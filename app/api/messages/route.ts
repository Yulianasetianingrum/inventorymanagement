import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { encrypt, decrypt } from "@/lib/crypto";

export async function GET(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get("targetUserId");
        // console.log("Fetching messages for", user.id, "target:", targetUserId);

        const whereClause: any = {
            OR: [
                { receiverId: user.id }, // My received messages
                { senderId: user.id }    // My sent messages
            ]
        };

        if (targetUserId) {
            whereClause.AND = [
                {
                    OR: [
                        { senderId: targetUserId },
                        { receiverId: targetUserId }
                    ]
                }
            ];
        }

        const messages = await prisma.message.findMany({
            where: whereClause,
            orderBy: { createdAt: "asc" },
            include: {
                sender: { select: { id: true, name: true, employeeId: true } },
                receiver: { select: { id: true, name: true, employeeId: true } }
            }
        });
        // console.log("Messages found:", messages.length);

        // Decrypt messages before sending to client
        const decryptedMessages = messages.map(msg => {
            try {
                return {
                    ...msg,
                    content: decrypt(msg.content)
                };
            } catch (err) {
                console.error("Map decrypt error", err);
                return msg;
            }
        });

        // Mark as read if I am the receiver
        if (targetUserId) {
            await prisma.message.updateMany({
                where: {
                    senderId: targetUserId,
                    receiverId: user.id,
                    isRead: false
                },
                data: { isRead: true }
            });
        }

        return NextResponse.json({ data: decryptedMessages });
    } catch (error: any) {
        console.error("GET Message Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sender = await prisma.user.findUnique({ where: { employeeId: session.employeeId } });
    if (!sender) return NextResponse.json({ error: "User not found" }, { status: 401 });

    try {
        const body = await req.json();
        const { receiverId, content } = body;

        if (!receiverId || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const encryptedContent = encrypt(content);

        const message = await prisma.message.create({
            data: {
                senderId: sender.id,
                receiverId,
                content: encryptedContent,
            },
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } }
            }
        });

        // Return decrypted content to the sender so UI doesn't break
        return NextResponse.json({
            data: {
                ...message,
                content: content
            }
        });
    } catch (error: any) {
        console.error("Failed to send message", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
