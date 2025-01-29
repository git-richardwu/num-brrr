import React, { CSSProperties, useState } from 'react'
import './index.scss';
import { useSocket } from '../context';
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

interface ItemProps {
   itemID: string,
   name: string,
   icon: string,
   description: string,
   rarity: string,
   cost: number
}

interface buttonStates {
   [key: string]: boolean
}

interface ShopProps {
   style?: CSSProperties;
   wares: ItemProps[];
   coinCheck: number,
   backgroundText: string;
   roomId: string,
}

const Shop: React.FC<ShopProps> = ({ style, wares, coinCheck, roomId }) => {
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

   const purchaseElement = (e: ItemProps, idx: number) => {
      if (coinCheck >= e.cost) {
         socket.emit('pendingPurchase', roomId, e);
         setBoughtStates((prev) => ({
            ...prev, [`b-${idx}`]: !prev[`b-${idx}`]
         }));
      }
      console.log(e)
   }


   return (
      <div style={style}>
         {wares.map((item, index) => (
            <button className='buyButton' key={"b-" + item.itemID} disabled={boughtStates[`b-${index}`]} onClick={() => purchaseElement(item, index)}>
               {item.icon}
            </button>
         ))}
         <div className='bg-text'>SHOP</div>
      </div>
   )
}

export default Shop;