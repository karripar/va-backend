import express, {Request, Response} from 'express';
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
import profileRoute from './routes/profileRoute';
import adminRoute from './routes/adminRoute';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Auth API v1 - Routes: /auth, /users, /profile',
  });
});

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/profile', profileRoute);
router.use('/admin', adminRoute);

export default router;
