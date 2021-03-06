var socket = io();
var team_one = [];
var team_two = [];
var players = [];
var view = 0;
var user_data;
var messageContainer = document.getElementsByClassName('messages')[0];


$(document).ready(function()
{
  let first_load = sessionStorage.getItem('first_load');
  if(first_load == "false")
  {
    reload_lobby();
    console.log(first_load);
  }
  else
  {
    join_lobby();
    sessionStorage.setItem('first_load', false);
    console.log(first_load);
  }
});

$(document).on('click', '.checkbox_icon', function()
{
  let player_index = $(this).data('player-index');
  let team = $(this).closest('tr').attr('id');

  valid_teams(player_index, team);
  send_team_info(player_index, team, user_data.lobby);
});

$(document).on('click', '.btn_reset_teams', function()
{
  reset_teams();
  socket.emit('reset_teams', user_data.lobby);
});

$(document).on('click', '.btn_start_game', function()
{
  console.log('1');
  start_game();
});

$(document).on('click', '.overlay', function()
{
  let reason = $('.overlay').data('reason') == "0" ? 'Cannot Set Up Teams Till All Players are in Lobby' : 'You are not admin';
  showAlert(reason, 2);
});

$(document).on('click', '.text button.btn_send', function()
{
  send_message();
  $('.msg_text').focus();
});

$(document).on('keypress', '.msg_text', function(e)
{
  if(e.key == "Enter")
  {
    $('.text button.btn_send').click();
  }
});

function valid_teams(player_index, team)
{
  let player = players[parseInt(player_index)];
  switch(team)
  {
    case 'team_one':
    if(team_one.length < 2)
    {
      if(team_two.findIndex(index => index == player) >= 0)
      {
        let player_idx = team_two.findIndex(index => index == player);
        team_two.splice(player_idx, 1);
        $(`#team_two i[data-player-index="${player_index}"]`).siblings('input').attr('checked', false);
        $(`#team_two i[data-player-index="${player_index}"]`).removeClass('fa-check-square');
        $(`#team_two i[data-player-index="${player_index}"]`).addClass('fa-square');
      }

      if(team_one.findIndex(index => index == player) >= 0)
      {
        let player_idx = team_one.findIndex(index => index == player);
        team_one.splice(player_idx, 1);
        $(`#team_one i[data-player-index="${player_index}"]`).siblings('input').attr('checked', false);
        $(`#team_one i[data-player-index="${player_index}"]`).removeClass('fa-check-square');
        $(`#team_one i[data-player-index="${player_index}"]`).addClass('fa-square');
      }
      else
      {
        team_one.push(player);
        $(`#team_one i[data-player-index="${player_index}"]`).siblings('input').attr('checked', true);
        $(`#team_one i[data-player-index="${player_index}"]`).removeClass('fa-square');
        $(`#team_one i[data-player-index="${player_index}"]`).addClass('fa-check-square');
      }
    }
    else
    {
      showAlert('Only 2 Players Per Team', 2);
    }
    break;

    case 'team_two':
    if(team_two.length < 2)
    {
      if(team_one.findIndex(index => index == player) >= 0)
      {
        let player_idx = team_one.findIndex(index => index == player);
        team_one.splice(player_idx, 1);
        $(`#team_one i[data-player-index="${player_index}"]`).siblings('input').attr('checked', false);
        $(`#team_one i[data-player-index="${player_index}"]`).removeClass('fa-check-square');
        $(`#team_one i[data-player-index="${player_index}"]`).addClass('fa-square');

        console.log(player_index);
      }

      if(team_two.findIndex(index => index == player) >= 0)
      {
        let player_idx = team_two.findIndex(index => index == player);
        team_two.splice(player_idx, 1);
        $(`#team_two i[data-player-index="${player_index}"]`).siblings('input').attr('checked', false);
        $(`#team_two i[data-player-index="${player_index}"]`).removeClass('fa-check-square');
        $(`#team_two i[data-player-index="${player_index}"]`).addClass('fa-square');
      }
      else
      {
        team_two.push(player);
        $(`#team_two i[data-player-index="${player_index}"]`).siblings('input').attr('checked', true);
        $(`#team_two i[data-player-index="${player_index}"]`).removeClass('fa-square');
        $(`#team_two i[data-player-index="${player_index}"]`).addClass('fa-check-square');
      }
    }
    else
    {
      showAlert('Only 2 Players Per Team', 2);
    }
    break;
  }
}

function reset_teams()
{
  team_one = [];
  team_two = [];
  $('.teams .card_body table tr td i:not(.fa-spinner)').removeClass('fa-check-square');
  $('.teams .card_body table tr td i:not(.fa-spinner)').addClass('fa-square');
  $('.teams .card_body table tr td input').attr('checked', false);
}

