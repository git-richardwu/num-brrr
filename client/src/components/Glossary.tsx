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
                    <li><b>odd</b>: <span className='instructions'>whole numbers that can't be evenly divided by 2. <ins>  examples</ins>: [1, 3, 5, 7, 9, 11, 13, 15, 17, ...]</span></li>
                    <li><b>even</b>: <span className='instructions'>whole numbers that can be evenly divided by 2. <ins>  examples</ins>: [2, 4, 6, 8, 10, 12, 14, 16, 18, ...]</span></li>
                    <li><b>prime</b>: <span className='instructions'>whole numbers whose only factors are 1 and itself. <ins>  examples</ins>: [2, 3, 5, 7, 11, 13, 17, 19, 23, ...]</span></li>
                    <li><b>composite</b>: <span className='instructions'>whole numbers that have more than two factors. <ins>  examples</ins>: [4, 6, 8, 9, 10, 12, 14, 15, 16, ...]</span></li>
                    <li><b>abundant</b>: <span className='instructions'>positive integers where the sum of its divisors is greater than the number itself. <ins>  examples</ins>: [12, 18, 20, 24, 30, 36, 40, 42, 48, ...]</span></li>
                    <li><b>deficient</b>: <span className='instructions'>positive integers where the sum of its divisors is less than the number itself.  <ins>  examples</ins>: [1, 2, 3, 4, 5, 7, 8, 10, 19, ...]</span></li>
                    <li><b>perfect</b>: <span className='instructions'>positive integers where the sum of its divisors is equal the number itself. <ins>  examples</ins>: [6, 28, 496, 8128, 33550336, 8589869056, ...]</span></li>
                    <li><b>square</b>: <span className='instructions'>positive integers that are a product of an integer squared. <ins>  examples</ins>: [1, 4, 9, 16, 25, 36, 49, 64, 81 ...]</span></li>
                    <li><b>triangle</b>: <span className='instructions'>positive integers that can form an equilateral triangle. <ins>  examples</ins>: [12, 18, 20, 24, 30, 36, 40, 42, 48, ...]</span></li>
                    <li><b>happy</b>: <span className='instructions'>whole number that will eventually reach 1 when replaced by the sum of the square of its digits. <ins>  examples</ins>: [1, 7, 10, 13, 19, 23, 28, 31, 32, ...]</span></li>
                    <li><b>narcissistic</b>: <span className='instructions'>whole number that is the sum of of its digits each raised by the power of the number of digits. <ins>  examples</ins>: [1, 2, 3, 4, 5, 6, 7, 8, 9, 153, ...]</span></li>
                    <li><b>palindromic</b>: <span className='instructions'>positive integers that read the same forwards and backwards. <ins>  examples</ins>: [111, 121, 393, 141, 87478, 952259, ...]</span></li>
                    <li><b>repunits</b>: <span className='instructions'>positive integers where each digit is 1. <ins>  examples</ins>: [1, 11, 111, 1111, 11111, 111111, ...]</span></li>
                </ul>
                <button onClick={() => {toggleVisibility(false); onClose();}}>close</button>
            </div>
        </div>
    )
}

export default Glossary;