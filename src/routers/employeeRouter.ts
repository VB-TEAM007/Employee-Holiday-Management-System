import express from 'express';
import EmployeeService from '../services/employeeService.js';
import { employeeController } from '../controllers/employee.controller.js';
import { isAuth } from '../utils/authUtils.js';

const employeeRouter = express.Router();
const employeeService = new EmployeeService;

employeeRouter.get('/add-employee', isAuth, (req, res)  => {
  res.status(200).render('add-employee');
});

employeeRouter.post('/add-employee', async (req, res) => {
  const selectedDatabase = process.env.SELECTED_DATABASE;

  if (selectedDatabase === 'postgres') {
    await employeeController.add(req, res);
  } else {
    await employeeService.add(req.body.name, req.body.remainingHolidays);
    res.redirect('employees');
  }
});

employeeRouter.get('/employees', async(req, res)  => {
  const selectedDatabase = process.env.SELECTED_DATABASE;
  
  const employees = selectedDatabase === 'postgres' 
    ? await employeeController.getAll(req, res) 
    : await employeeService.getAll();

  res.status(200).render('employees', { employees });
});

export default employeeRouter;
