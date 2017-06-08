var configuration = {
    'render' : Phaser.CANVAS,   // Render type
    'canvas_width_max' : 2048,  // The maximum width of the canvas
    'canvas_width' : 1000,      // The width of the canvas
    'canvas_height_max' : 2048, // The maximum height of the canvas
    'canvas_height' : 650,      // The height of the canvas
    'scale_ratio' : 1,          // Scaling factor
    'aspect_ratio' : 1,         // Aspect ratio
};


 
var offset_y = (window.outerHeight - window.innerHeight) * window.devicePixelRatio;  
var offset_x = (window.outerWidth - window.outerWidth) * window.devicePixelRatio; 

// Calculate the scaling factor and the aspect ratio
configuration.canvas_width = window.screen.availWidth + 20;
configuration.canvas_height = window.screen.availHeight - document.body.offsetHeight;

console.log(configuration.canvas_width);

configuration.aspect_ratio = configuration.canvas_width / configuration.canvas_height;
if (configuration.aspect_ratio < 1) configuration.scale_ratio = configuration.canvas_height / configuration.canvas_height_max;
else configuration.scale_ratio = configuration.canvas_width / configuration.canvas_width_max;



var gameProperties = {
    screenWidth: configuration.canvas_width,
    screenHeight: configuration.canvas_height,
	gameWidth: 4000,
	gameHeight: 4000,
	current_time: 0,
	game_elemnt: "gameDiv",
	in_game: false,
	connect: false, 
};
game = new Phaser.Game(configuration.canvas_width, 
configuration.canvas_height, configuration.render, 'gameDiv');



//var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, gameProperties.game_elemnt);






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
		socket.emit('enter_name', {username: signdivusername.value, gameWidth: gameProperties.gameWidth, gameHeight:gameProperties.gameHeight }); 
	}
}

gameResized = function ()
{
    var scale = Math.min(window.innerWidth / game.width, window.innerHeight / game.height);
 
    game.scale.setUserScale(scale, scale);
}


login.prototype = {
	preload: function() {
			game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

	

 
			
			
					game.load.physics('physicsData', 'client/assets/physics/polygon.json');
		
		game.load.image(gamegraphicsassets.arrow_name, gamegraphicsassets.arrow_url); 
		game.load.image(gamegraphicsassets.sword_name, gamegraphicsassets.sword_url); 
		game.load.image(gamegraphicsassets.sword_piercename, gamegraphicsassets.sword_pierceurl); 
		game.load.image(gamegraphicsassets.shield_name, gamegraphicsassets.shield_url); 
		game.load.image(gamegraphicsassets.speedpickup_name, gamegraphicsassets.speedpickup_url); 
		game.load.image(gamegraphicsassets.stunpickup_name, gamegraphicsassets.stunpickup_url);
		game.load.image(gamegraphicsassets.piercepickup_name, gamegraphicsassets.piercepickup_url); 
		game.load.image(gamegraphicsassets.scoreboard_name, gamegraphicsassets.scorebord_url); 
		game.load.image(gamegraphicsassets.crown_name, gamegraphicsassets.crown_url); 
		game.load.image(gamegraphicsassets.tile_name, gamegraphicsassets.tile_url); 
		game.load.spritesheet(gamegraphicsassets.blood_name, gamegraphicsassets.blood_url, 64, 64, 17);

    },
	
	create: function () {

		form_div.style.display = 'block';
		game.stage.backgroundColor = "#AFF7F0";
		socket = io.connect();
		socket.on('connect', potential_connect); 
		socket.on('join_game', join_game);
	}
}