import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import employeeRouter from './src/routers/employeeRouter.js';
import requestRouter from './src/routers/requestRouter.js';
import authRouter from './src/routers/authRouter.js';
import publicHolidayRouter from './src/routers/publicHolidayRouter.js';
import { connectToDatabase } from './src/utils/database.js';
import dotenv from 'dotenv';
import { ConfiguratePassport } from './src/utils/passport.js';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { getIdfromJwt } from './src/utils/authUtils.js';
import { employeeController } from './src/controllers/employee.controller.js';
import EmployeeService from './src/services/employeeService.js';
import { ObjectId } from 'mongodb';


dotenv.config();
const PORT: number = parseInt(process.env.PORT!);
const HOST: string = process.env.HOST!;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const employeeService = new EmployeeService;

const app = express();
ConfiguratePassport(passport);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/', employeeRouter);
app.use('/', requestRouter);
app.use('/', authRouter);
app.use('/public-holidays', publicHolidayRouter);

app.get('/', async (req, res) => {
  if(req.cookies.access_token){
  const employee = process.env.SELECTED_DATABASE === 'postgres'
    ? await employeeController.getEmployeebyJwt(req.cookies.access_token.token)
    : await employeeService.getEmployeebyJwt(req.cookies.access_token.token);
  res.status(200).render('index', { db: process.env.SELECTED_DATABASE, employee, access_token: req.cookies.access_token});
  } else {
  res.status(200).render('index', { db: process.env.SELECTED_DATABASE, access_token: req.cookies.access_token});
  }
});

app.get('*', (req, res)  => {
  res.status(404).render('error');
});

app.post('/set-database', (req, res) => {
  const newDatabase = req.body.database;
  process.env.SELECTED_DATABASE = newDatabase;
  res.clearCookie('access_token');
  console.log("Selected database:", newDatabase);
  res.redirect('/');
});

app.listen(PORT, HOST, async () => {
  await connectToDatabase();
  console.log(`Server started: http://${HOST}:${PORT}`);
});
