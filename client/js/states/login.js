var gameProperties = {
    screenWidth: 1367,
    screenHeight: 662,
	game_elemnt: "gameDiv",
	in_game: false,
	connect: false, 
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.CANVAS, gameProperties.game_elemnt)

function potential_connect () {
 
}

function join_game () {
	game.state.start('main'); 
}

var login = function(game){
};

var form_div = document.getElementById('signDiv'); 
var signdivusername = document.getElementById('signDiv-username'); 
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
	create: function () {
		form_div.style.display = 'block';
		game.stage.backgroundColor = "#4488AA";
		socket = io.connect();
		socket.on('connect', potential_connect); 
		socket.on('join_game', join_game);
	}
	
	
}