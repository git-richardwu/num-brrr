import React, { useState, useEffect } from 'react'
import { Socket } from 'socket.io-client';
import { PlayerStats } from '../Game'
import { PlayerAssignments } from '../Game';
import './index.scss';
import Timer from './Timer';

interface RoundDetails {
   stats: PlayerStats[],
   changeGameState: (gameState: string) => void,
   socketID: string
}

const CalculationPage: React.FC<RoundDetails> = ({ stats, changeGameState, socketID }) => {
   const [gameStats, setGameStats] = useState<PlayerStats[]>([])
   const [yourbaseEquation, setYourBaseEquation] = useState<string>("");
   const [opbaseEquation, setOpBaseEquation] = useState<string>("");
   const [yourInitialEquation, setYourInitialEquation] = useState<string>("");
   const [opInitialEquation, setOpInitialEquation] = useState<string>("");
   const [yourAssignments, setYourAssignments] = useState<PlayerAssignments>();
   const [opAssignments, setOpAssignments] = useState<PlayerAssignments>();
   const [yourSabotaged, setYourSabotaged] = useState<PlayerAssignments>();
   const [opSabotaged, setOpSabotaged] = useState<PlayerAssignments>();
   const [yourFinalEquation, setYourFinalEquation] = useState<string>("");
   const [opFinalEquation, setFinalEquation] = useState<string>("");
   const [yourAnswer, setYourAnswer] = useState<number>();
   const [opAnswer, setOpAnswer] = useState<number>();
   const [yourRes, setYourRes] = useState<string>("");

   //your->left
   //op->right
   useEffect(() => {
      if (gameStats.length > 0) {
         const player = gameStats.find(p => p.id === socketID);
         const opponent = gameStats.find(p => p.id !== socketID);
         setYourBaseEquation(player!.equation);
         setOpBaseEquation(opponent!.equation);
         setYourAssignments(player!.assignments);
         setOpAssignments(opponent!.assignments);
         setYourInitialEquation(player!.preview);
         setOpInitialEquation(opponent!.preview);
         setYourSabotaged(player!.sabotaged);
         setOpSabotaged(opponent!.sabotaged);
         setYourFinalEquation(player!.final);
         setFinalEquation(opponent!.final);
         setYourAnswer(player!.answer);
         setOpAnswer(opponent!.answer);
         setYourRes(player!.result);
         //setOpRes(opponent!.result);
      }
   }, [gameStats]);

   useEffect(() => { //check if redundant
      setGameStats(stats)
   }, []);

   function handleTimerCallBack(data: boolean) {
      if (data) {
         changeGameState('build');
      }
   }

   return (
      <div>
         <div className='pageHeader'>
            RESULTS
            <Timer timeLimit={10} sendCompleteStatus={handleTimerCallBack}/>
         </div>
         
         <div className='splitMiddle playerSide'>
            <div className='infoStyling'>
               <h3>{yourbaseEquation}</h3>
               <h3>{JSON.stringify(yourAssignments)}</h3>
               <h3>{yourInitialEquation}</h3>
               <h3>{JSON.stringify(yourSabotaged)}</h3>
               <h3>{yourFinalEquation}</h3>
               <h3>{yourAnswer}</h3>
            </div>
         </div>
         <div className='middleDescription'>
            <div className='descriptionStyle'>
               <h5>Base Equation</h5>
               <h5>Inital Assignments</h5>
               <h5>Updated Equation</h5>
               <h5>Sabotaged Variables</h5>
               <h5>Final Equation</h5>
               <h5>Answer</h5>
               <h2>{yourRes}</h2>
            </div>
         </div>
         <div className='splitMiddle opponentSide'>
            <div className='infoStyling'>
               <h3>{opbaseEquation}</h3>
               <h3>{JSON.stringify(opAssignments)}</h3>
               <h3>{opInitialEquation}</h3>
               <h3>{JSON.stringify(opSabotaged)}</h3>
               <h3>{opFinalEquation}</h3>
               <h3>{opAnswer}</h3>
            </div>
         </div>

         {/* {/* <div>{yourInitialEquation}</div> */}
      </div>
   )
}

export default CalculationPage;