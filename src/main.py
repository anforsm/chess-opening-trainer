import chess.pgn
import zstandard as zstd
import io
import matplotlib.pyplot as plt
from move_graph import move_graph

datafile = "../data/lichess_db_standard_rated_2023-02.pgn"

mg = move_graph("", "")

pgn = open(datafile)
openings = []
game = chess.pgn.read_game(pgn)
max_num_games = 1000
curr_game_i = 0
while game is not None:
    if curr_game_i > max_num_games:
        break
    prev_move = mg
    game = chess.pgn.read_game(pgn)
    board = game.board()
    
    for move in list(game.mainline_moves())[:5]:
        board.push(move)
        move = str(move)
        if move not in prev_move.next_moves:
            next_move = move_graph(str(move), board.fen())
            next_move.opening = game.headers["Opening"]
            next_move.opening_eco = game.headers["ECO"]
            prev_move.add_child(next_move)
        else:
            next_move = prev_move.next_moves[move]
                    
        next_move.games_played += 1
        result = game.headers["Result"]
        if result == "1-0":
            next_move.white_wins += 1
        elif result == "0-1":
            next_move.black_wins += 1
        
        prev_move = next_move

    curr_game_i += 1

mg.convert_to_neo4j(root = True)