
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
		player_properties.stun_immune = true; 
		game.time.events.add(Phaser.Timer.SECOND * 4, this.stun_immuneturnoff, this); 
		
		socket.emit('item_picked', {id: key, type: item_type}); 
	} else if (item_type === 'pierce') {
		player_properties.pierce_pickup(); 
		
		socket.emit('item_picked', {id: key, type: item_type}); 
	} 
}


function collide_handle (body, bodyB, shapeA, shapeB, equation) {
	if (body.sprite) {
		var key = body.sprite; 
		var current_id = player_properties.player_id;  
		// check to see if the player sword collied with the body of enemy; make sure the sword does not hit the player body itself
		
		if (body.sprite.key === 'shield' && player_properties.player_attack) {
			if (!player_properties.pierce) {
				player_properties.stunned = true;
				socket.emit('player_stunned', {player_id: socket.id, enemy_id: body.sprite.name});
			}
		} else if (body.sprite.key === 'arrow' && current_id !== body.sprite.name) {
			player_properties.in_cols.push(body.sprite.name); 
			
			// if the player is stunned, dont do anything			
			if (player_properties.stunned) {
				return;
			}
			
			if (!player_properties.stunned && player_properties.player_attack) {
				//emit message of the position of the player 
				var pierce = player_properties.pierce; 
				socket.emit('player_attack', {player_id: socket.id, enemy_id: body.sprite.name, pierce: pierce});
			}
		}
	}
}

function collide_exit (body, bodyB, shapeA, shapeB, equation) {
	if (body.sprite) {
		var col_id = body.sprite.name; 
		var current_id = player_properties.player_id; 
	
		if (body.sprite.key === 'arrow') {
			for (var i = 0; i < player_properties.in_cols.length; i++) {
				if (player_properties.in_cols[i] === col_id) {
					console.log('found');
					console.log(i);
					player_properties.in_cols.splice(i, 1);
				}
			}
		}
	}
}