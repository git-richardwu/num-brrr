import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './context';
import PopUp from './components/PopUp';
import { motion, spring } from "motion/react"

export default function LandingPage() {
  const [roomId, setRoomId] = useState<string>("");
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>('Play!');
  const [popUpDetails, setPopUpDetails] = useState<string | null>(null);
  const { socket } = useSocket();
  const navigate = useNavigate();

  function createRoom() {
    if (socket) {
      socket.emit('createRoom');
      socket.on('roomCreated', (room: string) => {
        navigate(`/lobby/${room}`);
      });
    }
    return () => {
      if (socket) {
        socket.off('roomCreated')
      }
    }
  };
  function joinRoom() {
    if (socket) {
      socket.emit('joinRoom', roomId);
      socket.on('playerJoined', () => {
        navigate(`/game/${roomId}`);
      });
      socket.on('createErrorMsg', (msg: string) => {
        setPopUpDetails(msg);
      });
    }
    return () => {
      if (socket) {
        socket.off('playerJoined');
        socket.off('createErrorMsg');
      } 
    }
  }

  function matchMake() {
    if (socket) {
      socket.emit('matchMake');
      setIsDisabled(true);
      setButtonText('Searching...');
      socket.on('matchMade', (roomId: string) => {
        navigate(`/game/${roomId}`);
      });
    }
    return () => {
      if (socket) {
        socket.off('matchMade');
      } 
    }
  }

  function closePopUp() {
    setPopUpDetails(null);
  }

  function displayHowTo() {
    navigate(`/howtoplay`);
  }

  return (
    <div className="App">
      {popUpDetails && <PopUp onClose={closePopUp} message={popUpDetails} />}
      <h1>numBRRR</h1>
      <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2, type: spring }} animate={{ opacity: 1, scale: 1 }}>
        <button disabled={isDisabled} className={`${isDisabled ? 'disabled' : ''}`} onClick={matchMake}>{buttonText}</button>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.5, type: spring }} animate={{ opacity: 1, scale: 1 }}>
        <button onClick={displayHowTo}>How to Play</button>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.5, type: spring }} animate={{ opacity: 1, scale: 1 }}>
        <button onClick={createRoom}>Create Private Room</button>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.6, type: spring }} animate={{ opacity: 1, scale: 1 }}>
        <input onChange={(e) => setRoomId(e.target.value)} placeholder='Room Code' />
        <button onClick={joinRoom}>Join Room</button>
      </motion.div>
      
    </div>
  );
}