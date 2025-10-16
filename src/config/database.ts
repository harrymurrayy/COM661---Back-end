import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

class Database {
  private static instance: Database;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    try {
      const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
      const dbName = process.env.DB_NAME || "com661-db";

      this.client = new MongoClient(uri);
      await this.client.connect();

      this.db = this.client.db(dbName);

      console.log(`✅ Connected to MongoDB: ${dbName}`);

      return this.db;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error("Database not initialized. Call connect() first.");
    }
    return this.db;
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("📪 MongoDB connection closed");
    }
  }
}

export default Database;
