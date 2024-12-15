class Player {
    constructor(id){
        this.id = id;
        this.equation = '2x^2'
        this.inventory = []
        this.score = 0
    }

    increaseScore() {
        this.score += 1;
        console.log(`${this.name}'s score is now ${this.score}`);
    }

    displayScore() {
        return this.score
    }

}

module.exports = Player;