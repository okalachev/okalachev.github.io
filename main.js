// logical (stored) canvas size
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1600;

const PEN_WIDTH = 3; // logical pen width
const PEN_COLOR = '#404040';

// const DRAW_HOST = location.hostname;
const DRAW_HOST = 'draw.chev.me';
const DRAW_PORT = 43471;

var body = document.querySelector('body');
var draw = false;
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var dpr = window.devicePixelRatio || 1;

// setup canvas
canvas.style.width = CANVAS_WIDTH + 'px';
canvas.style.height = CANVAS_HEIGHT + 'px';
canvas.width = CANVAS_WIDTH * dpr;
canvas.height = CANVAS_HEIGHT * dpr;

// setup context
ctx.scale(dpr, dpr);
ctx.lineWidth = PEN_WIDTH;
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.strokeStyle = PEN_COLOR;

var ws = new ReconnectingWebSocket('ws://' + DRAW_HOST + ':' + DRAW_PORT);

var points = [];

function sendPath() {
	if (points.length == 0) {
		return;
	}

	var path = { points: points };
	ws.send(JSON.stringify(path));

	points = [];
}

ws.onmessage = function(msg) {
	console.log('recv', msg);
	// draw paths
	var j = 0;
	paths = JSON.parse(msg.data);
	for (var path of paths) {
		// ctx.fillText(path.ip + ':' + path.port, path.points[0][0], path.points[0][1]);
		ctx.moveTo(path.points[0][0], path.points[0][1]); // first point
		for (var i = 1; i < path.points.length; i++) {
			// rest points
			ctx.lineTo(path.points[i][0], path.points[i][1]);
		}
		ctx.stroke();
	}
	console.log('%s points total', j);
}

canvas.addEventListener('mousedown', function(e) {
	if (e.button !== 0) return; // not left key

	body.classList.add('drawing');
	draw = true;
	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;
	ctx.moveTo(mouseX, mouseY);
	points.push([mouseX, mouseY]);
});

canvas.addEventListener('mouseup', function(e) {
	body.classList.remove('drawing');
	draw = false;
	sendPath();
});

canvas.addEventListener('mouseleave', function(e) {
	body.classList.remove('drawing');
	draw = false;
	sendPath();
});

canvas.addEventListener('mousemove', function(e) {
	if (!draw) return;

	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;

	ctx.lineTo(mouseX, mouseY);
	ctx.stroke();

	points.push([mouseX, mouseY]);
});
