const dotenv = require("dotenv");
const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { evaluate, parse, randomInt, re, number, factorial } = require('mathjs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Player = require('./Player.js');
const Item = require('./Item');
const { ItemPool, RelicPool, levelWeights, levelCap } = require('./Pool');
const { isEven, isOdd, isAbundant, isPalindrome, isRepunit, isDeficient, isComposite,
    isPerfect, isSquare, isTriangle, isHappy, isNarcissistic, isPrime,
    exponentByValAt } = require('./helper.js');

dotenv.config();
app.use(cors());

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
    });

} else {
    app.get("/", (req, res) => {
        res.send('API Running Successfully');
    });
}

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "https://num-brrr.onrender.com"],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }
})

const rooms = {};
const publicQueue = [];

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

function pickRandomWares(pool, weights, playerSet) {
    const totalWeight = pool.reduce((total, item) => total + weights[item.rarity], 0);
    const randomWeight = Math.random() * totalWeight;
    let tempWeight = 0;
    for (const purchaseable of pool) {
        const orignalID = purchaseable.itemID;
        tempWeight += weights[purchaseable.rarity];
        if (randomWeight < tempWeight) {
            if (playerSet.has(orignalID)) {
                const newID = orignalID + uuidv4();
                playerSet.add(newID);
                const copy = { ...purchaseable, itemID: newID };
                return copy;
            }
            else {
                playerSet.add(purchaseable.itemID);
                return purchaseable;
            }

        }
    }
}

function constructWareList(items, weights, amount, playerSet) {
    const res = []
    for (let i = 0; i < amount; i++) {
        res.push(pickRandomWares(items, weights, playerSet))
    }

    return res
}

const buffMap = {
    "Molar No. 3": (num) => num >= 17 && num <= 21 ? Math.pow(num, 4) : num,
    "Soap-Flavored Mint": (num) => isAbundant(num) ? Math.pow(num, 2) : num,
    "Deified Racecar": (num) => isPalindrome(num) ? Math.pow(num, 8) : num,
    "New Jeans": (num) => isRepunit(num) ? Math.pow(num, num.toString().length) : num,
    "Ate-Ball": (num) => num == 8 ? Math.pow(num, 3) : num,
    "Luck Lucky": (num) => num.toString().length >= 3 ? parseInt(num.toString(4)) : num,
    "Even Steven": (num) => isEven(num) ? num + 246 : num,
    "Deflated Volleyball": (num) => isDeficient(num) ? num * 2 : num,
    "Sitting Rib Roast": (num) => isPrime(num) ? Math.pow(num, 2) : num,
    "Oddjob": (num) => isOdd(num) ? num + 135 : num,
    "Composite Sketcher": (num) => isComposite(num) ? num * 2 : num,
    "Recently Cleaned Mirror": (num) => isPerfect(num) ? Math.pow(num, num.toString().length) : num,
    "Crooked Square": (num) => isSquare(num) ? Math.pow(num, 2) : num,
    "Freezer Burnt Pizza": (num) => isTriangle(num) ? Math.pow(num, 3) : num,
    ":)": (num) => isHappy(num) ? exponentByValAt(num, 0) : num,
    "Derek": (num) => isNarcissistic(num) ? exponentByValAt(num, (num.toString().length - 1)) : num,
    "Lychee Wood": (num) => num < 0 && Math.abs(num).toString().length == 2 ? num * 535 : num,
    "Debbie Downer": (num) => num * -1,
    "Moist Bagel": (num) => isComposite(num) && isEven(num) ? num * 42 : num,
    "Sour Pepper": (num) => isPalindrome(num) && isOdd(num) ? num * 121 : num,
    "Sasaladlad": (num) => num % 7 === 0 ? Math.ceil(Math.pow(num, 1.5)) : num,
    "Single Hockey Stick": (num) => num.toString().length === 3 && num % 13 === 0 ? Math.pow(num, 2) : num,
    "Carpet Lollipop": (num) => num.toString().length === 1 ? Math.pow(num, 4) : num,
    "Plastic Anchor": (num) => num.toString().length >= 3 && isNarcissistic(num) ? Math.pow(num, 5) : num,
    "Crispy Leaves": (num) => num.toString().length === 1 && isOdd(num) ? factorial(num) : num,
    "Bile Bar": (num) => isOdd(num) ? num * 370 : num,
    "Pomegranate Pie": (num) => isOdd(num) ? num * 426 : num,
    "Julianne Potat": (num) => isEven(num) ? num * 204 : num,
    "Evil Cherry": (num) => num <= 14 ? factorial(num) : num,

}

