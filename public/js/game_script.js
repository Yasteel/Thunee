var socket = io();
var user_data;

$(document).ready(function()
{
  join_lobby();
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

function fetch_lobby()
{
  socket.emit('fetch_lobby', (response) =>
  {
    console.log(response);
  });
}
