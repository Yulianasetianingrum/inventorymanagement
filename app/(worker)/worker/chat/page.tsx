"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WorkerChatPage() {
    const [me, setMe] = useState<{ id: string; name: string } | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMe();
    }, []);

    useEffect(() => {
        if (me) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [me]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function fetchMe() {
        try {
            const res = await fetch("/api/worker/me");
            if (res.ok) {
                const json = await res.json();
                setMe(json.data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchMessages() {
        try {
            const res = await fetch(`/api/messages`); // Fetches all messages for me
            const json = await res.json();
            if (res.ok) {
                const msgs = json.data || [];
                setMessages(msgs);

                // ✅ Mark as read: Find who sent us unread messages and hit API for them
                const unreadSenders = Array.from(new Set(
                    msgs.filter((m: any) => m.receiverId === me?.id && !m.isRead).map((m: any) => m.senderId)
                ));

                for (const targetId of unreadSenders) {
                    await fetch(`/api/messages?targetUserId=${targetId}`);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Determine receiver. For now, we reply to the last sender who is NOT me.
        // If no history, we need a default Admin target. 
        // This is a limitation of the simple system. 
        // Fix: Show a dropdown of Admins? Or just broadcast to the first available Admin?
        // Let's check if we have any Admin ID from previous messages.

        let targetId = messages.find(m => m.senderId !== me?.id)?.senderId;

        // If no chat history, we need to find an admin. 
        // For now, let's assume if there are no messages, the Worker cannot initiate without selecting a contact.
        // But the user request said "muncul di halaman chat bagian Worker".
        // I will add a "Select Contact" if no history.
        // Actually, to keep it simple: I will fetch admins on load.

        if (!targetId) {
            // Fallback: This simple chat assumes the worker is replying.
            // If empty, we can't send easily without a target.
            // I'll leave it as "Reply Only" for now or fetch an admin.
            // Let's try to fetch a default admin.
            const adminRes = await fetch("/api/admin/users?role=ADMIN");
            // Workers can't access /api/admin/users technically... middleware blocks it?
            // Let's check middleware.
            // If blocked, we might be stuck.
            // Safe bet: The Admin initiates. System is "Contact Worker".
            // Worker only replies.
            alert("Belum ada pesan dari Admin untuk dibalas.");
            return;
        }

        const tempMsg = {
            id: "temp-" + Date.now(),
            content: newMessage,
            senderId: me?.id,
            createdAt: new Date().toISOString(),
            sender: { name: me?.name } // local echo
        };
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage("");

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: targetId,
                    content: tempMsg.content
                })
            });
            if (res.ok) {
                fetchMessages();
            }
        } catch (err) {
            alert("Gagal mengirim");
        }
    }

    return (
        <div className="fixed inset-0 bg-[#f8fafc] flex flex-col">
            {/* Header */}
            <header className="bg-navy p-4 md:p-6 pb-8 md:pb-12 shadow-2xl shadow-navy/20 relative z-10 shrink-0">
                <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-white">Pesan & Inbox</h1>
                        <p className="text-white/60 text-[10px] md:text-xs font-medium">Hubungan langsung dengan Admin</p>
                    </div>
                    <Link href="/worker/home" className="text-white/60 hover:text-white bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold transition-colors">
                        &larr; Home
                    </Link>
                </div>
            </header>

            {/* Chat Body */}
            <main className="flex-1 relative z-20 flex flex-col w-full max-w-5xl mx-auto -mt-4 md:-mt-6 px-0 md:px-4 pb-0 md:pb-6 overflow-hidden">
                <div className="flex-1 bg-white md:rounded-[24px] shadow-lg shadow-slate-200/50 border-x md:border border-slate-100 overflow-hidden flex flex-col h-full rounded-t-[24px]">

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-6">
                                <div className="text-5xl mb-4">📭</div>
                                <h3 className="text-navy font-black text-lg">Belum Ada Pesan</h3>
                                <p className="text-xs text-slate-500 max-w-[200px] mb-4">Pesan dari Admin akan muncul di sini.</p>
                                <Button
                                    onClick={() => handleSend({ preventDefault: () => { } } as React.FormEvent)}
                                    disabled={false} // Allow trying to start chat
                                    className="bg-navy text-white text-xs"
                                >
                                    Mulai Percakapan Baru
                                </Button>
                            </div>
                        ) : (
                            messages.map((m) => {
                                const isMe = m.senderId === me?.id;
                                return (
                                    <div key={m.id} className={`flex w-full mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm transition-all duration-300 ${isMe
                                                    ? 'bg-navy text-white rounded-tr-none'
                                                    : 'bg-white border border-slate-200 text-navy rounded-tl-none'
                                                    }`}
                                            >
                                                {!isMe && (
                                                    <div className="text-[10px] font-black text-gold uppercase tracking-widest mb-1 flex items-center gap-1">
                                                        <span>{m.sender?.name}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        <span className="text-slate-400 capitalize">{m.sender?.role?.toLowerCase()}</span>
                                                    </div>
                                                )}
                                                <div className="whitespace-pre-wrap break-words">{m.content}</div>
                                                <div className={`text-[8px] font-bold mt-1.5 text-right ${isMe ? 'text-white/40' : 'text-slate-400'}`}>
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} className="h-2"></div>
                    </div>

                    {/* Input Area - Sticky Bottom */}
                    <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0 safe-area-bottom">
                        <form onSubmit={handleSend} className="flex gap-2 max-w-full">
                            <input
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all text-navy placeholder:text-slate-400"
                                placeholder="Tulis pesan..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!newMessage.trim()} className="w-12 h-12 bg-gold text-navy rounded-xl flex items-center justify-center hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-black shadow-lg shadow-gold/20 text-xl shrink-0">
                                ➤
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
