import "dotenv/config";
import express from "express";
import askRoute from "./routes/ask.js";
import askStreamRoute from "./routes/askStream.js";
import chatRoute from "./routes/chat.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  }),
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/api", askRoute);
app.use("/api", askStreamRoute);
app.use("/api", chatRoute);
