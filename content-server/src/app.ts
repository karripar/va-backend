import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { errorHandler, notFound } from './middlewares';
import api from './api';
import basicAuth from 'express-basic-auth';

const app = express();
dotenv.config();

app.use(express.json())
app.use(morgan('dev'));
app.use(helmet(
  {
    contentSecurityPolicy: false
  }
));
app.use(cors());

// Serve uploaded files from /uploads (folder at project root content-server/uploads)
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.use('/api/v1', api);

app.use(
  '/content/docs',
  basicAuth({
    users: { admin: process.env.DOCS_PASSWORD || 'defaultPassword' },
    challenge: true,
  })
);

app.use('/content/docs/typedoc', express.static(path.join(process.cwd(), 'docs')));
app.use('/content/docs/apidoc', express.static(path.join(process.cwd(), 'apidocs')));


app.use(notFound);

app.use(errorHandler);

export default app;
