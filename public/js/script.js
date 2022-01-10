var socket = io();

$(document).on('click', '#btn_join_game', function()
{
  let username = $('#username').val();
  let lobby = $('#lobby').val();

  socket.emit('check_lobby', {username, lobby}, (response) =>
  {
    if(response.status != 0)
    {
      alert(response.message);
    }
    else
    {
      sessionStorage.setItem('user_data', JSON.stringify({"username": username, "lobby": lobby}));
      window.location.href = "lobby.html";
    }
  });
});

function leave_lobby(username)
{
  socket.emit('leave_lobby', username);
}

socket.on('new_message', (message) =>
{
  console.log(message);
});


// function send_to_all(room)
// {
//   socket.emit('send_to_all', room, (response) =>
//   {
//     console.log(response.status);
//   });
// }
