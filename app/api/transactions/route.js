import { NextResponse } from 'next/server';
import { getTransactions, createTransaction } from '@/lib/data';

export async function GET() {
    return NextResponse.json(getTransactions());
}

export async function POST(request) {
    const data = await request.json();
    const transaction = createTransaction(data);
    return NextResponse.json(transaction);
}