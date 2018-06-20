var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = new http.Server(app);
var io = socketIO(server);
var fs = require("fs");
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
});

let games = {};
let playerRooms = {};
const MAX_PLAYERS = 5;
const MAP_WIDTH = 40;
const MAP_HEIGHT = 20;
const MOVE_COOLDOWN = 150;
//maximum amount of items spawned
const MAX_ITEMS = 5;
//interval items spawn at (seconds * server tick)
const ITEM_INTERVAL = 7.5 * 60;
const getPlayer = (id) => {
    return (games[playerRooms[id]]||{players:{}}).players[id];
}
//get a ramdom alphanumeric ID
const getId = () => {
    return Math.random().toString(36).substr(2, 5);
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
        if(name.length > 20) return;
        if(!playerRooms[socket.id]){
            let room = 1;
            while(games["room" + room] && (Object.keys(games["room" + room].players).length >= MAX_PLAYERS || games["room" + room].hasStarted)){
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
                    map: Math.floor(Math.random() * MAPS.length),
                    leader: socket.id,
                    hasStarted: false,
                    items: [],
                };
                x = Math.floor(MAP_WIDTH / (MAX_PLAYERS + 1));
            }
            games["room" + room].players[socket.id] = {
                name: name,
                pos: [[x, MAP_HEIGHT - 4], [x, MAP_HEIGHT - 3], [x, MAP_HEIGHT - 2]],
                movement: {},
                canMove: true,
                color: "black",
                moveCooldown: MOVE_COOLDOWN,
                item: -1
            };
            if(!games["room" + room].leader){
                games["room" + room].leader = socket.id;
            }
            playerRooms[socket.id] = "room" + room;
            console.log(name + " joined room" + room);
            socket.join("room" + room);
            socket.emit("room", {name: "room" + room, leader: games["room" + room].leader});
            io.in("room" + room).emit("players", {players: games["room" + room].players, hasStarted: games["room" + room].hasStarted, leader: games["room" + room].leader});
            socket.emit("map", {width: MAP_WIDTH, height: MAP_HEIGHT, map: MAPS[games["room" + room].map]});
        }
    });
    
    socket.on("input", (data) => {
        let player = getPlayer(socket.id);
        if(player){
            player.movement = data;
        }
    });
    
    socket.on("start", () => {
        try{
            if(games[playerRooms[socket.id]].leader === socket.id){
                io.in(playerRooms[socket.id]).emit("start");
                games[playerRooms[socket.id]].hasStarted = true;
            }
        }catch(err){}
    });
    
    socket.on("color", (color) => {
        try{
        getPlayer(socket.id).color = color;
        }catch(err){}
    });
    
    socket.on("join", (data) => {
        let code = data.code;
        let name = data.name;
        if(games[code]){
            if(Object.keys(games[code].players).length < MAX_PLAYERS && !games[code].hasStarted){
                let num = Object.keys(games[code].players).length + 1;
                x = num * Math.floor(MAP_WIDTH / (MAX_PLAYERS + 1));   
                socket.emit("msg", {type: "error", content: "Joining game..."});
                games[code].players[socket.id] = {
                    name: name,
                    pos: [[x, MAP_HEIGHT - 4], [x, MAP_HEIGHT - 3], [x, MAP_HEIGHT - 2]],
                    movement: {},
                    canMove: true,
                    color: "black",
                    moveCooldown: MOVE_COOLDOWN,
                    item: -1,
                    itemCooldown: 0
                };
                if(!games[code].leader){
                    games[code].leader = socket.id;
                }
                playerRooms[socket.id] = code;
                socket.emit("success");
                console.log(name + " joined " + code);
                socket.join(code);
                socket.emit("room", {name: code, leader: games[code].leader});
                io.in(code).emit("players", {players: games[code].players, hasStarted: games[code].hasStarted, leader: games[code].leader});
                socket.emit("map", {width: MAP_WIDTH, height: MAP_HEIGHT, map: MAPS[games[code].map]});
            }else{
                socket.emit("msg", {type: "error", content: "The room is full!"})
            }
        }else{
            socket.emit("msg", {type: "error", content: "The code you entered is invalid!"})
        }
    });
    
    socket.on("create game", (name) => {
        if(name.length > 20) return;
        let id = getId();
        while(games[id]){
            id = getId();
        }
        games[id] = {
            players: {},
            map: Math.floor(Math.random() * MAPS.length),
            leader: socket.id,
            hasStarted: false,
            items: [],
            leader: socket.id
        };
        let x = Math.floor(MAP_WIDTH / (MAX_PLAYERS + 1));
        games[id].players[socket.id] = {
            name: name,
            pos: [[x, MAP_HEIGHT - 4], [x, MAP_HEIGHT - 3], [x, MAP_HEIGHT - 2]],
            movement: {},
            canMove: true,
            color: "black",
            moveCooldown: MOVE_COOLDOWN,
            item: -1
        };
        playerRooms[socket.id] = id;
        console.log(name + " joined " + id);
        socket.join(id);
        socket.emit("room", {name: id, leader: games[id].leader});
        io.in(id).emit("players", {players: games[id].players, hasStarted: games[id].hasStarted, leader: games[id].leader});
        socket.emit("map", {width: MAP_WIDTH, height: MAP_HEIGHT, map: MAPS[games[id].map]});
    })
    
    socket.on("disconnect", () => {
        if(playerRooms[socket.id] && games[playerRooms[socket.id]]){
            if(games[playerRooms[socket.id]].leader === socket.id){
                if(Object.keys(games[playerRooms[socket.id]].players).length > 1){
                    let players = games[playerRooms[socket.id]].players;
                    let room = games[playerRooms[socket.id]];
                    for(let i in players){
                        if(i != socket.id){
                            room.leader = i;
                        }
                    }
                }
                else{
                    games[playerRooms[socket.id]].leader = undefined;
                }
            }
            delete games[playerRooms[socket.id]].players[socket.id];
            io.in(playerRooms[socket.id]).emit("players", {players: games[playerRooms[socket.id]].players, hasStarted: games[playerRooms[socket.id]].hasStarted, leader: games[playerRooms[socket.id]].leader});
            delete playerRooms[socket.id];
        }
    })
});
//game loop
let puTime = 0;
setInterval(() => {
    for(let i in games){
        if(games[i].hasStarted){
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
                                        if(games[i].players[k].item === 1 || j === k && games[i].players[j].pos.length === 2){
                                            nextBlock = undefined;
                                        }else{
                                            io.in(playerRooms[k]).emit("death", {
                                                userId: k,
                                                pos: games[i].players[k].pos
                                            });
                                            delete games[i].players[k];
                                            delete playerRooms[k];
                                            if (Object.keys(games[i].players).length === 1) {
                                                let key = Object.keys(games[i].players)[0];
                                                io.to(i).emit("win", key);
                                                
                                                setTimeout(() => {
                                                    delete games[i];
                                                }, 10 * 1000);                                                
                                            }
                                        }
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
                        
                        //item collisions
                        for(let k = 0; k < games[i].items.length; k++){
                            if(nextBlock[0] === games[i].items[k][0] && nextBlock[1] === games[i].items[k][1]){
                                let type = games[i].items[k][2];
                                if(type === 0 || type === 1){
                                    const ITEM_COOLDOWN = 5 * 60;
                                    if(type === player.item){
                                        player.itemCooldown += ITEM_COOLDOWN;
                                    }else{
                                        player.itemCooldown = ITEM_COOLDOWN;
                                    }
                                    //reset items
                                    player.moveCooldown = MOVE_COOLDOWN;

                                    //apply item (shield doesn't need to be applied)
                                    switch(type){
                                        //boot 
                                        case 0:
                                            player.moveCooldown = MOVE_COOLDOWN / 2;
                                            break;    
                                    }

                                    console.log(type);
                                    player.item = type;
                                }else{
                                    switch(type){
                                        //normal food
                                        case 2:
                                            player.pos.push(player.pos[player.pos[player.pos.length - 1]])
                                            player.pos.push();
                                            break;
                                        //anti-food
                                        case 3:
                                            if(player.pos.length > 3){
                                                player.pos.pop();
                                            }
                                    }
                                }
                                games[i].items.splice(k, 1);
                                k--;
                            }
                        }
                        player.pos.pop();
                        player.canMove = false;
                        setTimeout(() => {
                            player.canMove = true;
                        }, player.moveCooldown);
                    }
                }
                //item update
                player.itemCooldown--;
                if(player.itemCooldown === 0){
                    player.item = -1;
                    player.moveCooldown = MOVE_COOLDOWN;
                }
            }
            //item placement
            if(puTime % ITEM_INTERVAL === 0 && games[i].items.length < MAX_ITEMS) {
                let newItem;
                let canPlace;
                while(!canPlace){
                    canPlace = true;
                    newItem = [Math.floor(Math.random() * MAPS[games[i].map][0][0].length), Math.floor(Math.random() * MAPS[games[i].map][0].length)];
                    //check if in block
                    if(MAPS[games[i].map][1][newItem[1]][newItem[0]] !== 0){
                        canPlace = false;
                    }

                    //check if in player
                    for(let k in games[i].players){
                        let pos = games[i].players[k].pos;
                        for(let l = 0; l < pos.length; l++){
                            if(pos[l][0] === newItem[0] && pos[l][1] === newItem[1]){
                                canPlace = false;
                            }
                        }
                    }

                    //check if block exists
                    for(let k = 0; k < games[i].items.length; k++){
                        if(games[i].items[k][0] === newItem[0] && games[i].items[k][1] === newItem[1]){
                            canPlace = false;
                        }
                    }
                }
                newItem[2] = Math.floor(Math.random() * 4);
                console.log(newItem);
                games[i].items.push(newItem);
            }
        }
    }
    puTime++;
    for(let i in games){
        io.in(i).emit("state", games[i]);
    }
}, 1000 / 60);