import React, { CSSProperties, useEffect, useState } from 'react'
import './index.scss';
import { useSocket } from '../context';
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';

interface ItemProps {
   itemID: string;
   name: string;
   icon: string;
   description: string;
   rarity: string;
   cost: number;
}

interface buttonStates {
   [key: string]: boolean;
}

interface ShopProps {
   style?: CSSProperties;
   wares: ItemProps[];
   coinCheck: number;
   backgroundText: string;
   roomId: string;
   relicCount: number;
}

interface lookUp<T> {
   [key: string]: T;
}

const Shop: React.FC<ShopProps> = ({ style, wares, coinCheck, roomId, relicCount }) => {
   const { socket } = useSocket();

   const [boughtStates, setBoughtStates] = useState<buttonStates>({
      "b0": false,
      "b1": false,
      "b2": false,
      "b3": false,
      "b4": false,
      "b5": false,
      "b6": false,
      "b7": false,
      "b8": false,
   })

   useEffect(() => {
      socket.on('toggleButton', (disableIndex: number) => {
         setBoughtStates((prev) => ({
            ...prev, [`b-${disableIndex}`]: true
         }));
      })
   }, [boughtStates, socket])

   function purchaseElement(e: ItemProps, idx: number) {
      socket.emit('pendingPurchase', roomId, e, idx);
   }

   const colors: lookUp<string> = {
      'common': "#80EF80",
      'rare': '#1E96FC',
      'epic': '#C74FE8',
      'legendary': '#FDB833'
   }

   return (
      <div style={style}>
         {wares.map((item, index) => (
            <Tippy key={"T-" + item.itemID + index} content={<span>
               {item.name}
               <hr />
               <span style={{ fontStyle: "oblique", color: colors[item.rarity] }}>{item.description}</span>
               <br />
               <span style={{ fontStyle: "italic" }}>🪙: {item.cost}</span>
            </span>}>
               <button className='buyButton' key={"B-" + item.itemID} disabled={boughtStates[`b-${index}`]} onClick={() => purchaseElement(item, index)}>
                  <span className='buttonSurface'>{item.icon}</span>
               </button>
            </Tippy>

         ))}
         <Droppable droppableId={"sellArea"} direction="horizontal">
            {provided => (
               <div ref={provided.innerRef} {...provided.droppableProps} style={{
                  padding: '10px',
                  width: '110px',
                  height: '110px',
                  display: 'flex',
                  marginLeft: "20px",
                  marginTop: '20px',
                  backgroundColor: '#FBEEE0',
                  textAlign: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 29,
                  color: '#D77A61',
                  border: 'dashed 3px #22577A',
                  borderRadius: '10px', zIndex: 2
               }}>
                  <div style={{
                     width: '110px',
                     height: '110px', position: 'absolute'
                  }}>drag here to sell</div>{provided.placeholder}
               </div>
            )}
         </Droppable>

         <div className='bg-text'>SHOP</div>
      </div>
   )
}

export default Shop;