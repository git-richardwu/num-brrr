import React, { useState, useEffect } from 'react';
import { useSocket } from './context';
import { useParams } from 'react-router-dom';
import Area from './components/Area';
import CombatPage from './components/CombatPage';
import { evaluate, parse, random, randomInt } from 'mathjs';

export default function Game() {
    const { socket } = useSocket();
    const { roomId } = useParams<{ roomId: string }>();
    const [toggle, setToggle] = useState<boolean>(false);
    //const [choice, setChoice] = useState<number>(0);
    const [dice, setDice] = useState<number[]>([]);
    const [equationData, setEquationData] = useState<string>("$")

    const sampleData = [{content: 'a', id: 1}, {content: '*', id: 2}, {content: '-', id: 3}];
    const sampleInventory = [{content: '2', id: 4}, {content: '+', id: 5}, {content: 'c', id: 6}, {content: 'c', id: 7}];

    useEffect(() => {
        // socket.on('gameResult', (result: string) => {
        //     setResult(result);
        // });
        // return () => {
        //     socket.off('gameResult')
        // }
        socket.on('pickVariables', (variables: number[]) => {
            setDice(variables);
        })
        socket.on('initiateCombat', () => {
            setToggle(true);
        });
        return () => {
            socket.off('pickVariables');
            socket.off('initiateCombat')
            //socket.disconnect();
         }
    }, [])

    function handleDataFromArea(submittedEquation: string) { //should probably pass the whole object (InventoryData) in the future
        setEquationData(submittedEquation)
        socket.emit('playerReady', roomId, submittedEquation);
    }

    useEffect(() => {
        console.log(equationData)
    }, [equationData])

    return (
        <div>
            <div>
            {toggle ? (
                        <div>
                            <h2>Calculation</h2>
                            <h3>Game Result: {toggle}</h3>
                            <CombatPage equation={equationData} rolls={dice}></CombatPage>
                            <button onClick={() => setToggle(false)}>Play Again</button>
                        </div>
                    ) : (
                        <div>
                            <Area id="equationConstruct" content={sampleData} inventory={sampleInventory} sendDataToGame={handleDataFromArea} />
                        </div>
                    )}
            </div>
        </div>
    )
}