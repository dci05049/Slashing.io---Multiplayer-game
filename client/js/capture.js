var gameProperties = {
    screenWidth: 1340,
    screenHeight: 620,
};
var socket; 

var gamegraphicsassets = {
	arrow_url: 'client/assets/sprites/arrow.png',
	arrow_name: 'arrow',
	
	bullet: 'assets/sprites/bullet.png',
	bullet_name: 'bullet',
	
	ailen_url: 'assets/sprites/ailen.png',
	ailen_name: 'ailen',
	
};

var remote_player = function (index, game, player, startx, starty, startangle) {
	this.game = game; 
	this.player = player; 
	
	this.player = game.add.sprite(startx, starty, 'arrow');
	this.player.anchor.setTo(0.5, 0.5)
	
	this.player.name = index.toString(); 
	
	
}

remote_player.prototype.update = function () {
	
}


//  Dimensions
var spriteWidth = 16;
var spriteHeight = 16;

//  Drawing Area
var canvas;
var canvasBG;
var canvasGrid;
var canvasZoom = 128;
 
 
var ailens; 
var weapon; 

var enemies = []; 

function player (sprite, id, x, y) {
	this.player_sprite = sprite; 
	this.id = id; 
	this.x = x; 
	this.y = y; 
}
		
 
var mainState = function(game){
	
};

function createDrawingArea() {

    game.create.grid('drawingGrid', 16 * canvasZoom, 16 * canvasZoom, 32, 32, 'rgba(0,191,243,0.8)');

    canvas = game.make.bitmapData(spriteWidth * canvasZoom, spriteHeight * canvasZoom);
    canvasBG = game.make.bitmapData(canvas.width, canvas.height);

    canvasBG.rect(0, 0, canvasBG.width, canvasBG.height, '#3f5c67');

    var x = 0;
    var y = 0;

    canvasBG.addToWorld(x, y);
    canvasGrid = game.add.sprite(x , y , 'drawingGrid');
    //canvasGrid.crop(new Phaser.Rectangle(0, 0, spriteWidth * canvasZoom, spriteHeight * canvasZoom));

}

function onMoveplayer (data) {
	var movePlayer = findplayerbyid (data.id); 
	if (!movePlayer) {
		console.log('Player not found: ', data.id)
		return
	}
	
	movePlayer.player.x = data.x; 
	movePlayer.player.y = data.y; 
	
}


function onSocketConnected () {
	console.log('Connected to socket server');
	
	// Send local player data to the game server
	socket.emit('new_player', { x: 0, y: 0});
}

// search through enemies list to find the right object of the id; 
function findplayerbyid (id) {
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i].player.name == id) {
			return enemies[i]; 
		}
	}
}


mainState.prototype = {
	
    preload: function () {
		game.load.image(gamegraphicsassets.arrow_name, gamegraphicsassets.arrow_url); 
    },
 
    create: function () {
		socket = io.connect();
		
		// when the socket connects, call the onsocketconnected and send its information to the server 
		socket.on('connect', onSocketConnected); 
		
		//listen for the broadcast.emit from the server for new player; 
		socket.on('new_player', function(info) {
			enemies.push(new remote_player(info.id, game, player, info.x, info.y)); 
			console.log(info); 
		}); 
		
		socket.on('move_player', onMoveplayer); 
		
		
		game.world.setBounds(0, 0, 1920, 1920);
		game.stage.backgroundColor = '#0072bc';
		createDrawingArea();
		
		player = game.add.sprite(200, 100, 'arrow');
		player.anchor.setTo(0.5, 0.5);
		player.scale.setTo(1, 1);
		
		
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.enable(player, Phaser.Physics.ARCADE);
		
		player.body.allowRotation = false;
		
		
		// keep track of new players added; 
		
		socket.on('heartbeat', function (data) {
			
			/*for (var i in data) {
				if (data[i].id != socket.id) {
					var player_sprite = data[i].id;
					player_sprite.x = data[i].x; 
					player_sprite.y = data[i].y; 
				}
				
			}*/
			//console.log(player_lst); 
		}); 
		
		//camera follow
		game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.5, 0.5);
    },
 
    update: function () {
		
		if (game.physics.arcade.distanceToPointer(player) <= 50) {
			player.rotation = game.physics.arcade.moveToPointer(player, 400, game.input.activePointer, 500);
		} else {
			player.rotation = game.physics.arcade.moveToPointer(player, 400, game.input.activePointer);
		}
		
		
		// emit message of the position of the player  
		socket.emit('move_player', {x: player.x, y: player.y, angle: player.angle}); 
		
			
    },
	
		
	render: function () {
		game.debug.text("Distance to pointer: " + game.physics.arcade.distanceToPointer(player), 32, 32);
	}
	
};



 
var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.CANVAS, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');