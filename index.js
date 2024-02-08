import express from 'express';
import mongoose from 'mongoose';
import routers from './src/routes/index.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
const allowList = ['http://localhost:3000'];
dotenv.config();
// MongoDB connection string
const dbUri = process.env.DB_URI;

mongoose
  .connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();
app.use(bodyParser.json({ limit: '6mb' }));

app.use('/api', routers);
app.use(express.json());
// const bodyParser = require('body-parser');
// const cors = require('cors');
// app.use(cors());

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
