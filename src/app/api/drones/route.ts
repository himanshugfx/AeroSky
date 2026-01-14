import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all drones with uploads
export async function GET() {
    try {
        const drones = await prisma.drone.findMany({
            include: {
                uploads: true,
                accountableManager: true,
                manufacturedUnits: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Transform uploads to match frontend format
        const transformedDrones = drones.map((drone: any) => {
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

            return {
                id: drone.id,
                modelName: drone.modelName,
                uin: drone.uin,
                image: drone.image,
                accountableManagerId: drone.accountableManagerId,
                createdAt: drone.createdAt.toISOString(),
                uploads,
                manufacturedUnits: drone.manufacturedUnits.map((u: any) => u.serialNumber),
            };
        });

        return NextResponse.json(transformedDrones);
    } catch (error) {
        console.error("Error fetching drones:", error);
        return NextResponse.json({ error: "Failed to fetch drones" }, { status: 500 });
    }
}

// POST create drone
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { modelName, uin, image, manufacturedUnits } = body;

        const drone = await prisma.drone.create({
            data: {
                modelName,
                uin,
                image,
                manufacturedUnits: {
                    create: (manufacturedUnits || []).map((sn: string) => ({
                        serialNumber: sn,
                    })),
                },
            },
            include: {
                manufacturedUnits: true,
            },
        });

        return NextResponse.json({
            id: drone.id,
            modelName: drone.modelName,
            uin: drone.uin,
            image: drone.image,
            accountableManagerId: drone.accountableManagerId,
            createdAt: drone.createdAt.toISOString(),
            manufacturedUnits: drone.manufacturedUnits.map((u: any) => u.serialNumber),
            uploads: {
                infrastructureManufacturing: [],
                infrastructureTesting: [],
                infrastructureOffice: [],
                infrastructureOthers: [],
                regulatoryDisplay: [],
                hardwareSecurity: [],
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating drone:", error);
        return NextResponse.json({ error: "Failed to create drone" }, { status: 500 });
    }
}
