var gameProperties = {
    screenWidth: 1340,
    screenHeight: 620,
};

var gamegraphicsassets = {
	arrow_url: 'client/assets/sprites/arrow.png',
	arrow_name: 'arrow',
	
	bullet: 'assets/sprites/bullet.png',
	bullet_name: 'bullet',
	
	ailen_url: 'assets/sprites/ailen.png',
	ailen_name: 'ailen',
	
};

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

var players = []; 
 
		
 
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




mainState.prototype = {

    preload: function () {
		game.load.image(gamegraphicsassets.arrow_name, gamegraphicsassets.arrow_url); 
    },
 
    create: function () {
	
		
		game.world.setBounds(0, 0, 1920, 1920);
		game.stage.backgroundColor = '#0072bc';
		createDrawingArea();
		
		sprite = game.add.sprite(200, 100, 'arrow');
		sprite.anchor.setTo(0.5, 0.5);
		sprite.scale.setTo(1, 1);
		
		
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.enable(sprite, Phaser.Physics.ARCADE);
		
		sprite.body.allowRotation = false;
		socket.on('heartbeat', function (data) {
			for (var i = 0; i < players.length - 1; i ++) {
				if (
			}
		}); 
		
		//camera follow
		game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.5, 0.5);
    },
 
    update: function () {
		
		if (game.physics.arcade.distanceToPointer(sprite) <= 50) {
			sprite.rotation = game.physics.arcade.moveToPointer(sprite, 400, game.input.activePointer, 500);
		} else {
			sprite.rotation = game.physics.arcade.moveToPointer(sprite, 400, game.input.activePointer);
		}
		
		
		// keep track of the current positions 
		var data = {
			x: sprite.x,
			y: sprite.y
		}
		socket.emit('update', data); 
    },
	
		
	render: function () {
		game.debug.text("Distance to pointer: " + game.physics.arcade.distanceToPointer(sprite), 32, 32);
	}
	
};



 
var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.CANVAS, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');