import React, { useState, useEffect } from 'react';
import Droponent from './Droponent';
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";

interface Item {
    id: number,
    content: string;
}

type dropType = number

interface combatProps {
    equation: string,
    rolls: number[] //need to pass the index again
}

//when there are more than 3 variables in play, players can choose to insert to insert a number for their opponent

const CombatPage: React.FC<combatProps> = ({ equation, rolls }) => {
    const [randomRolls, setRandomRolls] = useState<number[]>(rolls);
    const [uniqueVariables, setUniqueVariables] = useState<string[]>([]);
    const [droppables, updateDroppables] = useState<dropType[]>([]);
    //const [setLength, updateSetLength] = useState<number>(0)
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

    useEffect(() => {
        extractNumofVar(equation)
    }, []);

    useEffect(() => {
        console.log(droppables)
    }, [droppables])

    const onDragEnd = ({ source, destination }: DropResult) => {
            if (destination === undefined || destination == null) {
                return
            }
            // if current count is greater than setLength, bounce
            if (destination.droppableId === source.droppableId && source.index === destination.index) {
                return
            }
            if (destination.droppableId === source.droppableId) {
                const elements = source.droppableId === 'rolls' ? [...randomRolls] : [...droppables]
                const [removed] = elements.splice(source.index, 1)
                elements.splice(destination.index, 0, removed)
                if (source.droppableId === 'equation') {
                    setRandomRolls(elements);
                } else {
                    updateDroppables(elements);
                }
            } else {
                const sourceElements = source.droppableId === 'rolls' ? [...randomRolls] : [...droppables]
                const destElements = destination.droppableId === 'rolls' ? [...randomRolls] : [...droppables]
                const [removed] = sourceElements.splice(source.index, 1);
                destElements.splice(destination.index, 0, removed);
    
                setRandomRolls(source.droppableId === 'rolls' ? sourceElements : destElements);
                updateDroppables(source.droppableId === 'rolls' ? destElements : sourceElements);
            }
        };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div>{equation}</div>
            <Droponent dropID={"rolls"} style={{ position: 'relative', display: 'flex', padding: '10px', minHeight: '110px', backgroundColor: '#97D8B2', margin: '10px', borderRadius: '10px' }}
            list={randomRolls} backgroundText={"SABOTAGE"} prefix={"C"} slotCount={[]} />
            <Droponent dropID={"slots"} style={{
                position: 'relative', display: 'flex', padding: '10px', minHeight: '110px', backgroundColor: '#89AAE6',
                margin: '10px', borderRadius: '10px'
            }}
            list={droppables} backgroundText={"ROLLS"} prefix={"D"} slotCount={uniqueVariables} />
            {/* <button onClick={submitEquation}>SUBMIT</button> */}
        </DragDropContext>
    )
}

export default CombatPage;