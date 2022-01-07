var socket = io();

$(document).on('click', '.btn', function()
{
  socket.emit('test', 'Test Message');
});

$(document).on('click', '#btn_join_game', function()
{
  let username = $('#username').val();
  let lobby = $('#lobby').val();

  socket.emit('join_lobby', {username, lobby}, (response) =>
  {
    console.log(response.message);
  });
});

function leave_lobby(username)
{
  socket.emit('leave_lobby', username);
}

function send_to_lobby(message, lobby)
{
  socket.emit('send_to_lobby', ({message, lobby}));
}

function send_to_all(room)
{
  socket.emit('send_to_all', room);
}

socket.on('new_message', (message) =>
{
  console.log(message);
});
