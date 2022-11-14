var socket = io();
var players = [];
var view = 0;
var user_data;
var messageContainer = document.getElementsByClassName('messages')[0];


$(document).ready(function()
{
  if(JSON.parse(sessionStorage.getItem("user_data")))
  {
    socket.on("connect", () => {
      user_data = JSON.parse(sessionStorage.getItem("user_data"));
      user_data.socket_id = socket.id;
      sessionStorage.setItem('user_data', JSON.stringify(user_data));
      socket.emit('join_lobby', user_data, true);
      socket.emit('fetch_lobby', user_data.lobby);

      $('span.lobby_name').text(user_data.lobby);
    });
  }
  else
  {
    window.location.href = "index.html";
  }
});

$(document).on('click', '.checkbox_icon', function()
{
  let player_socket_id = $(this).data('socket-id');
  let team = $(this).closest('tr').attr('id') == 'team_one' ? 1 : 2;
  
  let old_players = JSON.stringify(players);
  valid_teams(player_socket_id, team);
  
  if(JSON.stringify(players) != old_players)
  {
    send_team_info();
  }
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

function valid_teams(p_sid, team)
{
  let other_team = team == 1 ? 2 : 1;
  let team_count = 0;
  let player_idx = players.findIndex(index => index.socket_id == p_sid );

  $.each(players, (i, player) => 
  {
    if(player.team == team)
    {
      team_count++;
    }
  });
    
  // if team has space
  if(team_count < 2)
  {
    //if Player is Not Part of a Team Yet
    if(players[player_idx].team == 'null')
    {
      players[player_idx].team = team;
      change_icon(p_sid, team, 'fa-square', 'fa-check-square', true);
    }
    else
    {
      //To Switch Teams
      if(players[player_idx].team == other_team)
      {
        players[player_idx].team = team;
        change_icon(p_sid, other_team, 'fa-check-square', 'fa-square', false);
        change_icon(p_sid, team, 'fa-square', 'fa-check-square', true);
      }
      //To Deselect Player From Team
      else
      {
        players[player_idx].team = 'null';
        change_icon(p_sid, team, 'fa-check-square', 'fa-square', false);
      }
    }
  }
  //If Team is Full
  else
  {
    //Try to Add More Than 2 Players 
    if(players[player_idx].team == 'null')
    {
      showAlert('Team is Full', 2);
    }
    //To Deselect Player from Full Team
    else if(players[player_idx].team == team)
    {
      players[player_idx].team = 'null';
      change_icon(p_sid, team, 'fa-check-square', 'fa-square', false);
    }
    else if(players[player_idx].team == other_team)
    {
      showAlert('Team is Full', 2);
    }
  }
}

function change_icon(p_sid, team, removeIcon, addIcon, check)
{
  $(`#team_${team == 1 ? 'one' : 'two'} i[data-socket-id="${p_sid}"]`).removeClass(removeIcon);
  $(`#team_${team == 1 ? 'one' : 'two'} i[data-socket-id="${p_sid}"]`).addClass(addIcon);  
  $(`#team_${team == 1 ? 'one' : 'two'} i[data-socket-id="${p_sid}"]`).siblings('input').attr('checked', check);
}

function reset_teams()
{
  let old_players = JSON.stringify(players);
  $.each(players, (i,v) => 
  {
    if(v.team != 'null')
    {
      change_icon(v.socket_id, v.team, 'fa-check-square', 'fa-square', false);
      v.team = 'null';
    }
  });

  if(JSON.stringify(players) != old_players)
  {
    socket.emit('team_changes', {lobby: user_data.lobby, players: players});
  }
}

function display_teams_table()
{
  let teams =
  `
  <div class="card teams ${user_data.username != players[0].username ? "non_admin": "admin"}">
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
    teams += players[i] ? `<td class="player_name">${players[i].username}</td>` : `<td><i class="fas fa-spinner"></i></td>`;
  }

  for(let i=1; i<=2; i++)
  {
    teams +=
    `
      </tr>
      <tr id="${i==1 ? "team_one":"team_two"}">
        <td>Team ${i}</td>
    `;

    for(let j=0; j<4; j++)
    {
      teams += `<td><input type="checkbox"><i class="fas fa-square checkbox_icon" data-socket-id="${players[j]? players[j].socket_id : null}"></i></td>`;
    }
  }

  teams +=
  `
      </tr>
    </table>
  </div>
  `;

  if(players.length < 4 && user_data.username == players[0].username)
  {
    teams += `<div class="overlay" data-reason="0"></div>`;
  }
  else if(user_data.username != players[0].username)
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
        <td>${players[i].username}</td>
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

  display_teams_table();
}

// function display_teams(team_one, team_two)
// {
//   for(let i=0; i<team_one.length; i++)
//   {

//   }
// }

function send_team_info()
{
  socket.emit('team_changes', {lobby: user_data.lobby, players: players});
}

function start_game()
{
  socket.emit('start_game', user_data.lobby);
}

// async function update_socket_id()
// {
//   console.log('update opened');
//   let myPromise = new Promise((resolve, reject)=> 
//   {
//     resolve(socket.id).then((value) => {console.log('awe')});
//   });
//   // return await myPromise;

// } 
//Communicate with Server

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

function personal_message(message, ou)
{
  socket.emit('personal_message', message, ou);
}

socket.on('receiveLobby', data =>
{
  console.log('received lobby');
  console.log(data);
  console.log(JSON.parse(data));
});

socket.on('lobby_changes', new_players => 
{
  players = new_players;
  display_players();
});

socket.on('personal_message', (message) => 
{
  console.log(message);
});

socket.on('team_changes', (new_players) => 
{
  console.log('team changes');
  players = new_players;

  $.each(players, (i,v) => 
  {
    if(v.team == 'null')
    {
      change_icon(v.socket_id, 1, 'fa-check-square', 'fa-square', false);
      change_icon(v.socket_id, 2, 'fa-check-square', 'fa-square', false);
    }
    else if(v.team == 1)
    {
      change_icon(v.socket_id, 1, 'fa-square', 'fa-check-square',  true);
      change_icon(v.socket_id, 2, 'fa-check-square', 'fa-square', false);
    }
    else if(v.team == 2)
    {
      change_icon(v.socket_id, 2, 'fa-square', 'fa-check-square',  true);
      change_icon(v.socket_id, 1, 'fa-check-square', 'fa-square', false);
    }
  });

});

socket.on('start_game', () => 
{
  window.location.href = "game.html";
});