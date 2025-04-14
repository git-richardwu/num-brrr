import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from './context';
import { useNavigate } from 'react-router-dom';
import { motion, spring } from "motion/react";

export default function LobbyPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => { //join via link
    if (socket && roomId) {
      socket.emit('joinRoom', roomId);
    }
  }, [socket, roomId])

  useEffect(() => {
    if (socket) {
      socket.on('playerJoined', () => {
        navigate(`/game/${roomId}`);
      })
    }
    return () => {
      if (socket) {
        socket.off('playerJoined');
      }
    };
  }, [socket, navigate, roomId]);

  return (
    <div>
      <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.5, type: spring }} animate={{ opacity: 1, scale: 1 }}>
        <h1>{roomId}</h1>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.9, type: spring }} animate={{ opacity: 1, scale: 1 }}>
        <button onClick={() => navigator.clipboard.writeText(roomId!)}>Copy Room Code!</button>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.8, type: spring }} animate={{ opacity: 1, scale: 1 }}>
        <h1>Waiting for opponent...</h1>
      </motion.div>
    </div>
  );
}