import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: params.id },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Failed to fetch order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Convert dates if present
        if (body.orderDate) {
            body.orderDate = new Date(body.orderDate);
        }
        if (body.estimatedCompletionDate) {
            body.estimatedCompletionDate = new Date(body.estimatedCompletionDate);
        }
        if (body.contractValue) {
            body.contractValue = parseFloat(body.contractValue);
        }

        const order = await prisma.order.update({
            where: { id: params.id },
            data: body,
        });

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Failed to update order:', error);
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'Contract number already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.order.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete order:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
