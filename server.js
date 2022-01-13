const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, 'public');

const { instrument } = require('@socket.io/admin-ui');

var username = '';
var lobby = [];

app.use(express.static(static_path));

server.listen(port, () =>
{
  console.log(`Listening on Port: ${port}`);
});

io.on('connection', (socket) =>
{
  console.log(`New User has connected with ID: ${socket.id}`);

  socket.on('check_lobby', (data, callback) =>
  {
    let obj =
    {
      status: 0,
      message: `${data.username} Joined Lobby: ${data.lobby}`
    };
    // Status 0 - Joined Lobby
    // Status 1 - Username Taken
    // Status 2 - Lobby Full

    switch (check_lobby(data.username, data.lobby))
    {
      case '0':
      lobby.push({'lobby_name': data.lobby, 'no_users': 1, 'players': [{'username': data.username, 'socket_id': ''}]});
      break;
      case '1':
      lobby.push({'lobby_name': data.lobby, 'no_users': 1, 'players': [{'username': data.username, 'socket_id': ''}]});
      break;
      case '2':
      let idx = lobby.findIndex(index => index.lobby_name == data.lobby);
      lobby[idx].no_users++;
      lobby[idx].players.push({'username': data.username, 'socket_id': ''});
      break;
      case '3':
      obj.status = 1;
      obj.message = "Username is taken. Please choose another."
      break;
      case '4':
      obj.status = 2;
      obj.message = "Lobby is Full.";
      break;
    }
    console.log(lobby);
    callback(obj);
  });

  socket.on('join_lobby', (data) =>
  {
    let lobby_idx = lobby.findIndex(index => index.lobby_name == data.lobby);
    socket.join(data.lobby);
    io.in(data.lobby).emit('new_user', lobby[lobby_idx].players);
    socket.to(data.lobby).emit('new_message', {"username": "admin", "text": `${data.username} Joined`});

    //inserts new socket id into player object
    let player_idx = lobby[lobby_idx].players.findIndex(index => index.username == data.username);
    lobby[lobby_idx].players[player_idx].socket_id = socket.id;

  });

  socket.on('send_message', (message) =>
  {
    io.in(message.lobby).emit('new_message', {"username": message.username, "text": message.text});
  });

  socket.on('leave_lobby', (room) =>
  {
    socket.leave(room);
  });

  socket.on('disconnect', () =>
  {
    remove_user(socket);
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
    var idx = lobby.findIndex(index => index.lobby_name == lobby_name);
    if(idx == -1)
    {
      return '1';     // if there are lobbies but none with the specified lobby_name, create one with user
    }
    else
    {
      if(lobby[idx].no_users < 4)
      {
        // if a lobby was found and is available to join
        if(lobby[idx].players.findIndex(index => index.username == username) == -1)
        {
          return '2'; // if a lobby does not already has a user with the selected username
        }
        else
        {
          return '3'; // if a lobby already has a user with the selected username
        }
      }
      else
      {
        return '4';   // if the lobby is full
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

    socket.to(lobby[lobby_idx].lobby_name).emit('new_message', {"username": "admin", "text": `${lobby[lobby_idx].players[player_idx].username} Left`});

    if(lobby[lobby_idx].players.length > 1)
    {
      socket.leave(lobby[lobby_idx].lobby_name);
      lobby[lobby_idx].players.splice(player_idx, 1);
      lobby[lobby_idx].no_users--;

      io.in(lobby[lobby_idx].lobby_name).emit('new_user', lobby[lobby_idx].players);
    }
    else if(lobby[lobby_idx].players.length == 1)
    {
      socket.leave(lobby[lobby_idx].lobby_name);
      lobby.splice(lobby_idx, 1);
      console.log(lobby);
    }
  }
}






/*
Lobby Array
[
  {
    'lobby_name': xxxxxxxxxx,
    'no_users': xxxxxxxxxx,
    'players':
    [
      'username': xxxxxxxxxx,
      'socket_id': xxxxxxxxxx
    ]
  }
]

*/


// TODO: array.splice(index, no_of_items);
