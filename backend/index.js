import express from "express";
import Routes from "./routes/index.js"
const app = express();

const port = process.env.PORT || "3000";

app.use(express.json());

// Add routers from /routers here
app.use("/", Routes);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
