const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, 'public');

var username = '';
var lobby = [];

app.use(express.static(static_path));

io.on('connection', (socket) =>
{
  console.log(`New User has connected with ID: ${socket.id}`);

  socket.on('check_lobby', (data, callback) =>
  {
    // username = data.username;
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
          lobby.push({'lobby_name': data.lobby, 'no_users': 1, 'players': [data.username]});
        break;
      case '1':
          lobby.push({'lobby_name': data.lobby, 'no_users': 1, 'players': [data.username]});
        break;
      case '2':
          let idx = lobby.findIndex(index => index.lobby_name == data.lobby);
          lobby[idx].no_users++;
          lobby[idx].players.push(data.username);
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



  socket.on('leave_lobby', (room) =>
  {
    socket.leave(room);
  });
});

server.listen(port, () =>
{
  console.log(`Listening on Port: ${port}`);
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
        if(lobby[idx].players.findIndex(index => index == username) == -1)
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


/*
Lobby Array
[
  {
    'lobby_name': xxxxxxxxxx,
    'no_users': xxxxxxxxxx,
    'players': []
  }
]

*/


/*
socket.on('send_to_all', (message, callback) =>
{
  io.emit('new_message', message);
  callback({status: 'Message Sent'});
});

socket.on('send_to_lobby', (data) =>
{
  io.in(data.lobby).emit('new_message', data.message);
});
*/
