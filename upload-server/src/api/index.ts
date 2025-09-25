import express, {Request, Response} from 'express';
import testRoute from './routes/testRoute';
const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: nothing yet',
  })
}
);

router.use('/test', testRoute);

export default router;
