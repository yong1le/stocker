import { Router } from "express";
import { query, getClient } from "../db/index.js";


export const friend = Router();

// Send a friend request
friend.post("/sendrequest/:username", async (req, res) => {
  const username = req.params.username;
  const { friend } = req.body; // uid1 sends request to uid2
  try {

    const existingFriendship = await query(
      `
      SELECT * FROM friends
      WHERE (uid1 = $1 AND uid2 = $2) OR (uid1 = $2 AND uid2 = $1)
      `,
      [username, friend]
    );

    if (existingFriendship.rowCount > 0) {
      if (existingFriendship.rows[0].friend_status === true) {
        return res.json({ message: "already friends." });
      } if (
        existingFriendship.rows[0].uid2 === username
      ) {
        const result = await query(
          `
          UPDATE friends 
          SET friend_status = true
          WHERE (uid1 = $1 AND uid2 = $2) OR (uid1 = $2 AND uid2 = $1)
          RETURNING *
          `,
          [username, friend]
        );

        if (result.rowCount === 0) throw Error("Failed to update friend status.");


        return res.json({
          message: "Friend request accepted, now friends.",
          results: result.rows[0]
        });
      }

      return res.json({ message: "friend request sent already." });
    }

    const result = await query(
      `
      INSERT INTO friends 
      VALUES ($1, $2, false)
      RETURNING *
      `,
      [username, friend]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Failed to send friend request." });
    }

    res.json({ message: "Friend request sent.", request: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Accept a friend request
friend.post("/accept/:username", async (req, res) => {
  const username = req.params.username;
  const { friend } = req.body; // username accepts friend request from friend

  try {
    const result = await query(
      `
      UPDATE friends
      SET friend_status = true
      WHERE (uid2 = $1 AND uid1 = $2) AND friend_status = false
      RETURNING *
      `,
      [username, friend]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "No pending request found or already accepted." });
    }

    res.json({ message: "Friend request accepted.", friendship: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Reject a friend request
friend.post("/reject/:username", async (req, res) => {
  const username = req.params.username;
  const { friend } = req.body; // username reject friend request from friend

  try {
    const result = await query(
      `
      DELETE FROM friends
      WHERE (uid1 = $2 AND uid2 = $1) AND friend_status = false
      RETURNING *
      `,
      [username, friend]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "No pending request found to reject." });
    }

    res.json({ message: "Friend request rejected." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

//view all request for user
friend.get("/view/requests/in/:username", async (req, res) => {
  const username = req.params.username;
  const client = await getClient();

  try {
    const result = await client.query(
      `
      SELECT uid1 as requester
      FROM friends
      WHERE uid2 = $1 AND friend_status = false
      `,
      [username]
    );

    if (result.rowCount === 0) {
      return res.json({ message: "No pending friend requests." });
    }

    const requests = result.rows.map(row => row.requester);
    res.json(requests);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Failed to retrieve friend requests" });
  } finally {
    client.release();
  }
});

//view all request from user
friend.get("/view/requests/out/:username", async (req, res) => {
  const username = req.params.username;
  const client = await getClient();

  try {
    const result = await client.query(
      `
      SELECT uid2 as requester
      FROM friends
      WHERE uid1 = $1 AND friend_status = false
      `,
      [username]
    );

    if (result.rowCount === 0) {
      return res.json({ message: "No pending friend requests." });
    }

    const requests = result.rows.map(row => row.requester);
    res.json(requests);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Failed to retrieve friend requests" });
  } finally {
    client.release();
  }
});


//view all friends to user
friend.get('/view/all/:username', async (req, res) => {
  const username = req.params.username;
  const client = await getClient();
  try {
    const result = await client.query(
      `
      SELECT uid1, uid2
      FROM friends
      WHERE friend_status = true AND (uid1 = $1 OR uid2 = $1)
      `,
      [username]
    );

    if (result.rowCount === 0) {
      return res.json({ message: "No friends found." });
    }

    const friends = result.rows.map(row => (row.uid1 === username ? row.uid2 : row.uid1));

    res.json(friends);
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Failed to retrieve friends" });
  } finally {
    client.release();
  }
});

// Reject a friend request
friend.post("/remove/:username", async (req, res) => {
  const username = req.params.username;
  const { friend } = req.body; // username reject friend request from friend

  try {
    const result = await query(
      `
      DELETE FROM friends
      WHERE (uid1 = $1 AND uid2 = $2) OR (uid1 = $2 AND uid2 = $1) AND friend_status = true
      RETURNING *
      `,
      [username, friend]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "No pending friend found to reject." });
    }

    res.json({ message: "Friend request removed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});