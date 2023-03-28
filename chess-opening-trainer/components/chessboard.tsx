import { Chessground } from 'chessground';

import PropTypes from 'prop-types'
import { useEffect, useRef } from 'react';

import "chessground/assets/chessground.base.css";

//import "chessground/assets/chessground.brown.css";
//import "chessground/assets/chessground.cburnett.css";


//const config = {
//  fen: '2r3k1/pp2Qpbp/4b1p1/3p4/3n1PP1/2N4P/Pq6/R2K1B1R w -',
//  orientation: 'black',
//};
let test: string = "hej"

interface Config {
  fen: string,
  orientation: 'white' | 'black'
  height?: number,
  width?: number,
}

const config: Config = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  orientation: 'white',
  height: 400,
  width: 400,
};

const Chessboard = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const ground = Chessground(ref.current, config);
    return () => {
      ground.destroy();
    }

  }, [ref.current])

  return ( <div className = "w-full h-full" ref={ref} /> )
}

export default Chessboard;