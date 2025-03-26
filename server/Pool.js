const Item = require('./Item');
const { v4: uuidv4 } = require('uuid');

const levelWeights = {
    1: {
        'common': 80,
        'rare': 14,
        'epic': 5,
        'legendary': 1
    },
    2: {
        'common': 70,
        'rare': 20,
        'epic': 8,
        'legendary': 2
    },
    3: {
        'common': 50,
        'rare': 30,
        'epic': 15,
        'legendary': 5
    },
    4: {
        'common': 20,
        'rare': 25,
        'epic': 35,
        'legendary': 20
    },
    5: {
        'common': 5,
        'rare': 15,
        'epic': 50,
        'legendary': 30
    },
}

const levelCap = {
    1: 12,
    2: 21,
    3: 27,
    4: 30,
}

const ItemPool = [
    new Item('#0', '0', '0', "zestful zero", 'common', 2),
    new Item('#1', '1', '1', "opportunistic one", 'common', 2),
    new Item('#2', '2', '2', "tactile two", 'common', 2),
    new Item('#3', '3', '3', "tolerant three", 'common', 2),
    new Item('#4', '4', '4', "festive four", 'common', 2),
    new Item('#5', '5', '5', "facilitative five", 'common', 2),
    new Item('#6', '6', '6', "sincere six", 'common', 2),
    new Item('#7', '7', '7', "scintillating seven", 'common', 2),
    new Item('#8', '8', '8', "eloquent eight", 'common', 2),
    new Item('#9', '9', '9', "novel nine", 'common', 2),
    new Item('#+', '+', '+', "plus", 'common', 2),
    new Item('#-', '-', '-', "minus", 'common', 2),
    new Item('#a', 'a', 'a', "var a", 'rare', 3),
    new Item('#b', 'b', 'b', "var b", 'rare', 3),
    new Item('#c', 'c', 'c', "var c", 'rare', 3),
    new Item('#d', 'd', 'd', "var d", 'rare', 3),
    new Item('#e', 'e', 'e', "var e", 'rare', 3),
    new Item('#f', 'f', 'f', "var f", 'rare', 3),
    new Item('#*', '*', '*', "multiply", 'rare', 3),
    new Item('#/', '/', '/', "divide", 'rare', 3),
    new Item('#|', '|', '|', "absolute", 'epic', 4),
    new Item('#(', '(', '(', "open parentheses", 'epic', 4),
    new Item('#)', ')', ')', "close parentheses", 'epic', 4),
    new Item('#^', '^', '^', "caret", 'legendary', 5)
]

const RelicPool = [
    new Item("I-1", "Negative Nancy", '👧', "apply -1 to your final expression", 'rare', 3),
    new Item("I-2", "Day Old Wrap", '🌯', "restore 1 HP", 'epic', 4),
    new Item("I-3", "Molar No. 3", '🦷', "numbers between 17 and 21 are raised to the power of 4", 'rare', 3),
    new Item("I-4", "Unfinished Die", '🎲', "multiply final expression with number between 1-5", 'epic', 4),
    new Item("I-5", "Soap-Flavored Mint", '🍬', "abundant numbers are raised to the power of 2", 'rare', 3 ),
    new Item("I-6", "Deified Racecar", '🏎️', "palindromic numbers (minimum length 3) are raised to the power of 4", 'legendary', 5),
    new Item("I-7", "New Jeans", '👖', "repunits are raised to the power of their length", "epic", 4),
    new Item("I-8", "Ate-Ball", '🎱', "every single digit 8 is raised to the power of 3", "rare", 3),
    new Item("I-9", "Luck Lucky", '🍀', "update numbers with digits greater than or equal to 3 from a base of 10 to a base of 4", 'epic', 4),
    new Item("I-10", "Even Steven",'🧍‍♂️', "add 246 to even numbers", 'rare', 3),
    new Item("I-11", "Deflated Volleyball",'🏐', "deficient numbers are multiplied by 2", 'rare', 3),
    new Item("I-12", "Sitting Rib Roast",'🥩', "prime numbers are raised to the power of 2", 'epic', 4),
    new Item("I-13", "Oddjob",'🕴️', "add 135 to odd numbers", 'rare', 3),
    new Item("I-14", "Composite Sketcher",'👩‍🎨', "composite numbers are multiplied by 2", 'rare', 3),
    new Item("I-15", "Recently Cleaned Mirror",'🪞', "perfect numbers are raised to the power of their length", 'epic' , 4),
    new Item("I-16", "Crooked Square",'🟪', "square numbers are raised to the power of 2", 'rare', 3),
    new Item("I-17", "Freezer Burnt Pizza",'🍕', "triangle numbers are raised to the power of 3", 'rare', 3),
    new Item("I-18", ":)",'😃', "happy numbers are raised to the power of the first digit", 'epic', 4),
    new Item("I-19", "Derek",'🧛‍♂️', "narcissistic numbers are raised to the power of the last digit", 'epic', 4),
    new Item("I-20", "Lychee Wood",'🪵', "multiply negative numbers containing 2 digits with 535", 'epic', 4),
    new Item("I-21", "Debbie Downer",'👩', "apply -1 to every number", 'rare', 3),
    new Item("I-22", "Moist Bagel", '🥯', "numbers that are both even AND composite are multiplied by 42", 'rare', 3),
    new Item("I-23", "Sour Pepper", '🌶️', "numbers that are both palindromic (minimum length 3) AND odd are multiplied by 121", 'epic', 4),
    new Item("I-24", "Auspicious Orange", '🍊', "multiply final expression by today's date (day) to the power of 2", 'epic', 4),
    new Item("I-25", "Sasaladlad", '🥗', "numbers that are divisible by 7 are raised to the power of 1.5 and then rounded up", 'rare', 3),
    new Item("I-26", "Single Hockey Stick", '🏒', "3 digit numbers that are divisible by 13 are raised to the power of 2", 'epic', 4),
    new Item("I-27", "Carpet Lollipop", '🍭', "single digit numbers are raised power of 4", 'rare', 3),
    new Item("I-28", "Plastic Anchor", '⚓', "narcissistic numbers with 3 or more digits are raised to the power of 5", 'epic', 4),
    new Item("I-29", "Crispy Leaves", '🍂', "take the factorial of single digit odd numbers", 'rare', 3),
    new Item("I-30", "Walking Velcro", '🦔', "multiply final expression by 200 (reduce by 40 for every other relic equipped)", 'rare', 3),
    new Item("I-31", "Bile Bar", '🍫', "multiply odd numbers by 370", 'epic', 4),
    new Item("I-32", "Pomegranate Pie", '🥧', "multiply odd numbers by 426", 'epic', 4),
    new Item("I-33", "Water Ice", '🍧', "multiply even numbers by 581", 'legendary', 5),
    new Item("I-34", "Julianne Potat", '🍟', "multiply even numbers by 204", 'epic', 4),
    new Item("I-35", "Evil Cherry", '🍒', "take the factorial of numbers equal to or less than 14", 'legendary', 5),




]

module.exports = { ItemPool, RelicPool, levelWeights, levelCap };
