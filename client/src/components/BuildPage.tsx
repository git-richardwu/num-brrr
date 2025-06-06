import { useEffect, useState, Dispatch, SetStateAction } from "react";
import './index.scss';
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { parse } from 'mathjs'
import Droponent from "./Droponent";
import { useSocket } from '../context';
import Shop from "./Shop";
import Relics from "./Relics";
import Glossary from "./Glossary";
import Timer from "./Timer";
import { motion, spring } from "motion/react"

interface ItemProps {
    itemID: string;
    name: string;
    icon: string;
    description: string;
    rarity: string;
    cost: number;
}

type functionType = (value: string, decon: ItemProps[], relics: ItemProps[]) => void

interface InventoryInterface {
    content: ItemProps[];
    inventory: ItemProps[];
    relics: ItemProps[];
    opEquation: string;
    opReceipt: ItemProps[];
    coins: number;
    health: number;
    sendDataToGame: functionType;
    roomId: string;
    progress: number;
    level: number;
    cap: number;
    triggerError: Dispatch<SetStateAction<string | null>>;
}

type rarityType = {
    common: number,
    rare: number,
    epic: number,
    legendary: number
}

type levelWeightType = {
    [level: number]: rarityType;
}

const levelWeights: levelWeightType = {
    1: {
        'common': 80,
        'rare': 14,
        'epic': 5,
        'legendary': 1
    },
    2: {
        'common': 70,
        'rare': 20,
        'epic': 8,
        'legendary': 2
    },
    3: {
        'common': 50,
        'rare': 30,
        'epic': 15,
        'legendary': 5
    },
    4: {
        'common': 20,
        'rare': 25,
        'epic': 35,
        'legendary': 20
    },
    5: {
        'common': 5,
        'rare': 15,
        'epic': 50,
        'legendary': 30
    },
}

const expressionLimit: { [key: number]: number } = {
        1: 7,
        2: 8,
        3: 10,
        4: 12,
        5: 14,
}

