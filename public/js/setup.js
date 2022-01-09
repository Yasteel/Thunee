var socket = io();
var team_one = [];
var team_two = [];
var players = [];
var view = 0;


$(document).ready(function()
{
  // display_teams_view();
  // display_players();
});



$(document).on('click', '.checkbox_icon', function()
{
  valid_teams($(this), $(this).data('player-index'), $(this).closest('tr').attr('id'));
});

$(document).on('click', '.btn_reset_teams', function()
{
  reset_teams();
});

$(document).on('click', '.overlay', function()
{
  showAlert('Cannot Set Up Teams Till All Players are in Lobby', 2);
});

function valid_teams(element, player_index, team)
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
  console.log(`team 1: ${team_one}`);
  console.log(`team 2: ${team_two}`);
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
  if(view == 0)
  {
    let teams =
    `
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

    if(players.length < 4)
    {
      teams += `<div class="overlay"></div>`;
    }
    $('.card.teams').html('');
    $('.card.teams').append(teams);
  }
  else if(view == 1)
  {
    let teams =
    `
    <div class="card_header">
      <h2>Teams</h2>
    </div>
    <div class="card_body">
      <table class="non_admin_view">
        <tr>
          <th>Team 1</th>
    `;

    for(let i=0; i<2; i++)
    {
      if(team_one[i])
      {
        teams += `<td>${team_one[i]}</td>`;
      }
      else
      {
        teams += `<td><i class="fas fa-spinner"></i></td>`;
      }
    }

    teams +=
    `
    </tr>
    <tr>
      <th>Team 2</th>
    `;

    for(let i=0; i<2; i++)
    {
      if(team_two[i])
      {
        teams += `<td>${team_two[i]}</td>`;
      }
      else
      {
        teams += `<td><i class="fas fa-spinner"></i></td>`;
      }
    }

    teams +=
    `
        </tr>
      </table>
    </div>
    `;

    $('.card.teams').html('');
    $('.card.teams').append(teams);
  }

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
