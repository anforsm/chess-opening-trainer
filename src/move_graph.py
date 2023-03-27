from neo4j import GraphDatabase
driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "neo4j1"))

def execute_query(query):
    with driver.session() as session:
        return session.run(query)


class move_graph:
    def __init__(self, move, fen="", opening = "London System", opening_eco = "1337"):
        self.move = move
        self.opening = opening
        self.opening_eco = opening_eco
        self.next_moves = {}
        self.games_played = 0
        self.white_wins = 0
        self.black_wins = 0
        self.fen = fen
        
    def add_child(self, child_move):
        self.next_moves[child_move.move] = child_move
    
    # Win rate for white
    def get_win_rate(self):
        if self.white_wins + self.black_wins == 0:
            return 0.5
        return self.white_wins / (self.white_wins + self.black_wins)
    
    def get_properties(self):
        return {
            "move": self.move,
            "fen": self.fen,
            "opening": self.opening,
            "opening_eco": self.opening_eco,
            "games_played": self.games_played,
            "white_wins": self.white_wins,
            "black_wins": self.black_wins,
            "lichess_link": f"https://lichess.org/analysis/{self.fen.replace(' ', '_')}",
            "win_rate": self.get_win_rate(),
        }
    
    def convert_properties_to_neo4j_string(self):
        properties = self.get_properties()
        properties_string = ""
        for key, value in properties.items():
            properties_string += f"{key}: \"{value}\", "
        properties_string = properties_string[:-2]
        return properties_string
    
    def convert_to_neo4j(self, root = False):
        properties = self.convert_properties_to_neo4j_string() 

        if root:
            query = f"CREATE (n:Move {{{properties}}})"
            execute_query(query)

        for child in self.next_moves.values():
            child_properties = child.convert_properties_to_neo4j_string()
            query = f"CREATE (n:Move {{{child_properties}}})"
            execute_query(query)

            query = f"MATCH (a:Move), (b:Move) WHERE a.fen = '{self.fen}' AND b.fen = '{child.fen}' CREATE UNIQUE (a)-[:NEXT_MOVE{{move: \"{child.move}\"}}]->(b)"
            execute_query(query)

            child.convert_to_neo4j()
    
    def __str__(self):
        return f"Move {self.move}, number of children {len(self.next_moves)}"