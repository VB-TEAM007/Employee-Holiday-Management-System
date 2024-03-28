import { holidayRequest } from "../models/holidayRequest.model.js";
import { employee } from "../models/employee.model.js";
import { getTotalDaysRequested, validateHolidayRequest } from "../utils/validation.js";
import { employeeController } from "./employee.controller.js";

export interface HolidayRequestInstance {
  employeeId: number;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

const getAll = async () => {
  const holidayRequests = await holidayRequest.findAll();
  return holidayRequests;
}
async function add(name: string, startDate: Date, endDate: Date) {
  const existingEmployee: any = await employee.findOne({ where: { name: name } });  
  if (!existingEmployee) {
    throw new Error(`Employee with name '${name}' does not exist.`);
  }

  const newRequest = {
    employeeId: existingEmployee.id,
    startDate: startDate,
    endDate: endDate,
    status: 'pending'
  };  
  const errorMessage = await validateHolidayRequest(newRequest);

  if (errorMessage === null) {
    const totalDaysRequested = getTotalDaysRequested(startDate, endDate);

    await employee.update({
      remainingHolidays: existingEmployee.remainingHolidays - totalDaysRequested
    }, {
      where: { id: existingEmployee.id }
    });

    await holidayRequest.create(newRequest)
    return null;
  } else {
    return errorMessage;
  }
}

async function updateStatus(requestId: number, status: string) {
  try {
    const request: any = await holidayRequest.findByPk(requestId);
    if (!request) {
      throw new Error("Holiday request not found");
    }

    request.status = status;
    await request.save();
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  }
}

async function deleteRequest(id: number): Promise<void> {
  try {
    await holidayRequest.destroy({ where: { id: id } });
    console.log(`Holiday request with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting holiday request:", error);
    throw error;
  }
}

async function getArrayPendingRequestsByEmployeeId(employeeId: number) {
  try {
    const requests = await holidayRequest.findAll({
      where: {
        employeeId: employeeId,
        status: 'pending'
      }
    });
    return requests;
  } catch (error) {
    console.error('Error retrieving pending requests:', error);
    throw error;
  }
}

export async function updateRequest(id: string, startDate: Date, endDate: Date): Promise<string | null> {
  try {
    const request: any = await holidayRequest.findByPk(parseInt(id));
    const employee: any = await employeeController.getById(request.employeeId);
    const errorMessage = await validateHolidayRequest(request)

    if (errorMessage === null) {
      const totalDaysRequested = getTotalDaysRequested(request.startDate!, request.endDate!);
      
      await employee.increment('remainingHolidays', { by: totalDaysRequested });

      await holidayRequest.update({ startDate: startDate, endDate: endDate }, { where: { id: id } });

      const updatedRequest: any = await holidayRequest.findByPk(id);
      const updatedTotalDaysRequested = getTotalDaysRequested(updatedRequest.startDate, updatedRequest.endDate);

      await employee.decrement('remainingHolidays', { by: updatedTotalDaysRequested });

      return null;
    }

    return errorMessage;
  } catch (error) {
    console.error("Error retrieving request by ID:", error);
    throw error;
  }
}

async function getArrayRequestsByEmployeeId(employeeId: number) {
  try {
    const requests = await holidayRequest.findAll({
      where: {
        employeeId: employeeId
      }
    });
    return requests;
  } catch (error) {
    console.error('Error retrieving employee requests:', error);
    throw error;
  }
}


export const holidayRequestController = {
  getAll, add, updateStatus, deleteRequest, getArrayPendingRequestsByEmployeeId, updateRequest, getArrayRequestsByEmployeeId
}
