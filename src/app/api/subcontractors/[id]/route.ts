import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PUT update subcontractor
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { companyName, type, contactPerson, contactEmail, contactPhone, agreementDate } = body;

        const subcontractor = await prisma.subcontractor.update({
            where: { id },
            data: { companyName, type, contactPerson, contactEmail, contactPhone, agreementDate },
        });

        return NextResponse.json(subcontractor);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update subcontractor" }, { status: 500 });
    }
}

// DELETE subcontractor
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.subcontractor.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete subcontractor" }, { status: 500 });
    }
}
