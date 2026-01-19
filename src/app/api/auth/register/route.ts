import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, full_name } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username: email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                username: email,
                passwordHash: passwordHash,
            }
        });

        return NextResponse.json({
            id: user.id,
            username: user.username,
            message: "User registered successfully"
        }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
    }
}
