const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const { instrument } = require('@socket.io/admin-ui');
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
  console.log("awe");
  console.log(socket.rooms);
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
          delete_lobby: true,
          start_game: false,
          no_users: 1,
          round: 0
        },
        players:
        [
          {
            id: 0,
            socket_id: '',
            username: data.username,
            team: 0,
            trumping: false,
            score: 0,
            calls: 0
          }
        ]
      });
  });

  socket.on('join_lobby', (data, new_user) =>
  {
    let lobby_idx = lobby.findIndex(index => index.info.lobby_name == data.lobby);

    if(new_user)
    {
      lobby[idx].info.no_users++;
      lobby[idx].players.push(
        {
          id: 0,
          socket_id: '',
          username: data.username,
          team: 0,
          trumping: false,
          score: 0,
          calls: 0
        });
    }

    socket.join(data.lobby);
    io.in(data.lobby).emit('new_user', lobby[lobby_idx].players);
    socket.to(data.lobby).emit('new_message', {"username": "admin", "text": `${data.username} Joined`});

    //
    // console.log(
    //   `
    //   =====================\n
    //   ${JSON.stringify(lobby)}\n
    //   =====================
    //   `);
    //inserts new socket id into player object
    // let player_idx = lobby[lobby_idx].players.findIndex(index => index.username == data.username);
    // lobby[lobby_idx].players[player_idx].socket_id = socket.id;

  });

  socket.on('send_message', (message) =>
  {
    io.in(message.lobby).emit('new_message', {"username": message.username, "text": message.text});
  });

  socket.on('team_info', (obj) =>
  {
    socket.to(obj.lobby).emit('new_teams', {"player_index": obj.player_index, "team": obj.team });
  });

  socket.on('reset_teams', (lobby) =>
  {
    socket.to(lobby).emit('reset_teams');
  });

  socket.on('start_game', (lobby_name, team_one, team_two) =>
  {
    let lobby_idx = lobby.findIndex(index => index.info.lobby_name == lobby_name);

    lobby[lobby_idx].info.delete_lobby = false;
    lobby[lobby_idx].info.start_game = true;

    // filling players info into object
    lobby[lobby_idx].players.forEach((item, i) =>
    {
      item.score = 0;
      item.call = 0;

      switch (item.username) {
        case team_one[0]:
          item.id = 1;
          item.team = 1;
          item.trumping = true;
          // item.socket_id = ;
        break;
        case team_one[1]:
          item.id = 3;
          item.team = 1;
          item.trumping = false;
          // item.socket_id = ;
        break;
        case team_two[0]:
          item.id = 2;
          item.team = 2;
          item.trumping = false;
          // item.socket_id = ;
        break;
        case team_two[1]:
          item.id = 4;
          item.team = 2;
          item.trumping = false;
          // item.socket_id = ;
        break;
      }
    });

    // creating teams object
    lobby[lobby_idx].teams = [{ ball_count: 0, counting: false }, { ball_count: 0, counting: true }];

    io.in(lobby_name).emit('start_game', lobby);
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
  socket.on('fetch_lobby', (lobby_name, callback) =>
  {
    let lobby_idx = lobby.findIndex(index => index.info.lobby_name == lobby_name);
    console.log(`Lobby idx: ${lobby_idx}`);
    if(lobby_idx > -1)
    {
      //  ***** for now sending all lobby information ***** //
      callback(lobby[lobby_idx]);
    }
    else
    {
      callback(0);
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

function remove_user(socket)
{
  let lobby_idx = lobby.findIndex(idx => idx.players.findIndex(p_idx => p_idx.socket_id == socket.id) > -1);
  if(lobby_idx > -1)
  {
    let player_idx = lobby[lobby_idx].players.findIndex(index => index.socket_id == socket.id);

    socket.to(lobby[lobby_idx].info.lobby_name).emit('new_message', {"username": "admin", "text": `${lobby[lobby_idx].players[player_idx].username} Left`});

    if(lobby[lobby_idx].players.length > 1)
    {
      socket.leave(lobby[lobby_idx].info.lobby_name);
      lobby[lobby_idx].players.splice(player_idx, 1);
      lobby[lobby_idx].info.no_users--;

      io.in(lobby[lobby_idx].info.lobby_name).emit('new_user', lobby[lobby_idx].players);
    }
    else if(lobby[lobby_idx].players.length == 1)
    {
      socket.leave(lobby[lobby_idx].info.lobby_name);
      lobby[lobby_idx].players.splice(player_idx, 1);
      lobby[lobby_idx].info.no_users--;
      if(lobby[lobby_idx].info.delete_lobby && !lobby[lobby_idx].info.start_game)
      {
        lobby.splice(lobby_idx, 1);
        console.log('Lobby Deleted');
      }
    }
  }
  console.log(`User Removed`);
  console.log(JSON.stringify(lobby));
}
