var set_player = function () {
	this.speed = 400; 
	this.items = [];
	this.items_p = [];
	this.player_health = 10;
	this.player_attack = false; 
	this.killed = false; 
	this.player_id = 0; 
	this.points = 0;
	this.player_score = 0; 
	this.next_time = 0; 
	this.stunned_time = 0;
	this.free_tiime = 0;
	this.stunned = false; 
	
	
	this.itemsdestroy = function () {
		for (var i = 0; i < this.items.length; i++) {
			this.items[i].destroy(true,false)
		}
		for (var k = 0; k < this.items_p.length; k++) {
			this.items_p[k].destroy(true,false)
		}
	}
	
	this.player_update = function () {
		player.body.angle = player.angle;
		
		//physics item 
		for (var i = 0; i < this.items_p.length; i++) {
			this.items_p[i].body.angle = player.angle; 
			this.items_p[i].body.velocity.x = player.body.velocity.x; 
			this.items_p[i].body.velocity.y = player.body.velocity.y; 
		}
		
		//normal item 
		for (var k = 0; k < this.items.length; k++) {
			this.items[k].x = player.x; 
			this.items[k].y = player.y - 50; 
		}
	},
	
	this.player_stunned = function () {
		this.player_attack = false; 
	}
} 

var player_properties; /* = {
	//player identifier 
	
	//player stats
	speed: 400,
	
	// items effects 
	items: [], 
	// items with physics. 
	items_p: [],
	player_health : 10,
	player_attack: false,
	killed: false,
	player_id: 0, 
	points: 0,
	player_score: 0, 	
	next_time: 0,
	stunned_time: 0,
	
	free_tiime: 0,
	stunned: false,
	
	itemsdestroy: function () {
		for (var i = 0; i < this.items.length; i++) {
			this.items[i].destroy(true,false)
		}
		for (var k = 0; k < this.items_p.length; k++) {
			this.items_p[k].destroy(true,false)
		}
	},
	
	
	player_update: function () {
		player.body.angle = player.angle;
		
		//physics item 
		for (var i = 0; i < this.items_p.length; i++) {
			this.items_p[i].body.angle = player.angle; 
			this.items_p[i].body.velocity.x = player.body.velocity.x; 
			this.items_p[i].body.velocity.y = player.body.velocity.y; 
		}
		
		//normal item 
		for (var k = 0; k < this.items.length; k++) {
			this.items[k].x = player.x; 
			this.items[k].y = player.y - 50; 
		}
	},
	
	player_stunned: function () {
		this.player_attack = false; 
	}
	
} */

function dash_draw () {
	var image_list = []; 
	var player_image = game.add.sprite(player.x,player.y, 'arrow');
	player_image.anchor.setTo(0.5, 0.5);
	player_image.scale.setTo(0.3, 0.3);
	game.add.tween(player_image).to( { alpha: 0 }, 300, Phaser.Easing.Linear.None, true);
}


var remote_player = function (index, game, player, startx, starty, startangle) {
	this.item_lst = []; 
	this.enemy_score = 0; 
	
	this.game = game; 
	this.player = player; 
	this.angle = startangle;
	
	 
	this.player = game.add.sprite(startx, starty, 'arrow');
	this.player.anchor.setTo(0.5, 0.5);
	this.player.scale.setTo(0.3, 0.3);
	this.player.name = index.toString(); 
	this.game.physics.p2.enableBody(this.player,true);
	this.player.body.data.shapes[0].sensor = true;
	
	this.sword = game.add.sprite(50, 50, "sword");  
	this.game.physics.p2.enableBody(this.sword,true);
	this.sword.body.data.shapes[0].sensor = true;
	this.sword.scale.setTo(0.3, 0.3); 
	this.swordname = "sword".concat(index.toString()); 
	this.sword.name = this.sword_name;
	this.sword.body.clearShapes();
	this.sword.body.addRectangle(200, 30, 50, 50);
	this.sword.pivot.y = - 150;
	this.item_lst.push(this.sword); 
	
	//shield
	this.shield = game.add.sprite(200, 100, 'shield');
	this.shield.name = "shield".concat(index.toString()); 
	game.physics.p2.enableBody(this.shield, true);
	this.shield.body.data.gravityScale = 0;
	this.shield.scale.setTo(0.4,0.4);
	this.shield.pivot.y = 200;
	this.shield.body.clearShapes();
	this.shield.body.addRectangle(100, 100, 0, -80)
	this.shield.body.data.shapes[0].sensor = true;
	this.item_lst.push(this.shield); 
	
	this.destroyitem = function () {
		for (var i = 0; i < this.item_lst.length; i++) {
			this.item_lst[i].destroy(true,false); 
		}
	}
}


