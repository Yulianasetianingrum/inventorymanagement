"use client";

import { useState, useEffect } from "react";

export function HistoryPopup({ isOpen, onClose, targetUser }: { isOpen: boolean, onClose: () => void, targetUser: any }) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && targetUser?.id) {
            setLoading(true);
            fetch(`/api/admin/audit/activity/${targetUser.id}`)
                .then(res => res.json())
                .then(json => setHistory(json.data || []))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, targetUser]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-[24px]">
                    <div>
                        <h3 className="text-lg font-black text-navy">{targetUser?.name}</h3>
                        <p className="text-xs font-bold text-navy/40 uppercase tracking-widest">{targetUser?.employeeId}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-black text-gray-500 transition-colors">×</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="py-10 flex justify-center">
                            <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {history.length > 0 ? history.map((log: any, idx: number) => (
                                <div key={idx} className="relative pl-6 border-l-2 border-dashed border-gray-200 last:border-0 pb-1">
                                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gold border-2 border-white ring-1 ring-gray-100"></div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="text-[10px] font-black bg-navy/5 text-navy px-2 py-0.5 rounded uppercase tracking-wider">
                                            {log.action}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {new Date(log.createdAt).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-navy/80">{log.detail}</p>
                                    {log.metaJson && (
                                        <pre className="mt-2 text-[9px] bg-gray-50 p-2 rounded border border-gray-100 text-gray-500 overflow-x-auto">
                                            {log.metaJson}
                                        </pre>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-10 text-gray-400 text-xs font-bold italic">Belum ada riwayat aktivitas.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
