import { Router } from "express";
import { query, getClient } from "../db/index.js";

export const stocklist = Router();

stocklist.get("/", (req, res) => {
  res.send("Hello World from /stocklist!");
});

// Create stocklist with folder reference
stocklist.post('/create', async (req, res) => {
  const { username, pname } = req.body;
  const client = await getClient();
  client.query("BEGIN");
  try {
    const result = await client.query(
    `
      INSERT INTO folder (folder_name)
      VALUES ($1)
      RETURNING *
    `,
      [pname]
    );
    if (result.rowCount === 0) throw Error("Failed to create folder");

    const slid = result.rows[0].fid;

    if (!slid) throw Error("Failed to create folder");

    await client.query(
      `
      INSERT INTO creates
      VALUES ($1, $2)
    `,
      [username, slid]
    );
    await client.query(
    `
      INSERT INTO stocklist
      VALUES ($1, 'private')
    `,
      [slid]
    );
    await client.query(
    `
      INSERT INTO reviews(reviewer, slid, content)
      VALUES ($1, $2, '')
    `,
      [username, slid]
    );
    client.query("COMMIT");
    res.json({ slid: slid });
  } catch (e) {
    console.log(e);
    client.query("ROLLBACK");
    res.json({ slid: -1 }).status(400);
  } finally {
    client.release();
  }
});


//update status of stocklist
stocklist.post('/visibility/:slid', async (req, res) => {
  const slid = req.params.slid;
  const { visibility } = req.body;
  const client = await getClient();
  try {
    const result = await client.query(
      `
      UPDATE stocklist
      SET visibility = $1
      WHERE slid = $2
      RETURNING *
      `,
      [visibility, slid]
    );

    if (result.rowCount === 0) throw Error("Stocklist not found or update failed");

    res.json({ status: visibility, slid: slid });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Failed to update status" });
  } finally {
    client.release();
  }
});

//update status of stocklist
stocklist.post('/reviewcontent/:slid', async (req, res) => {
  const slid = req.params.slid;
  const { content } = req.body;
  const client = await getClient();
  try {
    const result = await client.query(
    `
      UPDATE reviews
      SET content = $1
      WHERE slid = $2
      RETURNING *
    `,
      [content, slid]
    );

    if (result.rowCount === 0) throw Error("Stocklist not found or update failed");

    res.json({ status: "updated content", slid: slid });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Failed to update status" });
  } finally {
    client.release();
  }
});

//view all user accesible stocklist
stocklist.get('/view/all/:username', async (req, res) => {
  const username = req.params.username;

  const client = await getClient();
  try {
    const result = await client.query(
      `
      SELECT s.slid, f.folder_name, s.visibility
      FROM Stocklist s
      JOIN Folder f ON s.slid = f.fid
      JOIN Creates c ON f.fid = c.fid
      LEFT JOIN Shares sh ON s.slid = sh.slid
      WHERE c.username = $1 OR s.visibility = 'public' OR sh.shared_with = $1
      `,
      [username]
    );

    if (result.rowCount === 0) {
      throw Error("No stocklists found or you have none.");
    }

    res.json(result.rows.map(({ slid, folder_name, visibility }) => ({slid: slid, name: folder_name, visibility: visibility})));
    // res.json(result.rows.map(({ slid }) => slid));
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Failed to retrieve stocklists." });
  } finally {
    client.release();
  }
});


