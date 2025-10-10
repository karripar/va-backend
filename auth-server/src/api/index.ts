import express, {Request, Response} from 'express';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import profileRoute from './routes/profileRoute';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Auth API v1 - Routes: /auth, /users, /profile',
  });
});

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/profile', profileRoute);

export default router;
