import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import {corsSettings} from './utils/settings';
import {errorHandler, notFound} from './middlewares';
import api from './api';
import path from 'path';
import basicAuth from 'express-basic-auth';

const app = express();


app.use(express.json());

app.use(morgan('dev'));
app.use(cors(corsSettings));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'"],
        imgSrc: ['*'],
      },
    },
  })
);

// Serve static files
app.use('/uploads', express.static('uploads'));

app.use('/api/v1', api);

app.use(
  '/docs/apidoc',
  basicAuth({
    users: { admin: process.env.DOCS_PASSWORD || 'defaultPassword' },
    challenge: true,
  }),
  express.static(path.join(process.cwd(), 'apidocs'))
)
app.use(
  '/docs/typedoc',
  basicAuth({
    users: { admin: process.env.DOCS_PASSWORD || 'defaultPassword' },
    challenge: true,
  }),
  express.static(path.join(process.cwd(), 'docs'))
);

app.use(notFound);

app.use(errorHandler);

export default app;
