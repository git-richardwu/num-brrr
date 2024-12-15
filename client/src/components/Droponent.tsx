import React, { CSSProperties } from "react";
import { Droppable } from "@hello-pangea/dnd";
import Tile from "./Tile";

interface Item {
    id: number,
    content: string;
}

interface DroponentProps {
    dropID: string;
    style?: CSSProperties;
    list: Item[] | number[];
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
                                return <Tile unique={`${prefix}-${entry.id}`} text={entry.content} index={index} key={`${prefix}-${entry.id}`} />
                            }
                            else {
                                return <Tile unique={`${prefix}-${entry}`} text={String(entry)} index={index} key={`${prefix}-${entry}`} />
                            }
                        })}
                        {provided.placeholder}
                    </div>
                    <div className="position" >
                        {slotCount.map(item => (
                            <div className="square" key={item}>{item}</div>
                        ))}
                    </div>
                    <div className="bg-text">{backgroundText}</div>
                </div>

            )}
        </Droppable>
    )

}

export default Droponent;