import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.scss';
import LandingPage from './LandingPage';
import LobbyPage from './LobbyPage';
import { SocketProvider } from './context';
import Game from './Game';
import HowToPlay from './components/HowToPlay';

// import { io } from "socket.io-client";
// const socket = io("http://localhost:3001");

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/howtoplay' element={<HowToPlay />} />
        <Route path='/lobby/:roomId' element={<LobbyPage />} />
        <Route path='/game/:roomId' element={<Game />} />
      </Routes>
      </BrowserRouter>
    </SocketProvider>
  )
}
