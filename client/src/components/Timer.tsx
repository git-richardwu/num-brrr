import React, { useEffect, useState } from "react";

interface TimeProps {
    timeLimit: number;
    sendCompleteStatus: (data: boolean) => void;
}

const Timer: React.FC<TimeProps> = ({ timeLimit, sendCompleteStatus }) => {
    const [seconds, setSeconds] = useState<number>(timeLimit);

    useEffect(() => {
        if (seconds === 0) {
            sendCompleteStatus(true);
            return;
        }
        const intervalId = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [seconds, timeLimit])

    const progress = ((timeLimit - seconds) / timeLimit) * 100;

    return (
        <div>
            <div style={{ width: '100%', backgroundColor: '#ddd', height: '10px', borderRadius: '10px' }}>
                <div style={{
                    width: `${progress}%`,
                    backgroundColor: '#4caf50',
                    height: '100%',
                    borderRadius: '10px',
                    transition: 'width 0.1s',
                }}></div>
            </div>
        </div>
    )
}

export default Timer;