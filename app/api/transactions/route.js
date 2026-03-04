import { NextResponse } from 'next/server';
import { getTransactions, createTransaction } from '@/lib/data';

export async function GET() {
    // Added await for cloud database
    return NextResponse.json(await getTransactions());
}

export async function POST(request) {
    const data = await request.json();
    // Added await for cloud database
    const transaction = await createTransaction(data);
    return NextResponse.json(transaction);
}