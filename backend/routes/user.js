import { Router } from "express";
import { query, getClient } from "../db/index.js";
import { createNewPortfolio } from "./portfolio.js";

export const user = Router();

user.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (
      (
        await query(
          `SELECT * FROM Useraccount
      WHERE username = $1 AND pass_word = $2`,
          [username, password]
        )
      ).rowCount === 0
    )
      throw Error("User and password combination wrong.");

    res.json({ success: true });
  } catch (e) {
    console.log(e);
    res.json({ success: false }).status(400);
  }
});

user.post("/register", async (req, res) => {
  const { username, password, fname, lname } = req.body;

  const client = await getClient();
  await client.query("BEGIN");
  try {
    await client.query(
      `
    INSERT INTO Useraccount (username, pass_word, fname, lname)
    VALUES ($1,$2,$3,$4)
    `,
      [username, password, fname, lname]
    );

    await createNewPortfolio(client, username, "default");
    await client.query("COMMIT");
    res.json({ success: true });
  } catch (e) {
    console.log(e);
    await client.query("COMMIt");
    res.json({ success: false }).status(400);
  } finally {
    client.release();
  }
});
