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

function calculateWinner(choice1, choice2) {
    if (choice1 === choice2) {
        return 'Draw!'
    }
    else if (choice1 > choice2) {
        return 'Player 1 wins!'
    }
    else {
        return 'Player 2 wins!'
    }
}

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

let initialRolls = handleDiceRolls(10);

io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`)
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} has disconnected`)
    })
    socket.on('createRoom', () => {
        const uniqueRoomID = Math.random().toString(36).substring(2, 7);
        rooms[uniqueRoomID] = [{ id: socket.id, equation: "3x^2", answer: 0, status: false }];
        socket.join(uniqueRoomID)
        console.log(rooms)
        socket.emit('roomCreated', uniqueRoomID)
    })
    socket.on('joinRoom', (roomCode) => {
        if (rooms[roomCode] && !rooms[roomCode].some(player => player.id === socket.id)) {
            socket.join(roomCode)
            rooms[roomCode].push({ id: socket.id, equation: "569x", answer: 0, status: false })
            socket.emit('playerJoined')
            socket.to(roomCode).emit('playerJoined')
            console.log(rooms)
        }
    })
    socket.on('playerReady', (roomId, submittedEquation) => { //equation has been constructed
        const player = rooms[roomId].find(p => p.id === socket.id)
        if (player) {
            console.log(player.id + ' is ready.')
            player.equation = submittedEquation
            let count = extractUniqueVariables(player.equation).size + 1
            let temp = initialRolls.slice(0, count)
            io.to(player.id).emit('pickVariables', temp)
            player.status = true
        }
        if (rooms[roomId].every(p => p.status == true)) {
            io.to(roomId).emit('initiateCombat');
            initialRolls = handleDiceRolls(10);
            rooms[roomId].forEach(p => p.status = false);
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