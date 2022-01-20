var socket = io();

$(document).on('click', '#btn_join_game', function()
{
  let username = $('#username').val();
  let lobby = $('#lobby').val();

  if(username.trim() == '' || lobby.trim() == '')
  {
    showAlert('Cannot Leave Fields Empty', 2);
  }
  else
  {
    socket.emit('check_lobby', {username, lobby}, (response) =>
    {
      if(response.status != 0)
      {
        console.log(response.status);
        showAlert(response.message, 2);
      }
      else
      {
        sessionStorage.setItem('first_load', true);
        sessionStorage.setItem('user_data', JSON.stringify({"username": username, "lobby": lobby}));
        window.location.href = "lobby.html";
      }
    });
  }
});

$(document).on('keypress', 'input[type="text"]', function(e)
{
  if(e.key == "Enter")
  {
    $('#btn_join_game').click();
  }
});
