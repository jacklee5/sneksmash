//frame rate
const FPS = 30;

//user's name
let name = "";

//show a page by index
const showPage = (index) => {
    let pages = document.getElementsByClassName("page");
    for(let i = 0; i < pages.length; i++){
        pages[i].style.display = "none";
    }
    pages[index].style.display = "block";
}

//the canvas definition
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

//width of canvas
let width = canvas.offsetWidth;

//height of canvas
let height = canvas.offsetHeight;
canvas.width = width;
canvas.height = height;

//ready will be 2 if ready to play
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

//the map
let MAP;

window.addEventListener("resize", () => {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    GRID_SIZE = Math.floor(Math.min(width / GRID_WIDTH, height / GRID_HEIGHT));
    OFFSET_Y = (height - GRID_SIZE * GRID_HEIGHT) / 2;
    OFFSET_X = (width - GRID_SIZE * GRID_WIDTH) / 2;
});

let GRAPHICS = {};
const loadImages = (urls) => {
  for (let i = 0; i < urls.length; i++) {
    let img = new Image();
    GRAPHICS[urls[i].name] = img;
    img.onload = () => {
      GRAPHICS[urls[i].name] = img;
    }
    img.src = urls[i].link;
  }
}

//init
{
  loadImages([
    {
      name: "11",
      link: "static/tiles/11.png"
    },
    {
      name: "bg1",
      link: "static/tiles/BackdropBasic.png"
        
    },
    {
      name: "bg1a",
      link: "static/tiles/Minecarts.png"
        
    },
    {
      name: "12",
      link: "static/tiles/12.png"
        
    },
    {
      name: "13",
      link: "static/tiles/13.png"
    },
    {
      name: "14",
      link: "static/tiles/14.png"
    },
    {
      name: "15",
      link: "static/tiles/15.png"
    },
    {
      name: "16",
      link: "static/tiles/16.png"
    },
    {
      name: "17",
      link: "static/tiles/17.png"
    },
    {
      name: "18",
      link: "static/tiles/18.png"
    },
    {
      name: "19",
      link: "static/tiles/19.png"
    },
    {
      name: "211",
      link: "static/tiles/211.png"
    },
    {
      name: "24",
      link: "static/tiles/24.png"
    },
    {
      name: "25",
      link: "static/tiles/25.png"
    },
    {
      name: "26",
      link: "static/tiles/26.png"
    },
    {
      name: "221",
      link: "static/tiles/221.png"
    },
    {
      name: "27",
      link: "static/tiles/27.png"
    },
    {
      name: "28",
      link: "static/tiles/28.png"
    },
    {
      name: "29",
      link: "static/tiles/29.png"
    },
    {
      name: "231",
      link: "static/tiles/231.png"
    },
    {
      name: "0",
      link: "static/sprites/Boot.png"
    },
    {
      name: "1",
      link: "static/sprites/BetterShield.png"
    },
    {
      name: "2",
      link: "static/sprites/Onigiri.png"
    },
    {
      name: "3",
      link: "static/sprites/BadOnigiri.png"
    }
  ]);
}

//Turns TMX stuff to an array with filenames
const toMap = (map) => {
    var dict = {};
	dict[1]  = "11";
	dict[2]  = "12";
	dict[3]  = "13";
	dict[9]  = "14";
	dict[10] = "15";
	dict[11] = "16";
	dict[17] = "17";
	dict[18] = "18";
	dict[19] = "19";
	dict[68] = "211";
    dict[73] = "24";
	dict[74] = "25";
	dict[75] = "26";
	dict[76] = "221";
	dict[81] = "27";
	dict[82] = "28";
	dict[83] = "29";
	dict[84] = "231";
	for (let i = 0; i < map.length; i++) {
		for (let j = 0; j < map[i].length; j++) {
            if (GRAPHICS[dict[map[i][j]]]) {
                ctx.drawImage(GRAPHICS[dict[map[i][j]]], GRID_SIZE * j + OFFSET_X, GRID_SIZE * i + OFFSET_Y, GRID_SIZE, GRID_SIZE);
            }
		}
	}
}

ambience_timing = 0;

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

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
    //make sure nothing is drawn outside of the map
    ctx.clearRect(0, 0, OFFSET_X, height);
    ctx.clearRect(width - OFFSET_X, 0, OFFSET_X, height);
    ctx.clearRect(0, 0, width, OFFSET_Y);
    ctx.clearRect(0, height - OFFSET_Y, width, OFFSET_Y);
}

