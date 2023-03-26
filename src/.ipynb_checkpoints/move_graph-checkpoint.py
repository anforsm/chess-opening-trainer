class move_graph:
    def __init__(self, move, opening = "London System", opening_eco = "1337"):
        self.move = move
        self.opening = opening
        self.opening_eco = opening_eco
        self.next_moves = {}
        self.games_played = 0
        self.white_wins = 0
        self.black_wins = 0
        
    def add_child(self, child_move):
        self.next_moves[child_move.move] = child_move
    
    # Win rate for white
    def get_win_rate(self):
        if self.white_wins + self.black_wins == 0:
            return 0.5
        return self.white_wins / (self.white_wins + self.black_wins)
    
    def __str__(self):
        return f"Move {move}, number of children {len(next_moves)}"