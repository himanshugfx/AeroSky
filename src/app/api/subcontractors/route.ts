import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all subcontractors
export async function GET() {
    try {
        const subcontractors = await prisma.subcontractor.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(subcontractors);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch subcontractors" }, { status: 500 });
    }
}

// POST create subcontractor
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { companyName, type, contactPerson, contactEmail, contactPhone, agreementDate } = body;

        const subcontractor = await prisma.subcontractor.create({
            data: {
                companyName,
                type,
                contactPerson,
                contactEmail,
                contactPhone,
                agreementDate,
            },
        });

        return NextResponse.json(subcontractor, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create subcontractor" }, { status: 500 });
    }
}
