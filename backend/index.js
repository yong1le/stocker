import express from "express";
<<<<<<< HEAD
import Routes from "./routes/index.js"
=======
import { portfolio } from "./routes/portfolio.js";
import { user } from "./routes/user.js";
import { stock } from "./routes/stock.js";
>>>>>>> yongle
const app = express();
const port = process.env.PORT || "3000";

const port = process.env.PORT || "3000";

app.use(express.json());

// Add routers from /routers here
<<<<<<< HEAD
app.use("/", Routes);
=======
app.use("/portfolio", portfolio);
app.use("/stock", stock);
app.use("/user", user);
>>>>>>> yongle

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