const BuildPage: React.FC<InventoryInterface> = ({ content, inventory, relics, opEquation, opReceipt, coins, health, sendDataToGame, roomId, progress, level, cap, triggerError }) => {
    const { socket } = useSocket();
    const [equationData, setequationData] = useState<ItemProps[]>(content);
    const [equationLimit, setequationLimit] = useState<number>(content.length);
    const [previewEquation, setPreviewEquation] = useState<string>('');
    const [healthData, setHealthData] = useState<number>(health)
    const [inventoryData, setinventoryData] = useState<ItemProps[]>(inventory);
    const [coinData, setCoinData] = useState<number>(coins)
    const [relicData, setRelicData] = useState<ItemProps[]>(relics);
    const [wareData, setWareData] = useState<ItemProps[]>([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [buttonMsg, setButtonMsg] = useState<string>('SUBMIT')
    const [isValid, setisValid] = useState<boolean>(true);
    const [showGlossary, setShowGlossary] = useState<boolean>(false);
    const [recentValid, setRecentValid] = useState<ItemProps[]>([]);
    const [recentInventory, setRecentInventory] = useState<ItemProps[]>([]);



    useEffect(() => { //populate with items
        if (socket) {
            socket.emit('generateWares', roomId);
            socket.on('updateWares', (wareArray: ItemProps[]) => {
                setWareData(wareArray);
            })
            socket.on('purchasedTile', (newInventory: ItemProps[]) => {
                setinventoryData(newInventory);
            })
            socket.on('purchasedRelic', (newRelics: ItemProps[]) => {
                setRelicData(newRelics);
            })
            socket.on('updateCoinCount', (newCoins: number) => {
                setCoinData(newCoins);
            })
            socket.on('wrapHeal', (newHealth: number) => {
                setHealthData(newHealth);
            })
            socket.on('updateSnapshots', (newRecentValid: ItemProps[], newRecentInventory: ItemProps[]) => {
                setRecentValid(newRecentValid);
                setRecentInventory(newRecentInventory);
            })
        }
        return () => {
            if (socket) {
                socket.off('updateWares');
                socket.off('purchasedTile');
                socket.off('purchasedRelic');
                socket.off('updateCoinCount');
                socket.off('updateSnapshots');
            }
        }
    }, [socket, roomId])

    useEffect(() => {
        socket.emit('updateInventory', roomId, inventoryData)
    }, [inventoryData, roomId, socket])

    useEffect(() => {
        socket.emit('updateRelicOrder', roomId, relicData)
    }, [relicData, roomId, socket])

    useEffect(() => { //track preview equation validity
        let updated = equationData.map(obj => obj.name).join("")
        if (isValid) {
            updated += " ✔️";
        }
        else {
            updated += " ❌";
        }
        setPreviewEquation(updated);
    }, [equationData, isValid, level])

    useEffect(() => { //track equation validity
        const temp = equationData.map(item => item.name);
        const tempString = temp.join("");
        if (/[a-z]/i.test(tempString) === false) { //check if there is at least one variable
            setisValid(false);
            return;
        }
        try {
            parse(tempString);
            setisValid(true);
            socket.emit('updateRecentValid', roomId, equationData, inventoryData);
            return;
        } catch (error) {
            setisValid(false);
            return;
        }
    }, [equationData, inventoryData, roomId, socket])

    function handleTimerCallBack(data: boolean) {
        if (data) {
            if (!isValid) {
                //update and restore to previous valid equation + inventory state
                socket.emit('updateInventory', roomId, recentInventory);
            }
            const temp = recentValid.map(item => item.name)
            const string = temp.join("")
            sendDataToGame(string, recentValid, relicData);
        }
    }

    function onDragEnd({ source, destination }: DropResult) {
        if (destination === undefined || destination == null) { //do nothing
            return;
        }
        if (destination.droppableId === source.droppableId && source.index === destination.index) {
            return;
        }
        if (destination.droppableId === 'sellArea') {
            const elements = source.droppableId === 'equation' ? [...equationData] : [...inventoryData];
            elements.splice(source.index, 1);
            if (source.droppableId === 'equation') {
                setequationData(elements);
            } else {
                setinventoryData(elements);
            }
            socket.emit('sellTile', roomId);
            return;
        }
        if (destination.droppableId === source.droppableId) { //same list
            const elements = source.droppableId === 'equation' ? [...equationData] : [...inventoryData]
            const [removed] = elements.splice(source.index, 1)
            elements.splice(destination.index, 0, removed)
            if (source.droppableId === 'equation') {
                setequationData(elements);
            } else {
                setinventoryData(elements);
            }
        }
        if (source.droppableId === 'equation' && destination.droppableId === 'inventory') {
            if (inventoryData.length >= 14) {
                triggerError("Max Inventory Size Reached!");
                return;
            }
            const updatedEquation = [...equationData];
            const updatedInventory = [...inventoryData];
            const [removed] = updatedEquation.splice(source.index, 1);
            updatedInventory.splice(destination.index, 0, removed);
            setequationData(updatedEquation);
            setinventoryData(updatedInventory);
        }
        if (source.droppableId === 'inventory' && destination.droppableId === 'equation') {
            if (equationData.length >= expressionLimit[level]) {
                triggerError("Max Equation Size Reached!" + " Level up to get more slots!");
                return;
            }
            const updatedInventory = [...inventoryData];
            const updatedEquation = [...equationData];
            const [removed] = updatedInventory.splice(source.index, 1);
            updatedEquation.splice(destination.index, 0, removed);
            setequationData(updatedEquation);
            setinventoryData(updatedInventory);
            setequationLimit(updatedEquation.length)
        }
    };

    function submitEquation() {
        if (isValid) {
            const temp = equationData.map(item => item.name)
            const string = temp.join("")
            sendDataToGame(string, equationData, relicData);
            setIsDisabled(true);
            setButtonMsg("WAITING FOR OPPONENT");
        } else {
            return
        }
    }

    function refreshShop(cost: number) {
        if (socket) {
            if (coinData >= cost) {
                socket.emit('payment', roomId, cost);
                socket.on('newBalance', (newBalance: number) => {
                    setCoinData(newBalance)
                })
                socket.emit('generateWares', roomId);
                socket.on('updateWares', (wareArray: ItemProps[]) => {
                    setWareData(wareArray);
                })
            }
            else {
                triggerError("Insufficient 🪙s!");
            }
        }
        return () => {
            if (socket) {
                socket.off('newBalance');
                socket.off('updateWares');
            }
        }
    }

    function closeGlossary() {
        setShowGlossary(false);
    }

    function sellRelic(index: number) {
        socket.emit('sellRelic', roomId, index);
    }

    function emitLevelUp() {
        socket.emit('levelUp', roomId);
    }



    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <button className="glossButton" onClick={() => setShowGlossary(!showGlossary)}>Glossary</button>
            {showGlossary && <Glossary onClose={closeGlossary} />}
            <div className="previewEquation">{previewEquation}</div>
            <div className="timerStyle">
                <Timer timeLimit={60} sendCompleteStatus={handleTimerCallBack} />
            </div>
            <div style={{ display: 'grid', gridTemplateRows: "auto 2fr auto", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
                <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.5, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ gridRow: "1 / 2", gridColumn: "1 / -1" }}>
                    <Droponent dropID={"equation"} style={{
                        position: 'relative', display: 'flex', flexWrap: 'wrap', padding: '10px', minHeight: '110px', backgroundColor: isValid ? '#97D8B2' : '#F78888',
                        margin: '10px', borderRadius: '10px', transition: '0.5s', pointerEvents: isDisabled ? 'none' : 'auto', 'opacity': isDisabled ? 0.5 : 1
                    }}
                        list={equationData} backgroundText={"EXPRESSION"} prefix={"E"} slotCount={[]} tileCap={expressionLimit[level]}/>
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.6, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ gridRow: "2 / 3", gridColumn: "1 / 2" }}>
                    <Shop style={{
                        position: 'relative', display: 'flex', flex: '0 0 auto', flexWrap: 'wrap', padding: '10px', minHeight: '420px', backgroundColor: '#22577A',
                        margin: '10px', borderRadius: '10px', pointerEvents: isDisabled ? 'none' : 'auto', 'opacity': isDisabled ? 0.5 : 1
                    }}
                        wares={wareData!}
                        backgroundText={"SHOP"} coinCheck={coinData} roomId={roomId!} relicCount={relicData.length} />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.7, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', gridRow: "2 / 3", gridColumn: "2 / 3", backgroundColor: '#38A3A5', margin: '10px', borderRadius: '10px', padding: '30px' }}>
                    <div>Health: {healthData}</div>
                    <div>🪙: {coinData}</div>
                    <button className={`${isDisabled ? 'disabled' : ''}`} onClick={() => { refreshShop(2) }}>Reroll for 2 🪙</button>
                    <div>------------------</div>
                    <div>Level: {level}</div>
                    <div> {level === 5 ? 'Max Level' : `Exp: ${progress}/${cap}`}</div>
                    <button onClick={() => { emitLevelUp() }} className={`${isDisabled || level === 5 ? 'disabled' : ''}`}>Add 3 Exp for 3 🪙</button>
                    <div className="bg-text small">STATS</div>
                </motion.div>
                <div style={{ gridRow: '2 / 3', gridColumn: ' 3 / 4', display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px' }}>
                    <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.5, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', margin: '10px', borderRadius: '10px', backgroundColor: '#DB5461', padding: '70px' }}>
                        <div className="bg-text small">RELICS</div>
                        <div className={`${isDisabled ? 'disabled' : ''}`}>
                            <Relics relicList={relicData} updateOrder={setRelicData} sellRelic={sellRelic} />
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.6, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ margin: '10px', borderRadius: '10px', backgroundColor: '#B3C0A4', padding: '10px' }}>
                        <div>Rarity Rates</div>
                        <div style={{ fontSize: 25 }}><span style={{ color: "#80EF80" }}>Common:</span>{" " + levelWeights[level]['common']}%</div>
                        <div style={{ fontSize: 25 }}><span style={{ color: "#1E96FC" }}>Rare:</span>{" " + levelWeights[level]['rare']}%</div>
                        <div style={{ fontSize: 25 }}><span style={{ color: "#C74FE8" }}>Epic:</span>{" " + levelWeights[level]['epic']}%</div>
                        <div style={{ fontSize: 25 }}><span style={{ color: "#FDB833" }}>Legendary:</span>{" " + levelWeights[level]['legendary']}%</div>
                    </motion.div>

                </div>
                <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.7, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ gridRow: "3 / 4", gridColumn: "1 / -1" }}>
                    <Droponent dropID={"inventory"} style={{
                        position: 'relative', display: 'flex', flexWrap: 'wrap', padding: '10px', minHeight: '110px', backgroundColor: '#F3B700',
                        margin: '10px', borderRadius: '10px', pointerEvents: isDisabled ? 'none' : 'auto', 'opacity': isDisabled ? 0.5 : 1
                    }}
                        list={inventoryData} backgroundText={"INVENTORY"} prefix={"I"} slotCount={[]} tileCap={0}/>
                </motion.div>
            </div>
            <button onClick={submitEquation} disabled={isDisabled} className={`${isDisabled || !isValid ? 'disabled' : ''}`}>{buttonMsg}</button>
        </DragDropContext>
    );
}

export default BuildPage;