function display_teams_view()
{
  let teams =
  `
  <div class="card teams ${user_data.username != players[0] ? "non_admin": "admin"}">
  <div class="card_header">
    <h2>Teams</h2>
    <a class="btn_reset_teams">Reset Teams</a>
    <a class="btn_start_game">Start Game</a>
  </div>
  <div class="card_body">
    <table>
      <tr>
        <td></td>
  `;

  for(let i=0; i<4; i++)
  {
    teams += players[i] ? `<td>${players[i]}</td>` : `<td><i class="fas fa-spinner"></i></td>`;
  }
  teams +=
  `
  </tr>
  <tr id="team_one">
    <td>Team 1</td>
  `;

  for(let i=0; i<4; i++)
  {
    teams += `<td><input type="checkbox"><i class="fas fa-square checkbox_icon" data-player-index="${i}"></i></td>`;
  }

  teams +=
  `
  </tr>
  <tr id="team_two">
    <td>Team 2</td>
  `;

  for(let i=0; i<4; i++)
  {
    teams += `<td><input type="checkbox"><i class="fas fa-square checkbox_icon" data-player-index="${i}"></i></td>`;
  }

  teams +=
  `
      </tr>
    </table>
  </div>
  `;

  if(players.length < 4 && user_data.username == players[0])
  {
    teams += `<div class="overlay" data-reason="0"></div>`;
  }
  else if(user_data.username != players[0])
  {
    teams += `<div class="overlay" data-reason="1"></div></div>`;
  }

  $('.card.teams').html('');
  $('.card.teams').replaceWith(teams);

}

function display_players()
{
  let players_table =
  `
  <div class="card_header">
    <h2>Players</h2>
  </div>
  <div class="card_body">
    <table>
  `;

  for (let i=0; i<4; i++)
  {
    if(players[i])
    {
      players_table +=
      `
      <tr class="ready">
        <td>${players[i]}</td>
        <td>
          <i class="fas fa-check"></i>
          <i class="fas fa-spinner"></i>
        </td>
      </tr>
      `;
    }
    else
    {
      players_table +=
      `
      <tr class="waiting">
        <td>Waiting for Player</td>
        <td>
          <i class="fas fa-check"></i>
          <i class="fas fa-spinner"></i>
        </td>
      </tr>
      `;
    }
  }
  players_table += `</table></div>`;
  $('.card.players').html('');
  $('.card.players').append(players_table);

  display_teams_view();
}

//Communicate with Server

function join_lobby()
{
  user_data = JSON.parse(sessionStorage.getItem('user_data'));
  socket.emit('join_lobby', user_data);
}

function reload_lobby()
{
  user_data = JSON.parse(sessionStorage.getItem('user_data'));
  socket.emit('check_lobby', user_data, (response) =>
  {
    if(response.status != 0)
    {
      showAlert(response.message, 2);
    }
    else
    {
      socket.emit('join_lobby', user_data);
    }
  });
}

function send_message()
{
  var message = $('.msg_text').val();
  if(message.trim())
  {
    var message_obj =
    {
      "username": user_data.username,
      "lobby": user_data.lobby,
      "text": message
    };
    socket.emit('send_message', message_obj);
    $('.msg_text').val('');
  }
  else
  {
    showAlert('Cannot Send Empty Message', 2);
  }
}

function object_cleanup(lobby_players)
{
  let clean_arr = [];
  lobby_players.forEach((item, i) => {
    clean_arr.push(item.username);
  });
  return clean_arr;
}

function display_message(username, text)
{
  let message = '';

  if(username == 'admin')
  {
    message = `  <div class="message admin"><p>${text}</p></div>`;
  }
  else
  {
    message =
    `
    <div class="message ${username == user_data.username ? " to" : " from"}">
      <div class="m_header"><p>${username}</p></div>
      <div class="m_body"><p>${text}</p></div>
    </div>
    `;
  }

  $('.message_wrapper .messages').append(message);
    messageContainer.scrollTop = messageContainer.scrollHeight
}

function send_team_info(player_index, team, lobby)
{
  let obj =
  {
    "player_index": player_index,
    "team": team,
    "lobby": lobby
  };

  socket.emit('team_info', obj);
}

function start_game()
{
  if(team_one.length == 2 && team_two.length == 2)
  {
    socket.emit('start_game', user_data.lobby, team_one, team_two);
  }
}

socket.on('new_user', (lobby_players) =>
{
  players = object_cleanup(lobby_players);
  console.log(`%c${players}`, "color: lime");
  display_players();
  display_teams_view();
});

socket.on('new_message', (message) =>
{
  display_message(message.username, message.text);
});

socket.on('new_teams', ({player_index, team}) =>
{
  valid_teams(player_index, team);
});

socket.on('reset_teams', () =>
{
  reset_teams();
});

socket.on('start_game', (game_data) =>
{
  sessionStorage.setItem('first_load', true);
  window.location.href = "thunee.html";
});
