var gameProperties = {
    screenWidth: window.innerWidth * window.devicePixelRatio,
	current_time: 0,
    screenHeight: window.innerHeight * window.devicePixelRatio,
	game_elemnt: "gameDiv",
	in_game: false,
	connect: false, 
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.CANVAS, gameProperties.game_elemnt);

var GameApp = GameApp || {};
GameApp.USE_DEVICE_PIXEL_RATIO = false; // here you can change to use or not the device pixel ratio - it is not supported by all browsers

if (GameApp.USE_DEVICE_PIXEL_RATIO) {
    GameApp.DEVICE_PIXEL_RATIO = window.devicePixelRatio;
    GameApp.CANVAS_WIDTH = window.innerWidth * GameApp.DEVICE_PIXEL_RATIO;
    GameApp.CANVAS_HEIGHT = window.innerHeight * GameApp.DEVICE_PIXEL_RATIO;
} else {
    GameApp.DEVICE_PIXEL_RATIO = 1.0;
    GameApp.CANVAS_WIDTH = window.innerWidth * GameApp.DEVICE_PIXEL_RATIO;
    GameApp.CANVAS_HEIGHT = window.innerHeight * GameApp.DEVICE_PIXEL_RATIO;
}

GameApp.ASPECT_RATIO = GameApp.CANVAS_WIDTH / GameApp.CANVAS_HEIGHT;
GameApp.ASPECT_RATIO_ROUND = Math.round(GameApp.ASPECT_RATIO);

if (GameApp.ASPECT_RATIO > 1) {
    GameApp.SCALE_RATIO = GameApp.CANVAS_HEIGHT / GameApp.CANVAS_WIDTH;
} else {
    GameApp.SCALE_RATIO = GameApp.CANVAS_WIDTH / GameApp.CANVAS_WIDTH;
}


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