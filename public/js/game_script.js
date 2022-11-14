var socket = io();
var user_data;
var game_data;
var round = 0;

$(document).ready(function() {
  $('.loading').addClass('show');

  
  
  
});

socket.on("connect", () => {
  debugger;
    console.log('connected');
    user_data = JSON.parse(sessionStorage.getItem("user_data"));
    user_data.socket_id = socket.id;
    sessionStorage.setItem('user_data', JSON.stringify(user_data));
    socket.emit('join_lobby', user_data, true);
    socket.emit('fetch_lobby', user_data.lobby);
    
    //remove the loading screen after 3s
    setTimeout(function() { $('.loading').removeClass('show');   }, 3000);
    console.log('done');
    // $('span.lobby_name').text(user_data.lobby);
  });


// socket.on('receiveLobby', data =>
// {
//   console.log('received lobby');
//   console.log(data);
//   console.log(JSON.parse(data));
// });

/*
// function display_players() {
//   if(user_data.username == game_data[0].teams[0].players[0].name)
//   {
//     // PLAYER 1 DISPLAY
//     $('.player_bottom .player_title').html(`<h2>${game_data[0].teams[0].players[0].name} (<span id="player_id">P${game_data[0].teams[0].players[0].id}</span>)</h2>`);
//     $('.player_top .player_title').html(`<h2>${game_data[0].teams[0].players[1].name} (<span id="player_id">P${game_data[0].teams[0].players[1].id}</span>)</h2>`);
//     $('.player_left .player_title').html(`<h2>${game_data[0].teams[1].players[1].name} (<span id="player_id">P${game_data[0].teams[1].players[1].id}</span>)</h2>`);
//     $('.player_right .player_title').html(`<h2>${game_data[0].teams[1].players[0].name} (<span id="player_id">P${game_data[0].teams[1].players[0].id}</span>)</h2>`);
//   }
//   else if(user_data.username == game_data[0].teams[0].players[1].name)
//   {
//     // PLAYER 3 DISPLAY
//     $('.player_bottom .player_title').html(`<h2>${game_data[0].teams[0].players[1].name} (<span id="player_id">P${game_data[0].teams[0].players[1].id}</span>)</h2>`);
//     $('.player_top .player_title').html(`<h2>${game_data[0].teams[0].players[0].name} (<span id="player_id">P${game_data[0].teams[0].players[0].id}</span>)</h2>`);
//     $('.player_left .player_title').html(`<h2>${game_data[0].teams[1].players[0].name} (<span id="player_id">P${game_data[0].teams[1].players[0].id}</span>)</h2>`);
//     $('.player_right .player_title').html(`<h2>${game_data[0].teams[1].players[1].name} (<span id="player_id">P${game_data[0].teams[1].players[1].id}</span>)</h2>`);
//   }
//   else if(user_data.username == game_data[0].teams[1].players[0].name)
//   {
//     // PLAYER 2 DISPLAY
//     $('.player_bottom .player_title').html(`<h2>${game_data[0].teams[1].players[0].name} (<span id="player_id">P${game_data[0].teams[1].players[0].id}</span>)</h2>`);
//     $('.player_top .player_title').html(`<h2>${game_data[0].teams[1].players[1].name} (<span id="player_id">P${game_data[0].teams[1].players[1].id}</span>)</h2>`);
//     $('.player_left .player_title').html(`<h2>${game_data[0].teams[0].players[0].name} (<span id="player_id">P${game_data[0].teams[0].players[0].id}</span>)</h2>`);
//     $('.player_right .player_title').html(`<h2>${game_data[0].teams[0].players[1].name} (<span id="player_id">P${game_data[0].teams[0].players[1].id}</span>)</h2>`);
//   }
//   else if(user_data.username == game_data[0].teams[1].players[1].name)
//   {
//     // PLAYER 4 DISPLAY
//     $('.player_bottom .player_title').html(`<h2>${game_data[0].teams[1].players[1].name} (<span id="player_id">P${game_data[0].teams[1].players[1].id}</span>)</h2>`);
//     $('.player_top .player_title').html(`<h2>${game_data[0].teams[1].players[0].name} (<span id="player_id">P${game_data[0].teams[1].players[0].id}</span>)</h2>`);
//     $('.player_left .player_title').html(`<h2>${game_data[0].teams[0].players[1].name} (<span id="player_id">P${game_data[0].teams[0].players[1].id}</span>)</h2>`);
//     $('.player_right .player_title').html(`<h2>${game_data[0].teams[0].players[0].name} (<span id="player_id">P${game_data[0].teams[0].players[0].id}</span>)</h2>`);
//   }
//   console.log(game_data);
// }
*/
