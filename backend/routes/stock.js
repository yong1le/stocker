import { Router } from "express";
import { query, getClient } from "../db/index.js";

export const stock = Router();

/** Market Value of a stock */
stock.get("/value/:symbol", async (req, res) => {
  const symbol = req.params.symbol;

  try {
    const result = await query(
      `
        SELECT symbol, close FROM (
          Stockdata s1 NATURAL JOIN (
            SELECT s2.symbol, MAX(s2.time_stamp) as time_stamp
            FROM Stockdata s2
            GROUP BY symbol 
          )
        )
      `,
      [symbol]
    );

    if (result.rowCount !== 1 || !result.rows[0].close)
      throw Error("Could not get market value of stock");

    res.json({ value: result.rows[0].close });
  } catch (e) {
    console.log(e);
    res.json({ value: -1 }).status(400);
  }
});

/** Past performance of a stock */
stock.get("/performance/past/:symbol/:interval", async (req, res) => {
  const symbol = req.params.symbol;
  /*
  1 week: 7
  1 month: 30
  1 quarter: 90
  1 year: 365
  5 years: 1825
  */
  const interval = req.params.interval;

  try {
    const result = await query(
      `
    SELECT time_stamp, symbol, close
    FROM Stockdata
    WHERE symbol = $1
    AND time_stamp >= NOW() - ($2 || ' days')::INTERVAL
    ORDER BY time_stamp DESC
    `,
      [symbol, interval]
    );

    if (res.rowCount === 0)
      throw Error("Failed to fetch stock data")

    res.json(result.rows)
  } catch (e) {
    console.log(e);
    res.json([]).status(400)
  }
});
