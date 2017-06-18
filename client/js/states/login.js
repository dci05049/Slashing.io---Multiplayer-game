
canvas_width = window.innerWidth * window.devicePixelRatio;
		canvas_height = window.innerHeight * window.devicePixelRatio;

aspect_ratio = window.screen.availWidth / window.screen.availHeight;
new_ratio = canvas_width/canvas_height; 
		
if (aspect_ratio < new_ratio) {
	newcanv_height = canvas_width / aspect_ratio; 
	scale_ratio = newcanv_height / window.screen.availHeight;
} else {
	newcanv_width = canvas_height * aspect_ratio; 
	scale_ratio = newcanv_width / window.screen.availWidth;
}

var prev_scaleratio = scale_ratio; 

game = new Phaser.Game(canvas_width,canvas_height, Phaser.CANVAS, 'gameDiv');




var gameProperties = {
    screenWidth: canvas_width,
    screenHeight: canvas_height,
	maxHeight: canvas_height, 
	maxWidth: canvas_width, 
	gameWidth: 4000 * scale_ratio,
	gameHeight: 4000 * scale_ratio,
	current_time: 0,
	game_elemnt: "gameDiv",
	in_game: false,
	connect: false, 
};





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


function resizePolygon(json_physics, shapeKey, scale){
   var newData = [];
	var data = json_physics["sword"];

   for (var i = 0; i < data.length; i++) {
       var vertices = [];

       for (var j = 0; j < data[i].shape.length; j+=2) {
          vertices[j] = data[i].shape[j] * scale;
          vertices[j+1] = data[i].shape[j+1] * scale; 

       }

       newData.push({shape : vertices});
   }

   var item = {};
   item[shapeKey] = newData;
   return item; 

}

function convertPosition (posX, posY, newPosx, newPosy) {
	var multiple;
}

function resizeBody (gameObject, scale, body_type) {
	var body_scale = gameObject.scale_value; 	
	
	if (!gameObject.body) {
		return;
	}
	
	if (body_type === "circle") {
		var new_bodySize = gameObject.body_size * scale_ratio;
		gameObject.body.clearShapes();
		
		var body_offsetX = gameObject.body_offsetX * scale_ratio; 
		var body_offsetY = gameObject.body_offsetY * scale_ratio; 
		gameObject.body.addCircle(new_bodySize, body_offsetX , body_offsetY);
	
		var percent_x = gameObject.body.x/gameProperties.maxWidth; 
		var percent_y = gameObject.body.y/gameProperties.maxHeight;

		

		gameObject.body.x = percent_x * gameProperties.gameWidth; 
		gameObject.body.y = percent_y * gameProperties.gameHeight; 
		
		
		var multiple = scale_ratio / prev_scaleratio; 
	
		gameObject.body.data.shapes[0].sensor = true;
	} else if (body_type === "json") {
		player_properties.destroy_sword();
		player_properties.draw_sword(player_properties.sword_width, player_properties.sword_height, player_properties.pierce);
		
	} else if (body_type === "gui") {
		/*
		gameObject.fixedToCamera = false;
		console.log(canvas_width);
		console.log(gameProperties.screenWidth);
		gameObject.x = gameProperties.screenWidth * gameObject.posX_multiple;
		gameObject.y = gameProperties.screenHeight * gameObject.posY_multiple;
		gameObject.fixedToCamera = true;
		*/
		var pos_x = gameProperties.screenWidth * gameObject.posX_multiple; 
		var pos_y = gameProperties.screenHeight * gameObject.posY_multiple;
		gameObject.cameraOffset.setTo(pos_x,pos_y);
	}	
	
	/*else if (body_type === "experiencebar") {
		gameObject.kill(); 
		experience_bar(gameProperties.screenWidth, gameProperties.screenHeight, 400);
	}*/


}


function resizegameObject (sprite, scale, physics) {
	if (sprite.body_type != "experiencebar") {
		sprite.scale.set(scale);
	}
	
	resizeBody(sprite, scale, sprite.body_type); 
}


var timeOut = null;


window.onresize = function(event) {
	

		canvas_width = window.innerWidth * window.devicePixelRatio;
		canvas_height = window.innerHeight * window.devicePixelRatio;

		aspect_ratio = window.screen.availWidth / window.screen.availHeight;
		new_ratio = canvas_width/canvas_height; 
		
		if (aspect_ratio < new_ratio) {
			newcanv_height = canvas_width / aspect_ratio; 
			scale_ratio = newcanv_height / window.screen.availHeight;
		} else {
			newcanv_width = canvas_height * aspect_ratio; 
			scale_ratio = newcanv_width / window.screen.availWidth;
		}
		
		/*
		prev_scaleratio = scale_ratio; 
		
		if (aspect_ratio < 1) {
			scale_ratio = Math.max((canvas_width / window.screen.availWidth),(canvas_height/window.screen.availWidth));

		} else {
			scale_ratio = canvas_height / window.screen.availWidth;
		}*/
		
		gameProperties.maxHeight = gameProperties.gameWidth; 
		gameProperties.maxWidth = gameProperties.gameHeight; 
		
		gameProperties.screenHeight = canvas_height;
		gameProperties.screenWidth = canvas_width;
		
		gameProperties.gameWidth = 4000 * scale_ratio; 
		gameProperties.gameHeight = 4000 * scale_ratio; 
		game.world.setBounds(0, 0, gameProperties.gameWidth, gameProperties.gameHeight, false, false, false, false);
		var len_sprite = scale_sprites.length;

	
		for (var n = 0; n < len_sprite; n++) {
			resizegameObject(scale_sprites[n], scale_ratio);
		}

};

login.prototype = {
	preload: function() {
			game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
			game.scale.parentIsWindow = true;
	
			
					game.load.physics('physicsData', 'client/assets/physics/polygon.json');
		
		game.load.image(gamegraphicsassets.crown_name, gamegraphicsassets.crown_url); 
		game.load.image(gamegraphicsassets.arrow_name, gamegraphicsassets.arrow_url); 
		game.load.image(gamegraphicsassets.sword_piercename, gamegraphicsassets.sword_pierceurl); 
		game.load.image(gamegraphicsassets.speedpickup_name, gamegraphicsassets.speedpickup_url); 
		game.load.image(gamegraphicsassets.stunpickup_name, gamegraphicsassets.stunpickup_url);
		game.load.image(gamegraphicsassets.piercepickup_name, gamegraphicsassets.piercepickup_url); 
		game.load.image(gamegraphicsassets.scoreboard_name, gamegraphicsassets.scorebord_url); 
		//game.load.image(gamegraphicsassets.crown_name, gamegraphicsassets.crown_url); 
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