import express from 'express';
import { isAuth, isUnauth } from '../utils/authUtils.js';
import EmployeeService from '../services/employeeService.js';
import { employeeController } from '../controllers/employee.controller.js';
 
const authRouter = express.Router();
const employeeService = new EmployeeService;

authRouter.get('/register', isUnauth, (req, res) => {
  res.status(200).render('register', {statusCode: res.statusCode});
})

authRouter.post('/register', async (req, res) => {
  if( req.body.password !== req.body.repeatPassword){
    res.status(400).render('register', {msg: 'passwords are not the same', statusCode: res.statusCode});
  }
  if (process.env.SELECTED_DATABASE === 'postgres') {
    await employeeController.add(req, res);
  } else {
    await employeeService.add(req, res);
  }
  res.status(200).redirect('/');
});

authRouter.get('/login', isUnauth, (req, res) => {
  res.status(200).render('login', {statusCode: res.statusCode});
});

authRouter.post('/login', async(req, res) => {
  if (process.env.SELECTED_DATABASE === 'postgres'){  
    await employeeController.login(req, res); 
  } else {
    await employeeService.login(req, res);
  }
})

authRouter.get('/logout', isAuth, async(req, res) =>{
  if (process.env.SELECTED_DATABASE === 'postgres'){  
    await employeeController.logout(req, res); 
  } else {
    await employeeService.logout(req, res);
  }
})

export default authRouter;