function modifyNumbers(numbers, buffs, receipt) {
    //const res = []
    return numbers.map((number) => {
        let final = parseInt(number);
        let applied = parseInt(number);
        let prev = parseInt(number);
        buffs.forEach((buff) => {
            if (buffMap[buff.name]) {
                applied = buffMap[buff.name](applied);
                if (prev !== applied) {
                    receipt.push({ before: prev, buff: buff, after: applied });
                }
                prev = applied
                final = applied
            }
        });
        //res.push(final)
        return final;
    });
    //return res;
}

function applyBuffs(e, buffs) {
    let receipt = []
    let numbers = e.match(/[-+]?\d+/g)
    const modifiedNumbers = modifyNumbers(numbers, buffs, receipt)
    let res = e
    let idx = 0
    res = res.replace(/\d+/g, (match) => {
        const updatedNumber = modifiedNumbers[idx]
        idx++
        return updatedNumber
    });
    let afterBuff;
    buffs.forEach((buff) => {
        afterBuff = buff;
        let prev = res
        if (buff.name === "Negative Nancy") {
            res = "-1*(" + res + ")";
            receipt.push({ before: prev, buff: afterBuff, after: res });
        }
        if (buff.name === "Unfinished Die") {
            let random1to5 = Math.floor(Math.random() * 5) + 1;
            res = random1to5 + " *(" + res + ")";
            receipt.push({ before: prev, buff: afterBuff, after: res });
        }
        if (buff.name === "Auspicious Orange") {
            let today = Math.pow(new Date().getDate(), 2);
            res = today + " *(" + res + ")";
            receipt.push({ before: prev, buff: afterBuff, after: res });
        }
        if (buff.name === "Walking Velcro") {
            let numOfBuffs = buffs.length - 1;
            let multiplyWith = 200 - (numOfBuffs * 40)
            res = multiplyWith + " *(" + res + ")";
            receipt.push({ before: prev, buff: afterBuff, after: res });
        }
    })
    return [res, receipt]
}

