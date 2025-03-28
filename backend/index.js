import express from "express";
import cors from "cors";
import { portfolio } from "./routes/portfolio.js";
import { user } from "./routes/user.js";
import { stock } from "./routes/stock.js";
import { friend } from "./routes/friend.js";
import { stocklist } from "./routes/stocklist.js";

const app = express();

const port = process.env.PORT || "8080";

app.use(express.json());
app.use(cors());

// Add routers from /routers here
app.use("/portfolio", portfolio);
app.use("/stock", stock);
app.use("/user", user);
app.use("/friend", friend);
app.use("/stocklist", stocklist);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
