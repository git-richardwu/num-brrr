function isEven(number) {
    return number % 2 === 0
}

function isOdd(number) {
    return number % 2 != 0
}

function isPrime(number) {
    for (let i = 2, s = Math.sqrt(number); i <= s; i++) {
        if (number % i === 0) {
            return false;
        }
    }
    return number > 1;
}

function isSquare(number) {
    if (number <= 0) {
        return false;
    }
    const squareRoot = Math.sqrt(number);
    return Number.isInteger(squareRoot)
}

function isDeficient(number) {
    if (number <= 0) {
        return false;
    }
    let sumOfDivisors = 0;
    for (let i = 1; i < number; i++) {
        if (number % i === 0) {
            sumOfDivisors += i;
        }
    }
    return sumOfDivisors < number;
}

function isAbundant(number) {
    if (number <= 0) {
        return false;
    }
    let sumOfDivisors = 0;
    for (let i = 0; i < number; i++) {
        if (number % i == 0) {
            sumOfDivisors += i;
        }
    }
    return sumOfDivisors > number;
}


function isPalindrome(number) {
    let numString = number.toString();
    if (numString.length >= 3) {
        let res = numString.split('').reverse().join('');
    return numString === res;
    }
    else {
        return false;
    }
}

function isRepunit(number) {
    let numString = number.toString();
    for (let char of numString) {
        if (char != '1') {
            return false
        }
    }
    return true
}

function isComposite(number) {
    if (number <= 1) {
        return false;
    }
    for (let i = 2; i <= Math.sqrt(number); i++) {
        if (number % i === 0) {
            return true;
        }
    }
    return false;
}

function isPerfect(number) {
    if (number <= 0) {
        return false;
    }
    let sumOfDivisors = 1;
    for (let i = 2; i < Math.sqrt(number); i++) {
        if (number % i === 0) {
            sumOfDivisors += i;
            let pairDiv = number / i
            if (i !== pairDiv) {
                sumOfDivisors += pairDiv
            }
        }
    }
    return sumOfDivisors === number;
}

function isTriangle(number) {
    if (number < 0) {
        return false;
    }
    const res = (Math.sqrt(8 * number + 1) - 1) / 2;
    return Number.isInteger(res);
}

function sumOfSquares(number) {
    let sum = 0;
    while (number > 0) {
        const digit = number % 10;
        sum += digit * digit;
        number = Math.floor(number / 10);
    }
    return sum
}


function isHappy(number) {
    let slow = number;
    let fast = sumOfSquares(number)
    while (fast !== 1 && slow !== fast) {
        slow = sumOfSquares(slow);
        fast = sumOfSquares(sumOfSquares(fast))
    }
    return fast === 1;
}

function isNarcissistic(number) {
    let numString = number.toString();
    let length = numString.length;

    let sum = 0;
    for (let i = 0; i < length; i++) {
        sum += Math.pow(parseInt(numString[i]), length)
    }
    return sum === number
}

function exponentByValAt(number, index) {
    let numString = number.toString()
    let exponent = parseInt(numString.charAt(index))
    return Math.pow(number, exponent)
}

module.exports = {
    isEven, isOdd, isPrime, isDeficient, isSquare,
    isAbundant, isPalindrome, isRepunit, isComposite, isPerfect, isTriangle, isHappy, isNarcissistic,
    exponentByValAt
}