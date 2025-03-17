import express from "express";
const app = express();

app.use(express.json());

// Add routers from /routers here

app.listen(process.env.PORT || "3000", () => {
  console.log(`Listening on port ${port}`);
});
