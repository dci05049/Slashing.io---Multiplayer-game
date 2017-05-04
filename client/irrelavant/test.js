var object = function (hi) {
	console.log(this); 
	console.log(hi); 
}
 
var player = new object("5");  
console.log(player.getPrototypeOf(this));