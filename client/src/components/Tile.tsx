import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import Tippy from "@tippyjs/react";

interface tileProps {
    unique: string;
    text: string;
    desc: string;
    highlight: string;
    index: number;
}

const Tile: React.FC<tileProps> = ({ unique, text, desc, highlight, index }) => {

    return (
        <Draggable draggableId={unique} index={index}>
            {provided => (
                <Tippy content={<span>
                    {text}
                    <hr />
                    <span style={{ fontStyle: "oblique" }}>{desc}</span>
                </span>}>
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                        style={{
                            ...provided.draggableProps.style, width: '110px',
                            height: '110px',
                            display: 'flex',
                            margin: '0 4px',
                            backgroundColor: '#FBEEE0',
                            textAlign: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '4px',
                            boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                            cursor: 'grab',
                            zIndex: 3
                        }}>
                        {text}

                    </div>
                </Tippy>
            )}
        </Draggable>
    );
}

export default Tile;