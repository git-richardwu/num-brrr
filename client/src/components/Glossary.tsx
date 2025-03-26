import React, { useState } from "react";
import './index.scss';

interface GlossaryProps {
    onClose: () => void;
}

const Glossary: React.FC<GlossaryProps> = ({ onClose }) => {
    const [isVisible, toggleVisibility] = useState<boolean>(true);

    if (!isVisible) return null;

    return (
        <div className="overlay glossPos">
            <div className="glossBox">
                <ul className="listOfTerms">
                    <li><b>odd</b>: whole numbers that can't be evenly divided by 2. <i>[1, 3, 5, 7, 9, 11, 13, 15, 17, ...]</i></li>
                    <li><b>even</b>: whole numbers that can be evenly divided by 2. <i>[2, 4, 6, 8, 10, 12, 14, 16, 18, ...]</i></li>
                    <li><b>prime</b>: whole numbers whose only factors are 1 and itself. <i>[2, 3, 5, 7, 11, 13, 17, 19, 23, ...]</i></li>
                    <li><b>composite</b>: whole numbers that have more than two factors. <i>[4, 6, 8, 9, 10, 12, 14, 15, 16, ...]</i></li>
                    <li><b>abundant</b>: positive integers where the sum of its divisors is greater than the number itself. <i>[12, 18, 20, 24, 30, 36, 40, 42, 48, ...]</i></li>
                    <li><b>deficient</b>: positive integers where the sum of its divisors is less than the number itself. <i>[1, 2, 3, 4, 5, 7, 8, 10, 19, ...]</i></li>
                    <li><b>perfect</b>: positive integers where the sum of its divisors is equal the number itself. <i>[6, 28, 496, 8128, 33550336, 8589869056, ...]</i></li>
                    <li><b>square</b>: positive integers that are a product of an integer squared. <i>[1, 4, 9, 16, 25, 36, 49, 64, 81 ...]</i></li>
                    <li><b>triangle</b>: positive integers that can form an equilateral triangle. <i>[12, 18, 20, 24, 30, 36, 40, 42, 48, ...]</i></li>
                    <li><b>happy</b>: whole number that will eventually reach 1 when replaced by the sum of the square of its digits. <i>[1, 7, 10, 13, 19, 23, 28, 31, 32, ...]</i></li>
                    <li><b>narcissistic</b>: whole number that is the sum of of its digits each raised by the power of the number of digits. <i>[1, 2, 3, 4, 5, 6, 7, 8, 9, 153, ...]</i></li>
                    <li><b>palindromic</b>: positive integers that read the same forwards and backwards. <i>[111, 121, 393, 141, 87478, 952259, ...]</i></li>
                    <li><b>repunits</b>: positive integers where each digit is 1. <i>[1, 11, 111, 1111, 11111, 111111, ...]</i></li>
                </ul>
                <button onClick={() => {toggleVisibility(false); onClose();}}>close</button>
            </div>
        </div>
    )
}

export default Glossary;