import express, {Request, Response} from 'express';
import profileRoute from './routes/profileRoute';


const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Routes in use: /api/profile',
  })
}
);

// router.use('/users', userRoute); import users route when available
// router.use('/auth', authRoute); import auth route when available
router.use('/profile', profileRoute);

export default router;
