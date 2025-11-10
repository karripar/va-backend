import express, {Request, Response} from 'express';
import testRoute from './routes/dataRoute';
import dataRoute from './routes/dataRoute';
import contactRoute from './routes/contactRoute';
import instructionRoute from './routes/instructionRoute';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: data, contact, instructions',
  });
});

router.use('/test', testRoute);

router.use('/data', dataRoute);

router.use('/contact', contactRoute);

router.use('/instructions', instructionRoute);

export default router;
