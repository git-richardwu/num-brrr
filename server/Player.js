const { v4: uuidv4 } = require('uuid');
const Item = require('./Item');

class Player {
    constructor(id) {
        this.id = id;
        //this.deconstructed = [{content: '2', id: uuidv4()}, {content: 'a', id: uuidv4()}, {content: '+', id: uuidv4()}, {content: 'b', id: uuidv4()}];
        this.deconstructed = [new Item('#' + uuidv4(), '2', '2', 'drag me!', 'common', 3),
        new Item('#' + uuidv4(), 'a', 'a', 'drag me!', 'common', 3),
        new Item('#' + uuidv4(), '+', '+', 'drag me!', 'common', 3),
        new Item('#' + uuidv4(), 'b', 'b', 'drag me!', 'common', 3)]
        this.equation = '2a+b';
        this.inventory = [new Item('#' + uuidv4(), '2', '2', 'drag me!', 'common', 3),
            new Item('#' + uuidv4(), '*', '*', 'drag me!', 'rare', 4),
            new Item('#' + uuidv4(), 'c', 'c', 'drag me!', 'common', 3),
            new Item('#' + uuidv4(), 'c', 'c', 'drag me!', 'common', 3)]
        this.relics = [];
        this.coins = 10;
        this.level = 1;
        this.exp = 0;
        this.health = 5;
        this.assignments = {}
        this.sabotaged = {}
        this.preview = null
        this.final = null;
        this.status = false
        this.answer = null;
        this.result = null
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