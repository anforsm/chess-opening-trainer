import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr';
import Chessboard from '@/components/chessboard';
import { Chess } from 'chess.js';
import * as ch from 'chess.js';
import { Autocomplete, TextField } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});



const inter = Inter({ subsets: ['latin'] })

//const fetcher = (url: string) => fetch(url, 
//  {"body": JSON.stringify({"opening": "London System"}), "method": "GET"}
//).then((res) => res.json())
const fetcher = (url: string) => fetch(url).then((res) => res.json())

const Home = () => {
  const [theoryGame, setTheoryGame] = useState<Chess>(new Chess());
  const theoryHistoryRef = useRef<ch.Move[]>([]); 
  const [lastMoveIsCorrect, setLastMoveIsCorrect] = useState<boolean | null>(null);
  const [theoryOver, setTheoryOver] = useState<boolean>(false);
  const [openingName, setOpeningName] = useState<string>('London System')
  const [showMove, setShowMove] = useState<boolean>(false);
  const { data, error, isLoading } = useSWR(
    `/api/openings/?name=${openingName}`, 
    fetcher
  );
  const { data: openings } = useSWR(
    `/api/openings/?all=true`,
    fetcher
  );
  const [pgn, setPgn] = useState<string>('');

  useEffect(() => {
    if (data?.pgn) {
      setPgn(data.pgn)
    }
    console.log(data);
  }, [data])

  useEffect(() => {
    console.log(openings);
  }, [openings])

  useEffect(() => {
    theoryGame.loadPgn(pgn);
    theoryHistoryRef.current = theoryGame.history({verbose: true});
  }, [pgn])

  return (
    <>
      <Head>
        <title>Chess Opening Trainer</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* // center the chessboard with flexbox */}
      <div className="flex w-screen h-screen justify-center items-center flex-col bg-slate-200">
        {/*<input type="text" value={openingName} onChange={(e) => setOpeningName(e.target.value)} />*/}
        <input type="checkbox" checked={showMove} onChange={(e) => setShowMove(e.target.checked)} />
        <Autocomplete
          id="opening-name"
          options={openings?.openings || []}
          style={{ width: 300 }}
          renderInput={(params: any) => <TextField {...params} label="Opening" variant="outlined" />}
          onChange={(e, value) => {
            if (value)
              setOpeningName(value as string);
          }}
          filterOptions={(options, params) => {
            const filtered = (options as string[]).filter(
              (option: string) => (
                option.toLowerCase().includes(params.inputValue.toLowerCase()))
            );
            return filtered.slice(0, 10);
          }}
        />
        {theoryOver ? <p>Opening complete</p> : lastMoveIsCorrect === null ? null : lastMoveIsCorrect ? <p>Correct!</p> : <p>Incorrect!</p>}
        <div className=" grow aspect-square">
          <Chessboard 
            showMove={showMove}
            onMove={(currentMove: ch.Move, history: ch.Move[]) => {
              console.log(theoryHistoryRef.current);
              if (!theoryHistoryRef.current) return;
              if (history.length > theoryHistoryRef.current.length) {
                setTheoryOver(true);
                console.log('theory over')
                return;
              }
              if (currentMove.after === theoryHistoryRef.current[history.length - 1].after) {
                console.log('correct move')
                setLastMoveIsCorrect(true);
              } else {
                console.log('incorrect move')
                setLastMoveIsCorrect(false);
              }
            }}
            getNextMove={(history: ch.Move[]) => {
              if (!theoryHistoryRef.current) return;
              if (history.length >= theoryHistoryRef.current.length) {
                setTheoryOver(true);
                console.log('theory over')
                return;
              }
              return theoryHistoryRef.current[history.length];
            }}
          />
        </div>
      </div>
    </>
  )
}

export default Home;