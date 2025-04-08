import { useEffect, useState, Dispatch, SetStateAction } from "react";
import './index.scss';
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { parse } from 'mathjs'
import Droponent from "./Droponent";
import { useSocket } from '../context';
import Shop from "./Shop";
import Relics from "./Relics";
import Glossary from "./Glossary";
import Tippy from "@tippyjs/react";
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

const BuildPage: React.FC<InventoryInterface> = ({ content, inventory, relics, opEquation, opReceipt, coins, health, sendDataToGame, roomId, progress, level, cap, triggerError }) => {
    const { socket } = useSocket();
    const [equationData, setequationData] = useState<ItemProps[]>(content);
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
        }
        return () => {
            socket.off('updateWares');
            socket.off('purchasedTile');
            socket.off('purchasedRelic');
            socket.off('updateCoinCount');
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
    }, [equationData, isValid])

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
            return;
        } catch (error) {
            setisValid(false);
            return;
        }
    }, [equationData])

    function onDragEnd({ source, destination }: DropResult) {
        if (destination === undefined || destination == null) { //do nothing
            return;
        }
        if (destination.droppableId === source.droppableId && source.index === destination.index) {
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
            const updatedEquation = [...equationData];
            const updatedInventory = [...inventoryData];
            const [removed] = updatedEquation.splice(source.index, 1);
            updatedInventory.splice(destination.index, 0, removed);
            setequationData(updatedEquation);
            setinventoryData(updatedInventory);
        }
        if (source.droppableId === 'inventory' && destination.droppableId === 'equation') {
            const updatedInventory = [...inventoryData];
            const updatedEquation = [...equationData];
            const [removed] = updatedInventory.splice(source.index, 1);
            updatedEquation.splice(destination.index, 0, removed);
            setequationData(updatedEquation);
            setinventoryData(updatedInventory);
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
            socket.off('newBalance');
            socket.off('updateWares');
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
            <div style={{ flex: 1, display: 'grid', gridTemplateRows: "auto 2fr auto", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
                <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.5, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ gridRow: "1 / 2", gridColumn: "1 / -1" }}>
                    <Droponent dropID={"equation"} style={{
                        position: 'relative', display: 'flex', flexWrap: 'wrap', padding: '10px', minHeight: '110px', backgroundColor: isValid ? '#97D8B2' : '#F78888',
                        margin: '10px', borderRadius: '10px', transition: '0.5s', pointerEvents: isDisabled ? 'none' : 'auto', 'opacity': isDisabled ? 0.5 : 1
                    }}
                        list={equationData} backgroundText={"EQUATION"} prefix={"E"} slotCount={[]} />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.6, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ gridRow: "2 / 3", gridColumn: "1 / 2" }}>
                    <Shop style={{
                        position: 'relative', display: 'flex', flex: '0 0 auto', flexWrap: 'wrap', padding: '10px', minHeight: '420px', backgroundColor: '#22577A',
                        margin: '10px', borderRadius: '10px', pointerEvents: isDisabled ? 'none' : 'auto', 'opacity': isDisabled ? 0.5 : 1
                    }}
                        wares={wareData!}
                        backgroundText={"SHOP"} coinCheck={coinData} roomId={roomId!} relicCount={relicData.length} />
                </motion.div>
                <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.7, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', gridRow: "2 / 3", gridColumn: "2 / 3", backgroundColor: '#38A3A5', margin: '10px', borderRadius: '10px', padding: '10px' }}>
                    <div>Health: {health}</div>
                    <div className={`${isDisabled ? 'disabled' : ''}`}>
                        <Relics relicList={relicData} updateOrder={setRelicData} sellRelic={sellRelic} />
                    </div>
                    <div>🪙: {coinData}</div>
                    <button className={`${isDisabled ? 'disabled' : ''}`} onClick={() => { refreshShop(2) }}>Reroll for 2 🪙</button>
                    <div>------------------</div>
                    <div>Level: {level}</div>
                    <div> {level === 5 ? 'Max Level Reached!' : `Exp: ${progress}/${cap}`}</div>
                    <button onClick={() => { emitLevelUp() }} className={`${isDisabled || level === 5 ? 'disabled' : ''}`}>Add 3 Exp for 3 🪙</button>
                </motion.div>
                <div style={{ gridRow: '2 / 3', gridColumn: ' 3 / 4', display: 'grid', gridTemplateRows: '1fr 1fr', gap: '10px' }}>
                    <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.5, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', margin: '10px', borderRadius: '10px', backgroundColor: '#DB5461', padding: '10px' }}>
                        <div className="bg-text small">OPPONENT</div>

                        <div>Last Seen Equation and Relics: {opEquation}</div>
                        {opReceipt.length === 0 ? <div>[ ]</div> : <div style={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>{opReceipt.map((item, index) => (
                            <Tippy key={'O-' + item.itemID + index} content={<span>
                                {item.name}
                                <hr />
                                <span style={{ fontStyle: "oblique" }}>{item.description}</span>
                                <br />
                            </span>} theme="light" animation="scale" delay={[200, 300]}>
                                <div key={"R-" + index + item.itemID}>{item.icon}</div>
                            </Tippy>
                        ))}</div>}
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.6, type: spring }} animate={{ opacity: 1, scale: 1 }} style={{ margin: '10px', borderRadius: '10px', backgroundColor: '#F0E2E7', padding: '10px' }}>
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
                        list={inventoryData} backgroundText={"INVENTORY"} prefix={"I"} slotCount={[]} />
                </motion.div>
            </div>
            <button onClick={submitEquation} disabled={isDisabled} className={`${isDisabled || !isValid ? 'disabled' : ''}`}>{buttonMsg}</button>
        </DragDropContext>
    );
}

export default BuildPage;