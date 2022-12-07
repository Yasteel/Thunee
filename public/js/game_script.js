var socket = io();
var user_data;
var game_data;
var players = [];
var round = 0;
var cards = [];


socket.on("connect", () => {
  if(sessionStorage.getItem("user_data"))
  {
    user_data = JSON.parse(sessionStorage.getItem("user_data"));
    old_sid = user_data.socket_id;
    user_data.socket_id = socket.id;

    sessionStorage.setItem('user_data', JSON.stringify(user_data));
    socket.emit('join_lobby', user_data);
    $('span.lobby_name').text(user_data.lobby);
  }
  else
  {
    window.location.href = "index.html";
  }

});

socket.on('new_user', (users) => 
{
  players = users;

  if(players.length == 4 )
  {
    $('.loading p.message').html('Game is Loading');
    socket.emit('get_game_data', user_data.lobby, (gameData) => 
    {
      game_data = gameData;
      init_display();
    });
  }
});

function init_display()
{
  var rows = 
  `
    <div class="row_1">
      <div class="sack">
        <div class="ball_cards primary" data-score="${game_data.ball_count[user_data.team == 1 ? 0 : 1]}">
          <div class="card back black">
            <p>♠</p><p>♠</p><p>♠</p><p>♠</p><p>♠</p><p>♠</p>
          </div>
          <div class="card front red">
            <p>♦</p><p>♦</p><p>♦</p><p>♦</p><p>♦</p><p>♦</p>
          </div>
        </div>
      </div>

      <div class="play_area">
        <div class="notification">
          <p><i class="fa-solid fa-sharp fa-circle-info"></i><span class="message"></span></p>
        </div>
        <div class="cards">
          <div class="card empty m"></div>
          <div class="card empty m"></div>
          <div class="card empty m"></div>
          <div class="card empty m"></div>
        </div>
      </div>

      <div class="sack">
        <div class="ball_cards primary" data-score="${game_data.ball_count[user_data.team == 1 ? 1 : 0]}">
          <div class="card back black">
            <p>♥</p><p>♥</p><p>♥</p><p>♥</p><p>♥</p><p>♥</p>
          </div>
          <div class="card front red">
            <p>♣</p><p>♣</p><p>♣</p><p>♣</p><p>♣</p><p>♣</p>
          </div>
        </div>
      </div>

    </div>
    <div class="row_2"></div>
    <div class="row_3"></div>
  `;

  $('section.main').html('');
  $('section.main').append(rows);
  $('.loading').removeClass('show');
  display_actions();
}

function display_actions()
{
  $('.row_3').html('');
  let actions = '';
  if(game_data.phase == 0)
  {
    if(user_data.id == game_data.dealing)
    {
      actions = 
      `
        <a class="shuffle">Shuffle</a>
        <a class="deal">Deal</a>
      `;
      send_notification(`${user_data.username} is dealing`)
    }
  }
  else if(game_data.phase == 1)
  {
    if(user_data.id == game_data.trumping.id)
    {
      
      $('.notification span.message').text('Waiting for Trump Calls');
      $('.notification').css({display: 'flex'});
    }
    else
    {
      if(user_data.team != game_data.trumping.team)
      {
        if(!game_data.trumping.keep.includes(user_data.socket_id))
        {
          actions = 
          `
          <a class="call_to_trump">Call ${(game_data.trumping.call + 10)}</a>
          <a class="keep">Keep</a>
          `;
        }
        $('.notification').css({display: 'none'});
      }
      else
      {
        $('.notification span.message').text('Waiting for Trump Calls');
        $('.notification').css({display: 'flex'});
      }
    }
  }
  else if(game_data.phase == 2)
  {
    if(game_data.trumping.id == user_data.id)
    {
      $('.notification span.message').text('Select and Confirm Trump');   
      $('.row_2').addClass('select_trump');   
      actions = `<a class="set_trump">Confirm Trump</a>`;
    }
    else
    {
      let pIdx = players.findIndex(index => index.id == game_data.trumping.id);
      $('.notification span.message').text(`${players[pIdx].username} is Setting Trump`);
    }
    $('.notification').css({display: 'flex'});
  }
  else if(game_data.phase == 3)
  {

  }
  else if(game_data.phase == 4)
  {

  }
  else if(game_data.phase == 5)
  {

  }
  else if(game_data.phase == 6)
  {

  }
  else if(game_data.phase == 7)
  {

  }
  else if(game_data.phase == 8)
  {

  }
  $('.row_3').append(actions);
}

