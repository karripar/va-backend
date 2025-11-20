import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { errorHandler, notFound } from './middlewares';
import api from './api';

const app = express();
dotenv.config();

app.use(express.json())
app.use(morgan('dev'));
app.use(helmet(
  {
    contentSecurityPolicy: false,
  }
));
app.use(cors());

// Serve uploaded files from /uploads (folder at project root content-server/uploads)
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.use('/api/v1', api);

app.use(
  '/docs/apidoc',
  express.static(path.join(process.cwd(), 'apidocs'))
)

app.use(
  '/docs/typedoc',
  express.static(path.join(process.cwd(), 'docs'))
);

app.use(notFound);

app.use(errorHandler);

export default app;
