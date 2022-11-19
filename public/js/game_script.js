var socket = io();
var user_data;
var game_data;
var round = 0;


socket.on("connect", () => {
  let old_sid = '';
  if(sessionStorage.getItem("user_data"))
  {
    user_data = JSON.parse(sessionStorage.getItem("user_data"));
    old_sid = user_data.socket_id;
    user_data.socket_id = socket.id;


    sessionStorage.setItem('user_data', JSON.stringify(user_data));
    socket.emit('join_lobby', user_data);
  }
  else
  {
    window.location.href = "index.html";
  }

  
  //remove the loading screen after 3s
  setTimeout(function() { $('.loading').removeClass('show');   }, 3000);

  // $('span.lobby_name').text(user_data.lobby);
});


socket.on('receiveLobby', data =>
{
  console.log('received lobby');
  console.log(data);
  console.log(JSON.parse(data));
});


