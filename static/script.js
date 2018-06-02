
//frame rate
const FPS = 30;
//user's name
let name = "";
const showPage = (index) => {
    let pages = document.getElementsByClassName("page");
    for(let i = 0; i < pages.length; i++){
        pages[i].style.display = "none";
    }
    pages[index].style.display = "block";
}
const game = () => {
    showPage(1);
    let canvas = document.getElementById("canvas");
    canvas.style.border = "black 1px solid";
    let ctx = canvas.getContext("2d");
    //width of canvas
    let width = canvas.offsetWidth;
    //height of canvas
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    //if game is ready to play, ready will be 2 if ready to play
    let ready = 0;
    //size of each grid block
    let GRID_SIZE;
    //the y-offset of the map
    let OFFSET_Y;
    //the x-offset of the map
    let OFFSET_X;
    //# of columns in grid
    let GRID_WIDTH;
    //# of rows in grid
    let GRID_HEIGHT;
    window.addEventListener("resize", () => {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        GRID_SIZE = Math.min(width / GRID_WIDTH, height / GRID_HEIGHT);
        OFFSET_Y = (height - GRID_SIZE * GRID_HEIGHT) / 2;
        OFFSET_X = (width - GRID_SIZE * GRID_WIDTH) / 2;
    });

ambience_timing = 0;

const ambience = (map, ctx) => {
    ambience_timing++;
    switch (map) {
        case 1:
            x = ambience_timing % 600;
            ctx.drawImage(GRAPHICS["bg1"], OFFSET_X, OFFSET_Y, GRID_SIZE * 40, GRID_SIZE * 20);
            ctx.drawImage(GRAPHICS["bg1a"], GRID_SIZE * (13 + 20 / 32 - x / 16) + OFFSET_X, GRID_SIZE * (6 + 5/32 - x / 32) + OFFSET_Y, GRID_SIZE * 4, GRID_SIZE * 4);

    }
}

const drawBackground = (map, ctx) => {
    amd = ambience(map[2], ctx);
    background = toMap(map[0], ctx);
    foreground = toMap(map[1], ctx);
//    DrawLayer(foreground, ctx);
//    DrawLayer(background, ctx);
}

let socket = io();

//frame rate
const FPS = 30;
const getKey = (e) => {
    var keynum;
    if(window.event) {
      keynum = e.keyCode;
    } else if(e.which){
      keynum = e.which;
    }
    return String.fromCharCode(keynum);
}
const game = () => {

    //the current state of keys
    let keys = {};
    let DIRS = {
        UP: 0,
        DOWN: 1,
        LEFT: 2,
        RIGHT: 3
    }
    let dir = -1;
    document.addEventListener("keydown", (e) => {
        keys[e.key.toString().toLowerCase()] = true;
    });
    document.addEventListener("keyup", (e) => {
        keys[e.key.toString().toLowerCase()] = false;
    });

    let game = {};

    socket.emit("new player", name);
    socket.on("map", (data) => {
        GRID_SIZE = Math.min(width / data.width, height / data.height);
        OFFSET_Y = (height - GRID_SIZE * data.height) / 2;
        OFFSET_X = (width - GRID_SIZE * data.width) / 2;
        GRID_WIDTH = data.width;
        GRID_HEIGHT = data.height;
        ready++;
    });
    socket.on("state", (data) => {
        game = data;
        if(ready < 2){
            ready++;
        }
    });

    //game loop
    setInterval(() => {
        if(ready === 2){
            drawBackground(default_map, ctx);
            let players = game.players;

            //draw players
            for(let i in players){
                for(let j = 0; j < players[i].pos.length; j++){
                    ctx.fillStyle = "black";
                    ctx.fillRect(players[i].pos[j][0] * GRID_SIZE + OFFSET_X, players[i].pos[j][1] * GRID_SIZE + OFFSET_Y, GRID_SIZE, GRID_SIZE);
                }
                ctx.fillStyle = "black";
                ctx.strokeStyle = "white";
                ctx.font = "14px Song Myung";
                ctx.textAlign = "center";
                let textdim = ctx.measureText(players[i].name);
                ctx.fillText(players[i].name, players[i].pos[0][0] * GRID_SIZE + OFFSET_X + GRID_SIZE / 2, players[i].pos[0][1] * GRID_SIZE + OFFSET_Y - 14);
            }
        }
    }, 1000 / FPS);

    setInterval(() => {
        if(ready === 2){
            socket.emit("input", {
                UP: keys.arrowup || keys.w,
                DOWN: keys.arrowdown || keys.s,
                LEFT: keys.arrowleft || keys.a,
                RIGHT: keys.arrowright || keys.d
            });
        }
    }, 1000 / 60);
};
document.getElementById("name").addEventListener("keypress", (e) => {
    if(e.keyCode === 13 && document.getElementById("name").value.length > 0){
        name = document.getElementById("name").value;
        game();
    }
});
document.getElementById("play").addEventListener("click", () => {
    if(document.getElementById("name").value.length > 0){
        name = document.getElementById("name").value;
        game();
    }
});
