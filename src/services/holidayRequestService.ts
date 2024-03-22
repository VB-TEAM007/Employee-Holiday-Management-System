import HolidayRequest from "../models/holidayRequest";
import { collections } from "../utils/database";
import { getTotalDaysRequested, validateHolidayRequest } from "../utils/validation";
import { ObjectId } from 'mongodb';

export default class HolidayRequestService {

  async getAll(): Promise<HolidayRequest[]> {
    return await collections.requests?.find({}).toArray() as HolidayRequest[];
  }

  async getById(id: ObjectId): Promise<HolidayRequest> {
    return await collections.requests?.find({_id: id}) as HolidayRequest;
  }
  async getArrayByEmployeeId(id: ObjectId): Promise<HolidayRequest[]> {
    return await collections.requests?.find({_id: id}).toArray() as HolidayRequest[];
  }

  async add(name: String, startDate: Date, endDate: Date): Promise<string | null> {
    const employee = await collections.employee?.findOne({ name: name});
    const newRequest: HolidayRequest = {
      employeeId: employee!._id,
      startDate: startDate,
      endDate: endDate,
      status: 'pending'
    }  
    const totalDaysRequested = getTotalDaysRequested(startDate, endDate); 
    employee!.remainingHolidays = employee!.remainingHolidays! - totalDaysRequested;  
    const errorMessage = await validateHolidayRequest(newRequest);
    if (errorMessage === null){
      await collections.requests?.insertOne(newRequest);
      return null;
    } else {
      return errorMessage;
    }
  }

  async updateStatus(id: ObjectId, status:String): Promise<void>{
    const query = { _id: id };
    await collections.requests?.updateOne(query, { $set: {status: status} });
    const request = await collections.requests?.findOne(query) as HolidayRequest;
    if (status === 'rejected'){         
      const employee = await collections.employee?.findOne({_id: request.employeeId!});
      const totalDaysRequested = getTotalDaysRequested(request.startDate!, request.endDate!);
      employee!.remainingHolidays = employee!.remainingHolidays! + totalDaysRequested;
    }
  }

  async delete(id: ObjectId): Promise<void> {
    const query = { _id: id };
    await collections.requests?.deleteOne(query);
  }

  async updateRequest(id: string, startDate: Date, endDate: Date): Promise<string | null>{
    const request = await this.getById(new ObjectId(id));   
    const employee = await collections.employee?.findOne({_id: request.employeeId!});
    const totalDaysRequested = getTotalDaysRequested(request.startDate!, request.endDate!); 
    employee!.remainingHolidays = employee!.remainingHolidays! + totalDaysRequested;
    const errorMessage = await validateHolidayRequest(request!)
    if(errorMessage === null){
      await collections.requests?.updateOne({_id: new ObjectId(id)}, {
        $set: {
          startDate: startDate,
          endDate: endDate
        }});
      const totalDaysRequested = getTotalDaysRequested(startDate, endDate!); 
      employee!.remainingHolidays = employee!.remainingHolidays! - totalDaysRequested;
      return null;
    }
    return errorMessage;
  }
}