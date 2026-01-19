import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            contractNumber,
            clientName,
            clientSegment,
            orderDate,
            estimatedCompletionDate,
            contractValue,
            currency,
            revenueRecognitionStatus,
            droneModel,
            droneType,
            weightClass,
            payloadConfiguration,
            flightEnduranceRequirements,
            softwareAiTier,
            dgcaFaaCertificationStatus,
            uin,
            exportLicenseStatus,
            geofencingRequirements,
            bomReadiness,
            manufacturingStage,
            calibrationTestLogs,
            afterSalesAmc,
        } = body;

        // Validate required fields
        if (!contractNumber || !clientName || !clientSegment || !orderDate || !contractValue || !droneModel || !droneType || !weightClass) {
            return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
        }

        const order = await prisma.order.create({
            data: {
                contractNumber,
                clientName,
                clientSegment,
                orderDate: new Date(orderDate),
                estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate) : null,
                contractValue: parseFloat(contractValue),
                currency: currency || 'INR',
                revenueRecognitionStatus: revenueRecognitionStatus || 'Pending',
                droneModel,
                droneType,
                weightClass,
                payloadConfiguration,
                flightEnduranceRequirements,
                softwareAiTier,
                dgcaFaaCertificationStatus: dgcaFaaCertificationStatus || 'Pending',
                uin,
                exportLicenseStatus,
                geofencingRequirements,
                bomReadiness: bomReadiness || 'Not Ready',
                manufacturingStage: manufacturingStage || 'In Design',
                calibrationTestLogs,
                afterSalesAmc,
                cocData: body.cocData,
            },
        });

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Failed to create order:', error);
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'Contract number already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
