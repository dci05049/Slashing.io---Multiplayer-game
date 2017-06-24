function experience_bar(gameX, gameY, width) {
	var barre1_x = gameX;
	var barre1_y = gameY; 

	player_properties.myHealthBar = new HealthBar(game, {x: barre1_x * 0.5, y: barre1_y * 0.9, width: width * scale_ratio});
	player_properties.myHealthBar.animationDuration = 500; 
	var exp_percent = (player_properties.expvalue/player_properties.exp_max) * 100; 
    player_properties.myHealthBar.setPercent(exp_percent);
	player_properties.myHealthBar.setFixedToCamera(true);
	player_properties.myHealthBar.type = "experiencebar";
}



function gui_interface () {
	score_board = game.add.sprite(gameProperties.screenWidth * 0.9, gameProperties.screenHeight * 0.1, 'scoreboard');
	console.log(score_board);
	score_board.posX_multiple = 0.9; 
	score_board.posY_multiple = 0.1; 
	score_board.alpha = 0.8;
	score_board.anchor.setTo(0.5, 0.5);
	score_board.scale.setTo(scale_ratio, scale_ratio);
	score_board.fixedToCamera = true;
	score_board.body_type = "gui"; 
	scale_sprites.push(score_board);
	
	experience_bar(gameProperties.screenWidth, gameProperties.screenHeight, 400); 
	
	
	var style = { font: "13px Press Start 2P", fill: "black", align: "center"};
	
	
	playertext = game.add.text(50, 50, (socket.id), style);
	playertext.anchor.set(0.5);
	playertext.name = 'name';
	player_properties.items.push(playertext); 
	
	
	player_followtext = game.add.text(0, 0, '' , style); 
	player_properties.items.push(player_followtext);
	
	
	player_distext = game.add.text(gameProperties.screenWidth/2, 50, '', style); 
	player_distext.anchor.set(0.5); 
	player_distext.fixedToCamera = true; 
	
	
	player_score = game.add.text(gameProperties.screenWidth - 100, gameProperties.screenHeight - 30, "", style);
	player_score.anchor.set(0.5);
	player_score.fixedToCamera = true;  
	
	
	player_level = game.add.text(100, gameProperties.screenHeight - 30, "", style); 
	player_level.anchor.set(0.5); 
	player_level.fixedToCamera = true;
	
	
	leader_text = game.add.text(0, 15, "", style);
	leader_text.anchor.set(0.5);

	score_board.addChild(leader_text);
	
}

function lbupdate (data) {
	var board_string = ""; 
	var count = 0; 
	var num_topscorer = data.length; 
	
	if (data) {
		//username, playeproperties and there is at least one element in the top scorer list 
	
		if (game_config.socketid && data[0]) {
 
			if (game_config.socketid === data[0].id) {
				player_properties.first_place(); 
			} else if (player_properties.first) {
				player_properties.first = false; 
				player_properties.crown.destroy(true,false); 
			}
		} else {
			return; 
		}
		
		for (var i = 0;  i < 10; i++) {
			
			if (i < data.length) {
				var username = data[i].username; 
				var len = username.length;
				if (len >= 10) {
					var temp = ""; 
					for (var j = 0; j < len; j++) {
						if (j < 5) {
							temp += username[j]; 
						}
					}
					
					temp += "...";
					console.log(temp);
					username = temp;
				}
				
				board_string = board_string.concat(i + 1,": ");
				board_string = board_string.concat(username," ",(data[i].score).toString(),"\n");
			} else {
				board_string = board_string.concat("\n");
			}
			for (var j = 0; j < board_string.length; j++) {
				if (board_string[j] == "\n") {
					count += 1; 
				}
			}
		}
	}
	
	leader_text.setText(board_string); 
}