import React, { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { PlayerStats } from '../Game'
import { PlayerAssignments } from '../Game';
import './index.scss';
import Timer from './Timer';
import Tippy from '@tippyjs/react';
import { motion, spring } from "motion/react"

type GameStates = 'build' | 'assignment' | 'calculate' | 'victory' | 'defeat';

interface ItemProps {
   itemID: string;
   name: string;
   icon: string;
   description: string;
   rarity: string;
   cost: number;
}

interface ReceiptProps {
   before: number;
   buff: ItemProps;
   after: number;
}

interface RoundDetails {
   stats: PlayerStats[];
   changeGameState: Dispatch<SetStateAction<GameStates>>;
   receipt: ItemProps[];
   opReceipt: ItemProps[];
   socketID: string;
}

const CalculationPage: React.FC<RoundDetails> = ({ stats, changeGameState, receipt, opReceipt, socketID }) => {
   const [yourbaseEquation, setYourBaseEquation] = useState<string>("");
   const [opbaseEquation, setOpBaseEquation] = useState<string>("");
   const [yourInitialEquation, setYourInitialEquation] = useState<string>("");
   const [opInitialEquation, setOpInitialEquation] = useState<string>("");

   const [yourBuffedEquation, setYourBuffedEquation] = useState<string>("");
   const [opBuffedEquation, setOpBuffedEquation] = useState<string>("");

   const [yourAssignments, setYourAssignments] = useState<PlayerAssignments>();
   const [opAssignments, setOpAssignments] = useState<PlayerAssignments>();
   const [yourSabotaged, setYourSabotaged] = useState<PlayerAssignments>();
   const [opSabotaged, setOpSabotaged] = useState<PlayerAssignments>();
   const [yourFinalEquation, setYourFinalEquation] = useState<string>("");
   const [opFinalEquation, setFinalEquation] = useState<string>("");
   const [yourAnswer, setYourAnswer] = useState<number>();
   const [opAnswer, setOpAnswer] = useState<number>();
   const [yourRes, setYourRes] = useState<string>("");
   const [yourHP, setYourHP] = useState<string>("");
   const [opHP, setOpHP] = useState<string>("");

   const player = stats.find(p => p.id === socketID);
   const opponent = stats.find(p => p.id !== socketID);

   useEffect(() => {
      if (stats.length > 0) {
         setYourBaseEquation(player!.equation);
         setOpBaseEquation(opponent!.equation);
         setYourAssignments(player!.assignments);
         setOpAssignments(opponent!.assignments);
         setYourBuffedEquation(player!.buffedEquation);
         setOpBuffedEquation(opponent!.buffedEquation);
         setYourInitialEquation(player!.presabotage);
         setOpInitialEquation(opponent!.presabotage);
         setYourSabotaged(player!.sabotaged);
         setOpSabotaged(opponent!.sabotaged);
         setYourFinalEquation(player!.final);
         setFinalEquation(opponent!.final);
         setYourAnswer(player!.answer);
         setOpAnswer(opponent!.answer);
         setYourRes(player!.result);
         let temp_1 = "", temp_2 = ""
         for (let i = 0; i < player!.health; i++) {
            temp_1 += "❤️"
         }
         for (let i = 0; i < opponent!.health; i++) {
            temp_2 += "❤️"
         }
         setYourHP(player!.health !== 0 ? temp_1 : '🪦👻');
         setOpHP(opponent!.health !== 0 ? temp_2 : '🪦👻');

      }
   }, []);

   function handleTimerCallBack(data: boolean) {
      if (data) {
         if (player!.health !== 0 && opponent!.health === 0) {
            changeGameState('victory');
         }
         else if (player!.health === 0 && opponent!.health !== 0) {
            changeGameState('defeat');
         }
         else {
            changeGameState('build');
         }
      }
   }

   return (
      <div>
         <div className='pageHeader'>
            RESULTS
            <Timer timeLimit={10} sendCompleteStatus={handleTimerCallBack} />
         </div>

         <div className='splitMiddle playerSide'>
            <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.4, type: spring }} animate={{ opacity: 1, scale: 1 }} className='infoStyling'>
               <h5>{yourbaseEquation}</h5>
               <h5>{receipt.length === 0 ? <div>no buffs applied </div> :
                  <div style={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>{receipt.map((item, index) => (
                     <Tippy key={'T-' + item.itemID + index} content={<span>
                        {item.name}
                        <hr />
                        <span style={{ fontStyle: "oblique" }}>{item.description}</span>
                        <br />
                     </span>} theme="light" animation="scale" delay={[200, 300]}>
                        <div key={"R-" + index + item.itemID}>{item.icon}</div>
                     </Tippy>
                  ))}</div>}</h5>
               <h5>{yourBuffedEquation}</h5>
               <h5>{JSON.stringify(yourAssignments)}</h5>
               <h5>{yourInitialEquation}</h5>
               <h5>{JSON.stringify(yourSabotaged)}</h5>
               <h5>{yourFinalEquation}</h5>
               <h5>{yourAnswer}</h5>
               <h5>{yourHP}</h5>
            </motion.div>
         </div>
         <div className='middleDescription'>
            <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.2, type: spring }} animate={{ opacity: 1, scale: 1 }} className='descriptionStyle'>
               <h5>Base Equation</h5>
               <h5>Applied Buffs</h5>
               <h5>Buffed Equation</h5>
               <h5>Inital Assignments</h5>
               <h5>Updated Equation</h5>
               <h5>Sabotaged Variables</h5>
               <h5>Final Equation</h5>
               <h5>Answer</h5>
               <h5>Updated Health</h5>
               <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 1.5, type: spring }} animate={{ opacity: 1, scale: 1 }}>
                  <h2>{yourRes}</h2>
               </motion.div>
            </motion.div>
         </div>
         <div className='splitMiddle opponentSide'>
            <motion.div initial={{ opacity: 0, scale: 0 }} transition={{ duration: 0.8, type: spring }} animate={{ opacity: 1, scale: 1 }} className='infoStyling'>
               <h5>{opbaseEquation}</h5>
               <h5>{opReceipt.length === 0 ? <div>no buffs applied </div> :
                  <div style={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>{opReceipt.map((item, index) => (
                     <Tippy key={'T-' + item.itemID + index} content={<span>
                        {item.name}
                        <hr />
                        <span style={{ fontStyle: "oblique" }}>{item.description}</span>
                        <br />
                     </span>} theme="light" animation="scale" delay={[200, 300]}>
                        <div key={"R-" + index + item.itemID}>{item.icon}</div>
                     </Tippy>
                  ))}</div>}</h5>
               <h5>{opBuffedEquation}</h5>
               <h5>{JSON.stringify(opAssignments)}</h5>
               <h5>{opInitialEquation}</h5>
               <h5>{JSON.stringify(opSabotaged)}</h5>
               <h5>{opFinalEquation}</h5>
               <h5>{opAnswer}</h5>
               <h5>{opHP}</h5>
            </motion.div>
         </div>
      </div>
   )
}

export default CalculationPage;