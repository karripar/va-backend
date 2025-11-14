import express, {Request, Response} from 'express';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import profileRoute from './routes/profileRoute';
import tipsRoute from './routes/tipsRoute';
import adminRoute from './routes/adminRoute';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: /api/profile, /api/tips',
  });
});
router.get<{}, {message: string}>('/ping', (_req: Request, res) => {
  res.json({message: 'pong'});
});

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/profile', profileRoute);
router.use('/tips', tipsRoute);
router.use('/admin', adminRoute);

export default router;
