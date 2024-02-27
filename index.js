import express from 'express';
import routers from './src/routes/index.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const eventBuzz = process.env.EVENT_BUZZ;
const allowList = [`${eventBuzz}`];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 200, // For legacy browser support
  credentials: true, // This allows session cookies from browser to pass through
};
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '6mb' }));

app.use('/api', routers);
app.use(express.json());
// const bodyParser = require('body-parser');
// const cors = require('cors');

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
