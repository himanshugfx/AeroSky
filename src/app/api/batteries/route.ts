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
        const batteries = await prisma.battery.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(batteries);
    } catch (error) {
        console.error('Failed to fetch batteries:', error);
        return NextResponse.json({ error: 'Failed to fetch batteries' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { model, ratedCapacity, batteryNumberA, batteryNumberB } = body;

        if (!model || !ratedCapacity || !batteryNumberA || !batteryNumberB) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const battery = await prisma.battery.create({
            data: {
                model,
                ratedCapacity,
                batteryNumberA,
                batteryNumberB,
            },
        });

        return NextResponse.json(battery);
    } catch (error) {
        console.error('Failed to create battery:', error);
        return NextResponse.json({ error: 'Failed to create battery' }, { status: 500 });
    }
}
