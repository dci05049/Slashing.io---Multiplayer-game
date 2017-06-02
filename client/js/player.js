var player_properties; 

var set_player = function () {
	//in game properties 
	this.speed = 300; 
	this.dashspeed = 1000;  
	this.attack_cooldown = 1; 
	this.player_value = 100;
	this.exp_max = 100;
	this.player_health = 10;
	this.killed = false; 
	this.next_time = 0; 
	this.stunned_time = 0;
	this.free_tiime = 0;
	this.stunned = false; 
	this.first = false; 
	this.speed_boost = false; 
	this.stun_immune = false; 
	// determine if player has pierce
	this.pierce = false; 
	
	
	// list of items 
	this.items = []; 
	// list of items with body 
	this.items_p = [];
	
	
	//list of enemies hit with the attack 
	this.in_cols_hit = [];
	//list of shield of enemies hit with the player attack 
	this.in_cols_shieldhit = [];
	
	// list of items in collision with the sword 
	this.in_cols = [];
	// check if number of sword collision with other shields 
	this.in_cols_shield = [];
	
	
	//player skills 
	this.next_attack = gameProperties.current_time; 
	this.canattack = true; 
	this.player_attack = false; 
	
	//player ranks and gui properties 
	this.player_id = 0; 
	this.points = 0;
	this.player_score = 0;
	this.level = 1;
	this.sword_height = 150;
	this.sword_width = 40;
	
	
	this.killstreak = 0; 
	this.streak_duration = 10;
	this.streak_end = 0;
	
	
	this.text_list = []; 
	this.txt_playerlst = [];
	this.displaying_text = false; 
	this.display_onplayertext = false; 
	
	
	this.destroy_fade = function (sprite, fade_time) {
		game.add.tween(sprite).to( { alpha: 0 }, fade_time , Phaser.Easing.Linear.None, true);
		game.time.events.add(fade_time, function () {sprite.destroy(true,false); console.log ('destroy')} , this);
	}
	
	this.itemsdestroy = function (fade_time) {
		for (var i = 0; i < this.items.length; i++) {
			//this.items[i].destroy(true,false);
			this.destroy_fade(this.items[i], fade_time); 
		}
		for (var k = 0; k < this.items_p.length; k++) {
			//this.items_p[k].destroy(true,false);
			this.destroy_fade(this.items_p[k], fade_time); 
		}
	}
	
	this.player_killed = function () {
		player.body.velocity.x = 0; 
		player.body.velocity.y = 0;
		player_properties.player_update();
		player_properties.killed = true; 
	}
	
	this.player_destroy = function (fade_time) {
		this.itemsdestroy(fade_time); 
		this.destroy_fade(player, fade_time);
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
			if (this.items[k].name === 'name') {
				this.items[k].x = player.x;
				this.items[k].y = player.y + 50; 
			} else {
				this.items[k].x = player.x; 
				this.items[k].y = player.y - 100; 
			}
		}
	}
	
	this.player_stunned = function () {
		this.player_attack = false; 
		this.latest_x = player.body.velocity.x;
		this.latest_y = player.body.velocity.y; 
		player.body.velocity.x = player_properties.latest_x * -1/10; 
		player.body.velocity.y = player_properties.latest_y * -1/10; 
		this.stunned_time = 1;
		this.free_time = game.time.totalElapsedSeconds() + player_properties.stunned_time; 
		this.stunned = true; 
	}
	
	this.onPlusClick = function(value){
		var new_exp = player_properties.expvalue + value; 
		player_properties.expvalue = new_exp;
	    var exp_max = player_properties.exp_max; 
		
		
		if (player_properties.expvalue >= player_properties.exp_max) {
			this.myHealthBar.setPercent(100); 
		    player_properties.expvalue = 0;		  
		    this.myHealthBar.setPercent(0);
		    player_properties.onLevelup();
		  
		    if (new_exp > exp_max) {
			    var new_val = new_exp - exp_max; 
			    this.onPlusClick(new_val); 
		    }
		    return; 
	    }
	  
	  var exp_percent = (player_properties.expvalue/player_properties.exp_max) * 100; 
      this.myHealthBar.setPercent(exp_percent);
	
    }
	
	this.onLevelup = function () {
		this.level += 1; 
		
		//increase the maximum exp max value
		this.exp_max *= 1.5; 
		this.player_value *= 1.3;
		
		this.sword_height += 10; 
		this.destroy_sword(); 
		this.draw_sword(this.sword_width, this.sword_height);
		
		
		if (this.dashspeed <= 2000) {
			this.dashspeed += 20; 
		}
		
		if (this.speed <= 700) {
			this.speed += 20; 
		}
		
		
		var level_lst = [];
		var index = 0; 
		
		//push the text that needs to be displayed in the level_lst;
		level_lst.push('Sword Length Increases');
		level_lst.push('Movement Speed UP'); 
		level_lst.push('Dash Speed UP'); 
		level_lst.push('Player Level UP'); 
		var length = level_lst.length; 
		
		for (var i = 0; i < length; i++) {
			this.display_onPlayer(level_lst[i], 200); 
		}
	}
	
	this.draw_handle = function (width) {
		//handle
		handle = game.add.graphics(player.body.x, player.body.y);
		handle.beginFill(0xFF3300);
		handle.lineStyle(2, 0xffd900, 1);
		handle.anchor.setTo(0.5,0.5);
		

		handle.moveTo(0, 15);
		handle.lineTo(0, 25);
		handle.lineTo(-50, 25);
		handle.lineTo(-50, 15);
		handle.endFill();
		
		game.physics.p2.enableBody(handle, false);
		
		handle.pivot.y = -30;
		handle.pivot.x = 30;
		player_properties.items_p.push(handle);
	}
	
	
	this.draw_sword = function (width, height, pierce) {
	
		sword = game.add.graphics(player.body.x, player.body.y);
		sword.name = "sword"; 

		// set a fill and line style
		if (pierce) {
			sword.beginFill(0xFF3300);
			sword.lineStyle(4, 0xffd900, 1);
			sword.anchor.setTo(0.5,0.5);
		} else {
			sword.beginFill(0xFF3300);
			sword.lineStyle(1, 0xffd900, 1);
			sword.anchor.setTo(0.5,0.5);
		}
			
		// draw a shape
		game.physics.p2.enableBody(sword, false);
		sword.moveTo(0,0);
		sword.lineTo(height, width/2);
		sword.lineTo(0, width);
		sword.endFill();
		sword.body.clearShapes();
		
		//have to add the pivot's y to the offset y of addrectangle
		
		this.offset_x = 30; 
		this.offset_y = -30; 
	
		this.data = {
			sword: [
						{
							"density": 2, "friction": 0, "bounce": 0, 
							"filter": { "categoryBits": 1, "maskBits": 65535 },
							"shape": [   0 - this.offset_x , 0 - this.offset_y, 
							height - this.offset_x,  width/2 - this.offset_y  ,  0 - this.offset_x, width - this.offset_y  ,
							0 - this.offset_x, 0 - this.offset_y ]
						}  
				]
		}
		
		sword.body.loadPolygon(null, this.data.sword);
		
		
		//planeShape = new polygons();
		sword.pivot.y = -30;
		sword.pivot.x = 30;
		
			
		sword.body.data.gravityScale = 0;
		//sword.scale.setTo(0.4,0.4);
		sword.body.angle = player.angle; 
		sword.body.data.shapes[0].sensor = true;
		
		//collision function on sword
		sword.body.onBeginContact.add(collide_handle, this);	
		sword.body.onEndContact.add(collide_exit, this);
		player_properties.items_p.push(sword);
		
	}
	
	this.destroy_sword = function () {
		for (var k = 0; k < this.items_p.length; k++) {
			if (this.items_p[k].name === "sword") {
				this.items_p[k].destroy(true,false);
				this.items_p.splice(k, 1); 
			}
		}
	}
	
	this.draw_shield = function () {
		shield = game.add.graphics(player.body.x, player.body.y);
		shield.name = "shield"; 

		// set a fill and line style
		shield.beginFill(0xFF3300);
		shield.lineStyle(2, 0xffd900, 1);
		shield.drawCircle(0, -70, 130);
		shield.endFill();
		
		shield.anchor.setTo(0.5,0.5);
			
		// draw a shape
		game.physics.p2.enableBody(shield, true);
		shield.body.clearShapes();
		//have to add the pivot's y to the offset y of addrectangle
		shield.body.addCircle(70, 0, -70);
			
		shield.body.data.gravityScale = 0;
		//sword.scale.setTo(0.4,0.4);
		shield.body.angle = player.angle; 
		shield.body.data.shapes[0].sensor = true;	
		player_properties.items_p.push(shield);
	}
	
	
	
	this.display_onPlayer = function (string_text, delay_time) {
		var text_object = {
			text_info: string_text, 
			delay_time: delay_time
		}
		this.txt_playerlst.push(text_object); 
		
		if (this.display_onplayertext === false) {
			this.display_onplayertext = true;
			var text_display = string_text; 	
			player_followtext.alpha = 1; 
			player_followtext.setText(text_display); 
			
			var oncomplete = function () {
				this.txt_playerlst.splice(0, 1); 
				if (this.txt_playerlst.length > 0) {	
					var next_text = this.txt_playerlst[0].text_info; 
					var next_delay = this.txt_playerlst[0].display_time; 
					player_followtext.alpha = 1; 
					player_followtext.setText(next_text); 
					var tween_text = game.add.tween(player_followtext).to( { alpha: 0 }, 100 , Phaser.Easing.Linear.None , true, delay_time);
					tween_text.onComplete.add(oncomplete, this); 
				} else {
					this.display_onplayertext = false;
					return; 
				}
			}
			
			var tween_text = game.add.tween(player_followtext).to( { alpha: 0 }, 500 , Phaser.Easing.Linear.None , true, delay_time);
			tween_text.onComplete.add(oncomplete, this); 
			
		} else if (this.displaying_text === true) {
			return; 
		}
	}
	
	
	this.display_text = function (string_text, delay_time) {
		var text_object = {
			text_info: string_text, 
			delay_time: delay_time
		}
		this.text_list.push(text_object); 
		
		if (this.displaying_text === false) {
			this.displaying_text = true;
			var text_display = string_text; 	
			player_distext.alpha = 1; 
			player_distext.setText(text_display); 
			
			var oncomplete = function () {
				this.text_list.splice(0, 1); 
				if (this.text_list.length > 0) {	
					var next_text = this.text_list[0].text_info; 
					var next_delay = this.text_list[0].display_time; 
					player_distext.alpha = 1; 
					player_distext.setText(next_text); 
					var tween_text = game.add.tween(player_distext).to( { alpha: 0 }, 500 , Phaser.Easing.Linear.None , true, delay_time);
					tween_text.onComplete.add(oncomplete, this); 
				} else {
					this.displaying_text = false;
					return; 
				}
			}
			
			var tween_text = game.add.tween(player_distext).to( { alpha: 0 }, 1000 , Phaser.Easing.Linear.None , true, delay_time);
			tween_text.onComplete.add(oncomplete, this); 
			
		} else if (this.displaying_text === true) {
			return; 
		}
	}
	
	this.first_place = function () {
		//player becomes first place for the first time. 
		if (this.first === false) {
			this.first = true; 
			this.crown = game.add.sprite(0, 30, 'crown');
			this.crown.anchor.setTo(0.5, 0.5);
			this.crown.scale.setTo(0.1, 0.1);
			if (this.item_lst) {
				this.item_lst.push(this.crown);
			}
			this.display_text("Top of the leader board");
		//player was already first place. 
		} else {
			this.crown.x = player.x; 
			this.crown.y = player.y - 30;
		}
	}
	
	this.stun_immunepickup = function () {
		this.stun_immune = true; 
		this.display_text('Stun Immune for 5 seconds', 500);
		this.display_onPlayer('Stun Immune for 5 Seconds', 500);
	}
	
	this.pierce_pickup = function () {
		this.pierce = true;
		this.display_text('Next Attack will Pierce', 500); 
		this.display_onPlayer('Next Attack Will Pierce', 500); 
		this.destroy_sword();
		this.draw_sword(this.sword_width, this.sword_height, true); 
	}
	
	this.speed_pickup = function () {
		this.speed_boost = true; 
		this.display_text('Speed Boost for 3 seconds', 500); 
		this.display_onPlayer('Speed Boost for 3 seconds', 500); 
		this.speed = 700;
	}
} 

