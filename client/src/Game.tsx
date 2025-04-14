import React, { useState, useEffect } from 'react';
import { useSocket } from './context';
import { useParams } from 'react-router-dom';
import BuildPage from './components/BuildPage';
import CombatPage from './components/CombatPage';
import GameOver from './components/GameOver';
import CalculationPage from './components/CalculationPage';
import { useNavigate } from 'react-router-dom';
import PopUp from './components/PopUp';
import PreventRefresh from './components/PreventRefresh';
import { motion, AnimatePresence } from "motion/react"



type GameStates = 'build' | 'assignment' | 'calculate' | 'victory' | 'defeat';

interface ItemProps {
    itemID: string;
    name: string;
    icon: string;
    description: string;
    rarity: string;
    cost: number;
}

interface ReceiptProps {
    before: number;
    buff: ItemProps;
    after: number;
}

export interface PlayerAssignments {
    variableLetter: string;
    numberValue: number;
}

export interface PlayerStats {
    id: string;
    health: number;
    equation: string;
    buffedEquation: string;
    answer: number;
    assignments: PlayerAssignments;
    sabotaged: PlayerAssignments;
    presabotage: string;
    final: string;
    status: boolean;
    result: string;
}

export default function Game() {
    const { socket } = useSocket();
    // const [socketStatus, setSocketStatus] = useState(false);
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<GameStates>('build');
    const [playerProp, setPlayerProp] = useState<PlayerStats[]>([]);
    const [currentBuild, setCurrentBuild] = useState<ItemProps[]>([]);
    const [currentInventory, setCurrentInventory] = useState<ItemProps[]>([]);
    const [buffedEquation, setBuffedEquation] = useState<string>("")
    const [receiptData, setReceiptData] = useState<ReceiptProps[]>([])
    const [currentRelics, setCurrentRelics] = useState<ItemProps[]>([]);
    const [currentCoins, setCurrentCoins] = useState<number>(0);
    const [currentHealth, setCurrentHealth] = useState<number>(0);
    const [dice, setDice] = useState<number[]>([]);
    const [opponentVariables, setOpponentVariables] = useState<string[]>([]);
    const [equationData, setEquationData] = useState<string>("$")
    const [loading, setLoading] = useState<boolean>(true);
    const [popUpDetails, setPopUpDetails] = useState<string | null>(null);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [currentLevel, setCurrentLevel] = useState<number>(1);
    const [currentProgress, setCurrentProgress] = useState<number>(0);
    const [currentCap, setCurrentCap] = useState<number>(12);
    const [iconReceipt, setIconReceipt] = useState<ItemProps[]>([]);
    const [opponentIconReceipt, setOpponentIconReceipt] = useState<ItemProps[]>([]);
    const [opPrevEquation, setOpPrevEquation] = useState<string>('2a+b')



    function removeDupes(arr: ItemProps[]) {
        const temp = new Set();
        return arr.filter(obj => {
            if (!temp.has(obj.name)) {
                temp.add(obj.name);
                return true;
            }
            return false;
        });
    }

    useEffect(() => {
        if (socket) {
            if (roomId !== undefined) {
                socket.emit('fetchBuild', roomId); //catch something here
            }
            socket.on('updateState', (deconstructedEq: ItemProps[], playerInventory: ItemProps[], playerItems: ItemProps[], playerCoins: number, playerHealth: number, playerExp: number) => {
                setCurrentBuild(deconstructedEq);
                setCurrentInventory(playerInventory);
                setCurrentRelics(playerItems);
                setCurrentCoins(playerCoins);
                setCurrentHealth(playerHealth);
                setCurrentProgress(playerExp);
                setLoading(false);
            })
            socket.on('updateProgress', (newProgress: number, newCap: number, newLevel: number) => {
                setCurrentProgress(newProgress);
                setCurrentCap(newCap);
                setCurrentLevel(newLevel);
            })
            socket.on('clearData', () => {
                setOpPrevEquation('2a+b');
                setIconReceipt([]);
                setOpponentIconReceipt([]);
            })
            return () => {
                if (socket) {
                    socket.off('fetchBuild');
                    socket.off('updateState');
                    socket.off('updateProgress');
                    socket.off('clearData');
                }
            };
        }
        else {
            console.log('no socket');
        }
    }, [socket, roomId])

    useEffect(() => {
        if (socket) {
            socket.on('sendAssignData', (dies: number[], buffed: string, receipt: ReceiptProps[]) => {
                setDice(dies);
                setBuffedEquation(buffed);
                setReceiptData(receipt);
                const allInteractions = receipt.map(interaction => interaction.buff)
                const uniqueInteractions = removeDupes(allInteractions)
                setIconReceipt(uniqueInteractions);
            })
            socket.on('opponentVars', (variables: string[]) => {
                setOpponentVariables(variables)
            })
            socket.on('lastSeen', (opReceipt: ReceiptProps[], opEquation: string) => {
                const allOpInteractions = opReceipt.map(interaction => interaction.buff);
                const uniqueOpInteractions = removeDupes(allOpInteractions);
                setOpponentIconReceipt(uniqueOpInteractions);
                setOpPrevEquation(opEquation)
            })
            socket.on('roundResults', (preview: PlayerStats[]) => {
                setPlayerProp(preview);
                //setYourAssignments(assign);
            })
            socket.on('initiateBuild', () => {
                setGameState('build');
            })
            socket.on('initiateCombat', () => {
                setGameState('assignment');
            });
            socket.on('initiateCalculations', () => {
                socket.emit('fetchBuild', roomId);
                setGameState('calculate');
            })
            socket.on('createErrorMsg', (msg: string) => {
                setPopUpDetails(msg);
            });
            socket.on('opponentDisconnect', (msg: string) => {
                setPopUpDetails(msg);
                const timer = setTimeout(() => {
                    navigate('/');
                }, 4000)
                return () => clearTimeout(timer);
            })
            return () => {
                if (socket) {
                    socket.off('sendAssignData');
                    socket.off('initiateCombat');
                    socket.off('opponentVars');
                    socket.off('lastSeen');
                    socket.off('roundResults');
                    socket.off('initiateBuild');
                    socket.off('initiateCalculations');
                    socket.off('createErrorMsg');
                    socket.off('opponentDisconnect');
                }
            }
        }
    }, [navigate, socket, loading, gameState, roomId]);

    useEffect(() => {
        const handleBeforeUnloadEvent = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            setShowWarning(true);
        }
        window.addEventListener("beforeunload", handleBeforeUnloadEvent);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnloadEvent);
        }
    }, [])

    function handleDataFromBuildPage(submittedEquation: string, deconstructedEquation: ItemProps[], submittedRelics: ItemProps[]) { //should probably pass the whole object (InventoryData) in the future
        setEquationData(submittedEquation);
        setCurrentRelics(submittedRelics);
        socket.emit('playerReady', roomId, submittedEquation, deconstructedEquation, submittedRelics);
    }

    function closePopUp() {
        setPopUpDetails(null);
    }
    function closeWarning() {
        setShowWarning(false);
    }
    function redirectToLobby() {
        socket.emit('end');
        navigate('/');
    }
    function newGame() {
        socket.emit('newGame', roomId);
    }



    return (
        <div>
            {loading ?
                <div style={{ paddingTop: '50px' }}>
                    <div>oops, you've exited the match!</div>
                    <button onClick={redirectToLobby}>return to lobby</button>
                </div> :
                <div>
                    {popUpDetails && <PopUp onClose={closePopUp} message={popUpDetails} />}
                    {showWarning && <PreventRefresh onClose={closeWarning} returnToLobby={redirectToLobby} />}
                    <AnimatePresence>
                        {gameState === 'build' && <motion.div exit={{ opacity: 0 }}><BuildPage content={currentBuild} inventory={currentInventory} relics={currentRelics} opEquation={opPrevEquation} opReceipt={opponentIconReceipt} coins={currentCoins}
                            health={currentHealth} sendDataToGame={handleDataFromBuildPage} roomId={roomId!} progress={currentProgress} level={currentLevel} cap={currentCap} triggerError={setPopUpDetails} /></motion.div>}
                    </AnimatePresence>
                    <AnimatePresence>
                        {gameState === 'assignment' && <CombatPage equation={equationData} rolls={dice} opponentVariables={opponentVariables} receipt={receiptData} buffed={buffedEquation}></CombatPage>}
                    </AnimatePresence>
                    <AnimatePresence>
                        {gameState === 'calculate' && <CalculationPage stats={playerProp} changeGameState={setGameState} receipt={iconReceipt} opReceipt={opponentIconReceipt} socketID={socket.id} />}
                    </AnimatePresence>
                    {gameState === 'victory' && <GameOver outcome='Victory!' returnToLobby={redirectToLobby} resetGame={newGame} />}
                    {gameState === 'defeat' && <GameOver outcome='Defeat!' returnToLobby={redirectToLobby} resetGame={newGame} />}
                </div>
            }
        </div>
    )
}