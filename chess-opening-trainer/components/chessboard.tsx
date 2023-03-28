import { Chessground } from 'chessground';
import { Config } from 'chessground/config';
import * as cg from 'chessground/types';
import { Chess } from 'chess.js';
import * as ch from 'chess.js';


import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react';

import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";



//import "chessground/assets/chessground.brown.css";
//import "chessground/assets/chessground.cburnett.css";


//const config = {
//  fen: '2r3k1/pp2Qpbp/4b1p1/3p4/3n1PP1/2N4P/Pq6/R2K1B1R w -',
//  orientation: 'black',
//};
let test: string = "hej"

const createKeyPair = (move: ch.Move): cg.KeyPair | [] => {
  if (!move) return [];
  const keyPair: cg.KeyPair = [
    move.from,
    move.to
  ]
  return keyPair;
}

const getAvailableMoves = (moves: ch.Move[]): cg.Dests => {
  const dests: cg.Dests = new Map();
  moves.forEach((move) => {
    if (dests.has(move.from)) {
      dests.get(move.from)?.push(move.to);
    } else {
      dests.set(move.from, [move.to]);
    }
  })

  return dests;
}


const Chessboard = () => {
  const ref = useRef(null);
  const [chess, setChess] = useState<Chess>(new Chess());
  const [reloaded, setReload] = useState(false);
  const reload = () => setReload(prev => !prev);


  useEffect(() => {
    const history = chess.history({verbose: true});
    const config: Config = {
      fen: chess.fen(),
      orientation: 'white',
      turnColor: chess.turn() === 'w' ? 'white' : 'black',
      lastMove: createKeyPair(history[history.length - 1]),
      highlight: {
        lastMove: true,
        check: true,
      },
      movable: {
        free: false,
        color: chess.turn() === 'w' ? 'white' : 'black',
        showDests: true,
        dests: getAvailableMoves(chess.moves({verbose: true})),
        events: {
          after: (orig, dest) => {
            chess.move({from: orig, to: dest});
            reload();
          }
        }
      },

    };

    if (!ref.current) return;
    const ground = Chessground(ref.current, config);
    return () => {
      ground.destroy();
    }
  }, [ref.current, reloaded])

  return ( <div className = " w-96 h-96" ref={ref} /> )
}

export default Chessboard;