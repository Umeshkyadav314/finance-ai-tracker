import { MongoClient, type Db, type Collection } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined
}

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error("MONGODB_URI is not set")
}

let client: MongoClient
if (!global.__mongoClient) {
  client = new MongoClient(uri, {})
  global.__mongoClient = client
} else {
  client = global.__mongoClient
}

export async function getDb(): Promise<Db> {
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

export async function usersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDb()
  return db.collection<UserDoc>("users")
}

export async function transactionsCollection(): Promise<Collection<TransactionDoc>> {
  const db = await getDb()
  return db.collection<TransactionDoc>("transactions")
}
