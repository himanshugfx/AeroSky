import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single drone
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const drone = await prisma.drone.findUnique({
            where: { id },
            include: {
                uploads: true,
                accountableManager: true,
                manufacturedUnits: true,
            },
        });

        if (!drone) {
            return NextResponse.json({ error: "Drone not found" }, { status: 404 });
        }

        const uploads = {
            trainingManual: drone.uploads.find((u: any) => u.uploadType === "training_manual")?.fileData,
            infrastructureManufacturing: drone.uploads
                .filter((u: any) => u.uploadType === "infrastructure_manufacturing")
                .map((u: any) => u.fileData),
            infrastructureTesting: drone.uploads
                .filter((u: any) => u.uploadType === "infrastructure_testing")
                .map((u: any) => u.fileData),
            infrastructureOffice: drone.uploads
                .filter((u: any) => u.uploadType === "infrastructure_office")
                .map((u: any) => u.fileData),
            infrastructureOthers: drone.uploads
                .filter((u: any) => u.uploadType === "infrastructure_others")
                .map((u: any) => ({ label: u.label || "", image: u.fileData })),
            regulatoryDisplay: drone.uploads
                .filter((u: any) => u.uploadType === "regulatory_display")
                .map((u: any) => u.fileData),
            systemDesign: drone.uploads.find((u: any) => u.uploadType === "system_design")?.fileData,
            hardwareSecurity: drone.uploads
                .filter((u: any) => u.uploadType === "hardware_security")
                .map((u: any) => u.fileData),
            webPortalLink: drone.webPortalLink,
        };

        return NextResponse.json({
            id: drone.id,
            modelName: drone.modelName,
            uin: drone.uin,
            image: drone.image,
            accountableManagerId: drone.accountableManagerId,
            createdAt: drone.createdAt.toISOString(),
            uploads,
            manufacturedUnits: drone.manufacturedUnits.map((u: any) => u.serialNumber),
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch drone" }, { status: 500 });
    }
}

// PUT update drone
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { modelName, uin, image, accountableManagerId, webPortalLink, manufacturedUnits } = body;

        const drone = await prisma.drone.update({
            where: { id },
            data: {
                modelName,
                uin,
                image,
                accountableManagerId,
                webPortalLink,
                ...(manufacturedUnits && {
                    manufacturedUnits: {
                        deleteMany: {},
                        create: manufacturedUnits.map((sn: string) => ({
                            serialNumber: sn,
                        })),
                    },
                }),
            },
        });

        return NextResponse.json(drone);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update drone" }, { status: 500 });
    }
}

// DELETE drone
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.drone.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete drone" }, { status: 500 });
    }
}
