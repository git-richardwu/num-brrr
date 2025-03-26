import React, { useEffect, useState } from "react";
import './index.scss';

interface PopProps {
    onClose: () => void;
    message: string;
}

const PopUp: React.FC<PopProps> = ({ onClose, message }) => {
    const [isVisible, toggleVisibility] = useState<boolean>(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            toggleVisibility(false);
            onClose();
        }, 4000)
        return () => clearTimeout(timer);
    }, [onClose])

    if (!isVisible) return null;

    return (
        <div className="overlay">
            <div className="popBox">
                <button className="closeButton" onClick={() => {toggleVisibility(false); onClose();}}>X</button>
                <p className="popContent">{message}</p>
            </div>
            
        </div>
    )
}

export default PopUp;