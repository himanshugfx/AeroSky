import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Generate sequential access ID (AS001, AS002, etc.)
async function generateSequentialAccessId() {
    // Find the member with the highest ID starting with "AS"
    const lastMember = await prisma.teamMember.findFirst({
        where: {
            accessId: {
                startsWith: "AS",
            },
        },
        orderBy: {
            accessId: "desc",
        },
    });

    if (!lastMember) {
        return "AS001";
    }

    // Extract the number part
    const lastId = lastMember.accessId;
    const numberPart = parseInt(lastId.replace("AS", ""), 10);

    if (isNaN(numberPart)) {
        // Fallback if parsing fails, though shouldn't happen with strict format
        return "AS001";
    }

    const nextNumber = numberPart + 1;
    // Pad with leading zeros (e.g., 1 -> "001", 10 -> "010", 100 -> "100")
    return `AS${nextNumber.toString().padStart(3, "0")}`;
}

// GET all team members
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const teamMembers = await prisma.teamMember.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(teamMembers);
    } catch (error) {
        console.error("Failed to fetch team members:", error);
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}

// POST create team member
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, phone, email, position } = body;

        const newAccessId = await generateSequentialAccessId();

        const teamMember = await prisma.teamMember.create({
            data: {
                accessId: newAccessId,
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
