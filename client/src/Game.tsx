import React, { useState, useEffect } from 'react';
import { useSocket } from './context';
import { useParams } from 'react-router-dom';
import BuildPage from './components/BuildPage';
import CombatPage from './components/CombatPage';
import CalculationPage from './components/CalculationPage';
import { useNavigate } from 'react-router-dom';
import { evaluate, parse, random, randomInt } from 'mathjs';

type GameStates = 'build' | 'assignment' | 'calculate';

interface ItemProps {
    itemID: string,
    name: string,
    icon: string,
    description: string,
    rarity: string,
    cost: number
}


export interface PlayerAssignments {
    variableLetter: string,
    numberValue: number
}

export interface PlayerStats {
    id: string,
    equation: string,
    answer: number,
    assignments: PlayerAssignments,
    sabotaged: PlayerAssignments,
    preview: string,
    final: string,
    status: boolean,
    result: string
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
    const [currentRelics, setCurrentRelics] = useState<ItemProps[]>([]);
    const [currentCoins, setCurrentCoins] = useState<number>(0);
    const [dice, setDice] = useState<number[]>([]);
    const [opponentVariables, setOpponentVariables] = useState<string[]>([]);
    const [equationData, setEquationData] = useState<string>("$")
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (roomId != undefined) {
            socket.emit('fetchBuild', roomId);
        }
        socket.on('updateState', (deconstructedEq: ItemProps[], playerInventory: ItemProps[], playerItems: ItemProps[], playerCoins: number) => {
            setCurrentBuild(deconstructedEq);
            setCurrentInventory(playerInventory);
            setCurrentRelics(playerItems);
            setCurrentCoins(playerCoins);
            setLoading(false);
        })
        return () => {
            socket.off('fetchBuild');
        };
    }, [])

    useEffect(() => {
        socket.on('pickDiceRolls', (dies: number[]) => {
            setDice(dies);
        })
        socket.on('opponentVars', (variables: string[]) => {
            setOpponentVariables(variables)
            //console.log(variables);
        })
        socket.on('roundResults', (preview: PlayerStats[]) => {
            //console.log(preview)
            setPlayerProp(preview);
            //setYourAssignments(assign);
        })
        socket.on('initiateCombat', () => {
            setGameState('assignment');
        });
        socket.on('initiateCalculations', () => {
            socket.emit('fetchBuild', roomId);
            setGameState('calculate');
        })
        // socket.on('disconnect', () => {
        //     console.log('here')
        //     setSocketStatus(true);
        // })
        // if (socketStatus) {
        //     navigate('/');
        // }
        return () => {
            socket.off('pickDiceRolls');
            socket.off('initiateCombat')
            //socket.disconnect();
        }
    }, [navigate, socket])

    function handleDataFromBuildPage(submittedEquation: string) { //should probably pass the whole object (InventoryData) in the future
        setEquationData(submittedEquation)
        socket.emit('playerReady', roomId, submittedEquation);
    }

    function newRound(gameState: string) {
        if (gameState === 'build'){
            setGameState('build');
        }
    }
    return (
        <div>
            {loading ? <div>Loading...</div> :
                <div>
                    {gameState === 'build' && <BuildPage id="equationConstruct" content={currentBuild!} inventory={currentInventory} relics={currentRelics} coins={currentCoins} sendDataToGame={handleDataFromBuildPage} roomId={roomId!} />}
                    {gameState === 'assignment' && <CombatPage equation={equationData} rolls={dice} opponentVariables={opponentVariables}></CombatPage>}
                    {gameState === 'calculate' && <CalculationPage stats={playerProp} changeGameState={newRound} socketID={socket.id} />}
                </div>
            }
        </div>
    )
}