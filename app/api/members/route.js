import { NextResponse } from 'next/server';
import { getMembers, createMember, deleteMember } from '@/lib/data';

export async function GET() {
    return NextResponse.json(getMembers());
}

export async function POST(request) {
    const data = await request.json();
    const member = createMember(data);
    return NextResponse.json(member);
}

export async function DELETE(request) {
    const { id } = await request.json();
    deleteMember(id);
    return NextResponse.json({ success: true });
}