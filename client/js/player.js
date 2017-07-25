var player_properties; 



var set_player = function () {
	//in game properties 
	this.speed = 300; 
	this.speed_scaled = this.speed; 
	this.dashspeed = 1000;  
	this.dashspeed_scaled = this.dashspeed;
	this.attack_cooldown = 1; 
	this.player_value = 100;
	this.expvalue = 0; 
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
	this.all_sprites = [];
	
	
	this.colorbase = color_base[getRndInteger(0,2)];  

	
	this.shield_color = randomColor({
		luminosity: 'dark',
		hue: this.colorbase
	}); 
	this.shield_color = this.shield_color.replace("#", "0x"); 
	
	this.sword_color = randomColor({
		luminosity: 'dark',
		hue: this.colorbase
	}); 
	this.sword_color = this.sword_color.replace("#", "0x"); 
	
	this.handle_color = randomColor({
			luminosity: 'dark',
			hue: this.colorbase
		}); 
		
	this.handle_color = this.handle_color.replace("#", "0x"); 
	
	
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
	this.sword_height = gameProperties.availMax * 0.2;
	this.sword_width = gameProperties.availMax * 0.05;
	
	
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
		sword.body.velocity.x = 0;
		sword.body.velocity.y = 0;
		shield.body.velocity.x = 0;
		shield.body.velocity.y = 0;
		player_properties.player_update();
		player_properties.killed = true; 
	}
	
	this.player_destroy = function (fade_time) {
		this.itemsdestroy(fade_time); 
		this.destroy_fade(player, fade_time);
	}
	
	this.player_update = function () {
		player.body.angle = player.angle;
		player.body.x = player.x; 
		player.body.y = player.y; 
		
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
			player.body.velocity.x = this.latest_x * -1/10; 
			player.body.velocity.y = this.latest_y * -1/10; 
			this.stunned_time = 1;
			this.free_time = game.time.totalElapsedSeconds() + player_properties.stunned_time; 
		
	}
	
	this.onPlusClick = function(value){
		var new_exp = player_properties.expvalue + value; 
		player_properties.expvalue = new_exp;
	    var exp_max = player_properties.exp_max; 
		
		
		if (player_properties.expvalue >= player_properties.exp_max) {
			this.myHealthBar.setPercent(100); 		  
		    this.myHealthBar.setPercent(0);
			player_properties.exp_max *= 1.5; 
			player_properties.expvalue = 0;
			console.log(value, player_properties.exp_max);
			
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
		
		socket.emit('level_up', {maxscreensize: gameProperties.availMax});
		
	}
	
	this.draw_handle = function (width) {
		//handle
		handle = game.add.graphics(player.body.x, player.body.y);
		handle.body_type = "none";
		handle.beginFill(game_config.sword_color);
		handle.lineStyle(2, game_config.sword_color, 1);
		handle.anchor.setTo(0.5,0.5);
		handle.scale.set(scale_ratio); 

		handle.moveTo(0, 15);
		handle.lineTo(0, 25);
		handle.lineTo(-50, 25);
		handle.lineTo(-50, 15);
		handle.endFill();
	
		game.physics.p2.enableBody(handle, false);
		handle.body.data.shapes[0].sensor = true;
		
		handle.pivot.y = -30;
		handle.pivot.x = 30;
		
		this.all_sprites.push(handle);
		player_properties.items_p.push(handle);
	}
	
	
	this.draw_sword = function (width, height, pierce) {
	
		sword = game.add.graphics(player.x, player.y);
		sword.name = "sword"; 

		// set a fill and line style
		if (pierce) {
			sword.beginFill(game_config.sword_color);
			sword.lineStyle(4, game_config.sword_color, 1);
			sword.anchor.setTo(0.5,0.5);
				

		} else {
			sword.beginFill(game_config.sword_color);
			sword.lineStyle(1, 0xffd900, 1);
				
		}
	
		
			
		// draw a shape
		game.physics.p2.enableBody(sword, true);
		sword.body.clearShapes();
		sword.moveTo(0,0);
		sword.lineTo(height, width/2);
		sword.lineTo(0, width);
		sword.endFill();
		
		
		//have to add the pivot's y to the offset y of addrectangle
		
		this.offset_x = 30; 
		this.offset_y = -30;
	
		var physics_data = {
			sword: [
						{
							//"density": 2, "friction": 0, "bounce": 0, 
							//"filter": { "categoryBits": 1, "maskBits": 65535 },
							"shape": [   0 - this.offset_x , 0 - this.offset_y, 
							height - this.offset_x,  width/2 - this.offset_y  ,  0 - this.offset_x, width - this.offset_y  ,
							0 - this.offset_x, 0 - this.offset_y ]
						}  
				]
		}
		
		sword.physics_data = physics_data; 
		var new_data = resizePolygon(physics_data, "sword", scale_ratio); 
		

		sword.body.loadPolygon(null, new_data.sword);
		
		
			
		sword.body.data.gravityScale = 0;
		//sword.scale.setTo(0.4,0.4);
		sword.body.angle = player.angle; 
		sword.body.data.shapes[0].sensor = true;
		sword.pivot.y = -30;
		sword.pivot.x = 30;
			//scale sprite
		sword.scale.set(scale_ratio);
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
		shield.body_type = "circle"; 

		// set a fill and line style
		shield.beginFill(game_config.shield_color);
		shield.lineStyle(2, game_config.shield_color, 1);
		//setting the size of the initial shield based on the screen size
		shield.radius = gameProperties.availMax * 0.08; 
		shield.drawCircle(0, -70, shield.radius * 2);
		shield.endFill();
		shield.anchor.setTo(0.5,0.5);

		//scale the shield 
		shield.scale.set(scale_ratio); 
		shield.scale_value = scale_ratio; 
			
		// draw a shape
		game.physics.p2.enableBody(shield, true);
		shield.body.clearShapes();
		shield.body_size = shield.radius; 
		shield.body_offsetX = 0;
		shield.body_offsetY = -70; 
		shield.body.addCircle(shield.body_size * scale_ratio, 0, shield.body_offsetY * scale_ratio);
		

			
		shield.body.data.gravityScale = 0;
		shield.body.angle = player.angle; 
		shield.body.data.shapes[0].sensor = true;
		this.all_sprites.push(shield); 
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
				this.scale_sprites.push(this.crown); 
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
	
	//scaling function for the controling player 
	this.scaleonresize = function (ratio) {
		
		player_properties.speed_scaled = player_properties.speed * ratio; 
		player_properties.dashspeed_scaled = player_properties.dashspeed * ratio;
		console.log(player_properties.speed);
		
		var length = this.all_sprites.length; 
		for (var i = 0; i < length; i++) {
			this.all_sprites[i].scale.set(ratio);
			var gameObject = this.all_sprites[i];
			var body_type = gameObject.body_type;
			
			var body_scale = gameObject.scale_value; 
			console.log(this.all_sprites);

			
			if (body_type === "circle") {
				var new_bodySize = gameObject.body_size * scale_ratio;
				gameObject.body.clearShapes();
				
				var body_offsetX = gameObject.body_offsetX * scale_ratio; 
				var body_offsetY = gameObject.body_offsetY * scale_ratio; 
				gameObject.body.addCircle(new_bodySize, body_offsetX , body_offsetY);
			
				var percent_x = gameObject.body.x/gameProperties.maxWidth; 
				var percent_y = gameObject.body.y/gameProperties.maxHeight;

				if (gameObject.type === "body") {
					console.log("body");
					gameObject.x = percent_x * gameProperties.gameWidth; 
					gameObject.y = percent_y * gameProperties.gameHeight; 
				} else {
					console.log("shield");
					gameObject.body.x = percent_x * gameProperties.gameWidth; 
					gameObject.body.y = percent_y * gameProperties.gameHeight; 
				}
				
				
				var multiple = scale_ratio / prev_scaleratio; 
			
				gameObject.body.data.shapes[0].sensor = true;
			} else if (body_type === "none") {
				var percent_x = gameObject.body.x/gameProperties.maxWidth; 
				var percent_y = gameObject.body.y/gameProperties.maxHeight;

				gameObject.x = percent_x * gameProperties.gameWidth; 
				gameObject.y = percent_y * gameProperties.gameHeight; 
			}

		}
		
		//recreate the sword since it cannot be rescaled. Make sure to create a sword after the player
		//is created because of pivot. 
		this.destroy_sword();
		this.draw_sword(this.sword_width, this.sword_height, this.pierce);
	}
} 

function dash_draw () {
	var image_list = []; 
	var player_image = game.add.sprite(player.x,player.y, 'arrow');
	player_image.anchor.setTo(0.5, 0.5);
	player_image.scale.setTo(0.3, 0.3);
	game.add.tween(player_image).to( { alpha: 0 }, 300 , Phaser.Easing.Linear.None, true);
}


var remote_player = function (index, username, game, player, startx
, starty, startangle, bodycolor, swordcolor, shieldcolor) {

	this.item_lst = []; 
	
	// list of items 
	this.items = []; 
	// list of items with body 
	this.items_p = [];
	
	
	this.id = index;
	this.username = username;
	//contains all gameobjects used to create the player. mainly use for scaling
	this.all_sprites = [];
	
	this.enemy_score = 0; 
	
	this.player_attack = false;
	this.pierce = false;
	this.first = false; 
	this.stunned = false;
	this.game = game; 
	this.player = player; 
	this.angle = startangle;
	
	//color setup
	this.body_color = bodycolor; 
	this.sword_color = swordcolor;
	this.shield_color = shieldcolor;
	
	//enemy sword properties	
	this.sword_height = gameProperties.availMax * 0.2;
	this.sword_width = gameProperties.availMax * 0.05; 
	
	
	
	this.player = game.add.graphics(startx, starty);
	this.player.type = "body"; 
	this.player.scale.set(scale_ratio);
	this.player.beginFill(this.body_color);
	//radius of player
	this.player.radius = gameProperties.availMax * 0.08; 
	
	this.player.lineStyle(2, 0xffd900, 1);
	this.player.drawCircle(0, 0, this.player.radius * 2);
	this.player.endFill();

	
	this.player.anchor.setTo(0.5, 0.5);
	this.player.name = index.toString(); 
	game.physics.p2.enableBody(this.player,true);
	this.player.body_type = "circle";
	this.player.body.clearShapes();
	this.player.body_size = this.player.radius; 
	this.player.body_offsetX = 0;
	this.player.body_offsetY = 0;
	
	
	this.player.body.addCircle(this.player.body_size * scale_ratio, 0 , 0); 
	this.player.body.data.shapes[0].sensor = true;
	this.all_sprites.push(this.player);
	this.item_lst.push(this.player); 
	
	
	this.draw_sword = function (width, height, pierce) {
		
		
		this.sword = game.add.graphics(this.player.body.x, this.player.body.y);
		this.sword.name = "sword"; 
		this.sword.type = "gear";

		// set a fill and line style
		if (pierce) {
			this.sword.beginFill(this.sword_color);
			this.sword.lineStyle(4, 0xffd900, 1);
			this.sword.anchor.setTo(0.5,0.5);
				

		} else {
			this.sword.beginFill(swordcolor);
			this.sword.lineStyle(1, 0xffd900, 1);	
		}
			
		// draw a shape
		game.physics.p2.enableBody(this.sword, true);
		this.sword.body.clearShapes();
		this.sword.moveTo(0,0);
		this.sword.lineTo(height, width/2);
		this.sword.lineTo(0, width);
		this.sword.endFill();
		
		
		//have to add the pivot's y to the offset y of addrectangle
		
		this.offset_x = 30; 
		this.offset_y = -30;
	
		var physics_data = {
			sword: [
						{
							//"density": 2, "friction": 0, "bounce": 0, 
							//"filter": { "categoryBits": 1, "maskBits": 65535 },
							"shape": [   0 - this.offset_x , 0 - this.offset_y, 
							height - this.offset_x,  width/2 - this.offset_y  ,  0 - this.offset_x, width - this.offset_y  ,
							0 - this.offset_x, 0 - this.offset_y ]
						}  
				]
		}
		
		this.sword.physics_data = physics_data; 
		var new_data = resizePolygon(physics_data, "sword", scale_ratio); 
		

		this.sword.body.loadPolygon(null, new_data.sword);
		
		
			
		this.sword.body.data.gravityScale = 0;
		//sword.scale.setTo(0.4,0.4);
		this.sword.body.angle = this.player.angle; 
		this.sword.body.data.shapes[0].sensor = true;
		this.sword.pivot.y = -30;
		this.sword.pivot.x = 30;
		this.sword.scale.set(scale_ratio);
		
 
		this.item_lst.push(this.sword);
	}
	
	
	this.draw_handle = function (width) {

		
		this.handle = game.add.graphics(this.player.body.x, this.player.body.y);
		this.handle.type = "gear";
		this.handle.body_type = "none";
		this.handle.beginFill(this.sword_color);
		this.handle.lineStyle(2, 0xffd900, 1);
		this.handle.anchor.setTo(0.5,0.5);
		this.handle.scale.set(scale_ratio); 

		this.handle.moveTo(0, 15);
		this.handle.lineTo(0, 25);
		this.handle.lineTo(-50, 25);
		this.handle.lineTo(-50, 15);
		this.handle.endFill();
	
		game.physics.p2.enableBody(this.handle, false);
		this.handle.body.data.shapes[0].sensor = true;
		
		this.handle.pivot.y = -30;
		this.handle.pivot.x = 30;
		
		this.all_sprites.push(this.handle);
		this.item_lst.push(this.handle);
		
	}
	
	this.draw_shield = function () {
		

		
		this.shield = game.add.graphics(this.player.body.x, this.player.body.y);
		this.shield.type = "gear";
		this.shield.name = index.toString();
		this.shield.body_type = "circle"; 
		this.shield.key = "shield";
		this.shield.radius = gameProperties.availMax * 0.08;

		// set a fill and line style
		this.shield.beginFill(this.shield_color);
		this.shield.lineStyle(2, 0xffd900, 1);
		this.shield.drawCircle(0, -70, this.shield.radius * 2);
		this.shield.endFill();
		this.shield.anchor.setTo(0.5,0.5);

		//scale the shield 
		this.shield.scale.set(scale_ratio); 
		this.shield.scale_value = scale_ratio; 
			
		// draw a shape
		game.physics.p2.enableBody(this.shield, true);
		this.shield.body.clearShapes();
		this.shield.body_size = this.shield.radius; 
		this.shield.body_offsetX = 0;
		this.shield.body_offsetY = -70; 
		this.shield.body.addCircle(shield.body_size * scale_ratio, 0, shield.body_offsetY * scale_ratio);
		

			
		this.shield.body.data.gravityScale = 0;
		this.shield.body.angle = player.angle; 
		this.shield.body.data.shapes[0].sensor = true;
		
		//for scaling, following
		this.all_sprites.push(this.shield); 
		this.item_lst.push(this.shield);
	}
	
	
	//draw sword 
	this.draw_sword(this.sword_width, this.sword_height); 
	//this.draw_handle();
	this.draw_shield(); 
	
	
	this.style = { font: "16px Arial", fill: "black", align: "center"};
	this.playertext = game.add.text(100, 100, this.username , this.style);
	this.playertext.name = "playertext"; 
	
	
	this.playertext.anchor.set(0.5);
	this.item_lst.push(this.playertext); 
	
	
	this.enemy_attack = function (playerObject) {
		var image_list = []; 
		
		if (!this.attacking) {
			return;
		}

		var player_image = game.add.sprite(this.player.x, this.player.y, 'arrow');
		this.sword.attack = true; 
		player_image.anchor.setTo(0.5, 0.5);
		player_image.scale.setTo(0.3, 0.3);
		
		var drawAttack = game.add.tween(player_image).to( { alpha: 0 }, 300 , Phaser.Easing.Linear.None, true);
		//drawAttack.oncomplete(function(){player_image.destroy(true,false)},this);
		
		setTimeout(function(){playerObject.enemy_attack(playerObject);},5); 
	}
	

	for (var i = 0; i < player_properties.in_cols.length; i++) {
		if (!player_properties.stunned && player_properties.player_attack) {
			console.log('attack'); 
			socket.emit('player_attack', {player_id: socket.id, enemy_id: player_properties.in_cols[i]});
		}
	}
	
	this.destroy_sword = function () {
		for (var k = 0; k < this.item_lst.length; k++) {
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
		
		game.time.events.add(fade_time, function () {sprite.destroy(true,false); console.log ('destroy')} , this);
		game.add.tween(sprite).to( { alpha: 0 }, fade_time , Phaser.Easing.Linear.None, true);
	}
	
	
	this.itemsdestroy = function (fade_time) {
		for (var i = 0; i < this.item_lst.length; i++) {
			this.destroy_fade(this.item_lst[i], fade_time); 
		}
	}
	
	this.player_killed = function () {
		//changing all the body elements velocity to 0, maybe change this later 
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		this.sword.body.velocity.x = 0;
		this.sword.body.velocity.y = 0;
		this.shield.body.velocity.x = 0;
		this.shield.body.velocity.y = 0;
		this.player.killed = true;
		this.shield.killed = true;
		this.killed = true; 
	}
	
	this.player_destroy = function (fade_time) {
		this.itemsdestroy(fade_time); 
	}
	
	this.player_stunned = function () {
		//make sure this is called only once
	
			this.player_attack = false; 
			this.velocity_x = this.player.body.velocity.x;
			this.velocity_y = this.player.body.velocity.y; 
			this.player.body.velocity.x = this.velocity_x * -1/10; 
			this.player.body.velocity.y = this.velocity_y * -1/10; 
		
	}
	
	
	this.updateremote = function () {

		this.player.body.angle = this.player.angle;
		for (var k = 0; k < this.item_lst.length; k++) {
			var name = this.item_lst[k].name; 
			var type = this.item_lst[k].type; 
			if (name === "playertext") {
				this.item_lst[k].x = this.player.x;  
				this.item_lst[k].y = this.player.y + 50; 
			} else if (type === "gear") {
				this.item_lst[k].body.angle = this.player.angle;
				this.item_lst[k].body.velocity.x = this.player.body.velocity.x; 
				this.item_lst[k].body.velocity.y = this.player.body.velocity.y; 
			} else {
				this.item_lst[k].x = this.player.x;  
				this.item_lst[k].y = this.player.y - 50; 
			}
			
		}
	}
	
	this.scaleonresize = function (ratio) {
		var length = this.all_sprites.length; 
		
		
		for (var i = 0; i < length; i++) {
			this.all_sprites[i].scale.set(ratio);
			var gameObject = this.all_sprites[i];
			var body_type = gameObject.body_type;
			
			var body_scale = gameObject.scale_value; 
			
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
			} else if (body_type === "none") {
				var percent_x = gameObject.body.x/gameProperties.maxWidth; 
				var percent_y = gameObject.body.y/gameProperties.maxHeight;

				gameObject.body.x = percent_x * gameProperties.gameWidth; 
				gameObject.body.y = percent_y * gameProperties.gameHeight; 
			}

		}
		
		//recreate the sword
		this.destroy_sword();
		this.draw_sword(this.sword_width, this.sword_height, this.pierce);
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
		
		/*
		var bound_limit = 40;
		var upper_bound = bound_limit;
		var bottom_bound = game.world.height - bound_limit;
		var left_bound = bound_limit;
		var right_bound = game.world.width - bound_limit; 
		var play_bound = true; 

		
        if (speed === undefined) { speed = 60; }
        pointer = pointer;
        if (maxTime === undefined) { maxTime = 0; }
		
		*/
        var angle = angleToPointer(displayObject, pointer);

        if (maxTime > 0)
        {
            //  We know how many pixels we need to move, but how fast?
            speed = distanceToPointer(displayObject, pointer) / (maxTime / 1000);
        }
		
		/*
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
		*/
		displayObject.body.velocity.x = Math.cos(angle) * speed;
		displayObject.body.velocity.y = Math.sin(angle) * speed;

        return angle;

}

function distanceToPointer (displayObject, pointer, world) {


        if (world === undefined) { world = false; }

        var dx = (world) ? displayObject.world.x - pointer.worldX : displayObject.x - pointer.worldX;
        var dy = (world) ? displayObject.world.y - pointer.worldY : displayObject.y - pointer.worldY;

        return Math.sqrt(dx * dx + dy * dy);

}

function angleToPointer (displayObject, pointer, world) {

        
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
