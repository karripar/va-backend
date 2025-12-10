import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import {corsSettings} from './lib/functions';
import api from './api';
import { errorHandler, notFound } from './middlewares';
import path from 'path';
import basicAuth from 'express-basic-auth';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors(corsSettings));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
    },
  }),
);

app.use('/api/v1', api);

const docsRouter = express.Router();

docsRouter.use(
  basicAuth({
    users: { admin: process.env.DOCS_PASSWORD || 'defaultPassword' },
    challenge: true,
  })
);

docsRouter.use('/typedoc', express.static(path.join(process.cwd(), 'docs'), { index: false }));
docsRouter.use('/apidoc', express.static(path.join(process.cwd(), 'apidocs'), { index: false }));


app.use('/auth/docs', docsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
