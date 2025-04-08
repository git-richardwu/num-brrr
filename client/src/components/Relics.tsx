import React, { Dispatch, SetStateAction, useState } from "react";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";


interface ItemProps {
    itemID: string;
    name: string;
    icon: string;
    description: string;
    rarity: string;
    cost: number;
}

interface relicProps {
    relicList: ItemProps[];
    updateOrder: Dispatch<SetStateAction<ItemProps[]>>;
    sellRelic: (idx: number) => void;
}

const Relics: React.FC<relicProps> = ({ relicList, updateOrder, sellRelic }) => {

    function onDragEnd({ source, destination }: DropResult) {
        if (destination === undefined || destination == null) {
            return;
        }
        if (destination.droppableId === source.droppableId && source.index === destination.index) {
            return;
        }
        if (destination.droppableId !== source.droppableId) {
            return;
        }
        if (destination.droppableId === source.droppableId) {
            const elements = [...relicList];
            const [removed] = elements.splice(source.index, 1);
            elements.splice(destination.index, 0, removed);
            relicList = elements;
            updateOrder(relicList);
        }
    }

    

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={"RELICS"} direction="horizontal">
                {provided => (
                    <div style={{ listStyle: "none", display: 'flex', justifyContent: "center", alignItems: "center", fontSize: 40 }} ref={provided.innerRef} {...provided.droppableProps}>
                        {relicList.length === 0 ? <div style={{fontSize: 24}}>[ no relics equipped ]</div> : relicList.map((item, index) => (
                            <Draggable draggableId={item.itemID + index} key={item.itemID + index} index={index}>
                                {provided => (
                                    <Tippy key={'T-' + item.itemID + index} interactive={true} content={<span>
                                        {item.name}
                                        <hr />
                                        <span style={{ fontStyle: "oblique" }}>{item.description}</span>
                                        <br />
                                        <button onClick={() => sellRelic(index)}>Sell for 1 🪙</button>
                                    </span>} theme="light" animation="scale" delay={[200, 300]}>
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} key={"R-" + index + item.itemID}>{item.icon}</div>
                                    </Tippy>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}

export default Relics;