function send_notification(message)
{
  socket.emit('notify', {lobby: user_data.lobby, message: message});
}

function display_cards()
{
  $('.row_2').html('');
  let cards_mu = '';
  $.each(cards, (i,v) => 
  {
    cards_mu += 
    `
    <div class="card ${v.suit == 'club' ? 'black' : v.suit == 'spade' ? 'black' : v.suit == 'heart' ? 'red' : v.suit == 'diamond' ? 'red' : ''}" data-index="${i}">
      <div class="desc">${v.short_description}</div>
      <div class="suit"><img src="../icon/${v.suit}.png" alt="${v.suit}"></div>
    </div>
    `;
  });
  
  $('.row_2').append(cards_mu);
  socket.emit('get_game_data', user_data.lobby, (gameData) => 
  {
    game_data = gameData;
    display_actions();
  });
}

socket.on('notify', (message) => 
{
  console.log(message);
  $('.notification span.message').text(message);
  $('.notification').css({display: 'flex'});
});

socket.on('receiveLobby', data =>
{
  console.log('received lobby');
  console.log(data);
  console.log(JSON.parse(data));
});

socket.on('my_cards', (my_cards) => 
{
  console.log('called');
  cards = [...cards, ...my_cards];
  display_cards();
});

socket.on('trump_call', (data) => 
{
  game_data = data;

  if(game_data.trumping.id == user_data.id)
  {
    $('.notification span.message').text('Waiting for Trump Calls');
    $('.notification').css({display: 'flex'});
  }
  else
  {
    if(game_data.trumping.team == user_data.team)
    {
      $('.notification span.message').text('Partner Called To Trump');
      $('.notification').css({display: 'flex'});
    }
    else
    {
      let p_idx = players.findIndex(index => index.id == game_data.trumping.id);

      $('.notification span.message').text(`${players[p_idx].username} Called To Trump`);
      $('.notification').css({display: 'flex'});
    }
  }

  display_actions();
});

socket.on('changePhase', (gameData) => 
{
  game_data = gameData;
  display_actions();
});


$(document).on('click', '.row_3 a.shuffle', function()
{
  socket.emit('shuffle', user_data.lobby, ()=>
  {
    showAlert('shuffled', 1, false);
  });
});

$(document).on('click', '.row_3 a.deal', function()
{
  socket.emit('deal', user_data.lobby);
});

$(document).on('click', '.row_3 a.call_to_trump', function()
{
  let data = 
  {
    lobby: user_data.lobby,
    id: user_data.id,
    team: user_data.team
  };
  socket.emit('trump_call', data);
});

$(document).on('click', '.row_3 a.keep', function()
{
  socket.emit('keep', {lobby: user_data.lobby});
});

$(document).on('click', '.row_2.select_trump .card', function()
{
  $('.row_2 .card').removeClass('selected');
  $(this).addClass('selected');
  $('.row_3 a.set_trump').attr('selected-trump', $(this).attr('data-index'));
});

$(document).on('click', '.row_3 a.set_trump', function()
{
  if(!$(this).attr('selected-trump'))
  {
    showAlert('Select Trump first Then confirm', 2);
  }
  else
  {
    let idx = $(this).attr('selected-trump');
    socket.emit('trump_chosen', user_data.lobby, idx);
  }
});