const { v4: uuidv4 } = require('uuid');
const Item = require('./Item');

class Player {
    constructor(id) {
        this.id = id;
        this.deconstructed = [new Item('#' + uuidv4(), '2', '2', 'drag me!', 'common', 3),
        new Item('#a' + uuidv4(), 'a', 'a', 'var a', 'common', 3),
        new Item('#+' + uuidv4(), '+', '+', 'plus', 'common', 3),
        new Item('#b' + uuidv4(), 'b', 'b', 'var b', 'common', 3)]
        this.equation = '2a+b';
        this.buffedEquation = "";
        this.inventory = [new Item('#' + uuidv4(), '2', '2', 'drag me!', 'common', 3),
            new Item('#*' + uuidv4(), '*', '*', 'multiply', 'rare', 4),
            new Item('#c' + uuidv4(), 'c', 'c', 'var c', 'common', 3),
            new Item('#c' + uuidv4(), 'c', 'c', 'var c', 'common', 3)]
        this.relics = [];
        this.coins = 10;
        this.prevReceipt = [];
        this.level = 1;
        this.exp = 0;
        this.health = 5;
        this.avoidDupes = new Set();
        this.previousEQ = '2a+b';
        this.assignments = {};
        this.sabotaged = {};
        this.presabotage = null;
        this.final = null;
        this.status = false;
        this.answer = null;
        this.result = null;
    }

    loseHealth() {
        this.health -= 1;
        console.log(`${this.id}'s health is now ${this.health}`);
    }

    displayHealth() {
        return this.score
    }

}

module.exports = Player;