import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