var deathParticles = [];

const deathEffects = (pos) => {
    sounds = ["static/audio/damage.mp3", "static/audio/aaa.mp3"];
    playSound(sounds[Math.floor(Math.random() * sounds.length)]);
    for (let i = 0; i < pos.length; i++) {
        deathParticles.push([pos[i], 50]);
    }
}

const breakEffectsLoop = () => {
    var destroyParticle = [];
    for (let i = 0; i < deathParticles.length; i++) {
        var x = 25 - (deathParticles[i][1] / 2);
        var y = (x - 20) * (x - 2) / -10 + 4;
        var z = y / -30;
        if (deathParticles[i][1] !== 0) {
            deathParticles[i][1]--;
            ctx.fillStyle = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
            ctx.fillRect(OFFSET_X + (deathParticles[i][0][0] + .5 + x / 100) * GRID_SIZE, OFFSET_Y + (deathParticles[i][0][1] + .5 + z) * GRID_SIZE, GRID_SIZE / 4, GRID_SIZE / 4);
        
            ctx.fillStyle = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
            ctx.fillRect(OFFSET_X + (deathParticles[i][0][0] + .5 - x / 100) * GRID_SIZE, OFFSET_Y + (deathParticles[i][0][1] + .5 + z) * GRID_SIZE, GRID_SIZE / 4, GRID_SIZE / 4);
        } else {
            destroyParticle.push[i];
        }
    }
    for (let i = 0; i < destroyParticle.length; i++) {
        deathParticle.splice[destroyParticle[i]];
    }
}



const playSound = (file) => {
    let snd1 = new Audio();
    let src1 = document.createElement("source");
    src1.type = "audio/mpeg";
    src1.src = file;
    snd1.appendChild(src1);
    snd1.play();
}

let socket = io();

