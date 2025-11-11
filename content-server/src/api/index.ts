import express, {Request, Response} from 'express';
import testRoute from './routes/dataRoute';
import dataRoute from './routes/dataRoute';
import tipsRoute from './routes/tipsRoute';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: /test, /data, /tips',
  })
}
);

router.use('/test', testRoute);
router.use('/data', dataRoute);
router.use('/tips', tipsRoute);

export default router;