// View one Stocklist have to fix
stocklist.get('/view/one/:username/:slid', async (req, res) => {
  const username = req.params.username;
  const slid = req.params.slid;

  try {
    const result = await query(
      `
    SELECT * FROM (
      (
      (SELECT * FROM Creates c WHERE username = $1 AND c.fid = $2)
      NATURAL JOIN Folder f JOIN Stocklist s ON f.fid = s.slid
      )
      NATURAL LEFT JOIN
      (
        SELECT fid, symbol, share, share * close AS value  FROM (
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
      [username, slid]
    );

    if (result.rowCount === 0)
      throw Error("This porfolio does not belong to this user.");

    res.json({
      slid: result.rows[0].slid,
      folder_name: result.rows[0].folder_name,
      amount: result.rows[0].amount,
      stocks: result.rows
        .filter(({ symbol, share }) => symbol !== null && share !== null)
        .map(({ symbol, share, value }) => ({ symbol, share, value })),
    });
  } catch (e) {
    console.log(e);
    res.json({}).status(400);
  }
});


// sharing stocklist with friends
stocklist.post('/share/:slid', async (req, res) => {
  const { username, friend } = req.body;
  const slid = req.params.slid;

  const client = await getClient();
  try {
    const friendshipResult = await client.query(
      `
      SELECT * FROM friends
      WHERE (uid1 = $1 AND uid2 = $2) OR (uid1 = $2 AND uid2 = $1) AND friend_status = true
      `,
      [username, friend]
    );

    if (friendshipResult.rowCount === 0) {
      return res.status(400).json({ error: "You are not friends with this user." });
    }

    // Update stocklist visibility to 'shared'
    const updateStocklist = await client.query(
      `
      UPDATE stocklist
      SET visibility = 'shared'
      WHERE slid = $1
      RETURNING *
      `,
      [slid]
    );

    if (updateStocklist.rowCount === 0) {
      return res.status(400).json({ error: "Stocklist not found or failed to update." });
    }

    // Insert into Shares table to log the shared stocklist
    const insertShare = await client.query(
      `
      INSERT INTO Shares
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [username, friend, slid]
    );

    if (insertShare.rowCount === 0) {
      return res.status(400).json({ error: "Failed to log shared stocklist." });
    }

    res.json({ message: "Stocklist successfully shared with the friend." });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Server error." });
  } finally {
    client.release();
  }
});

stocklist.post('/create/review/:slid', async (req, res) => {
  const { username, content } = req.body;
  const slid = req.params.slid;

  const client = await getClient();
  try {
    const validAndPermitted = await client.query(
      `
      SELECT 1 
      FROM Stocklist s
      LEFT JOIN Shares sh ON s.slid = sh.slid
      WHERE s.slid = $1 
      AND (s.visibility = 'public' OR sh.shared_with = $2)
      LIMIT 1
      `,
      [slid, username]
    );

    if (validAndPermitted.rowCount === 0) {
      return res.status(403).json({ error: "Stocklist does not exist or you lack permission." });
    }

    // Insert or update review
    const createReview = await client.query(
      `
      INSERT INTO reviews
      VALUES ($1, $2, $3)
      ON CONFLICT (reviewer, slid) 
      DO UPDATE SET content = EXCLUDED.content
      RETURNING *
      `,
      [username, slid, content]
    );

    if (createReview.rowCount === 0) {
      return res.status(400).json({ error: "Failed to create or update review." });
    }

    res.json({ message: "Review successfully created/updated.", review: createReview.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error." });
  } finally {
    client.release();
  }
});


/** Username adds shares of stock into stocklist */
stocklist.post("/add", async (req, res) => {
  const { username, slid, symbol, shares } = req.body;
  const client = await getClient();

  await client.query("BEGIN");
  try {
    // Make sure username is the creator of slid
    if (
      (
        await client.query(
          `
      SELECT * FROM Creates
      WHERE username=$1 AND fid=$2
      `,
          [username, slid]
        )
      ).rowCount == 0
    )
      throw Error(`${username} is not the creator of stocklist ${slid}`);

      const userstock = await client.query(
        `
      SELECT * from Stockholding
      WHERE fid = $1 AND symbol = $2
      `,
        [slid, symbol]
      )
    // Check if this stocklist already holds the share
    if (userstock.rowCount === 0)  {
      await client.query(
        `
      INSERT INTO Stockholding
      VALUES ($1, $2, $3)
      `,
        [slid, symbol, shares]
      );
    }  else {
      await client.query(
        `
      UPDATE Stockholding
      SET share = share + $3
      WHERE fid = $1 AND symbol = $2
      `,
        [slid, symbol, shares]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    await client.query("ROLLBACK");
    res.json({ success: false });
  } finally {
    client.release();
  }
});