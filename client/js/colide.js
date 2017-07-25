function player_coll (body, bodyB, shapeA, shapeB, equation) {
	var key = body.sprite.id; 
	var item_type = body.sprite.type; 
	
	if (item_type === 'speed') {
		socket.emit('item_picked', {id: key, type: item_type}); 
	} else if (item_type === 'stun') {

		socket.emit('item_picked', {id: key, type: item_type}); 
	} else if (item_type === 'pierce') {
		socket.emit('item_picked', {id: key, type: item_type}); 
	} else if (item_type === 'food') {
		socket.emit('item_picked', {id: key, type: item_type}); 
	}
}


function collide_handle (body, bodyB, shapeA, shapeB, equation) {
	if (body.sprite) {
		//if the enemy is dead already, don't do anything
		if (body.sprite.killed) {
			console.log('dead');
			return; 
		}
		
		var key = body.sprite;
		var id = body.sprite.name; 
		var current_id = player_properties.player_id;  
		// check to see if the player sword collied with the body of enemy; make sure the sword does not hit the player body itself
		
		if (body.sprite.key === "shield") {
			player_properties.in_cols_shield.push(body.sprite.name);
			
			
			if (player_properties.player_attack && !player_properties.pierce) {
				player_properties.in_cols_shieldhit.push(id); 
				socket.emit('player_stunned', {player_id: socket.id, enemy_id: body.sprite.name});
				
			} else {
				return;
			}
			
		} else if (body.sprite.type === "body" && current_id !== body.sprite.name) {
			player_properties.in_cols.push(body.sprite.name); 
			console.log("hit");
			// if the player is stunned, before the player hits, don't proceed with attack;
			
			console.log(player_properties.player_attack);
			if (!player_properties.stunned && player_properties.player_attack) {
				player_properties.in_cols_hit.push(id); 
				//emit message of the position of the player 
				var pierce = player_properties.pierce; 
				console.log('killed');
				socket.emit('player_attack', {player_id: socket.id, enemy_id: body.sprite.name, pierce: pierce});
			} else {
				return; 
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
	
		if (body.sprite.type === "body") {
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