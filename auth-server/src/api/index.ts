import express, {Request, Response} from 'express';
import profileRoute from './routes/profileRoute';
import tipsRoute from './routes/tipsRoute';


const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: /api/profile, /api/tips',
  })
}
);
router.get<{}, {message: string}>('/ping', (_req: Request, res) => {
  res.json({message: 'pong'});
});


// router.use('/users', userRoute); import users route when available
// router.use('/auth', authRoute); import auth route when available
router.use('/profile', profileRoute);
router.use('/tips', tipsRoute);

export default router;
