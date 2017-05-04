var gameProperties = {
    screenWidth: 1367,
	current_time: 0,
    screenHeight: 662,
	game_elemnt: "gameDiv",
	in_game: false,
	connect: false, 
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.CANVAS, gameProperties.game_elemnt);



function potential_connect () {
 
}

slideIn = Phaser.Plugin.StateTransition.In['SlideBottom'],
slideOut = Phaser.Plugin.StateTransition.Out['SlideBottom'];

function join_game () {
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