// find players to be removed 
function onRemovePlayer (data) {
  var removePlayer = findplayerbyid(data.id)
  // Player not found
  if (!removePlayer) {
    console.log('Player not found: ', data.id)
    return;
  }

  removePlayer.player.destroy(true, false);  
  removePlayer.destroyitem(); 

  // Remove player from array
  enemies.splice(enemies.indexOf(removePlayer), 1);
}


// search through enemies list to find the right object of the id; 
function findplayerbyid (id) {
	for (var i = 0; i < enemies.length; i++) {
		if (enemies[i].player.name == id) {
			return enemies[i]; 
		}
	}
}



function movetoPointer (displayObject, speed, pointer, maxTime) {
	
		var bound_limit = 40;
		var upper_bound = bound_limit;
		var bottom_bound = game.world.height - bound_limit;
		var left_bound = bound_limit;
		var right_bound = game.world.width - bound_limit; 
		var play_bound = true; 

		
        if (speed === undefined) { speed = 60; }
        pointer = pointer || this.game.input.activePointer;
        if (maxTime === undefined) { maxTime = 0; }

        var angle = angleToPointer(displayObject, pointer);

        if (maxTime > 0)
        {
            //  We know how many pixels we need to move, but how fast?
            speed = distanceToPointer(displayObject, pointer) / (maxTime / 1000);
        }
		
		if (displayObject.body.y < upper_bound || displayObject.body.y > bottom_bound) {
			if (!(game.input.worldY > upper_bound && game.input.worldY < bottom_bound)) {
				displayObject.body.velocity.y = 0;
			} else {
				displayObject.body.velocity.x = Math.cos(angle) * speed;
				displayObject.body.velocity.y = Math.sin(angle) * speed;
			}
		} else if (displayObject.body.x < left_bound || displayObject.body.x > right_bound) {
			if (!(game.input.worldX > left_bound && game.input.worldX < right_bound)) {
				displayObject.body.velocity.x = 0;
			} else {
				displayObject.body.velocity.x = Math.cos(angle) * speed;
				displayObject.body.velocity.y = Math.sin(angle) * speed;
			}
		}

		displayObject.body.velocity.x = Math.cos(angle) * speed;
		displayObject.body.velocity.y = Math.sin(angle) * speed;
        return angle;

}

function distanceToPointer (displayObject, pointer, world) {

        if (pointer === undefined) { pointer = game.input.activePointer; }
        if (world === undefined) { world = false; }

        var dx = (world) ? displayObject.world.x - pointer.worldX : displayObject.x - pointer.worldX;
        var dy = (world) ? displayObject.world.y - pointer.worldY : displayObject.y - pointer.worldY;

        return Math.sqrt(dx * dx + dy * dy);

}

function angleToPointer (displayObject, pointer, world) {

        if (pointer === undefined) { pointer = game.input.activePointer; }
        if (world === undefined) { world = false; }

        if (world)
        {
            return Math.atan2(pointer.worldY - displayObject.world.y, pointer.worldX - displayObject.world.x);
        }
        else
        {
            return Math.atan2(pointer.worldY - displayObject.y, pointer.worldX - displayObject.x);
        }

}