import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World from /friends!");
});

import * as db from "../db/index.js"

router.get('/:id', async (req, res, next) => {
    console.log("here", req.params.id);
    // const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id])
    // res.send(result.rows[0])
    res.send("done");
})



export default router;