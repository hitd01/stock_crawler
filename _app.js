import express from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import cors from 'cors';

// routes
import hoseRoute from './routes/HoSERoute.js';

const app = express();

// middleware
app.use(cors());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
dotenv.config();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// routes
app.use('/api/hose', hoseRoute);
