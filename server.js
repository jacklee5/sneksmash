var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
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
const getPlayer = (id) => {
    return (games[playerRooms[id]]||{players:{}}).players[id];
}
io.on('connection', function(socket) {
    socket.on("new player", (name) => {
        socket.emit("map", {width: MAP_WIDTH, height: MAP_HEIGHT})
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
            games["room" + room] = {};
            x = Math.floor(MAP_WIDTH / (MAX_PLAYERS + 1));
            games["room" + room].players = {};
        }
        games["room" + room].players[socket.id] = {
            name: name,
            pos: [[x, MAP_HEIGHT - 2], [x, MAP_HEIGHT - 3], [x, MAP_HEIGHT - 4]],
            movement: {}
        };
        playerRooms[socket.id] = "room" + room;
        console.log(name + " joined room " + room);
    });
    
    socket.on("input", (data) => {
        let player = getPlayer(socket.id);
        if(player){
            player.movement = data;
        }
    })
});
//game loop
setInterval(() => {
    for(let i in games){
        for(let j in games[i].players){
            let player = games[i].players[j];
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
                player.pos.unshift(nextBlock);
                player.pos.pop();
            }
        }
    }
    for(let i in playerRooms){
        io.to(i).emit("state", games[playerRooms[i]]);
    }
}, 50);