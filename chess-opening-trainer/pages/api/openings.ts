import type { NextApiRequest, NextApiResponse } from 'next'
import neo4j from 'neo4j-driver';

const username = "neo4j";
const password = "neo4j1";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const opening = req.body.opening;
  // Connect to Neo4j
  const driver = neo4j.driver(
    "bolt://localhost:7687",
    neo4j.auth.basic(username, password)
  );
  const session = driver.session();

  // Run query
  const query = `MATCH (o:Opening{name: "${opening}"}) RETURN o LIMIT 10`;

  // Get node
  const queryResults = await session.run(query);
  const node = queryResults.records[0].get("o");
  const pgn = node.properties.pgn;

  session.close();
  driver.close();

  res.status(200).json({ pgn: pgn })
}