function player_coll (body, bodyB, shapeA, shapeB, equation) {
	var key = body.sprite.id; 
	var item_type = body.sprite.type; 
	
	this.boost_turnoff = function () {
		player_properties.speed_boost = false; 
	}
	
	this.stun_immuneturnoff = function () {
		player_properties.stun_immune = false; 
	}
	
	if (item_type === 'speed') {
		if (player_properties.speed <= 600) {
			var prev_speed = player_properties.speed; 
			player_properties.speed_pickup(); 
			
			game.time.events.add(Phaser.Timer.SECOND * 4, function () {player_properties.speed_boost = false
			player_properties.speed = prev_speed} , this);
		}
		
		socket.emit('item_picked', {id: key, type: item_type}); 
	} else if (item_type === 'stun') {
		player_properties.stun_immunepickup();
		
		game.time.events.add(Phaser.Timer.SECOND * 4, this.stun_immuneturnoff, this); 
		socket.emit('item_picked', {id: key, type: item_type}); 
	} else if (item_type === 'pierce') {
		player_properties.pierce_inattack = true; 
		player_properties.pierce_pickup(); 
		
		socket.emit('item_picked', {id: key, type: item_type}); 
	} 
}


function collide_handle (body, bodyB, shapeA, shapeB, equation) {
	if (body.sprite || body.sprite.killed) {
		var key = body.sprite;
		var id = body.sprite.name; 
		var current_id = player_properties.player_id;  
		// check to see if the player sword collied with the body of enemy; make sure the sword does not hit the player body itself
		
		if (body.sprite.key === 'shield') {
			player_properties.in_cols_shield.push(body.sprite.name);
			
			// if the kill happens right after hits,  
			var kill_recent = false; 
			for (var j = 0; j < player_properties.in_cols_hit.length ; j++) {
				if (player_properties.in_cols_hit[j] === id) {
					kill_recent = true; 
				}
			}
			
			if (player_properties.player_attack && !player_properties.pierce && !kill_recent) {
				if (!player_properties.stun_immune) {
					player_properties.in_cols_shieldhit.push(id); 
					socket.emit('player_stunned', {player_id: socket.id, enemy_id: body.sprite.name});
				} else {
					player_properties.player.body.x = 0;
					player_properties.player.body.y = 0;
					player_properties.player_attack = false; 
				}
					
			} else {
				return;
			}
			
		} else if (body.sprite.key === 'arrow' && current_id !== body.sprite.name) {
			player_properties.in_cols.push(body.sprite.name); 
			// if the player is stunned, before the player hits, don't proceed with attack;
			var stun_recent = false;
			for (var j = 0; j < player_properties.in_cols_shieldhit.length; j++) {
				if (player_properties.in_cols_shieldhit[j] === id) {
					stun_recent = true; 
				}
			}
			
			
			if (!player_properties.stunned && player_properties.player_attack && !stun_recent) {
				player_properties.in_cols_hit.push(id); 
				//emit message of the position of the player 
				var pierce = player_properties.pierce; 
				console.log('killed');
				socket.emit('player_attack', {player_id: socket.id, enemy_id: body.sprite.name, pierce: pierce});
			} else {
				return; 
			}
			
			
		} else if (body.sprite.key === 'sword' && player_properties.player_attack) {
			// check if the other player is attacking too. if they are, stop the movement 
			if (body.sprite.attack) {
				player_properties.player_attack = false; 
				console.log('true');
				player.body.velocity.x = 0; 
				player.body.velocity.y = 0;
			}
		} else {
			return;
		}
	}
}


function collide_exit (body, bodyB, shapeA, shapeB, equation) {
	if (body.sprite) { 
		var col_id = body.sprite.name;
		var current_id = player_properties.player_id; 
	
		if (body.sprite.key === 'arrow') {
			console.log('collide exit');
			// get rid of all collisions between sword and enemy body 
			for (var i = 0; i < player_properties.in_cols.length; i++) {
				if (player_properties.in_cols[i] === col_id) {
					player_properties.in_cols.splice(i, 1);
				}
			}
			// get rid of all instant collisions between sword and enemy body
			for (var i = 0; i < player_properties.in_cols_hit.length; i++) {
				if (player_properties.in_cols_hit[i] === col_id) {
					player_properties.in_cols_hit.splice(i, 1);
				}
			}

		} else if (body.sprite.key === 'shield') {
			console.log('shield exit');
			player_properties.in_cols_shield.splice(0, 1);
			
			// get rid of all instant collisions between shield and sword
			for (var i = 0; i < player_properties.in_cols_shieldhit.length; i++) {
				if (player_properties.in_cols_shieldhit[i] === col_id) {
					player_properties.in_cols_shieldhit.splice(i, 1);
				}
			}
		}
		
	}
}