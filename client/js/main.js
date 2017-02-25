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

/* function ailens_start () {
	//  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;
}

function create_ailens () {
	for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.body.moves = false;
        }
    }

	//  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true); 
}

function create_explosion () {
	//  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(1, 'kaboom');
    explosions.forEach(setupInvader, this);
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

} */

mainState.prototype = {

    preload: function () {
		game.load.image(gamegraphicsassets.arrow_name, gamegraphicsassets.arrow_url); 
		game.load.image(gamegraphicsassets.ailen_name, gamegraphicsassets.ailen_url); 
		game.load.spritesheet('kaboom', 'assets/sprites/explode.png', 128, 128);
    },
 
    create: function () {
	
		
		
		game.world.setBounds(0, 0, 1920, 1920);
		
		game.stage.backgroundColor = '#0072bc';
		createDrawingArea();
		sprite = game.add.sprite(200, 100, 'arrow');
		weapon = game.add.weapon(30, 'bullet');
		//  The bullet will be automatically killed when it leaves the world bounds
		weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
		
		//weapon
		//  The speed at which the bullet is fired
		weapon.bulletSpeed = 1300;
		//  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
		weapon.fireRate = 110;
		// button for firing bullet
		fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
		
		weapon.trackSprite(sprite, 55, 0, true);
	
				//set ailens 
		ailens_start(); 
		create_ailens(); 
		
		sprite.anchor.setTo(0.5, 0.5);
		sprite.scale.setTo(1, 1);
		
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.enable(sprite, Phaser.Physics.ARCADE);
		
		sprite.body.allowRotation = false;
		
		
		//camera follow
		game.camera.follow(sprite, Phaser.Camera.FOLLOW_LOCKON, 0.5, 0.5);
    },
 
    update: function () {
		if (game.physics.arcade.distanceToPointer(sprite) <= 50) {
			sprite.rotation = game.physics.arcade.moveToPointer(sprite, 400, game.input.activePointer, 500);
		} else {
			sprite.rotation = game.physics.arcade.moveToPointer(sprite, 400, game.input.activePointer);
		}
		
		 if (fireButton.isDown)
		{
			weapon.fire();
		}
		
		 game.physics.arcade.overlap(weapon.bullets, aliens, collisionHandler, null, this);
    },
	
		
	render: function () {
		game.debug.text("Distance to pointer: " + game.physics.arcade.distanceToPointer(sprite), 32, 32);
	}
	
};

function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();
	//create explosion 
	create_explosion(); 
		
	var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);
}
 
var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.CANVAS, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');