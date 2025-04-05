import { Router } from "express";
import { query, getClient } from "../db/index.js";

export const portfolio = Router();

export const createNewPortfolio = async (client, username, pname) => {
  const result = await client.query(
    `
      INSERT INTO folder (folder_name)
      VALUES ($1)
      RETURNING *
    `,
    [pname]
  );
  if (result.rowCount === 0) throw Error("Failed to create folder");

  const fid = result.rows[0].fid;

  if (!fid) throw Error("Failed to create folder");

  await client.query(
    `
      INSERT INTO creates
      VALUES ($1, $2)
    `,
    [username, fid]
  );
  await client.query(
    `
      INSERT INTO portfolio
      VALUES ($1, 0)
    `,
    [fid]
  );

  return fid;
};

/** Username creates a new portfolio with name slname. */
portfolio.post("/create", async (req, res) => {
  const { username, pname } = req.body;

  const client = await getClient();
  await client.query("BEGIN");
  try {
    const fid = createNewPortfolio(client, username, pname);
    res.json({ pid: fid });
    await client.query("COMMIT");
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    res.json({ pid: -1 }).status(400);
  } finally {
    client.release();
  }
});

portfolio.delete("/delete/:username/:fid", async (req, res) => {
  const username = req.params.username;
  const fid = req.params.fid;

  const client = await getClient();
  await client.query("BEGIN");
  try {
    const result = await client.query(
      `
      DELETE FROM folder
      WHERE fid=$2 AND EXISTS (
        SELECT fid from Creates WHERE fid = $2 AND username = $1
      )
    `,
      [username, fid]
    );
    if (result.rowCount === 0) throw Error("Failed to delete folder");

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    res.json({ success: false }).status(400);
  } finally {
    client.release();
  }
});

/** Username views all portfolios created by them. */
portfolio.get("/view/all/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const result = await query(
      `
      SELECT fid, folder_name, amount FROM
      (
        (
          (SELECT fid FROM Creates WHERE username = $1)
          NATURAL JOIN Folder
        )
        JOIN Portfolio
        ON fid = pid 
      )
      `,
      [username]
    );

    res.json(
      result.rows.map(({ fid, folder_name, amount }) => ({
        pid: fid,
        name: folder_name,
        amount: Number(amount.toFixed(2)),
      }))
    );
  } catch (e) {
    console.log(e);
    res.json([]).status(404);
  }
});

/** Username views the portfolio represended by pid. Returns the portfolio name,
 * cash, and all stock holdings.
 */
portfolio.get("/view/one/:username/:pid", async (req, res) => {
  const username = req.params.username;
  const pid = req.params.pid;

  try {
    const result = await query(
      `
    SELECT * FROM (
      (
      (SELECT * FROM Creates c WHERE username = $1 AND c.fid = $2)
      NATURAL JOIN Folder f JOIN Portfolio p ON f.fid = p.pid
      )
      NATURAL LEFT JOIN
      (
        SELECT fid, symbol, share, share * close AS value, close  FROM (
          Stockholding NATURAL JOIN
          (
            SELECT symbol, close FROM (
              Stockdata s1 NATURAL JOIN (
                SELECT s2.symbol, MAX(s2.time_stamp) as time_stamp
                FROM Stockdata s2
                GROUP BY symbol 
              )
            )
          )
        )
      )
    )
    `,
      [username, pid]
    );

    if (result.rowCount === 0)
      throw Error("This porfolio does not belong to this user.");

    // Get the market value
    const mv = await query(
      `
      SELECT pid, amount + COALESCE(SUM(value),0) AS value
      FROM (
        SELECT pid, amount, close * share as value
        FROM (
          (
            (SELECT * FROM Portfolio WHERE pid = $1)
            LEFT JOIN Stockholding
            ON fid = pid
          ) NATURAL LEFT JOIN
          (
            SELECT symbol, close FROM (
              Stockdata s1 NATURAL JOIN (
                SELECT s2.symbol, MAX(s2.time_stamp) as time_stamp
                FROM Stockdata s2
                GROUP BY symbol 
              )
            )
          )
        )
      )
      GROUP BY pid, amount
      `,

      [pid]
    );

    if (mv.rowCount === 0) throw Error("Failed to get market value.");

    res.json({
      pid: result.rows[0].pid,
      name: result.rows[0].folder_name,
      value: Number(Number(mv.rows[0].value || 0).toFixed(2)),
      amount: Number(result.rows[0].amount.toFixed(2)),
      stocks: result.rows
        .filter(({ symbol, share }) => symbol !== null && share !== null)
        .map(({ symbol, share, value, close }) => ({
          symbol,
          share,
          value: Number(value.toFixed(2)),
          close: Number(close.toFixed(2)),
        })),
    });
  } catch (e) {
    console.log(e);
    res.json({}).status(400);
  }
});

