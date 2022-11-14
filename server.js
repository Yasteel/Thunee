const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const { instrument } = require('@socket.io/admin-ui');
const { json } = require('express');
const { log } = require('console');
const io = socketio(server,
  {
    cors:
    {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
  });

const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, 'public');

var username = '';
var lobby = [];

app.use(express.static(static_path));

instrument(io, {auth: false});

server.listen(port, () =>
{
  console.log(`Listening on Port: ${port}`);
});

io.on('connection', (socket) =>
{
  ////////////////////////////////////////////////////////////
  socket.on('getLobby', () =>
  {
    socket.emit('receiveLobby', JSON.stringify(lobby));
  });
  ////////////////////////////////////////////////////////////
  socket.on('personal_message', (message, ou)=>
  {
    socket.to(ou).emit('personal_message', (message));
  });
  ////////////////////////////////////////////////////////////
  socket.on('check_lobby', (data, callback) =>
  {
    let obj =
    {
      status: 0,
      message: `${data.username} Joined Lobby: ${data.lobby}`
    };

    let lobby_status = check_lobby(data.username, data.lobby);
    callback(lobby_status);
  });

  socket.on('create_lobby', (data) =>
  {
    lobby.push(
      {
        info:
        {
          lobby_name: data.lobby,
          login: true,
          delete_lobby: true,
          start_game: false,
          no_users: 1,
          round: 0
        },
        players:
        [
          {
            id: 0,
            socket_id: data.socket_id,
            username: data.username,
            team: 'null'
          }
        ]
      });
  });

  socket.on('join_lobby', (data, new_user) =>
  {
    let lobby_idx = lobby.findIndex(index => index.info.lobby_name == data.lobby);

    if(new_user)
    {
      lobby[lobby_idx].info.no_users++;
      lobby[lobby_idx].players.push(
        {
          id: 0,
          socket_id: data.socket_id,
          username: data.username,
          team: 'null'
        });
    }

    socket.join(data.lobby);
    io.in(data.lobby).emit('new_user', lobby[lobby_idx].players);
    // socket.to(data.lobby).emit('new_message', {"username": "admin", "text": `${data.username} Joined`});
  });

  socket.on('send_message', (message) =>
  {
    io.in(message.lobby).emit('new_message', {"username": message.username, "text": message.text});
  });

  socket.on('team_changes', (obj) =>
  {
    let lobby_idx = lobby.findIndex(index => index.info.lobby_name == obj.lobby);
    if(lobby_idx > -1)
    {
      lobby[lobby_idx].players = obj.players;
      socket.to(obj.lobby).emit('team_changes', lobby[lobby_idx].players);
    }
    else
    {
      console.log('something fucked up');
    }
  });

  socket.on('reset_teams', (lobby) =>
  {
    socket.to(lobby).emit('reset_teams');
  });

  socket.on('start_game', (lobby_name) =>
  {
    let lobby_idx = lobby.findIndex(index => index.info.lobby_name == lobby_name);

    // changing state flags
    lobby[lobby_idx].info.delete_lobby = false;
    lobby[lobby_idx].info.login = false;
    lobby[lobby_idx].info.start_game = true;

    // creating player ids for play order
    let team_one_id = 1;
    let team_two_id = 2;

    // $.each(lobby[lobby_idx].players, (i,v) => 
    // {
      
    // });

    lobby[lobby_idx].players.forEach(v => {
      if(v.team == 1)
      {
        v.id = team_one_id;
        team_one_id += 2;
      }
      else if(v.team == 2)
      {
        v.id = team_two_id;
        team_two_id += 2;
      }
    });

    // creates temporary duplicate data for players
    lobby[lobby_idx].temp_players = lobby[lobby_idx].players.slice();

    // create game data object
    let game_data = 
    {
      'dealing': 1,
      'trumping': 2,
      'ball_count': [0,0],
      'trump': 'null',
      'count': 0,
      'calls': {'id': 0, 'value': 0},
      'deck': new Deck(),
      'played_cards': 'null'
    };

    lobby[lobby_idx].game_data = game_data;

    io.in(lobby_name).emit('start_game');
  });

  socket.on('leave_lobby', (room) =>
  {
    socket.leave(room);
  });
  
  socket.on('disconnect', () =>
  {
    remove_user(socket);
  });


  // events for actual game now//

  // event to send player info to each lobby //
  socket.on('fetch_lobby', (lobby_name) =>
  {
    let lobby_idx = lobby.findIndex(index => index.info.lobby_name == lobby_name);
    if(lobby_idx > -1)
    {
      io.in(lobby[lobby_idx].info.lobby_name).emit("lobby_changes", lobby[lobby_idx].players);
    }
  });
});

