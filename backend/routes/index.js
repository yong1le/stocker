import express from "express";
import Friends from "./friend.js"

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World from /index!");
});

router.use("/friends", Friends);

export default router;
// insert into useraccount (username, fname, lname, pass_word) VALUES ('alvin', 'alvin', 'cao', '123');