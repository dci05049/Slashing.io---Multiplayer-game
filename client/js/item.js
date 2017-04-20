var speed_object = function (id, game, type, startx, starty, value) {
	this.game = game; 
	
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

// search through enemies list to find the right object of the id; 
function finditembyid (id) {
	for (var i = 0; i < speed_pickup.length; i++) {
		if (speed_pickup[i].item.id == id) {
			return speed_pickup[i]; 
		}
	}
}
