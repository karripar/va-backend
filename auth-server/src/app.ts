import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import {errorHandler, notFound} from './middlewares';
import api from './api';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true, // allow cookies to be sent as the token is in httpOnly cookie
  }),
);

app.use('/api/v1', api);

app.use(notFound);

app.use(errorHandler);

export default app;
