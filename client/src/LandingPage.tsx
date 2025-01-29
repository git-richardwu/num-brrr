import React, { useState, useEffect } from 'react';
// import { io } from "socket.io-client";
import { useNavigate } from 'react-router-dom';
import { useSocket } from './context';
// const socket = io("http://localhost:3001");

export default function LandingPage() {
  const [roomId, setRoomId] = useState<string>("")
  const { socket } = useSocket();
  const navigate = useNavigate();

  const createRoom = () => {
    if (socket) {
      socket.emit('createRoom');
      socket.on('roomCreated', (room: string) => {
        navigate(`/lobby/${room}`);
      });
    }

  };
  const joinRoom = () => {
    if (socket) {
      socket.emit('joinRoom', roomId);
      socket.on('playerJoined', () => {
        navigate(`/game/${roomId}`);
      });
    }
  }

  return (
    <div className="App">
      <h1>numBRRR</h1>
      <button onClick={createRoom}>Create Room</button>
      <div>
        <input onChange={(e) => setRoomId(e.target.value)} placeholder='Room Code' />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
}