import React from "react";
import { Draggable } from "@hello-pangea/dnd";

interface tileProps {
    // idx: number;
    unique: string;
    text: string;
    index: number;
}

const Tile: React.FC<tileProps> = ({ unique, text, index }) => {

    return (
        <Draggable draggableId={unique} index={index}>
            {provided => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={{
                    ...provided.draggableProps.style, width: '100px',
                    height: '100px',
                    // display: 'inline-block',
                    margin: '0 8px',
                    backgroundColor: 'lightgrey',
                    border: '1px solid black',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    cursor: 'grab',
                    zIndex: 3
                }}>
                    {text}
                    
                </div>
            )}
        </Draggable>
    );
}

export default Tile;