import express from 'express';
import { ObjectId } from 'mongodb';
import HolidayRequestService from '../services/holidayRequestService.js';
import EmployeeService from '../services/employeeService.js';
import { holidayRequestController } from '../controllers/holidayRequest.controller.js';
import { employeeController } from '../controllers/employee.controller.js';
import { isAuth } from '../utils/authUtils.js';

const requestRouter = express.Router();
const holidayRequestService = new HolidayRequestService();
const employeeService = new EmployeeService();

requestRouter.get('/requests', async (req, res)  => {
  const selectedDatabase = process.env.SELECTED_DATABASE;

  const employee: any = selectedDatabase === 'postgres' 
    ? await employeeController.getEmployeebyJwt(req.cookies.access_token.token) 
    : await employeeService.getEmployeebyJwt(req.cookies.access_token.token);
    
  const holidayRequests = selectedDatabase === 'postgres' 
    ? await holidayRequestController.getArrayRequestsByEmployeeId(employee.id) 
    : await holidayRequestService.getArrayRequestsByEmployeeId(employee._id);

const template = selectedDatabase === 'postgres' ? 'requestsForSQL' : 'requests';

res.status(200).render(template, { holidayRequests, employee, access_token: req.cookies.access_token });
});

requestRouter.get('/add-request', isAuth, async(req, res)  => {
  const selectedDatabase = process.env.SELECTED_DATABASE;

  const employee = selectedDatabase === 'postgres' 
    ? await employeeController.getEmployeebyJwt(req.cookies.access_token.token) 
    : await employeeService.getEmployeebyJwt(req.cookies.access_token.token);

  res.status(200).render('add-request', { employee, statusCode: res.statusCode} );
});

requestRouter.post('/add-request', async (req, res) => {
  const selectedDatabase = process.env.SELECTED_DATABASE;
  const employee: any = selectedDatabase === 'postgres' 
    ? await employeeController.getEmployeebyJwt(req.cookies.access_token.token) 
    : await employeeService.getEmployeebyJwt(req.cookies.access_token.token);
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);

  const errorMessage = selectedDatabase === 'postgres' 
  ? await holidayRequestController.add(employee.username, startDate, endDate) 
  : await holidayRequestService.add(employee.username, startDate, endDate);

  if (errorMessage === null) {
    res.redirect('/requests');
  } else {
    res.status(400).render('add-request', { employee, errorMessage, statusCode: res.statusCode });
  }
});

requestRouter.post('/approve-request/:id', async (req, res)  => {
  const selectedDatabase = process.env.SELECTED_DATABASE;
  try {
    if (selectedDatabase === 'postgres') {
      const id = parseInt(req.params.id);
      await holidayRequestController.updateStatus(id, 'approved');
    } else {
      const id = new ObjectId(req.params.id);
      await holidayRequestService.updateStatus(id, 'approved');
    }
    res.status(200).redirect('/requests');
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).send("Internal Server Error");
  }
});

requestRouter.post('/reject-request/:id', async(req, res)  => {
  const selectedDatabase = process.env.SELECTED_DATABASE;
  try {
    if (selectedDatabase === 'postgres') {
      const id = parseInt(req.params.id);
      await holidayRequestController.updateStatus(id, 'rejected');
    } else {
      await holidayRequestService.updateStatus(new ObjectId(req.params.id), 'rejected');
    }
    res.status(200).redirect('/requests');
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).send("Internal Server Error");
  }
});

requestRouter.post('/delete-request/:id', async(req, res) => {
  const selectedDatabase = process.env.SELECTED_DATABASE;
  try {
    if (selectedDatabase === 'postgres') {
      const id = parseInt(req.params.id);
      await holidayRequestController.deleteRequest(id);
    } else {
      await holidayRequestService.delete(new ObjectId(req.params.id));
    }
    res.redirect('/requests');
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).send("Internal Server Error");
  }
});

requestRouter.get('/update-request/:id', isAuth, (req, res) => {
  const id = req.params.id;
  res.status(200).render('update-request', { id });
})

requestRouter.post('/update-request/:id', async (req, res) =>{
  const selectedDatabase = process.env.SELECTED_DATABASE;
  try {
    const id = selectedDatabase === 'postgres' ? parseInt(req.params.id) : new ObjectId(req.params.id);
    const errorMessage = selectedDatabase === 'postgres' 
      ? await holidayRequestController.updateRequest(String(id), req.body.startDate, req.body.endDate) 
      : await holidayRequestService.updateRequest(String(id), req.body.startDate, req.body.endDate);
  
    if (errorMessage === null) {
      res.redirect('/requests');
    } else {
      res.status(400).render('update-request', { id, errorMessage, statusCode: res.statusCode });
    }
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default requestRouter;
