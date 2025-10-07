import express, {Request, Response} from 'express';
<<<<<<< HEAD
import authRoute from './routes/authRoute';
import userRoute from './routes/userRoute';
=======
import profileRoute from './routes/profileRoute';

>>>>>>> 8b0c3baa73ed3b0412b44d66a15324acc030ebb8

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
<<<<<<< HEAD
    message: 'Auth API v1 - Routes: /auth, /users',
  });
});

router.use('/auth', authRoute);
router.use('/users', userRoute);
=======
    message: 'Routes in use: /api/profile',
  })
}
);

// router.use('/users', userRoute); import users route when available
// router.use('/auth', authRoute); import auth route when available
router.use('/profile', profileRoute);
>>>>>>> 8b0c3baa73ed3b0412b44d66a15324acc030ebb8

export default router;
