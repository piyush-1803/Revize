import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Beaker, BarChart3, CheckCircle2, XCircle, FileText, Image as ImageIcon, ExternalLink, Calendar, CheckSquare, PauseCircle, Edit2, MoreVertical, ArrowLeft, Plus, Trash2, Save, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useData } from '../contexts/DataContext';
import { format, addDays } from 'date-fns';

export const TopicDetailScreen: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { topics, subjects, updateTopic, deleteTopic, loading } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', description: '', difficulty: '' });

    const topic = topics.find(t => t.id === id);
    const subject = topic ? subjects.find(s => s.id === topic.subjectId) : null;

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (loading) return null;
    if (!topic) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                Topic not found
            </div>
        );
    }

    const handleRevise = async () => {
        const streak = topic.streak || 0;
        const intervals = [1, 3, 7, 21, 30];
        const nextInterval = intervals[Math.min(streak, intervals.length - 1)];
        
        const nextDate = addDays(new Date(), nextInterval);
        
        const historyRecord = {
            date: new Date().toISOString(),
            status: 'COMPLETED' as const
        };

        await updateTopic(topic.id, {
            streak: streak + 1,
            lastRevised: new Date().toISOString(),
            nextRevisionDate: nextDate.toISOString(),
            history: [...(topic.history || []), historyRecord]
        });

        navigate('/today');
    };

    const handlePause = async () => {
        await updateTopic(topic.id, {
            status: topic.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED'
        });
    };

    const handleDelete = async () => {
        await deleteTopic(topic.id);
        navigate('/topics');
    };

    const startEditing = () => {
        setEditData({ name: topic.name, description: topic.description || '', difficulty: topic.difficulty || 'Medium' });
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        await updateTopic(topic.id, editData);
        setIsEditing(false);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pb-48"
        >
            <header className="sticky top-0 z-40 w-full flex items-center justify-between px-4 h-16 bg-background/80 backdrop-blur-md border-b border-outline/30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    {!showDeleteConfirm && <h1 className="text-xl font-bold tracking-tight uppercase text-white truncate max-w-[200px]">{topic.name}</h1>}
                </div>
                
                {showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mr-2 animate-pulse">Delete?</span>
                        <button 
                            onClick={() => setShowDeleteConfirm(false)} 
                            className="px-3 py-1 bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
                        >
                            No
                        </button>
                        <button 
                            onClick={handleDelete} 
                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest"
                        >
                            Yes
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setShowDeleteConfirm(true)} className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-red-500">
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </header>

            <main className="p-6 space-y-10">
                {/* Metadata Bento */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 bento-card p-6">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Subject</span>
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${subject?.color}20` || 'rgba(99,102,241,0.2)' }}
                            >
                                <Beaker className="w-6 h-6" style={{ color: subject?.color || '#6366f1' }} />
                            </div>
                            <p className="text-xl font-bold text-white tracking-tight">{subject?.name}</p>
                        </div>
                    </div>
                    <div className="bento-card p-5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Status</span>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", topic.status === 'ACTIVE' ? "bg-emerald-500" : "bg-amber-500")}></div>
                            <p className="font-bold text-white tracking-tight uppercase text-sm">{topic.status}</p>
                        </div>
                    </div>
                    <div className="bento-card p-5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Streak</span>
                        <p className="font-bold text-white text-sm tracking-tight">{topic.streak} revisions</p>
                    </div>
                </section>

                {topic.description && (
                  <section className="bento-card p-6">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block italic">Core Module Concept</span>
                    <p className="text-zinc-300 font-medium leading-relaxed italic">{topic.description}</p>
                  </section>
                )}

                {/* Revision History */}
                <section>
                    <h2 className="text-sm font-bold mb-5 flex items-center gap-2 text-zinc-400 uppercase tracking-widest">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Revision History
                    </h2>
                    
                    <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                        {topic.history && topic.history.length > 0 ? [...topic.history].reverse().map((item, i) => (
                            <div key={i} className="flex-shrink-0 flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-5 py-3 rounded-2xl transition-all">
                                {item.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                <span className={cn("text-xs font-bold", item.status === 'COMPLETED' ? "text-white" : "text-zinc-500")}>
                                  {format(new Date(item.date), 'MMM d')}
                                </span>
                            </div>
                        )) : (
                            <p className="text-zinc-600 text-sm font-bold italic px-2">No history archives found.</p>
                        )}
                    </div>
                </section>

                {/* Attachments */}
                <section>
                    <div className="flex justify-between items-center mb-5 px-1">
                        <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-400 uppercase tracking-widest">
                            <Plus className="w-4 h-4 text-primary" />
                            Attachments
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {topic.attachments && topic.attachments.length > 0 ? topic.attachments.map((a, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bento-card hover:bg-zinc-800 transition-all cursor-pointer group">
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                        {a.type === 'NOTE' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                    </div>
                                    <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">{a.name}</p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        )) : (
                            <div className="p-8 text-center bento-card border-dashed border-2 border-zinc-800 opacity-60">
                                <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 italic">No nodes attached</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Next Dates */}
                <section>
                    <h2 className="text-sm font-bold mb-5 flex items-center gap-2 text-zinc-400 uppercase tracking-widest">
                        <Calendar className="w-4 h-4 text-primary" />
                        Next Dates
                    </h2>
                    <div className="bento-card overflow-hidden divide-y divide-zinc-800/50">
                        <div className="flex items-center justify-between px-6 py-5 hover:bg-zinc-800/30 transition-colors">
                            <span className="font-bold text-white">{format(new Date(topic.nextRevisionDate), 'PPP')}</span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] italic">Current Goal</span>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="fixed bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-xl border border-outline/50 p-5 z-50 rounded-3xl shadow-2xl">
                <div className="max-w-md mx-auto flex flex-col gap-4">
                    <button 
                        onClick={handleRevise}
                        className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-primary-container uppercase tracking-widest text-sm"
                    >
                        <CheckSquare className="w-5 h-5" />
                        Mark as Revised
                    </button>
                    <div className="flex gap-4">
                        <button 
                            onClick={handlePause}
                            className="flex-1 border border-zinc-800 text-zinc-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-white transition-all text-xs uppercase tracking-widest"
                        >
                            <PauseCircle className="w-5 h-5" />
                            {topic.status === 'PAUSED' ? 'Resume' : 'Pause'}
                        </button>
                        <button 
                          onClick={startEditing}
                          className="flex-1 border border-zinc-800 text-zinc-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-white transition-all text-xs uppercase tracking-widest"
                        >
                            <Edit2 className="w-5 h-5" />
                            Edit
                        </button>
                    </div>
                </div>
            </footer>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditing(false)}
                            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
                        />
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed inset-x-4 bottom-10 md:inset-auto md:w-[500px] md:left-1/2 md:-translate-x-1/2 bg-surface border border-outline/30 rounded-[2.5rem] z-[101] shadow-2xl p-8 space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">Refine Module</h1>
                                <button onClick={() => setIsEditing(false)} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic ml-1">Title</label>
                                    <input 
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary transition-all"
                                        value={editData.name}
                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic ml-1">Concept Overview</label>
                                    <textarea 
                                        className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white font-medium outline-none focus:border-primary transition-all resize-none"
                                        value={editData.description}
                                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic ml-1">Difficulty</label>
                                    <select 
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary transition-all appearance-none"
                                        value={editData.difficulty}
                                        onChange={(e) => setEditData({...editData, difficulty: e.target.value})}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                onClick={handleSaveEdit}
                                className="w-full bg-primary text-white font-bold py-5 rounded-3xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm"
                            >
                                <Save className="w-5 h-5" />
                                Commit Changes
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
