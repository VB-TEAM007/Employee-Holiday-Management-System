import { ObjectId } from "mongodb";

export default interface Employee {
    username: string,
    remainingHolidays: number,
    hash: string,
    salt: string,
    role: 'employee' | 'admin';
    _id: ObjectId,
}
