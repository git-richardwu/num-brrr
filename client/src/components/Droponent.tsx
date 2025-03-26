import React, { CSSProperties } from "react";
import { Droppable } from "@hello-pangea/dnd";
import Tile from "./Tile";

interface ItemProps {
    itemID: string;
    name: string;
    icon: string;
    description: string;
    rarity: string;
    cost: number;
}

type propOrNum = ItemProps[] | number[];

interface DroponentProps {
    dropID: string;
    style?: CSSProperties;
    list: propOrNum;
    backgroundText: string;
    prefix: string;
    slotCount: string[];
}

const Droponent: React.FC<DroponentProps> = ({ dropID, style, list, backgroundText, prefix, slotCount }) => {

    function typeGuard(checkThis: propOrNum): checkThis is ItemProps[] {
        return typeof checkThis[0] === 'object';
    }

    return (
        <Droppable droppableId={dropID} direction="horizontal">
            {provided => (
                <div style={{ position: 'relative' }} >
                    {typeGuard(list) ? <div style={style} ref={provided.innerRef} {...provided.droppableProps}>
                        {list.map((entry: ItemProps, index: number) => {
                            return <Tile unique={entry.itemID} text={entry.icon} desc={entry.description} highlight={entry.rarity} index={index} key={entry.itemID} />
                        })}
                        {provided.placeholder}
                    </div> : <div style={style} ref={provided.innerRef} {...provided.droppableProps}>
                        {list.map((entry: number, index: number) => {
                            return <Tile unique={`${prefix}-${entry}-${index}`} text={String(entry)} highlight={"solid white"} index={index} key={`${prefix}-${entry}-${index}`} desc={""} />
                        })}
                        {provided.placeholder}
                    </div>}

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