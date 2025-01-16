const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { evaluate, parse, randomInt } = require('mathjs');

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
})

const rooms = {};

function extractUniqueVariables(e) {
    const count = new Set()
    for (const character of e) {
        if (/^[a-zA-Z]$/.test(character)) {
            count.add(character)
        }
    }
    return count
}

function handleDiceRolls(repeat) {
    var newRolls = []
    for (let i = 0; i < repeat; i++) {
        const random = randomInt(-100, 100)
        newRolls.push(random)
    }
    return newRolls
}

var initialRolls = handleDiceRolls(10);

io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`)
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} has disconnected`)
    })
    socket.on('createRoom', () => {
        const uniqueRoomID = Math.random().toString(36).substring(2, 7);
        rooms[uniqueRoomID] = [{ id: socket.id, equation: "2a+b", answer: null, assignments: {}, sabotaged: {}, preview: null, final: null, status: false, result: null }];
        socket.join(uniqueRoomID)
        //console.log(rooms)
        socket.emit('roomCreated', uniqueRoomID)
    })
    socket.on('joinRoom', (roomCode) => {
        if (rooms[roomCode] && !rooms[roomCode].some(player => player.id === socket.id)) {
            socket.join(roomCode)
            rooms[roomCode].push({ id: socket.id, equation: "2a+b", answer: null, assignments: {}, sabotaged: {}, preview: null, final: null, status: false, result: null })
            socket.emit('playerJoined')
            socket.to(roomCode).emit('playerJoined')
            //console.log(rooms)
        }
    })
    socket.on('playerReady', (roomId, submittedEquation) => { //equation has been constructed
        const player = rooms[roomId].find(p => p.id === socket.id)
        const opponent = rooms[roomId].find(p => p.id != socket.id)
        if (player) {
            console.log(player.id + ' is ready.')
            player.equation = submittedEquation
            let extractedVars = extractUniqueVariables(player.equation)
            let count = extractedVars.size + 1
            let temp = initialRolls.slice(0, count) //get rolls equal to variable count
            io.to(player.id).emit('pickDiceRolls', temp)
            //io.to(opponent.id).emit('opponentVars', [...extractedVars])
            socket.broadcast.to(roomId).emit('opponentVars', [...extractedVars])
            player.status = true
        }
        if (rooms[roomId].every(p => p.status == true)) {
            io.to(roomId).emit('initiateCombat'); //moved here
            initialRolls = handleDiceRolls(10);
            rooms[roomId].forEach(p => p.status = false);
        }
    })
    socket.on('playerAssigned', (roomId, randomRolls, uniqueVariables) => {
        const player = rooms[roomId].find(p => p.id === socket.id)
        const opponent = rooms[roomId].find(p => p.id != socket.id)
        if (player) {
            const sabotageVariable = uniqueVariables.pop();
            const sabotageValue = randomRolls.pop();
            const pendingAssignment = Object.fromEntries(uniqueVariables.map((key, index) => [String(key), randomRolls[index]]))
            const pendingSabotage = {}
            pendingSabotage[sabotageVariable] = sabotageValue
            player.assignments = pendingAssignment
            player.status = true
            opponent.sabotaged = pendingSabotage
        }
        if (rooms[roomId].every(p => p.status == true)) {
            rooms[roomId].forEach(p => {
                var base = p.equation
                for (var key of Object.keys(p.assignments)) { //before
                    base = base.replaceAll(String(key), `(${p.assignments[key]})`)
                }
                p.preview = base
                var evaluateThis = p.equation
                for (var key of Object.keys(p.sabotaged)) { //sabotage
                    evaluateThis = evaluateThis.replaceAll(String(key), `(${p.sabotaged[key]})`)
                }
                for (var key of Object.keys(p.assignments)) { //non-sabotage
                    evaluateThis = evaluateThis.replaceAll(String(key), `(${p.assignments[key]})`)
                }
                p.final = evaluateThis
                p.answer = evaluate(evaluateThis);
                
            })
            if (player.answer === opponent.answer) {
                player.result = "Tie!"
                opponent.result = "Tie!"
            }
            else if (player.answer > opponent.answer) {
                player.result = "Victory!"
                opponent.result = "Defeat!"
            }
            else {
                player.result = "Defeat!"
                opponent.result = "Victory!"
            }
            io.to(roomId).emit('roundResults', rooms[roomId])
            io.to(roomId).emit('initiateCalculations');
            //console.log(rooms[roomId])
            //include previous equation
            rooms[roomId].forEach(p => {
                p.assignments = {};
                p.sabotaged = {};
                p.status = false;
                p.preview = null;
                p.final = null;
                p.answer = null;
                p.result = null;
            });
        }


    })
    socket.on('playerChoice', (roomId, playerChoice) => {
        const player = rooms[roomId].find(p => p.id === socket.id)
        if (player) {
            updatedEquation = player.equation.replace('x', `(${playerChoice})`)
            console.log(updatedEquation)
            player.answer = evaluate(updatedEquation)
            // player.equation = playerChoice
        }
        console.log(rooms)
        if (rooms[roomId].every(p => p.answer !== 0)) {
            const submissions = rooms[roomId].map(player => player.answer);
            console.log(submissions);
            const res = calculateWinner(submissions[0], submissions[1]);
            io.to(roomId).emit('gameResult', res);
            rooms[roomId].forEach(p => p.answer = 0);
            //reset score/equation
        }
    });
});

app.get("/api", (req, res) => {
    res.json({ message: "Hello" })
});

server.listen(3001, () => {
    console.log(`Game listening on *:3001`)
});