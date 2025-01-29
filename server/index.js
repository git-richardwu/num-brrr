const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { evaluate, parse, randomInt, re } = require('mathjs');
const { v4: uuidv4 } = require('uuid');
const Player = require('./Player.js');
const { ItemPool, RelicPool, weights } = require('./Pool');

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

function pickRandomWares(pool, weights) {
    const totalWeight = pool.reduce((total, item) => total + weights[item.rarity], 0)
    const randomWeight = Math.random() * totalWeight
    let tempWeight = 0
    for (const item of pool) {
        tempWeight += weights[item.rarity]
        if (randomWeight < tempWeight){
            return item
        }
    }
}

function constructWareList(items, weights, amount) {
    const res = []
    for (let i = 0; i < amount; i++){
        res.push(pickRandomWares(items, weights))
    }
    return res
}

io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`)
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} has disconnected`)

    })
    socket.on('createRoom', () => {
        const uniqueRoomID = Math.random().toString(36).substring(2, 7);
        rooms[uniqueRoomID] = [new Player(socket.id)];
        socket.join(uniqueRoomID)
        socket.emit('roomCreated', uniqueRoomID)
    })
    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId] && !rooms[roomId].some(player => player.id === socket.id)) {
            socket.join(roomId)
            rooms[roomId].push(new Player(socket.id))
            socket.emit('playerJoined')
            socket.to(roomId).emit('playerJoined')
        }
    })
    socket.on('fetchBuild', (roomId) => {
        const emitter = rooms[roomId].find(p => p.id === socket.id)
        const deconstructedEq = emitter.deconstructed
        const playerInventory = emitter.inventory
        const playerItems = emitter.relics
        const playerCoins = emitter.coins
        io.to(emitter.id).emit('updateState', deconstructedEq, playerInventory, playerItems, playerCoins)

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
                opponent.loseHealth();
                if (opponent.health === 0) {
                    console.log('Yay')
                }
            }
            else {
                player.result = "Defeat!"
                opponent.result = "Victory!"
                player.loseHealth();
                if (player.health === 0) {
                    console.log('Boo')
                }
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
            console.log(rooms[roomId])
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
    socket.on('generateWares', (roomId) => {
        const player = rooms[roomId].find(p => p.id === socket.id)
        const part1 = constructWareList(ItemPool, weights, 6);
        const part2 = constructWareList(RelicPool, weights, 3);
        const fullList = part1.concat(part2)
        io.to(player.id).emit('updateWares', fullList);

    })

    socket.on('pendingPurchase', (roomId, item, disableIndex) => {
        const player = rooms[roomId].find(p => p.id === socket.id)
        if (player) {
            if (player.coins >= item.cost) {
                player.coins -= item.cost
                if (item.itemID[0] == "I") {
                    player.relics.push(item)
                    io.to(player.id).emit('purchasedRelic', player.relics);
                    io.to(player.id).emit('toggleButton', disableIndex)
                    io.to(player.id).emit('updateCoinCount', player.coins);
                }
                // insert condition if max amount of relic
                else if (item.itemID[0] == '#') {
                    player.inventory.push(item)
                    io.to(player.id).emit('purchasedTile', player.inventory);
                    io.to(player.id).emit('toggleButton', disableIndex)
                    io.to(player.id).emit('updateCoinCount', player.coins);
                }
            }
            else {
                io.to(player.id).emit('failedPurchase', "Insufficient 🪙s!");
            }
        }

    })
});

app.get("/api", (req, res) => {
    res.json({ message: "Hello" })
});

server.listen(3001, () => {
    console.log(`Game listening on *:3001`)
});