io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`)
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} has disconnected`)
        for (let roomId in rooms) {
            if (rooms[roomId].some((user) => user.id === socket.id)) {
                console.log(`${socket.id} left ${roomId}`);
                socket.broadcast.to(roomId).emit('opponentDisconnect', "Your opponent has disconnected! Redirecting you back to lobby.")
                rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id)
                if (rooms[roomId].length === 0) {
                    delete rooms[roomId];
                }
            }
        }

    })
    socket.on('matchMake', () => {
        publicQueue.push(socket);
        if (publicQueue.length >= 2) {
            const player1 = publicQueue.shift();
            const player2 = publicQueue.shift();
            const uniqueRoomID = Math.random().toString(36).substring(2, 7);
            player1.join(uniqueRoomID)
            player2.join(uniqueRoomID)
            rooms[uniqueRoomID] = [new Player(player1.id), new Player(player2.id)];
            player1.emit('matchMade', uniqueRoomID);
            player2.emit('matchMade', uniqueRoomID);
        }
    })
    socket.on('createRoom', () => {
        const uniqueRoomID = Math.random().toString(36).substring(2, 7);
        rooms[uniqueRoomID] = [new Player(socket.id)];
        socket.join(uniqueRoomID);
        socket.emit('roomCreated', uniqueRoomID);
    })
    socket.on('joinRoom', (roomId) => {
        try {
            if (rooms[roomId] && rooms[roomId].length < 2 && !rooms[roomId].some(player => player.id === socket.id)) {
                socket.join(roomId);
                rooms[roomId].push(new Player(socket.id));
                socket.emit('playerJoined');
                socket.to(roomId).emit('playerJoined');
            }
            else {
                socket.emit('createErrorMsg', "Game Unavailable!");
            }
        }
        catch (error) {
            console.log('Error message:', error);
        }
    })
    socket.on('fetchBuild', (roomId) => {
        try {
            if (rooms[roomId]) {
                const emitter = rooms[roomId].find(p => p.id === socket.id)
                const deconstructedEq = emitter.deconstructed
                const playerInventory = emitter.inventory
                const playerItems = emitter.relics
                const playerCoins = emitter.coins
                const playerHealth = emitter.health
                const playerExp = emitter.exp
                io.to(emitter.id).emit('updateState', deconstructedEq, playerInventory, playerItems, playerCoins, playerHealth, playerExp)
            }
            else {
                console.log('Invalid Room');
            }
        } catch (error) {
            console.log('Error message:', error);
        }
    })
    socket.on('playerReady', (roomId, submittedEquation, deconstructedEq, submittedRelics) => { //equation has been constructed
        try {
            const player = rooms[roomId].find(p => p.id === socket.id);
            if (player) {
                console.log(player.id + ' is ready.')
                let obj = applyBuffs(submittedEquation, player.relics);
                let buffed = obj[0];
                let receipt = obj[1];
                player.equation = submittedEquation
                player.deconstructed = deconstructedEq
                player.relics = submittedRelics
                player.buffedEquation = buffed;
                player.prevReceipt = receipt;
                // console.log(buffed)

                let extractedVars = extractUniqueVariables(player.buffedEquation)
                let count = extractedVars.size + 1
                let rolls = initialRolls.slice(0, count) //get rolls equal to variable count
                io.to(player.id).emit('sendAssignData', rolls, buffed, receipt)
                socket.broadcast.to(roomId).emit('opponentVars', [...extractedVars])
                player.status = true
            }
            if (rooms[roomId].every(p => p.status == true)) {
                io.to(roomId).emit('initiateCombat');
                initialRolls = handleDiceRolls(10);
                rooms[roomId].forEach(p => p.status = false);
            }
        } catch (error) {
            console.log('Error message:', error);
        }
    })
    socket.on('playerAssigned', (roomId, randomRolls, uniqueVariables) => {
        try {
            const player = rooms[roomId].find(p => p.id === socket.id)
            const opponent = rooms[roomId].find(p => p.id != socket.id)
            // console.log(player.id + ' ' + randomRolls)
            // console.log(player.id + ' ' + uniqueVariables)

            if (player) {
                const sabotageVariable = uniqueVariables.pop();
                const sabotageValue = randomRolls.pop();
                const pendingAssignment = Object.fromEntries(uniqueVariables.map((key, index) => [String(key), randomRolls[index]]))
                const pendingSabotage = {}
                pendingSabotage[sabotageVariable] = sabotageValue
                player.assignments = pendingAssignment
                player.status = true
                opponent.sabotaged = pendingSabotage
                // socket.broadcast.to(roomId).emit('lastSeen', player.prevReceipt, player.equation)
            }
            if (rooms[roomId].every(p => p.status == true)) {
                rooms[roomId].forEach(p => {
                    var base = p.buffedEquation
                    for (var key of Object.keys(p.assignments)) { //before
                        base = base.replaceAll(String(key), `(${p.assignments[key]})`)
                    }
                    p.presabotage = base
                    var evaluateThis = p.buffedEquation
                    for (var key of Object.keys(p.sabotaged)) { //sabotage
                        evaluateThis = evaluateThis.replaceAll(String(key), `(${p.sabotaged[key]})`)
                    }
                    for (var key of Object.keys(p.assignments)) { //non-sabotage
                        evaluateThis = evaluateThis.replaceAll(String(key), `(${p.assignments[key]})`)
                    }
                    p.final = evaluateThis
                    // console.log(p.id + " " + evaluateThis);
                    p.answer = evaluate(evaluateThis);

                })
                if (player.answer === opponent.answer) {
                    player.result = "Tie!"
                    opponent.result = "Tie!"
                }
                else if (player.answer > opponent.answer) {
                    player.result = "Victory!"
                    player.coins += 3
                    opponent.result = "Defeat!"
                    opponent.loseHealth();
                }
                else {
                    player.result = "Defeat!"
                    opponent.result = "Victory!"
                    player.loseHealth();
                }
                io.to(roomId).emit('roundResults', rooms[roomId])
                io.to(roomId).emit('initiateCalculations');
                //console.log(rooms[roomId])
                //include previous equation
                rooms[roomId].forEach(p => {
                    p.assignments = {};
                    p.sabotaged = {};
                    p.buffedEquation = "";
                    p.status = false;
                    p.coins += 10;
                    p.presabotage = null;
                    p.final = null;
                    p.answer = null;
                    p.result = null;
                });
            }
        } catch (error) {
            console.log('Error message:', error);
        }
    })

    socket.on('updateInventory', (roomId, updatedInventory) => {
        try {
            const player = rooms[roomId].find(p => p.id === socket.id)
            if (player) {
                player.inventory = updatedInventory;
            }
        } catch (error) {
            console.log('Error message:', error);
        }
    });

    socket.on('updateRecentValid', (roomId, updatedRecentValid, updatedRecentInventory) => {
        try {
            const player = rooms[roomId].find(p => p.id === socket.id)
            if (player) {
                player.recentValid = updatedRecentValid;
                player.recentInventory = updatedRecentInventory;
            }
            io.to(player.id).emit('updateSnapshots', player.recentValid, player.recentInventory);

        }
        catch (error) {
            console.log('Error message:', error);
        }
    });

    socket.on('updateRelicOrder', (roomId, updatedRelicOrder) => {
        try {
            const player = rooms[roomId].find(p => p.id === socket.id)
            if (player) {
                player.relics = updatedRelicOrder;
            }
        } catch (error) {
            console.log('Error message:', error);
        }
    });

    socket.on('sellRelic', (roomId, index) => {
        try {
            const player = rooms[roomId].find(p => p.id === socket.id);
            if (player && typeof index === 'number') {
                let updated = player.relics;
                updated.splice(index, 1);
                player.relics = updated;
                player.coins += 1;
                io.to(player.id).emit('purchasedRelic', player.relics);
                io.to(player.id).emit('updateCoinCount', player.coins);
            }
        } catch (error) {
            console.log('Error message:', error);
        }
    })

    socket.on('generateWares', (roomId) => {
        try {
            const player = rooms[roomId].find(p => p.id === socket.id);
            if (player && roomId) {
                const playerSet = player.avoidDupes;
                const part1 = constructWareList(ItemPool, levelWeights[player.level], 6, playerSet);
                const part2 = constructWareList(RelicPool, levelWeights[player.level], 3, playerSet);
                const fullList = part1.concat(part2);
                io.to(player.id).emit('updateWares', fullList);
            }
        } catch (error) {
            console.log('Error message:', error);
        }
    })

    socket.on('payment', (roomId, amount) => {
        const player = rooms[roomId].find(p => p.id === socket.id);
        try {
            if (player && typeof amount === 'number') {
                if (player.coins >= amount) {
                    player.coins -= amount;
                    io.to(player.id).emit('newBalance', player.coins);
                }
            }
        } catch (error) {
            console.log('Error message:', error);
        }
    })

    socket.on('pendingPurchase', (roomId, item, disableIndex) => {
        const player = rooms[roomId].find(p => p.id === socket.id);
        try {
            if (item.cost > player.coins) {
                io.to(player.id).emit('createErrorMsg', "Insufficient 🪙s!");
                return;
            }
            if (player.relics.length >= 5 && item.itemID[0] == "I" && item.name !== "Day Old Wrap") {
                io.to(player.id).emit('createErrorMsg', "Relic Limit Reached!");
                return;
            }
            player.coins -= item.cost;
            if (item.itemID[0] == "I") {
                if (item.name === "Day Old Wrap") {
                    if (player.health < 5) {
                        player.health += 1
                        socket.emit('wrapHeal', player.health);
                    }
                }
                else {
                    player.relics.push(item);
                    socket.emit('purchasedRelic', player.relics);
                }
            } else if (item.itemID[0] == '#') {
                item.itemID += uuidv4();
                player.inventory.push(item);
                io.to(player.id).emit('purchasedTile', player.inventory);
            }
            io.to(player.id).emit('toggleButton', disableIndex)
            io.to(player.id).emit('updateCoinCount', player.coins);

        } catch (error) {
            console.log('Error message:', error);
        }
    })

    socket.on('levelUp', (roomId) => {
        try {
            const player = rooms[roomId].find(p => p.id === socket.id);
            if (player) {
                if (player.coins >= 3) {
                    let currentCap = levelCap[player.level]
                    player.exp += 3;
                    player.coins -= 3;
                    if (player.exp >= currentCap) {
                        player.exp = currentCap - player.exp
                        player.level += 1
                        if (player.level === 5) {
                            io.to(player.id).emit('reachedMaxLevel');
                        }
                    }
                    io.to(player.id).emit('updateCoinCount', player.coins);
                    io.to(player.id).emit('updateProgress', player.exp, levelCap[player.level], player.level);
                }
                else {
                    io.to(player.id).emit('createErrorMsg', "Insufficient 🪙s!");
                }
            }
        } catch (error) {
            console.log('Error message:', error);
        }
    })

    socket.on('newGame', (roomId) => {
        try {
            const player = rooms[roomId].find(p => p.id === socket.id);
            if (player) {
                player.status = true;
                player.deconstructed = [new Item('#' + uuidv4(), '2', '2', 'drag me!', 'common', 3),
                new Item('#a' + uuidv4(), 'a', 'a', 'var a', 'common', 3),
                new Item('#+' + uuidv4(), '+', '+', 'plus', 'common', 3),
                new Item('#b' + uuidv4(), 'b', 'b', 'var b', 'common', 3)];
                player.equation = '2a+b';
                player.buffedEquation = "";
                player.inventory = [new Item('#' + uuidv4(), '2', '2', 'drag me!', 'common', 3),
                new Item('#*' + uuidv4(), '*', '*', 'multiply', 'rare', 4),
                new Item('#c' + uuidv4(), 'c', 'c', 'var c', 'common', 3),
                new Item('#c' + uuidv4(), 'c', 'c', 'var c', 'common', 3)]
                player.relics = [];
                player.coins = 10;
                player.level = 1;
                player.exp = 0;
                player.health = 5;
                player.avoidDupes = new Set();
                player.assignments = {};
                player.sabotaged = {};
                player.presabotage = null;
                player.final = null;
                player.answer = null;
                player.result = null;
                io.to(player.id).emit('updateState', player.deconstructed, player.inventory, player.relics, player.coins, player.health, player.exp);
                io.to(player.id).emit('clearData');
            }
            if (rooms[roomId].every(p => p.status == true)) {
                rooms[roomId].forEach(p => {
                    p.status = false;
                    io.to(roomId).emit('initiateBuild');
                })
            }
        } catch (error) {
            console.log('Error message:', error);
        }
    })

    socket.on('end', () => {
        for (let roomId in rooms) {
            if (rooms[roomId].some((user) => user.id === socket.id)) {
                rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id)
                socket.broadcast.to(roomId).emit('opponentDisconnect', "Your opponent has disconnected! Redirecting you back to lobby.")
                rooms[roomId] = rooms[roomId].filter((user) => user.id !== socket.id)
                if (rooms[roomId].length === 0) {
                    delete rooms[roomId];
                }

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