import e, { Router } from "express";
import { query, getClient } from "../db/index.js";
import { SLR } from "ml-regression";

export const stock = Router();

stock.post("/create", async (req, res) => {
  const { date, symbol, open, high, low, close, volume } = req.body;

  const client = await getClient('BEGIN');
  await client.query("BEGIN")
  try {
    const result = await client.query(
      `
        INSERT INTO Stockdata (time_stamp, symbol, open, high, low, close, volume)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `,
      [
        date,
        symbol,
        Number(open),
        Number(high),
        Number(low),
        Number(close),
        Number(volume),
      ]
    );

    await client.query(`REFRESH MATERIALIZED VIEW StockPrices`);

    await client.query(
      `
      DELETE FROM StockCorrelation WHERE
      s1 = $1 OR s2 = $1
      `,
      [symbol]
    );

    if (result.rowCount === 0)
      throw Error(`Failed to insert ${symbol} @ ${date}`);

    await client.query("COMMIT")
    res.send({ success: true });
  } catch (e) {
    await client.query("ROLLBACK");

    console.log(e);
    res.send({ success: false }).status(400);
  } finally {
    client.release();
  }
});

stock.get("/all", async (req, res) => {
  try {
    const result = await query(
      `
        SELECT symbol, close AS value FROM StockPrices
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
        SELECT symbol, close
        FROM StockPrices
        WHERE symbol = $1
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
    WITH LastDate AS (
      SELECT time_stamp as last_date
      FROM StockPrices
      WHERE symbol = $1
    )  
    SELECT EXTRACT(EPOCH FROM time_stamp) AS time_stamp, symbol, close
    FROM Stockdata
    WHERE symbol = $1
    AND time_stamp >= (
      SELECT last_date - ($2 || ' days')::INTERVAL
      FROM LastDate
    ) 
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

/** Predict future stock values for the next 5 years */
stock.get("/prediction/:symbol/:interval", async (req, res) => {
  const symbol = req.params.symbol;
  const interval = req.params.interval;
  console.log(interval);
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
    const lastRecordedTimestamp = Number(timestamps[timestamps.length - 1]);
    const predictions = Array.from({ length: Number(interval) }, (_, days) => ({
      time_stamp: lastRecordedTimestamp + (days + 2) * 86400,
      predictedValue: regression.predict(lastRecordedTime + days + 2),
    }));

    res.json({ symbol, predictions });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Failed to predict stock values" });
  }
});

stock.get("/statistic/:symbol/:interval", async (req, res) => {
  const symbol = req.params.symbol;
  const interval = req.params.interval;

  try {
    const result = await query(
      `
      WITH
      Single AS (
        SELECT symbol, time_stamp, close FROM stockdata
        WHERE symbol = $1
      ),
      Market AS (
        SELECT time_stamp, SUM(close) AS close
        FROM stockdata
        WHERE symbol != $1
        GROUP BY time_stamp
      ),
      LastDate AS (
        SELECT time_stamp as last_date
        FROM StockPrices
        WHERE symbol = $1
      )  
      SELECT s.symbol, corr(m.close, s.close) AS beta, stddev(s.close) / avg(s.close) AS cov
      FROM
      Market m JOIN Single s
      ON m.time_stamp = s.time_stamp
      WHERE s.time_stamp >= (
        SELECT last_date - ($2 || ' days')::INTERVAL
        FROM LastDate
      ) 
      GROUP BY s.symbol;
      `,
      [symbol, interval]
    );

    if (result.rowCount === 0)
      throw Error(`Failed to calculate statistics for ${symbol}`);

    return res.json({
      cov: Number(result.rows[0].cov.toFixed(2)),
      beta: Number(result.rows[0].beta.toFixed(2)),
    });
  } catch (e) {
    console.log(e);
    res.json({}).status(400);
  }
});