function dash_draw () {
	var image_list = []; 
	var player_image = game.add.sprite(player.x,player.y, 'arrow');
	player_image.anchor.setTo(0.5, 0.5);
	player_image.scale.setTo(0.3, 0.3);
	game.add.tween(player_image).to( { alpha: 0 }, 300 , Phaser.Easing.Linear.None, true);
}


var remote_player = function (index, username, game, player, startx, starty, startangle) {
	//drawing sword function
		
	this.item_lst = []; 
	this.id = index;
	this.username = username;
	
	this.enemy_score = 0; 
	
	this.player_attack = false;
	this.pierce = false;
	this.first = false; 
	this.game = game; 
	this.player = player; 
	this.angle = startangle;
	
	//enemy sword properties	
	this.sword_height = 150;
	this.sword_width = 40; 
	
	 
	this.player = game.add.sprite(startx, starty, 'arrow');
	this.player.anchor.setTo(0.5, 0.5);
	this.player.scale.setTo(0.3, 0.3);
	this.player.name = index.toString(); 
	this.player.type = "body"; 
	game.physics.p2.enableBody(this.player,true);
	this.player.body.data.shapes[0].sensor = true;
	this.item_lst.push(this.player); 
	
	this.draw_sword = function (width, height, pierce) {
	
		this.sword = game.add.graphics(this.player.body.x, this.player.body.y);
		this.sword.name = "sword"; 
		this.sword.type = "gear"; 
		
		// set a fill and line style
		if (pierce) {
			this.sword.beginFill(0xFF3300);
			this.sword.lineStyle(4, 0xffd900, 1);
			this.sword.anchor.setTo(0.5,0.5);
		} else {
			this.sword.beginFill(0xFF3300);
			this.sword.lineStyle(1, 0xffd900, 1);
			this.sword.anchor.setTo(0.5,0.5);
		}
			
		// draw a shape
		game.physics.p2.enableBody(this.sword, false);
		this.sword.moveTo(0,0);
		this.sword.lineTo(height, width/2);
		this.sword.lineTo(0, width);
		this.sword.endFill();
		this.sword.body.clearShapes();
		//have to add the pivot's y to the offset y of addrectangle
		
		this.offset_x = 30; 
		this.offset_y = -30; 
	
		this.data = {
			sword: [
						{
							"density": 2, "friction": 0, "bounce": 0, 
							"filter": { "categoryBits": 1, "maskBits": 65535 },
							"shape": [   0 - this.offset_x , 0 - this.offset_y, 
							height - this.offset_x,  width/2 - this.offset_y  ,  0 - this.offset_x, width - this.offset_y  ,
							0 - this.offset_x, 0 - this.offset_y ]
						}  
				]
		}
		
		this.sword.body.loadPolygon(null, this.data.sword);
		
		
		this.sword.pivot.y = -30;
		this.sword.pivot.x = 30;
			
		this.sword.body.data.gravityScale = 0;
		//sword.scale.setTo(0.4,0.4);
		this.sword.body.angle = this.player.angle; 
		this.sword.body.data.shapes[0].sensor = true;
		this.item_lst.push(this.sword);
	}
	
	this.draw_handle = function (width) {
		//handle
		this.handle = game.add.graphics(this.player.body.x, this.player.body.y);
		this.handle.type = "gear"; 
		
		this.handle.beginFill(0xFF3300);
		this.handle.lineStyle(2, 0xffd900, 1);
		this.handle.anchor.setTo(0.5,0.5);
		

		this.handle.moveTo(0, 15);
		this.handle.lineTo(0, 25);
		this.handle.lineTo(-50, 25);
		this.handle.lineTo(-50, 15);
		this.handle.endFill();
		
		this.handle.pivot.y = -30;
		this.handle.pivot.x = 30;
		
		game.physics.p2.enableBody(this.handle,true);
		this.handle.body.data.shapes[0].sensor = true;
		
		this.item_lst.push(this.handle);
		
	}
	
	this.draw_shield = function () {
		this.shield = game.add.graphics(this.player.body.x, this.player.body.y);
		this.shield.name = index.toString();
		this.shield.type = "gear"; 
		this.shield.key = "shield";

		// set a fill and line style
		this.shield.beginFill(0xFF3300);
		this.shield.lineStyle(2, 0xffd900, 1);
		this.shield.drawCircle(0, -70, 130);
		this.shield.endFill();

		game.physics.p2.enableBody(this.shield, true);
		this.shield.body.data.gravityScale = 0;
		this.shield.body.clearShapes();
		this.shield.body.addCircle(70, 0, -70);
		this.shield.body.data.shapes[0].sensor = true;
		this.shield.body.angle = this.player.angle;
		this.item_lst.push(this.shield);
	}
	
	
	//draw sword 
	this.draw_sword(this.sword_width, this.sword_height); 
	this.draw_handle();
	this.draw_shield(); 
	
	
	this.style = { font: "16px Arial", fill: "black", align: "center"};
	this.playertext = game.add.text(100, 100, this.username , this.style);
	this.playertext.name = "playertext"; 
	
	
	this.playertext.anchor.set(0.5);
	this.item_lst.push(this.playertext); 
	
	
	this.enemy_attack = function () {
		var image_list = []; 
		var player_image = game.add.sprite(this.player.x, this.player.y, 'arrow');
		this.sword.attack = true; 
		player_image.anchor.setTo(0.5, 0.5);
		player_image.scale.setTo(0.3, 0.3);
		game.add.tween(player_image).to( { alpha: 0 }, 300 , Phaser.Easing.Linear.None, true);
	}
	

	for (var i = 0; i < player_properties.in_cols.length; i++) {
		if (!player_properties.stunned && player_properties.player_attack) {
			console.log('attack');
			//emit message of the position of the player 
			socket.emit('player_attack', {player_id: socket.id, enemy_id: player_properties.in_cols[i]});
		}
	}
	
	this.destroy_sword = function () {
		for (var k = 0; k < this.item_lst.length; k++) {
			console.log(this.item_lst[k].name);
			if (this.item_lst[k].name === "sword") {
				this.item_lst[k].destroy(true,false);
				this.item_lst.splice(k, 1); 
			}
		}
	}

	
	this.first_place = function () {
		if (this.first === false) {
			this.first = true; 
			this.crown = game.add.sprite(200, 100, 'crown');
			this.crown.anchor.setTo(0.5, 0.5);
			this.crown.scale.setTo(0.1, 0.1);
			this.item_lst.push(this.crown);
		} else {
			this.crown.x = this.player.x; 
			this.crown.y = this.player.y; 
		}
	}
	
	this.pierce_effect = function () {
		this.draw_sword(this.sword_width, this.sword_height, true); 
	}
	
	
	this.destroy_fade = function (sprite, fade_time) {
		console.log(fade_time);
		
		game.time.events.add(fade_time, function () {sprite.destroy(true,false); console.log ('destroy')} , this);
		game.add.tween(sprite).to( { alpha: 0 }, fade_time , Phaser.Easing.Linear.None, true);
	}
	
	
	this.itemsdestroy = function (fade_time) {
		for (var i = 0; i < this.item_lst.length; i++) {
			this.destroy_fade(this.item_lst[i], fade_time); 
		}
	}
	
	this.player_killed = function () {
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;		
		this.player.killed = true;
		this.shield.killed = true;
		this.killed = true; 
	}
	
	this.player_destroy = function (fade_time) {
		this.itemsdestroy(fade_time); 
	}
	
	
	this.updateremote = function (player_x, player_y, player_angle) {
		for (var k = 0; k < this.item_lst.length; k++) {
			var name = this.item_lst[k].name; 
			var type = this.item_lst[k].type; 
			if (name === "playertext") {
				this.item_lst[k].x = player_x;  
				this.item_lst[k].y = player_y + 50; 
			} else if (type === "gear" || type === "body") {
				this.item_lst[k].body.angle = player_angle;
				this.item_lst[k].body.x = player_x; 
				this.item_lst[k].body.y = player_y; 
			} else {
				this.item_lst[k].x = player_x;  
				this.item_lst[k].y = player_y - 50; 
			}
			
		}
	}
	
	
}


// find players to be removed 
function onRemovePlayer (data) {
	var removePlayer = findplayerbyid(data.id);
	// Player not found
	if (!removePlayer) {
		console.log('Player not found: ', data.id)
		return;
	}
	
	// if the player that needs to be removed is killed instead of disconnecting, 
	if (data.killed) {
		add_blood(removePlayer.player.x, removePlayer.player.y);
		removePlayer.player_killed();
		game.time.events.add(1000, function () {removePlayer.player_destroy(1000);} , this);
	} else {
		removePlayer.player_killed();
		removePlayer.player_destroy(1000);
	}

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