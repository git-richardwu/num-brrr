import { useEffect, useState } from "react";
import './index.scss';
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { parse } from 'mathjs'
import Droponent from "./Droponent";
import { useSocket } from '../context';
import Shop from "./Shop";
import Relics from "./Relics";

interface ItemProps {
    itemID: string,
    name: string,
    icon: string,
    description: string,
    rarity: string,
    cost: number
}

type functionType = (value: string) => void

interface InventoryInterface {
    id: string,
    content: ItemProps[]
    inventory: ItemProps[],
    relics: ItemProps[],
    coins: number,
    sendDataToGame: functionType,
    roomId: string
    //setGameState: React.Dispatch<React.SetStateAction<'build' | 'assignment' | 'calculate'>>
}

const BuildPage: React.FC<InventoryInterface> = ({ id, content, inventory, relics, coins, sendDataToGame, roomId }) => {
    const { socket } = useSocket();
    const [equationData, setequationData] = useState<ItemProps[]>(content);
    const [inventoryData, setinventoryData] = useState<ItemProps[]>(inventory);
    const [coinData, setCoinData] = useState<number>(coins)
    const [relicData, setRelicData] = useState<ItemProps[]>(relics);
    const [wareData, setWareData] = useState<ItemProps[]>([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [buttonMsg, setButtonMsg] = useState<string>('SUBMIT')
    const [isValid, setisValid] = useState(true);

    useEffect(() => {
        if (socket) {
            socket.emit('generateWares', roomId);
            socket.on('updateWares', (wareArray: ItemProps[]) => {
                console.log(wareArray)
                setWareData(wareArray);
            })
        }
    }, [])

    useEffect(() => {
        if (socket) {
            socket.on('purchasedTile', (newInventory: ItemProps[]) => {
                console.log(newInventory);
                setinventoryData(newInventory);
            })
            socket.on('purchasedRelic', (newRelics: ItemProps[]) => {
                setRelicData(newRelics);
            })
            socket.on('updateCoinCount', (newCoins: number) => {
                setCoinData(newCoins);
            })
        }
    }, [])

    const onDragEnd = ({ source, destination }: DropResult) => {
        if (destination === undefined || destination == null) { //do nothing
            return
        }
        if (destination.droppableId === source.droppableId && source.index === destination.index) {
            return
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
            setequationData(outdatedEquation => {
                const updatedEquation = [...outdatedEquation];
                const [removed] = updatedEquation.splice(source.index, 1);
                setinventoryData(outdatedInventory => {
                    const updatedInventory = [...outdatedInventory];
                    updatedInventory.splice(destination.index, 0, removed)
                    return updatedInventory
                })
                return updatedEquation;
            });
        }
        if (source.droppableId === 'inventory' && destination.droppableId === 'equation') {
            setinventoryData(outdatedInventory => {
                const updatedInventory = [...outdatedInventory];
                const [removed] = updatedInventory.splice(source.index, 1);
                setequationData(outdatedEquation => {
                    const updatedEquation = [...outdatedEquation]
                    updatedEquation.splice(destination.index, 0, removed)
                    return updatedEquation

                })
                return updatedInventory;
            });
        }
    };

    function submitEquation() {
        if (isValid) {
            const temp = equationData.map(item => item.name)
            const string = temp.join("")
            sendDataToGame(string)
            setIsDisabled(true)
            setButtonMsg("WAITING FOR OPPONENT")
        } else {
            return
        }
    }

    useEffect(() => {
        const temp = equationData.map(item => item.name)
        const tempString = temp.join("")
        if (/[a-z]/i.test(tempString) === false) {
            setisValid(false)
            return
        }
        try {
            parse(tempString);
            //check if there is at least one variable
            setisValid(true)
            return
        } catch (error) {
            setisValid(false)
            return
        }
    }, [equationData])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droponent dropID={"equation"} style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', padding: '10px', minHeight: '110px', backgroundColor: isValid ? '#97D8B2' : '#F78888', margin: '10px', borderRadius: '10px', transition: '0.5s' }}
                list={equationData} backgroundText={"EQUATION"} prefix={"A"} slotCount={[]} />
            <div style={{ display: 'flex', flexDirection: 'row', maxWidth: '100%' }}>
                <div style={{ flex: 2 }}>
                    <Shop style={{ position: 'relative', display: 'flex', flex: '0 0 auto', flexWrap: 'wrap', padding: '10px', minHeight: '420px', backgroundColor: 'aquamarine', margin: '10px', borderRadius: '10px' }}
                        wares={wareData!}
                        backgroundText={"SHOP"} coinCheck={coinData} roomId={roomId!} />
                </div>
                <div style={{ flex: 1 }}>
                    <div>Health: 8</div>
                    <Relics relicList={relicData}/>
                    <div>🪙: {coinData}</div>
                    <div>Your Opponent's Previous Equation:</div>
                    <button>Reroll for 1 🪙</button>
                    <div>Level: 1</div>
                    <div>Exp: 6/9</div>
                    <button>Add 3 Exp for 3 🪙</button>
                </div>
            </div>
            <Droponent dropID={"inventory"} style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', padding: '10px', minHeight: '110px', backgroundColor: '#89AAE6', margin: '10px', borderRadius: '10px' }}
                list={inventoryData} backgroundText={"INVENTORY"} prefix={"B"} slotCount={[]} />
            <button onClick={submitEquation} disabled={isDisabled} style={{ backgroundColor: isDisabled ? '#cad9f4' : '#89aae6' }}>{buttonMsg}</button>
        </DragDropContext>
    );
}

export default BuildPage;