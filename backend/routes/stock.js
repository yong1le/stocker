import e, { Router } from "express";
import { query, getClient } from "../db/index.js";
import { SLR } from "ml-regression";
// import linearRegession from "ml-regression"

export const stock = Router();

stock.get("/all", async (req, res) => {
  try {
    const result = await query(
      `
        SELECT symbol, close AS value FROM (
          Stockdata s1 NATURAL JOIN (
            SELECT s2.symbol, MAX(s2.time_stamp) as time_stamp
            FROM Stockdata s2
            GROUP BY symbol 
          )
        )
      `
    );

    res.json(result.rows.map(({ symbol, value }) => ({ symbol, value })));
  } catch (e) {
    console.log(e);
    res.json({ value: -1 }).status(400);
  }
});

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
            WHERE symbol=$1
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
    ORDER BY time_stamp ASC
    `,
      [symbol, interval]
    );

    if (res.rowCount === 0) throw Error("Failed to fetch stock data");

    res.json(
      result.rows.map(({ time_stamp, close }) => ({ time_stamp, close }))
    );
  } catch (e) {
    console.log(e);
    res.json([]).status(400);
  }
});

/** ALL performance of a stock */

/** Predict future stock values for the next 5 years */
stock.get("/prediction/:symbol", async (req, res) => {
  const symbol = req.params.symbol;

  try {
    const result = await query(
      `
      SELECT EXTRACT(EPOCH FROM time_stamp) AS timestamp, close
      FROM Stockdata
      WHERE symbol = $1
      ORDER BY time_stamp ASC
      `,
      [symbol]
    );

    // if (result.rowCount < 2) throw new Error("Not enough data for prediction");

    // Extract time (X) and close price (Y)
    const timestamps = result.rows.map((row) => row.timestamp);
    const closePrices = result.rows.map((row) => row.close);

    // Normalize timestamps (convert to days since first record)
    const minTimestamp = timestamps[0];
    const X = timestamps.map((t) => (t - minTimestamp) / 86400); // Convert seconds to days
    const Y = closePrices;

    const regression = new SLR(X, Y);

    const lastRecordedTime = X[X.length - 1];
    const lastRecordedTimestamp = Number(timestamps[timestamps.length - 1])
    const predictions = Array.from({length: 365}, (_, days) => ({
      time_stamp: lastRecordedTimestamp + days * 86400,
      predictedValue: regression.predict(lastRecordedTime + days)
    }));

    res.json({ symbol, predictions });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Failed to predict stock values" });
  }
});
