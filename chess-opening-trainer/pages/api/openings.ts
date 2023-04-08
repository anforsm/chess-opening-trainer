import type { NextApiRequest, NextApiResponse } from 'next'
import neo4j from 'neo4j-driver';

const username = "neo4j";
const password = process.env.DB_PASS || "neo4j1";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const opening_name = req.query.name;
  const all_openings = req.query.all;
  // Connect to Neo4j
  const driver = neo4j.driver(
    "neo4j+s://bad3437e.databases.neo4j.io:7687",
    neo4j.auth.basic(username, password)
  );
  const session = driver.session();

  if (all_openings !== "true") {
    // Run query
    const query = `MATCH (o:Opening{name: "${opening_name}"}) RETURN o LIMIT 10`;

    // Get node
    const queryResults = await session.run(query);
    const node = queryResults.records[0].get("o");
    const pgn = node.properties.pgn;

    session.close();
    driver.close();

    res.status(200).json({ pgn: pgn })
  } else if (all_openings === "true") {
    // Run query
    const query = `MATCH (o:Opening) RETURN o`;

    // Get node
    const queryResults = await session.run(query);
    const nodes = queryResults.records.map(record => record.get("o"));
    const openings = nodes.map(node => node.properties.name);

    session.close();
    driver.close();

    res.status(200).json({ openings: Array.from(new Set(openings)) })
  }
}