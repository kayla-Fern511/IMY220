import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
let client;
let db;

async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI environment variable is missing.');
    }
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('BookSnaps');
    console.log('Connected to MongoDB (BookSnaps)');
}

function getDB() {
    if (!db) {
        throw new Error('Database not connected. Call connectDB first.');
    }
    return db;
}

export { connectDB, getDB };
