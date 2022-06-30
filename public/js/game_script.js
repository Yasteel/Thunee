var socket = io();
var user_data;
var game_data;
var round = 0;

$(document).ready(function() {
  $('.loading').addClass('show');
  // join_lobby();
  fetch_lobby();

  //remove the loading screen after 3s
  setTimeout(function() {
    $('.loading').removeClass('show');

  }, 3000);
});

function join_lobby() {
  user_data = JSON.parse(sessionStorage.getItem('user_data'));

  socket.emit('check_lobby', user_data, (response) => {
    if (response.status != 0) {
      showAlert(response.message, 2);
      console.log(response.message);
    } else {
      socket.emit('join_lobby', user_data);
    }
  });
}

function fetch_lobby() {
  socket.emit('fetch_lobby', user_data, (response) => {
    if (response == 0) {
      showAlert('Something Went Wrong, redirecting back to setup', 2, true);
      setTimeout(function() {
        window.location.href = 'lobby.html';
      }, 3000);
    } else {
      game_data = response;
      display_players();
    }
  });
}

function display_players() {
  // if(user_data.username == game_data[0].teams[0].players[0].name)
  // {
  //   // PLAYER 1 DISPLAY
  //   $('.player_bottom .player_title').html(`<h2>${game_data[0].teams[0].players[0].name} (<span id="player_id">P${game_data[0].teams[0].players[0].id}</span>)</h2>`);
  //   $('.player_top .player_title').html(`<h2>${game_data[0].teams[0].players[1].name} (<span id="player_id">P${game_data[0].teams[0].players[1].id}</span>)</h2>`);
  //   $('.player_left .player_title').html(`<h2>${game_data[0].teams[1].players[1].name} (<span id="player_id">P${game_data[0].teams[1].players[1].id}</span>)</h2>`);
  //   $('.player_right .player_title').html(`<h2>${game_data[0].teams[1].players[0].name} (<span id="player_id">P${game_data[0].teams[1].players[0].id}</span>)</h2>`);
  // }
  // else if(user_data.username == game_data[0].teams[0].players[1].name)
  // {
  //   // PLAYER 3 DISPLAY
  //   $('.player_bottom .player_title').html(`<h2>${game_data[0].teams[0].players[1].name} (<span id="player_id">P${game_data[0].teams[0].players[1].id}</span>)</h2>`);
  //   $('.player_top .player_title').html(`<h2>${game_data[0].teams[0].players[0].name} (<span id="player_id">P${game_data[0].teams[0].players[0].id}</span>)</h2>`);
  //   $('.player_left .player_title').html(`<h2>${game_data[0].teams[1].players[0].name} (<span id="player_id">P${game_data[0].teams[1].players[0].id}</span>)</h2>`);
  //   $('.player_right .player_title').html(`<h2>${game_data[0].teams[1].players[1].name} (<span id="player_id">P${game_data[0].teams[1].players[1].id}</span>)</h2>`);
  // }
  // else if(user_data.username == game_data[0].teams[1].players[0].name)
  // {
  //   // PLAYER 2 DISPLAY
  //   $('.player_bottom .player_title').html(`<h2>${game_data[0].teams[1].players[0].name} (<span id="player_id">P${game_data[0].teams[1].players[0].id}</span>)</h2>`);
  //   $('.player_top .player_title').html(`<h2>${game_data[0].teams[1].players[1].name} (<span id="player_id">P${game_data[0].teams[1].players[1].id}</span>)</h2>`);
  //   $('.player_left .player_title').html(`<h2>${game_data[0].teams[0].players[0].name} (<span id="player_id">P${game_data[0].teams[0].players[0].id}</span>)</h2>`);
  //   $('.player_right .player_title').html(`<h2>${game_data[0].teams[0].players[1].name} (<span id="player_id">P${game_data[0].teams[0].players[1].id}</span>)</h2>`);
  // }
  // else if(user_data.username == game_data[0].teams[1].players[1].name)
  // {
  //   // PLAYER 4 DISPLAY
  //   $('.player_bottom .player_title').html(`<h2>${game_data[0].teams[1].players[1].name} (<span id="player_id">P${game_data[0].teams[1].players[1].id}</span>)</h2>`);
  //   $('.player_top .player_title').html(`<h2>${game_data[0].teams[1].players[0].name} (<span id="player_id">P${game_data[0].teams[1].players[0].id}</span>)</h2>`);
  //   $('.player_left .player_title').html(`<h2>${game_data[0].teams[0].players[1].name} (<span id="player_id">P${game_data[0].teams[0].players[1].id}</span>)</h2>`);
  //   $('.player_right .player_title').html(`<h2>${game_data[0].teams[0].players[0].name} (<span id="player_id">P${game_data[0].teams[0].players[0].id}</span>)</h2>`);
  // }
  console.log(game_data);
}
