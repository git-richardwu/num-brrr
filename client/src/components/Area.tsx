import { useEffect, useState } from "react";
import './index.scss';
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { parse } from 'mathjs'
import Droponent from "./Droponent";

interface Item {
    id: number,
    content: string;
}

type functionType = (value: string) => void

interface InventoryInterface {
    id: string,
    content: Item[]
    inventory: Item[],
    sendDataToGame: functionType
}

const Area: React.FC<InventoryInterface> = ({ id, content, inventory, sendDataToGame }) => {
    const [contentData, setContentData] = useState<Item[]>(content);
    const [inventoryData, setinventoryData] = useState<Item[]>(inventory);
    const [isValid, setisValid] = useState(true);

    const onDragEnd = ({ source, destination }: DropResult) => {
        if (destination === undefined || destination == null) { //do nothing
            return
        }
        if (destination.droppableId === source.droppableId && source.index === destination.index) {
            return
        }
        if (destination.droppableId === source.droppableId) { //same list
            const elements = source.droppableId === 'equation' ? [...contentData] : [...inventoryData]
            const [removed] = elements.splice(source.index, 1)
            elements.splice(destination.index, 0, removed)
            if (source.droppableId === 'equation') {
                setContentData(elements);
            } else {
                setinventoryData(elements);
            }
        } else { //move to other list 
            const sourceElements = source.droppableId === 'equation' ? [...contentData] : [...inventoryData]
            const destElements = destination.droppableId === 'equation' ? [...contentData] : [...inventoryData]
            const [removed] = sourceElements.splice(source.index, 1);
            destElements.splice(destination.index, 0, removed);

            setContentData(source.droppableId === 'equation' ? sourceElements : destElements);
            setinventoryData(source.droppableId === 'equation' ? destElements : sourceElements);
        }
    };

    function submitEquation() {
        if (isValid) {
            const temp = contentData.map(item => item.content)
            const string = temp.join("")
            sendDataToGame(string)
        } else {
            return
        }
    }

    useEffect(() => {
        const temp = contentData.map(item => item.content)
        const tempString = temp.join("")
        try {
            parse(tempString)
            setisValid(true)
            return
        } catch (error) {
            setisValid(false)
            return
        }
    }, [contentData])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droponent dropID={"equation"} style={{ position: 'relative', display: 'flex', padding: '10px', minHeight: '110px', backgroundColor: isValid ? '#97D8B2' : '#F78888', margin: '10px', borderRadius: '10px', transition: '0.5s' }}
            list={contentData} backgroundText={"EQUATION"} prefix={"A"} slotCount={[]} />
            <Droponent dropID={"inventory"} style={{ position: 'relative', display: 'flex', padding: '10px', minHeight: '110px', backgroundColor: '#89AAE6', margin: '10px', borderRadius: '10px' }}
            list={inventoryData} backgroundText={"INVENTORY"} prefix={"B"} slotCount={[]} />
            <button onClick={submitEquation}>SUBMIT</button>
        </DragDropContext>
    );
}

export default Area;