const getKey = (e) => {
    var keynum;
    if(window.event) {
      keynum = e.keyCode;
    } else if(e.which){
      keynum = e.which;
    }
    return String.fromCharCode(keynum);
}
const startGame = () => {
    socket.emit("start");
}
socket.on("msg", (msg) => {
    if(msg.type === "error")
        document.getElementById("error").innerHTML = msg.content;
});
socket.on("success", () => {
    game();
})
const game = () => {
    showPage(2);
    setCookie("username", name, 365);
    setCookie("color", document.getElementById("colours").jscolor.toHEXString());
    let isLeader;
    socket.emit("new player", name);
    socket.on("map", (data) => {
        console.log("on map");
        GRID_SIZE = Math.min(width / data.width, height / data.height);
        OFFSET_Y = (height - GRID_SIZE * data.height) / 2;
        OFFSET_X = (width - GRID_SIZE * data.width) / 2;
        GRID_WIDTH = data.width;
        GRID_HEIGHT = data.height;
        ready++;
        MAP = data.map;
    });
    socket.on("room", (room) => {
        showPage(2);
        console.log("on room");
        document.getElementById("room-name").innerHTML = room.name;
        if(room.leader === socket.id){
            isLeader = true;
        }
    });
    socket.on("players", (data) => {
        console.log("on players");
        let players = data.players;
        let hasStarted = data.hasStarted;
        let leader = data.leader;
        let el = document.getElementById("players");
        el.innerHTML = "";
        for(let i in players){
            el.innerHTML += `<p class = 'player'>${players[i].name}</p>`;
        }
        el = document.getElementById("msg");
        if(leader === socket.id){
            el.innerHTML = "<a class = 'button' onclick = 'startGame();'>Play</a>"
        }else if(hasStarted){
            el.innerHTML = "Game has already started!";   
        }else{
            el.innerHTML = "Waiting for leader to start game...";
        }        
    });
    socket.on("start", () => {
        showPage(1);
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        GRID_SIZE = Math.floor(Math.min(width / GRID_WIDTH, height / GRID_HEIGHT));
        OFFSET_Y = (height - GRID_SIZE * GRID_HEIGHT) / 2;
        OFFSET_X = (width - GRID_SIZE * GRID_WIDTH) / 2;
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

        socket.on("state", (data) => {
            game = data;
            if(ready < 2){
                ready++;
            }
        });
        socket.on("death", (player) => {
            if(player.userId === socket.id){
                document.getElementById("darken").style.display = "block";
                let results = document.getElementById("results")
                results.style.display = "block";
                results.innerHTML = "<h1>You died!</h1><a class = 'button' onclick = 'location.reload()'>Play again</a>"
            }
            deathEffects(player.pos);
        })
        socket.emit("color", document.getElementById("colours").jscolor.toHEXString());
        socket.on("win", (player) => {
            if(player === socket.id){
                document.getElementById("darken").style.display = "block";
                let results = document.getElementById("results")
                results.style.display = "block";
                results.innerHTML = "<h1>You win!</h1><a class = 'button' onclick = 'location.reload()'>Play again</a>"
            }
        })
        //game loop
        setInterval(() => {
            if(ready === 2){
                drawBackground(MAP, ctx);
                //draw items
                for(let i = 0; i < game.items.length; i++){
                    ctx.drawImage(GRAPHICS[game.items[i][2]], game.items[i][0] * GRID_SIZE + OFFSET_X, game.items[i][1] * GRID_SIZE + (Math.sin(ambience_timing / 10)) / 4 * GRID_SIZE + OFFSET_Y, GRID_SIZE, GRID_SIZE);
                }
                
                let players = game.players;
                
                //draw players
                for(let i in players){
                    ctx.fillStyle = players[i].color;
                    for(let j = 0; j < players[i].pos.length; j++){
                        ctx.fillRect(players[i].pos[j][0] * GRID_SIZE + OFFSET_X, players[i].pos[j][1] * GRID_SIZE + OFFSET_Y, GRID_SIZE, GRID_SIZE);
                    }
                    //draw item
                    if(players[i].item != -1){
                        let block = players[i].pos[players[i].pos.length-1]
                        if (players[i].itemCooldown > 120 || Math.floor(players[i].itemCooldown / 10) % 2 === 0)
                        ctx.drawImage(GRAPHICS[players[i].item], block[0] * GRID_SIZE + OFFSET_X, block[1] * GRID_SIZE + OFFSET_Y, GRID_SIZE, GRID_SIZE);
                    }
                    console.log(players[i].item);
                    ctx.fillStyle = "white";
                    ctx.beginPath();
                    ctx.arc((players[i].pos[0][0] + .5) * GRID_SIZE + OFFSET_X, (players[i].pos[0][1] + .5) * GRID_SIZE + OFFSET_Y, GRID_SIZE / 4, 0, 2*Math.PI); 
                    ctx.fill();
                    ctx.beginPath();
                    ctx.fillStyle = "black";
                    ctx.arc((players[i].pos[0][0] + .5 + (players[i].pos[0][0] - players[i].pos[1][0])/8) * GRID_SIZE + OFFSET_X, (players[i].pos[0][1] + .5 + (players[i].pos[0][1] - players[i].pos[1][1]) / 8) * GRID_SIZE + OFFSET_Y, GRID_SIZE / 16, 0, 2*Math.PI); 
                    ctx.fill();
                    ctx.fillStyle = "white";
                    ctx.strokeStyle = "white";
                    ctx.font = "14px Song Myung";
                    ctx.textAlign = "center";
                    let textdim = ctx.measureText(players[i].name);
                    ctx.fillText(players[i].name, players[i].pos[0][0] * GRID_SIZE + OFFSET_X + GRID_SIZE / 2, players[i].pos[0][1] * GRID_SIZE + OFFSET_Y - 14);
                }
                breakEffectsLoop();
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
    });
};
document.getElementById("name").value = getCookie("username");
setTimeout(() => {
    document.getElementById('colours').jscolor.fromString(getCookie("color"));
}, 0)
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
document.getElementById("join-code").addEventListener("keypress", (e) => {
    if(e.keyCode === 13 && document.getElementById("name").value.length > 0){
        joinRoom();
    }
});
document.getElementById("help-button").addEventListener("click", () => {
    document.getElementById("help").style.width = "200px";
    document.getElementById("help").style["white-space"] = "initial";
})

const showJoiner = () => {
    document.getElementById('joiner').style.height='100px';
    document.getElementById('joiner').style.margin='8px';
    document.getElementById('joiner').style.padding='8px';
}

const joinRoom = () => {
    name = document.getElementById("name").value;
    if(name.length > 0){
        socket.emit("join", {code: document.getElementById("join-code").value, name: name});
    }else{
        document.getElementById("error").innerHTML = "Please enter a name";
    }
}