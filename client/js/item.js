var speed_object = function (id, game, type, startx, starty, value) {
	this.game = game; 
	this.id = id;
	
	this.posx = startx;  
	this.posy = starty; 
	this.powerup = value;
	
	this.item = game.add.sprite(this.posx * scale_ratio, this.posy * scale_ratio, 'speedpickup'); 
	this.item.type = 'speed';
	this.item.id = id;
	
	this.item.scale_offset = -0.9;
	this.item.scale.set(scale_ratio + this.item.scale_offset);
	this.game.physics.p2.enableBody(this.item, true);
	this.item.body.clearShapes();
	this.item.body_size = 250; 
	this.item.body_offsetX = 0;
	this.item.body_offsetY = 0; 
	this.item.body.addCircle(this.item.body_size * (scale_ratio + this.item.scale_offset), 0, this.item.body_offsetY * (scale_ratio + this.item.scale_offset));
	
	this.item.body_type = "circle";
	
	this.item.body.data.shapes[0].sensor = true;
	scale_sprites.push(this.item);
}

var stun_object = function (id, game, type, startx, starty, value) {
	this.game = game; 
	this.id = id; 
	
	this.posx = startx;  
	this.posy = starty; 
	this.powerup = value;
	
	this.item = game.add.sprite(this.posx * scale_ratio, this.posy * scale_ratio, 'stunpickup'); 
	this.item.type = 'stun';
	this.item.id = id;
	
	this.item.scale_offset = -0.9;
	this.item.scale.set(scale_ratio + this.item.scale_offset);
	
	this.game.physics.p2.enableBody(this.item, true);
	this.item.body.clearShapes();
	this.item.body_size = 250; 
	this.item.body_offsetX = 0;
	this.item.body_offsetY = 0; 
	this.item.body.addCircle(this.item.body_size * (scale_ratio + this.item.scale_offset), 0, this.item.body_offsetY * (scale_ratio + this.item.scale_offset));
	this.item.body_type = "circle";
	
	this.item.body.data.shapes[0].sensor = true;
	scale_sprites.push(this.item);
}


var pierce_object = function (id, game, type, startx, starty, value) {
	this.game = game; 
	this.id = id; 
	
	this.posx = startx;  
	this.posy = starty; 
	this.powerup = value;
	
	this.item = game.add.sprite(this.posx * scale_ratio, this.posy * scale_ratio, 'piercepickup'); 
	this.item.type = 'pierce';
	this.item.id = id;
	
	this.item.scale_offset = -0.9;
	this.item.scale.set(scale_ratio + this.item.scale_offset);
	
	this.game.physics.p2.enableBody(this.item, true);
	this.item.body.clearShapes();
	this.item.body_size = 250; 
	this.item.body_offsetX = 0;
	this.item.body_offsetY = 0; 
	this.item.body.addCircle(this.item.body_size * (scale_ratio + this.item.scale_offset), 0, this.item.body_offsetY * (scale_ratio + this.item.scale_offset));
	
	this.item.body_type = "circle";
	this.item.body.data.shapes[0].sensor = true;
	scale_sprites.push(this.item);
}


var food_object = function (id, game, type, startx, starty, value) {
	this.game = game; 
	this.id = id; 
	
	this.posx = startx;  
	this.posy = starty; 
	this.powerup = value;
	
	
	this.item = game.add.graphics(this.posx * scale_ratio, this.posy * scale_ratio);
	this.item.scale.set(scale_ratio);

	// set a fill and line style
	var index = getRndInteger(0, 10); 
	var randomColo = randomColor({
		luminosity: 'dark',
		hue: 'red'
	}); 
	randomColo = randomColo.replace("#", "0x"); 
	this.item.beginFill(randomColo);
	this.item.lineStyle(2, randomColo, 1);
	this.item.drawCircle(0, 0, 20);

	this.item.type = 'food';
	this.item.id = id;
	
	this.game.physics.p2.enableBody(this.item, true);
	this.item.body.clearShapes();
	this.item.body_size = 10; 
	this.item.body_offsetX = 0;
	this.item.body_offsetY = 0; 
	this.item.body.addCircle(this.item.body_size * scale_ratio, 0, this.item.body_offsetY * scale_ratio);
	
	this.item.body_type = "circle";
	this.item.body.data.gravityScale = 0;

	this.item.body.data.shapes[0].sensor = true;
	scale_sprites.push(this.item);

}




// search through enemies list to find the right object of the id; 
function finditembyid (id, length, list_item) {
	for (var i = 0; i < length; i++) {

		if (list_item[i].id == id) {
			return list_item[i]; 
		}
	}
	
	return false; 
}

function destroyitemid (id, length, list_item) {
	for (var k = 0; k < list_item.length; k++) {
		if (list_item[k].id == id) {
			list_item.splice(k, 1); 
		}
	}
}




