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


const Chessboard = (props: any) => {
  const ref = useRef(null);
  const [chess, setChess] = useState<Chess>(new Chess());
  const [reloaded, setReload] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement>();
  const reload = () => setReload(prev => !prev);

  useEffect(() => setAudio(new Audio("./move_sound_1.wav")), []);

  useEffect(() => {
    const history = chess.history({verbose: true});
    const config: Config = {
      fen: chess.fen(),
      orientation: 'white',
      turnColor: chess.turn() === 'w' ? 'white' : 'black',
      check: chess.inCheck(),
      lastMove: createKeyPair(history[history.length - 1]),
      autoCastle: true,
      highlight: {
        lastMove: true,
        check: true,
      },
      movable: {
        free: false,
        color: 'white',
        showDests: true,
        dests: getAvailableMoves(chess.moves({verbose: true})),
        events: {
          after: (orig, dest) => {
            chess.move({from: orig, to: dest});
            reload();
            let history = chess.history({verbose: true});
            props.onMove(history[history.length - 1], history);
            if (audio)
              audio.play();
            if (chess.turn() === 'b' && props.getNextMove) {
              setTimeout(() => {
                let move: ch.Move = props.getNextMove(chess.history({verbose: true}))
                if (!move) return;
                chess.move(move);
                reload();
                if (audio)
                  audio.play();
              }, 400)
            }
          }
        }
      },
      // Draw an arrow to indicate the next move
      drawable: {
        enabled: true,
        visible: true,
        eraseOnClick: true,
        shapes: props.showMove && chess.turn() === "w" ? [
          {
            orig: props.getNextMove(chess.history({verbose: true}))?.from,
            dest: props.getNextMove(chess.history({verbose: true}))?.to,
            brush: 'purple',
          },
        ] : [],
        brushes: {
          green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
          red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
          blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
          yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
          purple: { key: 'p', color: '#800080', opacity: 1, lineWidth: 10 },
          paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
          paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
          paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
          paleGrey: { key: 'pgr', color: '#4a4a4a', opacity: 0.35, lineWidth: 15 },
          grey: { key: 'gr', color: '#4a4a4a', opacity: 1, lineWidth: 10 },
          paleBrown: { key: 'pbr', color: '#855f42', opacity: 0.4, lineWidth: 15 },
          brown: { key: 'br', color: '#855f42', opacity: 1, lineWidth: 10 },
          white: { key: 'w', color: '#fff', opacity: 1, lineWidth: 10 },
          black: { key: 'bl', color: '#000', opacity: 1, lineWidth: 10 },
        }
      },
    };

    if (!ref.current) return;
    const ground = Chessground(ref.current, config);
    return () => {
      ground.destroy();
    }
  }, [ref.current, reloaded, props.showMove])

  return ( <div className = "w-full h-full" ref={ref} /> )
}

export default Chessboard;