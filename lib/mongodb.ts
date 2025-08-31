import { MongoClient, type Db, type Collection } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined
}

const uri = process.env.MONGODB_URI
if (!uri) {
  console.warn("MONGODB_URI is not set - MongoDB features will be disabled")
}

let client: MongoClient | null = null
if (uri) {
  if (!global.__mongoClient) {
    client = new MongoClient(uri, {})
    global.__mongoClient = client
  } else {
    client = global.__mongoClient
  }
}

export async function getDb(): Promise<Db> {
  if (!client) {
    throw new Error("MongoDB client not initialized. Please set MONGODB_URI environment variable.")
  }
  // Next.js accommodates this check; connect once
  // @ts-expect-error topology shape differs by driver versions
  if (!client.topology || !client.topology.isConnected?.()) {
    await client.connect()
  }
  return client.db()
}

export type UserDoc = {
  _id: string
  email: string
  name?: string
  image?: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

export type TransactionDoc = {
  _id: string
  userId: string
  amount: number
  currency: string
  type: "INCOME" | "EXPENSE"
  category: string
  description?: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

export async function usersCollection(): Promise<Collection<UserDoc> | null> {
  if (!client) {
    console.warn("MongoDB not available - users collection not accessible")
    return null
  }
  const db = await getDb()
  return db.collection<UserDoc>("users")
}

export async function transactionsCollection(): Promise<Collection<TransactionDoc> | null> {
  if (!client) {
    console.warn("MongoDB not available - transactions collection not accessible")
    return null
  }
  const db = await getDb()
  return db.collection<TransactionDoc>("transactions")
}
