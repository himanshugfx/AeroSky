import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT update team member
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, phone, email, position } = body;

        const teamMember = await prisma.teamMember.update({
            where: { id },
            data: { name, phone, email, position },
        });

        return NextResponse.json(teamMember);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
    }
}

// DELETE team member
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.teamMember.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
    }
}
