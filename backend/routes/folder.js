import { Router } from "express";
import { query, getClient } from "../db/index.js";

export const folder = Router();

folder.get("/statistic/:username/:pid/:interval", async (req, res) => {
  const username = req.params.username;
  const pid = req.params.pid;
  const interval = req.params.interval;

  try {
    await query(
      `
      WITH FolderSymbols AS (
          SELECT symbol
          FROM Stockholding
          WHERE fid = $1
      ), 
      FolderStock AS (
        SELECT symbol, time_stamp, close
        FROM stockdata
        WHERE symbol IN (
          SELECT symbol FROM Stockholding WHERE fid = $1
        )
      ),
      StockPairs AS (
        SELECT f1.symbol AS s1, f2.symbol AS s2
        FROM FolderSymbols f1
        JOIN FolderSymbols f2
        ON f1.symbol < f2.symbol
      ),
      MissingPairs AS (
        SELECT sp.s1, sp.s2
        FROM StockPairs sp
        WHERE NOT EXISTS (
          SELECT 1 FROM StockCorrelation sc
          WHERE sc.s1 = sp.s1 AND sc.s2 = sp.s2
          AND sc.interval_value = ($2 || ' days')::INTERVAL
        )
      ),
      LastDate AS (
        SELECT MAX(time_stamp) as last_date FROM FolderStock
      )
      INSERT INTO StockCorrelation
      SELECT mp.s1, mp.s2, ($2 || ' days')::INTERVAL, corr(p1.close, p2.close)
      FROM MissingPairs mp
      JOIN FolderStock p1 ON p1.symbol = mp.s1
      JOIN FolderStock p2 ON p2.symbol = mp.s2 AND p1.time_stamp = p2.time_stamp
      WHERE p1.time_stamp >= (
        SELECT last_date - ($2 || ' days')::INTERVAL FROM LastDate
      )
      GROUP BY mp.s1, mp.s2;
      `,
      [pid, interval]
    );

    const result = await query(
      `
      WITH FolderSymbols AS (
          SELECT symbol
          FROM Stockholding
          WHERE fid = $1
      )
      SELECT * FROM StockCorrelation
      WHERE interval_value = ($2 || ' days')::INTERVAL
        AND s1 IN (SELECT symbol FROM FolderSymbols)
        AND s2 IN (SELECT symbol FROM FolderSymbols)
        AND s1 != s2
      UNION ALL 
      SELECT symbol AS s1, symbol AS s2, ($2 || ' days')::INTERVAL AS interval_value, 1 AS corr FROM FolderSymbols
      UNION ALL
      SELECT s2 AS s1, s1 AS s2, interval_value, corr FROM StockCorrelation
      WHERE interval_value = ($2 || ' days')::INTERVAL
        AND s1 IN (SELECT symbol FROM FolderSymbols)
        AND s2 IN (SELECT symbol FROM FolderSymbols)
        AND s1 != s2
      ORDER BY s1,s2;
      `,
      [pid, interval]
    );

    console.log(result.rows);
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
