import React, { useMemo } from 'react';
import { X, Calendar, CheckSquare, FileText, ArrowRight } from 'lucide-react';

const NoteHistory = ({
    data,
    onClose,
    onSelectDate
}) => {
    // Combine and sort dates that have either notes or todos
    const historyItems = useMemo(() => {
        const dates = new Set([
            ...Object.keys(data.dailyNotes || {}),
            ...Object.keys(data.dailyTodos || {})
        ]);

        return Array.from(dates)
            .sort((a, b) => new Date(b) - new Date(a)) // Newest first
            .map(dateStr => {
                const note = data.dailyNotes?.[dateStr] || '';
                const todos = data.dailyTodos?.[dateStr] || [];
                const completedTodos = todos.filter(t => t.completed).length;

                // Format date
                const dateObj = new Date(dateStr);
                const [y, m, d] = dateStr.split('-').map(Number);
                const displayDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });

                return {
                    dateStr,
                    displayDate,
                    notePreview: note.length > 60 ? note.substring(0, 60) + '...' : note,
                    todoCount: todos.length,
                    completedTodos,
                    hasNote: !!note
                };
            });
    }, [data.dailyNotes, data.dailyTodos]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="text-orange-400" />
                        Notes & Tasks History
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {historyItems.length > 0 ? (
                        historyItems.map((item) => (
                            <div
                                key={item.dateStr}
                                onClick={() => onSelectDate(item.dateStr)}
                                className="group flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-orange-500/30 hover:bg-slate-800/50 transition-all cursor-pointer"
                            >
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-400 group-hover:text-orange-400 transition-colors">
                                    <Calendar size={18} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-200 mb-1">{item.displayDate}</h4>
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        {item.todoCount > 0 && (
                                            <span className="flex items-center gap-1">
                                                <CheckSquare size={12} />
                                                {item.completedTodos}/{item.todoCount} Tasks
                                            </span>
                                        )}
                                        {item.hasNote && (
                                            <span className="truncate max-w-[200px] md:max-w-xs italic text-slate-500">
                                                "{item.notePreview}"
                                            </span>
                                        )}
                                        {!item.todoCount && !item.hasNote && (
                                            <span className="italic opacity-50">Empty entry</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-shrink-0 text-slate-600 group-hover:text-orange-400 transform group-hover:translate-x-1 transition-all">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <p>No notes or tasks found in history.</p>
                            <p className="text-sm mt-2">Start adding daily plans from the calendar!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteHistory;
