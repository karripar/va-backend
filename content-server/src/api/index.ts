import express, {Request, Response} from 'express';
import testRoute from './routes/dataRoute';
import dataRoute from './routes/dataRoute';
const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: nothing yet',
  })
}
);

router.use('/test', testRoute);

router.use('/data', dataRoute);

export default router;
