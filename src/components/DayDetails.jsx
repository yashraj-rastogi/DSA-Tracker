import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, Save } from 'lucide-react';

const DayDetails = ({
    dateStr,
    onClose,
    note,
    todos,
    onUpdateNote,
    onAddTodo,
    onToggleTodo,
    onDeleteTodo
}) => {
    // Local state for note editing
    const [localNote, setLocalNote] = useState(note || '');
    const [todoInput, setTodoInput] = useState('');

    useEffect(() => {
        setLocalNote(note || '');
    }, [note]);

    const handleSaveNote = () => {
        onUpdateNote(dateStr, localNote);
    };

    const handleAddTodo = (e) => {
        e.preventDefault();
        if (!todoInput.trim()) return;
        onAddTodo(dateStr, todoInput);
        setTodoInput('');
    };

    // Format date nicely
    const dateObj = new Date(dateStr);
    // Correct for timezone off-by-one by treating the string as local date components
    // Actually the dateStr is YYYY-MM-DD. creating "new Date(dateStr)" creates a UTC date at midnight.
    // If we display it with toLocaleDateString in local time, it might show previous day.
    // We should treat it as local.
    const [y, m, d] = dateStr.split('-').map(Number);
    const displayDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-[#1e293b] w-full max-w-lg rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
                    <h3 className="text-xl font-bold text-slate-100">
                        {displayDate}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-0 overflow-y-auto max-h-[70vh]">
                    {/* To-Do Section */}
                    <div className="p-6 border-b border-slate-700/50">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">To-Do List</h4>

                        <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={todoInput}
                                onChange={e => setTodoInput(e.target.value)}
                                placeholder="Add a new task..."
                                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors text-sm"
                            />
                            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                                <Plus size={20} />
                            </button>
                        </form>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {todos && todos.length > 0 ? (
                                todos.map(todo => (
                                    <div key={todo.id} className="group flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600 transition-all">
                                        <button
                                            onClick={() => onToggleTodo(dateStr, todo.id)}
                                            className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${todo.completed
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-slate-500 text-transparent hover:border-orange-400'
                                                }`}
                                        >
                                            <Check size={14} strokeWidth={3} />
                                        </button>
                                        <span className={`flex-1 text-sm leading-relaxed ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                            {todo.text}
                                        </span>
                                        <button
                                            onClick={() => onDeleteTodo(dateStr, todo.id)}
                                            className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-600 italic text-sm border-2 border-dashed border-slate-800 rounded-lg">
                                    No tasks for this day
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Notes</h4>
                            {localNote !== note && (
                                <span className="text-xs text-orange-400 font-medium animate-pulse">
                                    Unsaved changes...
                                </span>
                            )}
                        </div>
                        <textarea
                            value={localNote}
                            onChange={e => setLocalNote(e.target.value)}
                            onBlur={handleSaveNote}
                            placeholder="Write your thoughts, learnings, or reminders separately..."
                            className="w-full h-40 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none leading-relaxed text-sm"
                        />
                        <p className="mt-2 text-xs text-slate-500 text-right">
                            Click outside to save note automatically
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayDetails;
