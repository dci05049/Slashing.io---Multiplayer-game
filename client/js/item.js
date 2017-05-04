var speed_object = function (id, game, type, startx, starty, value) {
	this.game = game; 
	this.id = id;
	
	this.posx = startx;  
	this.posy = starty; 
	this.powerup = value;
	
	this.item = game.add.sprite(this.posx, this.posy, 'speedpickup'); 
	this.item.type = 'speed';
	this.item.id = id;
	this.item.scale.setTo(0.23, 0.23);
	
	this.game.physics.p2.enableBody(this.item,true);
	this.item.body.data.shapes[0].sensor = true;
}

var stun_object = function (id, game, type, startx, starty, value) {
	this.game = game; 
	this.id = id; 
	
	this.posx = startx;  
	this.posy = starty; 
	this.powerup = value;
	
	this.item = game.add.sprite(this.posx, this.posy, 'stunpickup'); 
	this.item.type = 'stun';
	this.item.id = id;
	this.item.scale.setTo(0.3 , 0.3);
	
	this.game.physics.p2.enableBody(this.item,true);
	this.item.body.data.shapes[0].sensor = true;
}


var pierce_object = function (id, game, type, startx, starty, value) {
	this.game = game; 
	this.id = id; 
	
	this.posx = startx;  
	this.posy = starty; 
	this.powerup = value;
	
	this.item = game.add.sprite(this.posx, this.posy, 'piercepickup'); 
	this.item.type = 'pierce';
	this.item.id = id;
	this.item.scale.setTo(0.3 , 0.3);
	
	this.game.physics.p2.enableBody(this.item,true);
	this.item.body.data.shapes[0].sensor = true;
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
