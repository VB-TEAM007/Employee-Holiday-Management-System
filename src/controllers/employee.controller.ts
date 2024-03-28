import { employee } from "../models/employee.model.js";
import { Request, Response } from 'express';
import { genPassword, issueJWT, validPassword } from "../utils/passwordUtils.js";
import { getIdfromJwt } from "../utils/authUtils.js";

const add = async (req: Request, res: Response) => {
  const { username, password, isAdmin} = req.body;
  const remainingHolidays = 20;
  var role;  

  if(isAdmin !== undefined){ 
    role = 'admin';
  } else {
    role = 'employee';
  }

  const existingEmployee = await employee.findOne({ where: { username } });
  if (existingEmployee) {
    return res.status(400).send(`
      <p>Employe with name: ${username} already exists</p>
      <button onclick="window.history.back()">Back</button>
    `);
  }

  const saltHash = genPassword(password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    try {        
      await employee.create({username, remainingHolidays, hash, salt, role});
      res.status(200).redirect('/');
    } catch (err) {        
      throw err;   
    }
}

const getAll = async (req: Request, res: Response) => {
  const employees =  await employee.findAll();
  return employees;  
}

const getById = async(id: number) => {
  try {
    return await employee.findByPk(id);
  } catch (error) {
    console.error('Error retrieving employee by ID:', error);
    throw error;
  }
}

const login = async(req: Request, res: Response) => {
  const existingEmployee: any  = await employee.findOne({ where: {username: req.body.username}});  
    if (!existingEmployee) {
      return res.status(401).render('login', {msg: 'could not find the user', statusCode: res.statusCode});
    }
    const isValid = validPassword(req.body.password, existingEmployee.hash, existingEmployee.salt);
    
    if (isValid) {
      const tokenObject = await issueJWT(existingEmployee);
      res.cookie('access_token', tokenObject, {httpOnly: true, sameSite: true});
      res.status(200).redirect('/');
    } else {
      res.status(401).render('login', {msg: 'wrong username or password'});
    }
};

const logout = async(req: Request, res: Response) => {
  res.clearCookie('access_token');
  res.redirect('/');
 }
const getEmployeebyJwt = async (token: string) => {
  const id: string = getIdfromJwt(token) as string; 
  return await getById(parseInt(id));  
}
export const employeeController = {
  add, getAll, getById, login, logout, getEmployeebyJwt
}