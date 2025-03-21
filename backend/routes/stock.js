import { Router } from "express";
import { query, getClient } from "../db/index.js";

export const stock = Router();

/** Market Value of a stock */
stock.get("/value/:symbol", async (req, res) => {
  const symbol = req.params.symbol;

  try {
    const result = await query(
      `
      (
            SELECT symbol, close FROM (
              Stockdata s1 NATURAL JOIN (
                SELECT s2.symbol, MAX(s2.time_stamp) as time_stamp
                FROM Stockdata s2
                GROUP BY symbol 
              )
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
portfolio.get("/performance/past/:symbol/:interval", async (req, res) => {});
