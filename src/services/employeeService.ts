import { ObjectId } from 'mongodb';
import Employee from '../models/employee.js';
import { collections } from '../utils/database.js';
import { genPassword, issueJWT, validPassword } from '../utils/passwordUtils.js';
import { getIdfromJwt } from '../utils/authUtils.js';

export default class EmployeeService {

   async getAll(): Promise<Employee[]> {
    return await collections.employee?.find({}).toArray() as Employee[];
  }

  async add(req: any, res: any): Promise<void> {
    const saltHash = genPassword(req.body.password);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    var role;

    if(req.body.isAdmin !== undefined){ 
      role = 'admin';
    } else {
      role = 'employee';
    }

    const newEmployee = {
      username: req.body.username,
      remainingHolidays: 20,
      hash: hash,
      salt: salt,
      role: role
    }
    await collections.employee?.insertOne(newEmployee);
  }

  async getById(id: ObjectId): Promise<Employee>{
    return await collections.employee?.findOne({ _id: id}) as Employee;
  }

  async login(req: any, res: any){        
    const existingEmployee = await collections.employee?.findOne({ username: req.body.username })
    if (existingEmployee) {
      const isValid = validPassword(req.body.password, existingEmployee.hash, existingEmployee.salt);
      if (isValid) {
        const tokenObject = await issueJWT(existingEmployee);
        res.cookie('access_token', tokenObject, {httpOnly: true, sameSite: true});
        res.status(200).redirect('/');
      } else {
        res.status(401).render('login', {error: 'wrong username or password', statusCode: res.statusCode});
      }
    } else {
      res.status(400);
    }
  }
   
  async logout(req: any, res:any){
    res.clearCookie('access_token');
    res.redirect('/');
  }

  async getEmployeebyJwt(token:string){
    const id: string = getIdfromJwt(token) as string; 
    return await this.getById(new ObjectId(id));
  }

}
