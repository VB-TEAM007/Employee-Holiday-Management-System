import dotenv from 'dotenv';
import mongoDB from 'mongodb';
import { MongoClient } from 'mongodb';

export const collections: { 
    employee?: mongoDB.Collection,
    requests?: mongoDB.Collection,
} = {}

export async function connectToDatabase () {
    dotenv.config();
    const client: mongoDB.MongoClient = new MongoClient(process.env.DB_CONN_STRING!);
    await client.connect();        
    const db: mongoDB.Db = client.db(process.env.DB_NAME);
    const employeeCollection: mongoDB.Collection = db.collection(process.env.EMPLOYEE_COLLECTION_NAME!);
    collections.employee = employeeCollection;
    const requestCollection: mongoDB.Collection = db.collection(process.env.REQUESTS_COLLECTION_NAME!);
    collections.requests = requestCollection;
    console.log(`Successfully connected to database: ${db.databaseName}`);
 }