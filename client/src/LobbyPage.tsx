import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from './context';
import { useNavigate } from 'react-router-dom';

export default function LobbyPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const { socket } = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
          socket.on('playerJoined', () => {
            navigate(`/game/${roomId}`);
          })
    
          return () => {
            socket.off('message');
          };
        }
      }, [socket]);

    return (
        <div>
            <h1>{roomId}</h1>
            <button onClick={() => navigator.clipboard.writeText(roomId!)}>Copy Room Code!</button>
            <h1>Waiting for opponent...</h1>
        </div>
    );
}