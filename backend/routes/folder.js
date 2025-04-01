import { Router } from "express";
import { query, getClient } from "../db/index.js";

export const folder = Router();

folder.get("/statistic/:username/:pid/:interval", async (req, res) => {
  const username = req.params.username;
  const pid = req.params.pid;
  const interval = req.params.interval;

  try {
    const result = await query(
      `
      WITH
      FolderStock AS (
        SELECT symbol, time_stamp, close FROM stockdata
        WHERE symbol IN (
          SELECT DISTINCT symbol FROM
          Stockholding s NATURAL JOIN Creates
          WHERE s.fid = $2 AND username = $1
        )
      ),
      LastDate AS (
          SELECT MAX(time_stamp) as last_date
          FROM Stockdata
          WHERE symbol IN (
            SELECT symbol FROM FolderStock
          )
      )  
      SELECT p1.symbol AS s1, p2.symbol AS s2, corr(p1.close, p2.close) AS corr
      FROM
      FolderStock p1 JOIN FolderStock p2
      ON p1.time_stamp = p2.time_stamp
      WHERE p1.time_stamp >= (
          SELECT last_date - ($3 || ' days')::INTERVAL
          FROM LastDate
      )
      GROUP BY p1.symbol, p2.symbol
      ORDER BY p1.symbol, p2.symbol
      `,
      [username, pid, interval]
    );

    if (result.rowCount === 0)
      throw Error(`Failed to calculate folder statistics`);

    const symbols = [...new Set(result.rows.map(({ s1 }) => s1))];
    const matrix = symbols.map((s) => {
      return result.rows
        .filter((row) => row.s1 === s)
        .map(({ corr }) => Number(corr.toFixed(2)));
    });

    return res.json({
      symbols,
      correlations: matrix,
    });
  } catch (e) {
    console.log(e);
    res.json({}).status(400);
  }
});
