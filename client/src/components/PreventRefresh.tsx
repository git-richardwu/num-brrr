import React, { useState } from "react";
import './index.scss';

interface warningProps {
    onClose: () => void;
    returnToLobby: () => void;
}

const PreventRefresh: React.FC<warningProps> = ({ onClose, returnToLobby }) => {
    const [isVisible, toggleVisibility] = useState<boolean>(true);
    
    if (!isVisible) return null;

    return (
        <div className="overlay">
            <div className="popBox">
                <p style={{ marginTop: '10px', fontSize: '20px' }}>Careful!</p>
                <p style={{ color: '#394053', fontSize: '15px'}}>
                   Refreshing the page will disconnect you from the match!
                </p>
                <button onClick={() => {toggleVisibility(false); onClose();}}>understood</button>
                <button onClick={() => {toggleVisibility(false); returnToLobby();}}>leave game</button>
            </div>
            
        </div>
    )
}


export default PreventRefresh;
