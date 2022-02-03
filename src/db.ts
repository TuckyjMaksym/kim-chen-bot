import { MongoClient, Db, Collection, Document } from 'mongodb';

export const mongo = new MongoClient(process.env.MONGO_CONNECTION_URI);
export let db: Db = null;
export let scores: Collection<Document> = null;
export const connectDb = async () => {
    try {
        // Connect the client to the server
        await mongo.connect();

        // Establish and verify connection
        db = mongo.db('users');
        await db.command({ ping: 1 });
        scores = db.collection('scores');
        console.log('Connected successfully to database');
    } catch (error) {
        console.error('DATABASE ERROR: ', error);
    }
}