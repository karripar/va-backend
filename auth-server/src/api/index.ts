import express, {Request, Response} from 'express';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import profileRoute from './routes/profileRoute';
import applicationRoute from './routes/applicationRoute';
import budgetRoute from './routes/budgetRoute';
import grantRoute from './routes/grantRoute';
import exchangeStoriesRoute from './routes/ExchangeStoriesRoute';
import tipsRoute from './routes/tipsRoute';
import adminRoute from './routes/adminRoute';
import aiChatRoute from './routes/aiChatRoute';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message:
      'Routes in use: /api/profile, /api/applications, /api/budgets, /api/grants, /api/tips, /api/auth, /api/users, /api/admin',
  });
});
router.get<{}, {message: string}>('/ping', (_req: Request, res) => {
  res.json({message: 'pong'});
});

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/profile', profileRoute);
router.use('/applications', applicationRoute);
router.use('/budgets', budgetRoute);
router.use('/grants', grantRoute);
router.use('/tips', tipsRoute);
router.use('/exchange-stories', exchangeStoriesRoute);
router.use('/admin', adminRoute);
router.use('/ai/chat', aiChatRoute);

export default router;
