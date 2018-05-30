let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
//the dimensions of the canvas
let width = canvas.offsetWidth;
let height = canvas.offsetHeight;
//debug
console.log(width + ", " + height);

//change fill color
ctx.fillStyle = "red";
//draw a rectangle
ctx.fillRect(0,0,10,10);
//look up HTML5 Canvas API for more