function check_lobby(username, lobby_name)
{
  if(lobby.length == 0)
  {
    return '0';       // if there are no lobbies, create one with user
  }
  else
  {
    var idx = lobby.findIndex(index => index.info.lobby_name == lobby_name);
    if(idx == -1)
    {
      return '0';     // if there are lobbies but none with the specified lobby_name, create one with user
    }
    else
    {
      if(lobby[idx].info.no_users < 4)
      {
        // if a lobby was found and is available to join
        if(lobby[idx].players.findIndex(index => index.username == username) == -1)
        {
          return '1'; // if a lobby does not already has a user with the selected username
        }
        else
        {
          return '2'; // if a lobby already has a user with the selected username
        }
      }
      else
      {
        return '3';   // if the lobby is full
      }
    }
  }
}

function remove_user(socket){
  let lobby_idx = lobby.findIndex(idx => idx.players.findIndex(p_idx => p_idx.socket_id == socket.id) > -1);
  if(lobby_idx > -1)
  {
    let player_idx = lobby[lobby_idx].players.findIndex(index => index.socket_id == socket.id);

    // socket.to(lobby[lobby_idx].info.lobby_name).emit('new_message', {"username": "admin", "text": `${lobby[lobby_idx].players[player_idx].username} Left`});

    
    if(lobby[lobby_idx].players.length > 1)
    {
      socket.leave(lobby[lobby_idx].info.lobby_name);
      lobby[lobby_idx].players.splice(player_idx, 1);
      lobby[lobby_idx].info.no_users--;

      io.in(lobby[lobby_idx].info.lobby_name).emit('lobby_changes', lobby[lobby_idx].players);
    }
    else if(lobby[lobby_idx].players.length == 1)
    {
      socket.leave(lobby[lobby_idx].info.lobby_name);
      lobby[lobby_idx].players.splice(player_idx, 1);
      lobby[lobby_idx].info.no_users--;
      if(lobby[lobby_idx].info.delete_lobby && !lobby[lobby_idx].info.start_game && !lobby[lobby_idx].info.login)
      {
        lobby.splice(lobby_idx, 1);
        console.log('Lobby Deleted');
      }
    }


  }
  console.log(`User Removed`);
}

// function in_lobby(socketID)
// {
//   let lobby_idx = lobby.findIndex(l_idx => l_idx.players.findIndex(p_idx => p_idx.socket_id == socketID) > -1);

//   if(lobby_idx > -1)
//   {
//     io.in(lobby[lobby_idx].lobby_name).emit('lobby_changes', lobby[lobby_idx].players);
//   }
// }



class Deck{

  // Creates a deck of cards
  constructor(){
      this.cards = [{'id':0,'suit':'heart','value':'9','description':'9','short_description':'9','points':20,},{'id':1,'suit':'heart','value':'10','description':'10','short_description':'10','points':10,},{'id':2,'suit':'heart','value':'11','description':'Jack','short_description':'J','points':30,},{'id':3,'suit':'heart','value':'12','description':'Queen','short_description':'Q','points':2,},{'id':4,'suit':'heart','value':'13','description':'King','short_description':'K','points':3,},{'id':5,'suit':'heart','value':'1','description':'Ace','short_description':'A','points':11,},{'id':6,'suit':'diamond','value':'9','description':'9','short_description':'9','points':20,},{'id':7,'suit':'diamond','value':'10','description':'10','short_description':'10','points':10,},{'id':8,'suit':'diamond','value':'11','description':'Jack','short_description':'J','points':30,},{'id':9,'suit':'diamond','value':'12','description':'Queen','short_description':'Q','points':2,},{'id':10,'suit':'diamond','value':'13','description':'King','short_description':'K','points':3,},{'id':11,'suit':'diamond','value':'1','description':'Ace','short_description':'A','points':11,},{'id':12,'suit':'club','value':'9','description':'9','short_description':'9','points':20,},{'id':13,'suit':'club','value':'10','description':'10','short_description':'10','points':10,},{'id':14,'suit':'club','value':'11','description':'Jack','short_description':'J','points':30,},{'id':15,'suit':'club','value':'12','description':'Queen','short_description':'Q','points':2,},{'id':16,'suit':'club','value':'13','description':'King','short_description':'K','points':3,},{'id':17,'suit':'club','value':'1','description':'Ace','short_description':'A','points':11,},{'id':18,'suit':'spade','value':'9','description':'9','short_description':'9','points':20,},{'id':19,'suit':'spade','value':'10','description':'10','short_description':'10','points':10,},{'id':20,'suit':'spade','value':'11','description':'Jack','short_description':'J','points':30,},{'id':21,'suit':'spade','value':'12','description':'Queen','short_description':'Q','points':2,},{'id':22,'suit':'spade','value':'13','description':'King','short_description':'K','points':3,},{'id':23,'suit':'spade','value':'1','description':'Ace','short_description':'A','points':11,}];
  }
  
  // Function for shuffling the deck
  shuffle(){
      for (let i = this.cards.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * i);
          let temp = this.cards[i];
          this.cards[i] = this.cards[j];
          this.cards[j] = temp;
      }
  }

  // Sets Deck
  set_deck(cards)
  {
      this.cards = cards;
  }

  // Returns Deck
  get_deck()
  {
      return JSON.stringify(this.cards);
  }
}