/** Username withdraws cash into an external bank account */
portfolio.put("/withdraw/:username/:pid", async (req, res) => {
  const username = req.params.username;
  const pid = req.params.pid;
  const { amount } = req.body;

  const client = await getClient();
  await client.query("BEGIN");
  try {
    const result = await client.query(
      `
      UPDATE portfolio
      SET amount = amount - $3
      WHERE pid = $2 AND EXISTS (
        SELECT fid from Creates WHERE fid = $2 AND username = $1
      )
      `,
      [username, pid, amount]
    );

    if (result.rowCount === 0) throw Error("Failed to update portfolio cash");

    if (
      (
        await client.query(
          `
      INSERT INTO Transaction (pid, amount) VALUES
      ($1, $2)
      RETURNING *
      `,
          [pid, -amount]
        )
      ).rowCount === 0
    )
      throw Error("Failed to create transaction.");

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (e) {
    await client.query("ROLLBACK");
    console.log(e);
    res.json({ success: false }).status(400);
  } finally {
    client.release();
  }
});

/** Username deposits cash into pid1 from pid2 */
portfolio.put("/deposit/:username/:pid1/:pid2", async (req, res) => {
  const username = req.params.username;
  const pid1 = req.params.pid1;
  const pid2 = req.params.pid2;
  const { amount } = req.body;

  const client = await getClient();
  await client.query("BEGIN");
  try {
    if (
      (
        await client.query(
          `
      SELECT * FROM Creates
      WHERE (fid=$2 OR fid=$3) AND username=$1
      `,
          [username, pid1, pid2]
        )
      ).rowCount !== 2
    )
      throw Error(
        `${username} is not the creator of portfolio ${pid1} or ${pid2}`
      );

    if (
      (
        await client.query(
          `
      UPDATE Portfolio
      SET amount = amount + $2
      WHERE pid = $1
      `,
          [pid1, amount]
        )
      ).rowCount === 0
    )
      throw Error(`Failed to add amount into ${pid1}`);

    if (
      (
        await client.query(
          `
      UPDATE Portfolio
      SET amount = amount - $2
      WHERE pid = $1
      `,
          [pid2, amount]
        )
      ).rowCount === 0
    )
      throw Error(`Failed to subtract amount into ${pid2}`);

    if (
      (
        await client.query(
          `
      INSERT INTO Transaction (pid, transaction_type, amount, other_pid)
      VALUES
        ($1,'transfer', $2, $3),
        ($3,'transfer', $4, $1)
      RETURNING *
      `,
          [pid1, amount, pid2, -amount]
        )
      ).rowCount === 0
    )
      throw Error("Failed to create transaction.");

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    res.json({ success: false }).status(400);
  } finally {
    client.release();
  }
});

/** Username deposits cash into pid from an external bank account */
portfolio.put("/deposit/:username/:pid", async (req, res) => {
  const username = req.params.username;
  const pid = req.params.pid;
  const { amount } = req.body;

  const client = await getClient();
  await client.query("BEGIN");
  try {
    const result = await client.query(
      `
      UPDATE portfolio
      SET amount = amount + $3
      WHERE pid = $2 AND EXISTS (
        SELECT fid from Creates WHERE fid = $2 AND username = $1
      )
      `,
      [username, pid, amount]
    );

    if (result.rowCount === 0) throw Error("Failed to update portfolio cash");

    if (
      (
        await client.query(
          `
      INSERT INTO Transaction (pid, amount) VALUES
      ($1, $2)
      RETURNING *
      `,
          [pid, amount]
        )
      ).rowCount === 0
    )
      throw Error("Failed to create transaction.");

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (e) {
    await client.query("ROLLBACK");
    console.log(e);
    res.json({ success: false }).status(400);
  } finally {
    client.release();
  }
});

/** Username adds shares of stock into folder */
portfolio.post("/buy", async (req, res) => {
  const { username, pid, symbol, shares } = req.body;
  const client = await getClient();

  await client.query("BEGIN");
  try {
    // Make sure username is the creator of pid
    if (
      (
        await client.query(
          `
      SELECT * FROM Creates
      WHERE fid=$2 AND username=$1
      `,
          [username, pid]
        )
      ).rowCount == 0
    )
      throw Error(`${username} is not the creator of portfolio ${pid}`);

    // Check if this portfolio already holds the share
    if (
      (
        await client.query(
          `
      UPDATE Stockholding
      SET share = share + $3
      WHERE fid = $1 AND symbol = $2
      `,
          [pid, symbol, shares]
        )
      ).rowCount === 0
    ) {
      await client.query(
        `
      INSERT INTO Stockholding
      VALUES ($1, $2, $3)
      `,
        [pid, symbol, shares]
      );
    }

    const price = await client.query(
      `
      SELECT close FROM (
        Stockdata s1 NATURAL JOIN (
          SELECT s2.symbol, MAX(s2.time_stamp) as time_stamp
          FROM Stockdata s2
          WHERE s2.symbol = $1
          GROUP BY symbol 
        )
      )
        `,
      [symbol]
    );
    if (price.rowCount === 0)
      throw Error(`Could not find stock price for ${symbol}`);

    const buyPrice = price.rows[0].close * shares;
    if (
      (
        await client.query(
          `
      UPDATE Portfolio
      SET amount = amount - $1
      WHERE pid = $2
      `,
          [buyPrice, pid]
        )
      ).rowCount === 0
    )
      throw Error(`Failed to update`);

    if (
      (
        await client.query(
          `
      INSERT INTO Transaction (pid, amount, transaction_type, stock_symbol, stock_shares)
      VALUES ($1, $2, 'stock', $3, $4)
      RETURNING *
      `,
          [pid, -buyPrice, symbol, shares]
        )
      ).rowCount === 0
    )
      throw Error("Failed to create transaction.");

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    await client.query("ROLLBACK");
    res.json({ success: false }).status(400);
  } finally {
    client.release();
  }
});

/** Username sells shares of stock */
portfolio.delete("/sell", async (req, res) => {
  const { username, pid, symbol, shares } = req.body;
  const client = await getClient();

  await client.query("BEGIN");
  try {
    // Make sure username is the creator of pid
    if (
      (
        await client.query(
          `
      SELECT * FROM Creates
      WHERE fid=$2 AND username=$1
      `,
          [username, pid]
        )
      ).rowCount == 0
    )
      throw Error(`${username} is not the creator of portfolio ${pid}`);

    await client.query(
      `
      UPDATE Stockholding
      SET share = share - $3
      WHERE fid = $1 AND symbol = $2
      `,
      [pid, symbol, shares]
    );

    const price = await client.query(
      `
      SELECT close FROM (
        Stockdata s1 NATURAL JOIN (
          SELECT s2.symbol, MAX(s2.time_stamp) as time_stamp
          FROM Stockdata s2
          WHERE s2.symbol = $1
          GROUP BY symbol 
        )
      )
        `,
      [symbol]
    );
    if (price.rowCount === 0)
      throw Error(`Could not find stock price for ${symbol}`);

    const sellPrice = price.rows[0].close * shares;
    if (
      (
        await client.query(
          `
      UPDATE Portfolio
      SET amount = amount + $1
      WHERE pid = $2
      `,
          [sellPrice, pid]
        )
      ).rowCount === 0
    )
      throw Error(`Failed to update`);

    if (
      (
        await client.query(
          `
      INSERT INTO Transaction (pid, amount, transaction_type, stock_symbol, stock_shares)
      VALUES ($1, $2, 'stock', $3, $4)
      RETURNING *
      `,
          [pid, sellPrice, symbol, shares]
        )
      ).rowCount === 0
    )
      throw Error("Failed to create transaction.");

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    await client.query("ROLLBACK");
    res.json({ success: false }).status(400);
  } finally {
    client.release();
  }
});

portfolio.get("/transactions/:username/:pid", async (req, res) => {
  const username = req.params.username;
  const pid = req.params.pid;

  try {
    const result = await query(
      `
    SELECT transaction_type, amount, other_pid, folder_name AS other_portfolio, stock_symbol, stock_shares, time_stamp FROM (
      (
        Transaction t JOIN Creates c
        ON t.pid = c.fid AND c.username = $1
      ) LEFT JOIN Folder f ON other_pid = f.fid
    )
    WHERE pid = $2
    `,
      [username, pid]
    );

    if (result.rowCount === 0) throw Error("No transactions");

    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.json([]).status(400);
  }
});
