import { useState } from "react";
import { motion, spring } from "motion/react";

interface GameOverProps {
    outcome: string;
    returnToLobby: () => void;
    resetGame: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ outcome, returnToLobby, resetGame }) => {
    const [isDisabled, setIsDisabled] = useState(false);
    const [buttonMsg, setButtonMsg] = useState<string>('Play Again?')

    function beginReset() {
        resetGame()
        setIsDisabled(true);
        setButtonMsg("WAITING FOR OPPONENT");
    }

    return (
        <div>
            <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.7, type: spring }} animate={{ opacity: 1, scale: 1 }}>
                <h2>{outcome}</h2>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.8, type: spring }} animate={{ opacity: 1, scale: 1 }}>
            <button disabled={isDisabled} onClick={beginReset}>{buttonMsg}</button>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.9, type: spring }} animate={{ opacity: 1, scale: 1 }}>
            <button onClick={() => returnToLobby()}>Return Lobby</button>
            </motion.div>
            
        </div>

    )
}

export default GameOver;
