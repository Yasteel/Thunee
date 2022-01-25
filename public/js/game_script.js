var socket = io();
var user_data;
var game_data;

$(document).ready(function()
{
  join_lobby();
  fetch_game();

});

function join_lobby()
{
  user_data = JSON.parse(sessionStorage.getItem('user_data'));

  socket.emit('check_lobby', user_data, (response) =>
  {
    if(response.status != 0)
    {
      showAlert(response.message, 2);
      console.log(response.message);
    }
    else
    {
      socket.emit('join_lobby', user_data);
    }
  });
}

function fetch_game()
{
  socket.emit('fetch_game', (user_data.lobby));
}

function fetch_lobby()
{
  socket.emit('fetch_lobby', (response) =>
  {
    console.log(response);
  });
}

socket.on('fetch_game', (response) =>
{
  if(response == 0)
  {
    showAlert('Something Went Wrong, redirecting back to setup', 2, true);
    setTimeout(function()
    {
      window.location.href = 'lobby.html';
    }, 3000);
  }
  else
  {
    console.log(response);
  }
});
