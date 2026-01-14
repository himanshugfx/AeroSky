import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST upload files for a drone
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { uploadType, files, label } = body;

        // Delete existing uploads of this type (for single file types like training_manual)
        const singleFileTypes = ["training_manual", "system_design"];
        if (singleFileTypes.includes(uploadType)) {
            await prisma.droneUpload.deleteMany({
                where: { droneId: id, uploadType },
            });
        }

        // For array types, delete all existing and re-add
        const arrayTypes = [
            "infrastructure_manufacturing",
            "infrastructure_testing",
            "infrastructure_office",
            "regulatory_display",
            "hardware_security",
        ];
        if (arrayTypes.includes(uploadType)) {
            await prisma.droneUpload.deleteMany({
                where: { droneId: id, uploadType },
            });
        }

        // Create new uploads
        if (Array.isArray(files)) {
            await prisma.droneUpload.createMany({
                data: files.map((fileData: string) => ({
                    droneId: id,
                    uploadType,
                    fileData,
                    label: label || null,
                })),
            });
        } else if (files) {
            await prisma.droneUpload.create({
                data: {
                    droneId: id,
                    uploadType,
                    fileData: files,
                    label: label || null,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error uploading files:", error);
        return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
    }
}
