import './index.scss';
import { useNavigate } from 'react-router-dom';

const HowToPlay = () => {
    const navigate = useNavigate();

    function goBack() {
        navigate('/');
    }

    return (
        <div>
            <button onClick={goBack} className='glossButton'>back</button>
            <div style={{ marginLeft: 20, marginRight: 20 }}>
                <div style={{ margin: 30 }}>OBJECTIVE: <span className='instructions'>make a number greater than your opponent!</span></div>
                <p style={{ margin: 30 }}>the game is split into two phases:</p>
                <div style={{ marginLeft: 30, marginRight: 30, marginBottom: 0 }}>BUILD PHASE: </div>
                <div className='instructions'>
                    <ul style={{ listStyleType: 'square', display: "inline-block", marginTop: 0 }}>
                        <li>During this phase, you will have 60 seconds to build a math expression.</li>
                        <li>You can improve your expression by using coins 🪙 to buy numbers, variables, operators, and relics from the Shop.</li>
                        <li>Relics provide buffs to specific types of numbers in your expression.</li>
                        <li>To 'build' your expression, simply drag tiles from your Inventory to the Expression area. </li>
                        <li>Click the 'Submit' button when ready!</li>
                    </ul>
                </div>

                <div style={{ marginLeft: 30, marginRight: 30, marginBottom: 0 }}>ASSIGNMENT/SABOTAGE PHASE: </div>
                <div className='instructions'><ul style={{ listStyleType: 'square', display: "inline-block", marginTop: 0 }}>
                    <li>During this phase, you will have 30 seconds to assign values to your variables.</li>
                    <li>BUT FIRST, you have the opportunity to assign and overwrite one of your opponent's variable.</li>
                    <li>After selecting which variable you'd like to sabotage, it will be represented on the next page with a red tab.</li>
                    <li>To assign, simply drag the tiles to the variables you desire.</li>
                    <li>Click the 'Submit' button when ready and you will be shown the results of the round!</li>
                </ul>
                </div>
                <div style={{ marginLeft: 30, marginRight: 30, marginBottom: 0 }}>TIPS/TRICKS</div>
                <div className='instructions'>
                    <ul style={{ listStyleType: 'square', display: "inline-block", marginTop: 0 }}>
                        <li>You can find and rearrange the order of your purchased relics in the Relics area - this impacts the order in which the buffs are applied during the Assignment Phase.</li>
                        <li>You can also use coins 🪙 to reroll your options in the Shop OR buy EXP to level up and increase your odds of seeing better items in the Shop.</li>
                        <li>During the Assignment/Sabotage phase, you and your opponent recieve the same values to assign.</li>
                    </ul>
                </div>
            </div>
        </div>

    )
}

export default HowToPlay;
