import React, { useState, useEffect } from 'react';
import Droponent from './Droponent';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context';
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import Tippy from '@tippyjs/react';
import Timer from './Timer';
import { AnimatePresence, motion } from "motion/react"

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

interface combatProps {
    equation: string;
    opponentVariables: string[];
    rolls: number[];
    receipt: ReceiptProps[];
    buffed: string;
}
interface lookUp<T> {
    [key: string]: T
}


const CombatPage: React.FC<combatProps> = ({ equation, rolls, opponentVariables, receipt, buffed }) => {
    const { socket } = useSocket();
    const { roomId } = useParams<{ roomId: string }>();
    const [randomRolls, setRandomRolls] = useState<number[]>(rolls);
    const [uniqueVariables, setUniqueVariables] = useState<string[]>([]);
    const [buttonMsg, setButtonMsg] = useState<string>('SUBMIT')
    const [sabotageVar, setSabotageVar] = useState<string | null>(null);
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        extractNumofVar(equation);
    }, [equation]);

    function extractNumofVar(e: string) {
        const countVar = new Set<string>();
        for (const character of e) {
            if (/^[a-zA-Z]$/.test(character)) {
                countVar.add(character);
            }
        }
        const temp = Array.from(countVar);
        setUniqueVariables(temp);
    }

    function handleClick(option: string) {
        setSabotageVar(option);
        var temp = [...uniqueVariables];
        temp.push(option);
        setUniqueVariables(temp);
    }

    const colors: lookUp<string> = {
        'common': "#80EF80",
        'rare': '#1E96FC',
        'epic': '#C74FE8',
        'legendary': '#FDB833'
    }

    function confirmSelection() { //should probably pass the whole object (InventoryData) in the future
        setIsDisabled(true);
        setButtonMsg("WAITING FOR OPPONENT");
        socket.emit('playerAssigned', roomId, randomRolls, uniqueVariables);
    }

    function onDragEnd({ source, destination }: DropResult) {
        if (destination === undefined || destination == null) {
            return;
        }
        // if current count is greater than setLength, bounce
        if (destination.droppableId === source.droppableId && source.index === destination.index) {
            return
        }
        if (destination.droppableId === source.droppableId) {
            const elements = [...randomRolls];
            const [removed] = elements.splice(source.index, 1);
            elements.splice(destination.index, 0, removed);
            setRandomRolls(elements);
        }
    };

    function handleTimerCallBack(data: boolean) {
        var temp: string[] = [...uniqueVariables];
        if (data && sabotageVar === null) {
            setSabotageVar(opponentVariables[0]);
            temp.push(opponentVariables[0]);
            setUniqueVariables(temp);
        }
        socket.emit('playerAssigned', roomId, randomRolls, temp);
     }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="timerStyle">
                <Timer timeLimit={30} sendCompleteStatus={handleTimerCallBack} />
            </div>
            <motion.div initial={{ opacity: 0 }} transition={{ duration: 1 }} animate={{ opacity: 1 }} style={{ backgroundColor: '#E3E3E3' }}>
                <div>your initial equation: {equation}</div>
                <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', marginTop: '10px' }}>
                    {receipt.length === 0 ? <div style={{color: 'grey'}}>no buffs applied :<span>&#40;</span></div> :
                        <div style={{ maxHeight: '200px', borderRadius: '10px', backgroundColor: '#ECECEC', padding: "10px", overflowY: 'auto' }}>
                    {receipt.map((item, index) => (
                            <Tippy key={item.buff.itemID + index} content={<span>
                                {item.buff.name}
                                <hr />
                                <span style={{ fontStyle: "oblique", color: colors[item.buff.rarity] }}>{item.buff.description}</span>
                            </span>}>
                                <div>{item.before} ➡️ {item.buff.icon} ➡️ {item.after}</div>
                            </Tippy>
                    ))}
                    </div>
                    }
                </div>
                <div>your buffed equation: {buffed}</div>
            </motion.div>
            <div>⬇️</div>
            <AnimatePresence>
            {sabotageVar ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div>assign your variables and sabotage one of your <span style={{color: '#F78888'}}>opponent's!</span></div>
                    <br />
                    <Droponent dropID={"slots"} style={{
                            position: 'relative', display: 'flex', padding: '10px', minHeight: '110px', backgroundColor: '#89AAE6',
                            margin: '10px', borderRadius: '10px'
                        }}
                        list={randomRolls} backgroundText={"ASSIGN"} prefix={"D"} slotCount={uniqueVariables} tileCap={0} />
                    <button onClick={confirmSelection} disabled={isDisabled} className={`${isDisabled ? 'disabled' : ''}`}>{buttonMsg}</button>
                </motion.div>
            ) :
                <div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Pick one of your opponent's variable to sabotage 💣</motion.div>
                    {opponentVariables.map(option => (
                        <button key={String(option)} className='sabotageButton' onClick={() => handleClick(option)}>{option}</button>
                    ))}
                </div>
            }
            </AnimatePresence>
        </DragDropContext>
    )
}

export default CombatPage;