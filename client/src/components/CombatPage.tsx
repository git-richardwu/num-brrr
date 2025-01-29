import React, { useState, useEffect } from 'react';
import Droponent from './Droponent';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context';
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";

type dropType = number

interface combatProps {
    equation: string,
    opponentVariables: string[],
    rolls: number[] //need to pass the index again
}

//when there are more than 3 variables in play, players can choose to insert to insert a number for their opponent

const CombatPage: React.FC<combatProps> = ({ equation, rolls, opponentVariables }) => {
    const { socket } = useSocket();
    const { roomId } = useParams<{ roomId: string }>();
    const [randomRolls, setRandomRolls] = useState<number[]>(rolls);
    const [uniqueVariables, setUniqueVariables] = useState<string[]>([]);
    const [buttonMsg, setButtonMsg] = useState<string>('SUBMIT')
    const [sabotageVar, setSabotageVar] = useState<string | null>(null);
    const [isDisabled, setIsDisabled] = useState(false);
    //previous equation

    const extractNumofVar = (e: string) => {
        const countVar = new Set<string>()
        for (const character of e) {
            if (/^[a-zA-Z]$/.test(character)) {
                countVar.add(character)
            }
        }
        const temp = Array.from(countVar)
        setUniqueVariables(temp)
        //updateSetLength(countVar.size)
    }

    const handleClick = (option: string) => {
        setSabotageVar(option);
        var temp = [...uniqueVariables];
        temp.push(option);
        setUniqueVariables(temp);
    }

    useEffect(() => {
        extractNumofVar(equation)
    }, []);

    function confirmSelection() { //should probably pass the whole object (InventoryData) in the future
        setIsDisabled(true)
        setButtonMsg("WAITING FOR OPPONENT")
        socket.emit('playerAssigned', roomId, randomRolls, uniqueVariables);
    }

    const onDragEnd = ({ source, destination }: DropResult) => {
        if (destination === undefined || destination == null) {
            return
        }
        // if current count is greater than setLength, bounce
        if (destination.droppableId === source.droppableId && source.index === destination.index) {
            return
        }
        if (destination.droppableId === source.droppableId) {
            const elements = [...randomRolls]
            const [removed] = elements.splice(source.index, 1)
            elements.splice(destination.index, 0, removed)
            setRandomRolls(elements);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div>{equation}</div>
            {sabotageVar ? (
                <div>
                    <Droponent dropID={"slots"} style={{
                        position: 'relative', display: 'flex', padding: '10px', minHeight: '110px', backgroundColor: '#89AAE6',
                        margin: '10px', borderRadius: '10px'
                    }}
                        list={randomRolls} backgroundText={"ASSIGN"} prefix={"D"} slotCount={uniqueVariables} />
                    <button onClick={confirmSelection} disabled={isDisabled} style={{backgroundColor: isDisabled ? '#cad9f4' : '#89aae6'}}>{buttonMsg}</button>
                </div>
            ) :
                <div>
                    <div>Pick one of your opponent's variable to sabotage 💣</div>
                    {opponentVariables.map(option => (
                        <button key={String(option)} className='sabotageButton' onClick={() => handleClick(option)}>{option}</button>
                    ))}
                </div>
            }

            {/* <button onClick={submitEquation}>SUBMIT</button> */}
        </DragDropContext>
    )
}

export default CombatPage;