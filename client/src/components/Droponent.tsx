import React, { CSSProperties } from "react";
import { Droppable } from "@hello-pangea/dnd";
import Tile from "./Tile";

interface ItemProps {
    itemID: string,
    name: string,
    icon: string,
    description: string,
    rarity: string,
    cost: number
}

interface DroponentProps {
    dropID: string;
    style?: CSSProperties;
    list: ItemProps[] | number[];
    backgroundText: string;
    prefix: string;
    slotCount: string[];
}

const Droponent: React.FC<DroponentProps> = ({ dropID, style, list, backgroundText, prefix, slotCount }) => {
    return (
        <Droppable droppableId={dropID} direction="horizontal">
            {provided => (
                <div style={{ position: 'relative' }} >
                    <div style={style} ref={provided.innerRef} {...provided.droppableProps}>
                        {list.map((entry, index) => {
                            if (typeof entry === 'object') {
                                return <Tile unique={entry.itemID} text={entry.icon} index={index} key={entry.itemID} />
                            }
                            else {
                                return <Tile unique={`${prefix}-${entry}`} text={String(entry)} index={index} key={`${prefix}-${entry}`} />
                            } //remove?
                        })}
                        {provided.placeholder}
                    </div>
                    <div className="position" >
                        {slotCount.map((item, index) => (
                            <div className="square" key={`${item}-${index}`}>{item}</div>
                        ))}
                    </div>
                    <div className="bg-text">{backgroundText}</div>
                </div>

            )}
        </Droppable>
    )

}

export default Droponent;