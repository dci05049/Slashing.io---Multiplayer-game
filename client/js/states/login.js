console.log(screen.innerHeight);

var gameProperties = {
    screenWidth: (window.screen.availWidth * window.devicePixelRatio),
	current_time: 0,
    screenHeight: (window.screen.availHeight - 50  * window.devicePixelRatio),
	game_elemnt: "gameDiv",
	in_game: false,
	connect: false, 
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.CANVAS, gameProperties.game_elemnt);

game.width = 100;


function potential_connect () {
	socket.emit('in_lobby'); 
}

slideIn = Phaser.Plugin.StateTransition.In['SlideBottom'],
slideOut = Phaser.Plugin.StateTransition.Out['SlideBottom'];

function join_game (data) {
	game_config.socketid = data.id; 
	game_config.username = data.username; 
	game_config.room_id = data.room_id; 
	
	game.state.start(
        'main',
        slideOut,
        slideIn
      );
}

var login = function(game){
};

var form_div = document.getElementById('signDiv'); 
var signdivusername = document.getElementById('signdiv-username'); 
var signdiv = document.getElementById('entername'); 


signdiv.onclick = function () {
	if (!gameProperties.in_game) {
		gameProperties.in_game = true; 
		//player_properties.username = signdivusername.value; 
		form_div.style.display = 'none'; 
		socket.emit('enter_name', {username: signdivusername.value}); 
	}
}



login.prototype = {
	preload: function() {
 
    },
	
	create: function () {
		form_div.style.display = 'block';
		game.stage.backgroundColor = "#AFF7F0";
		socket = io.connect();
		socket.on('connect', potential_connect); 
		socket.on('join_game', join_game);
	}
}