import express from "express";
import { portfolio } from "./routes/portfolio.js";
import { user } from "./routes/user.js";
import { stock } from "./routes/stock.js";
const app = express();
const port = process.env.PORT || "3000";

app.use(express.json());

// Add routers from /routers here
app.use("/portfolio", portfolio);
app.use("/stock", stock);
app.use("/user", user);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
