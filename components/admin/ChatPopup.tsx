"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type ChatPopupProps = {
    isOpen: boolean;
    onClose: () => void;
    targetUser: {
        id: string;
        name: string;
        employeeId: string;
        role?: string;
    };
    currentUser: {
        id: string; // our user id (sender)
    };
};

export function ChatPopup({ isOpen, onClose, targetUser, currentUser }: ChatPopupProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000); // Polling every 3s
            return () => clearInterval(interval);
        }
    }, [isOpen, targetUser.id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function fetchMessages() {
        try {
            const res = await fetch(`/api/messages?targetUserId=${targetUser.id}`);
            const json = await res.json();
            if (res.ok) {
                setMessages(json.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Optimistic UI update
        const tempMsg = {
            id: "temp-" + Date.now(),
            content: newMessage,
            senderId: currentUser.id,
            createdAt: new Date().toISOString(),
            sender: { name: "Me" }
        };
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage("");

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverId: targetUser.id,
                    content: tempMsg.content
                })
            });
            if (res.ok) {
                fetchMessages(); // Sync
            }
        } catch (err) {
            alert("Gagal mengirim pesan");
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-navy/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="bg-navy p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs uppercase border border-white/20">
                            {targetUser.name[0]}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-navy rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight">{targetUser.name}</h3>
                        <div className="text-[10px] text-white/60 font-medium">{targetUser.employeeId}</div>
                    </div>
                </div>
                <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 h-80 overflow-y-auto p-4 bg-off-white space-y-3">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <div className="text-4xl mb-2">💬</div>
                        <div className="text-xs font-bold text-navy uppercase tracking-widest">Mulai Percakapan</div>
                    </div>
                ) : (
                    messages.map((m) => {
                        const isMe = m.senderId === currentUser.id;
                        return (
                            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs font-medium ${isMe ? 'bg-navy text-white rounded-br-none' : 'bg-white border border-navy/5 text-navy rounded-bl-none shadow-sm'}`}>
                                    {m.content}
                                    <div className={`text-[8px] mt-1 text-right ${isMe ? 'text-white/40' : 'text-navy/30'}`}>
                                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef}></div>
            </div>

            {/* Footer */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-navy/5 flex gap-2">
                <input
                    className="flex-1 bg-off-white rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-navy/10"
                    placeholder="Ketik pesan..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 bg-gold text-navy rounded-xl flex items-center justify-center hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold shadow-lg shadow-gold/20">
                    ➤
                </button>
            </form>
        </div>
    );
}
