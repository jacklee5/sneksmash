var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var fs = require("fs");
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

let games = {};
let playerRooms = {};
const MAX_PLAYERS = 2;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 20;
const MOVE_COOLDOWN = 150;
const getPlayer = (id) => {
    return (games[playerRooms[id]]||{players:{}}).players[id];
}

//maps
var default_map = [[[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,82,82,82,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,82,83,0,0,0,81,82,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,82,82,74,74,74,74,74],[74,74,74,74,74,75,0,0,0,0,0,0,0,81,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,83,0,0,81,74,74,74,74],[74,74,74,74,74,75,0,0,0,0,0,0,0,0,73,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,75,0,0,0,0,81,74,74,74],[74,74,74,74,74,74,84,0,0,0,0,0,0,0,73,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,75,0,0,0,0,0,73,74,74],[74,74,74,74,74,74,74,84,0,0,0,0,0,0,73,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,75,0,0,0,0,0,73,74,74],[74,74,74,74,74,74,74,74,76,84,0,0,0,68,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,84,0,0,0,68,74,74,74],[74,74,74,74,74,74,74,74,74,74,76,76,76,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,76,76,76,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,82,82,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,75,0,0,81,82,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,10,74,74,74,74,74,74,74,75,0,0,0,0,73,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,75,0,0,0,0,73,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,76,76,76,76,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74],[74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,10,74,74,74,74,74,10,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74]],
                   
[[10,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,18,10],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,10,10,10,10,10,10,10,10,11,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,18,18,18,18,18,10,10,10,11,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,10,10,11,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,10,10,11,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,18,18,19,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,1,2,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,3,0,0,0,0,9],[11,0,0,0,0,9,10,10,10,10,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,10,10,10,11,0,0,0,0,9],[11,0,0,0,0,9,10,10,10,10,10,1,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,10,10,10,11,0,0,0,0,9],[11,0,0,0,0,17,18,18,18,18,18,18,18,18,19,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,10,10,10,11,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,18,18,18,19,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,10,10,10,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9],[11,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,10,10,10,10,10,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,10]]
                   
, 1];
const MAPS = [default_map];

/*use this to convert between your char string thing and an array*/
//const toArr = (map) => {
//	var newmap = [];
//	for(let i = 0;  i < 20; i++){
//		newmap[i] = [];
//	}
//
//	map = map.split("\n");
//	var xtiles;
//
//	for (var i = 0; i <  20; i++) {
//		xtiles = map[i].split(",");
//		for (var j = 0; j < 40; j++) {
//            newmap[i][j] = xtiles[j];
//		}
//	}
//	return newmap;
//}
//fs.writeFileSync("out.txt", JSON.stringify(toArr(default_map[1])));

io.on('connection', function(socket) {
    socket.on("new player", (name) => {
        let room = 1;
        while(games["room" + room] && Object.keys(games["room" + room].players).length >= MAX_PLAYERS){
            room++;
        }
        let x;
        let player;
        if(games["room" + room]){
            let num = Object.keys(games["room" + room].players).length + 1;
            x = num * Math.floor(MAP_WIDTH / (MAX_PLAYERS + 1));
        }else{
            games["room" + room] = {
                players: {},
                map: Math.floor(Math.random() * MAPS.length)
            };
            x = Math.floor(MAP_WIDTH / (MAX_PLAYERS + 1));
        }
        games["room" + room].players[socket.id] = {
            name: name,
            pos: [[x, MAP_HEIGHT - 4], [x, MAP_HEIGHT - 3], [x, MAP_HEIGHT - 2]],
            movement: {},
            canMove: true,
            color: "black"
        };
        playerRooms[socket.id] = "room" + room;
        console.log(name + " joined room " + room);
        socket.join("room" + room);
        socket.emit("map", {width: MAP_WIDTH, height: MAP_HEIGHT, map: MAPS[games["room" + room].map]})
    });
    
    socket.on("input", (data) => {
        let player = getPlayer(socket.id);
        if(player){
            player.movement = data;
        }
    });
    
    socket.on("color", (color) => {
        getPlayer(socket.id).color = color;
    })
});
//game loop
setInterval(() => {
    for(let i in games){
        for(let j in games[i].players){
            let player = games[i].players[j];
            if(player.canMove){
                let nextBlock;
                if(player.movement.UP){
                    nextBlock = [player.pos[0][0], player.pos[0][1] - 1];
                }else if(player.movement.DOWN){
                    nextBlock = [player.pos[0][0], player.pos[0][1] + 1];
                }else if(player.movement.LEFT){
                    nextBlock = [player.pos[0][0] - 1, player.pos[0][1]];
                }else if(player.movement.RIGHT){
                    nextBlock = [player.pos[0][0] + 1, player.pos[0][1]];
                }
                if(nextBlock){
                    //check if block colides with existing players
                    for(let k in games[i].players){
                        for(let l = 0; l < games[i].players[k].pos.length; l++){
                            if(nextBlock && nextBlock[0] === games[i].players[k].pos[l][0] && nextBlock[1] === games[i].players[k].pos[l][1]){
                                if(l === games[i].players[k].pos.length - 1){
                                    io.in(playerRooms[k]).emit("death", {
                                        userId: k,
                                        pos: games[i].players[k].pos
                                    });
                                    delete games[i].players[k];
                                    break;
                                }else{
                                    nextBlock = undefined;
                                    break;
                                }
                            }
                        }
                    }
                    //check if block collides with blocks
                    if(nextBlock && MAPS[games[i].map][1][nextBlock[1]][nextBlock[0]] != 0){
                        nextBlock = undefined;
                    }
                }   
                if(nextBlock){
                    player.pos.unshift(nextBlock);
                    player.pos.pop();
                    player.canMove = false;
                    setTimeout(() => {
                        player.canMove = true;
                    }, MOVE_COOLDOWN);
                }
            }
        }
    }
    for(let i in playerRooms){
        io.to(i).emit("state", games[playerRooms[i]]);
    }
}, 1 / 60);