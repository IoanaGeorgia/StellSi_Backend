
import express from 'express';
import dotenv from 'dotenv';
import { connectDB} from './config/db.js';
import { sequelize } from './models/index.js';
import starsRouter from './routes/stars.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import contactRouter from './routes/contact.js';
import session from 'express-session';
import connectSessionSequelize from "connect-session-sequelize";
import cors from 'cors';

dotenv.config()


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());


app.use(cors({
  origin: 'https://stellsi.onrender.com',
  credentials: true
}));

// this creates a session table in ur database automatocally
const SequelizeStore = connectSessionSequelize(session.Store);

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "Sessions", 
  checkExpirationInterval: 15 * 60 * 1000, 
  expiration: 24 * 60 * 60 * 1000
});

app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, 
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 
    }
  })
);

  app.use('/api/stars', starsRouter);
  app.use('/api/order', ordersRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/user', userRouter);
  app.use('/api/contact', contactRouter)

const startServer = async () => {
  try {

    await connectDB();

    // here we synch the database so the tables are like in modules
    await sequelize.sync({ force: false });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Nu s-a putut porni serverul:', error.message);
  }
};

startServer();