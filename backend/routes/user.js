import { Router } from "express";
import { query, getClient } from "../db/index.js";

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

  try {
    await query(
      `
    INSERT INTO Useraccount (username, pass_word, fname, lname)
    VALUES ($1,$2,$3,$4)
    `,
      [username, password, fname, lname]
    );

    res.json({ success: true });
  } catch (e) {
    console.log(e);
    res.json({ success: false }).status(400);
  }
});
