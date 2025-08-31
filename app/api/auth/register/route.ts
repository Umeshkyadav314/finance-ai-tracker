import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { usersCollection } from "@/lib/mongodb"
import { z } from "zod"

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const parsed = registerSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0].message },
                { status: 400 }
            )
        }

        const { name, email, password } = parsed.data

        const users = await usersCollection()
        if (!users) {
            return NextResponse.json(
                { error: "Database not available" },
                { status: 503 }
            )
        }

        // Check if user already exists
        const existingUser = await users.findOne({ email })
        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = {
            name,
            email,
            password: hashedPassword,
            image: "",
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const result = await users.insertOne(user as any)

        return NextResponse.json(
            {
                message: "User created successfully",
                userId: result.insertedId
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
