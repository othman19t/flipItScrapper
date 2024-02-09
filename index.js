import express from "express";
import mongoose from "mongoose";
import routers from "./src/routes/index.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";

import { CronJob } from "cron";

const allowList = ["http://localhost:3000", "http://localhost:3001"];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200, // For legacy browser support
  credentials: true, // This allows session cookies from browser to pass through
};

dotenv.config();
// MongoDB connection string
const dbUri = process.env.DB_URI;

mongoose
  .connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "6mb" }));

app.use("/api", routers);
app.use(express.json());
// const bodyParser = require('body-parser');
// const cors = require('cors');

// this is the cron job example it runs every 30 seconds. documintation: https://www.npmjs.com/package/cron#-basic-usage
const job = new CronJob("*/30 * * * * *", () => {
  console.log("Cron job running every 30 seconds");
});

// Start the cron job, uncoment to see it working in the terminal
// job.start();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
