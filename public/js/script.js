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
      switch(response)
      {
        case '0':
          socket.emit('create_lobby', {username, lobby});
          sessionStorage.setItem({"username": username, "lobby": lobby});
          window.location.href = "lobby.html";
          break;
        case '1':
          let new_user = true;
          socket.emit('join_lobby', {username, lobby}, new_user);
          sessionStorage.setItem({"username": username, "lobby": lobby});
          window.location.href = "lobby.html";
          break;
        case '2': showAlert("Username is taken. Please choose another.", 2); break;
        case '3': showAlert("Lobby is Full.", 2); break;

        // Status 0 - if there are no lobbies, create one with user
        // Status 0 - if there are lobbies but none with the specified lobby_name, create one with user
        // Status 1 - if a lobby does not already has a user with the selected username
        // Status 2 - if a lobby already has a user with the selected username
        // Status 3 - if the lobby is full
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
