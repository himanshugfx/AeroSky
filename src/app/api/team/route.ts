import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate access ID in format ASK-XXXX
function generateAccessId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "ASK-";
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// GET all team members
export async function GET() {
    try {
        const teamMembers = await prisma.teamMember.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(teamMembers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}

// POST create team member
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, phone, email, position } = body;

        const teamMember = await prisma.teamMember.create({
            data: {
                accessId: generateAccessId(),
                name,
                phone,
                email,
                position,
            },
        });

        return NextResponse.json(teamMember, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
    }
}
