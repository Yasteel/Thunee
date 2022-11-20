var socket = io();
var user_data;
var game_data;
var players = [];
var round = 0;


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
        <div class="card empty"></div>
        <div class="card empty"></div>
        <div class="card empty"></div>
        <div class="card empty"></div>
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
  
}


socket.on('receiveLobby', data =>
{
  console.log('received lobby');
  console.log(data);
  console.log(JSON.parse(data));
});


