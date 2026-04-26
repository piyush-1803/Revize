import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { CheckCircle, AlertCircle, ChevronRight, Plus, X, ListPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { format, isToday, isBefore, startOfDay, addDays } from 'date-fns';

export const TodayScreen: React.FC = () => {
  const navigate = useNavigate();
  const { topics, subjects, loading, addTopic, addSubject } = useData();
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', subjectName: '', description: '' });

  const today = startOfDay(new Date());
  
  const todayTasks = topics.filter(t => {
    if (!t.nextRevisionDate) return false;
    const nextDate = startOfDay(new Date(t.nextRevisionDate));
    return isToday(nextDate) || isBefore(nextDate, today);
  });

  const completedToday = todayTasks.filter(t => {
    if (!t.lastRevised) return false;
    return isToday(new Date(t.lastRevised));
  }).length;

  const totalCount = todayTasks.length;
  const percentage = totalCount > 0 ? Math.round((completedToday / totalCount) * 100) : 0;

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.name || !newTopic.subjectName) return;

    // Check if subject exists
    let subjectId = '';
    const existingSubject = subjects.find(
      s => s.name.toLowerCase() === newTopic.subjectName.trim().toLowerCase()
    );

    if (existingSubject) {
      subjectId = existingSubject.id;
    } else {
      // Create new subject
      const subjectDoc = await addSubject({
        name: newTopic.subjectName.trim(),
        color: '#6366f1' // Default primary
      });
      if (subjectDoc) {
        subjectId = subjectDoc;
      }
    }

    if (subjectId) {
      console.log("Creating topic with subjectId:", subjectId);
      await addTopic({
        name: newTopic.name.trim(),
        subjectId: subjectId,
        description: newTopic.description,
        status: 'ACTIVE',
        difficulty: 'Medium',
        nextRevisionDate: new Date().toISOString()
      });
    }

    setIsAddingTopic(false);
    setNewTopic({ name: '', subjectName: '', description: '' });
  };

  const upcomingDays = Array.from({ length: 5 }).map((_, i) => {
    const d = addDays(new Date(), i + 1);
    const count = topics.filter(t => {
      if (!t.nextRevisionDate) return false;
      return isToday(addDays(startOfDay(new Date(t.nextRevisionDate)), -(i + 1)));
    }).length;
    
    return {
      label: format(d, 'EEE'),
      day: d.getDate(),
      count
    };
  });

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 py-4"
    >
      {/* Progress Header */}
      <section className="flex items-center justify-between bento-card p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Today's Revisions</h2>
          <p className="text-sm font-medium text-zinc-400">
            {totalCount > 0 
              ? `You're almost there! ${completedToday} of ${totalCount} topics done.`
              : "No revisions scheduled for today. Great job!"}
          </p>
        </div>
        
        <div className="relative flex items-center justify-center w-[80px] h-[80px]">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle 
              className="text-zinc-800 stroke-current" 
              cx="50" cy="50" fill="transparent" r="40" strokeWidth="10" 
            />
            {totalCount > 0 && (
              <circle 
                className="progress-ring__circle stroke-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                cx="50" cy="50" fill="transparent" r="40" strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (percentage / 100))} 
                strokeLinecap="round"
              />
            )}
          </svg>
          <span className="absolute text-sm font-bold text-white">{percentage}%</span>
        </div>
      </section>

      {/* Task List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-widest text-[11px]">Your Modules</h3>
          <button 
            onClick={() => navigate('/topics')}
            className="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-primary-container transition-colors"
          >
            Manage All
          </button>
        </div>

        <div className="space-y-4">
          {todayTasks.length === 0 ? (
            <div className="bento-card p-12 text-center flex flex-col items-center gap-4 opacity-50">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">All clear for now</p>
            </div>
          ) : todayTasks.map(topic => {
            const subject = subjects.find(s => s.id === topic.subjectId);
            const isCompleted = topic.lastRevised && isToday(new Date(topic.lastRevised));
            const isOverdue = !isCompleted && isBefore(startOfDay(new Date(topic.nextRevisionDate)), today);

            return (
              <div 
                key={topic.id}
                onClick={() => navigate(`/topic/${topic.id}`)}
                className={cn(
                  "group flex items-center gap-4 bento-card p-5 border-l-4 cursor-pointer transition-all",
                  isCompleted ? "opacity-60 grayscale" : "opacity-100",
                  subject?.color ? `border-l-[${subject.color}]` : "border-l-primary"
                )}
                style={{ borderLeftColor: subject?.color || '#6366f1' }}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tighter",
                      isOverdue ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"
                    )}>
                      {subject?.name || 'Unknown'} {isOverdue && '• Overdue'}
                    </span>
                  </div>
                  <h4 className={cn("text-xl font-bold tracking-tight", isCompleted ? "text-zinc-400 line-through" : "text-white")}>
                    {topic.name}
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-emerald-500 fill-current opacity-80" />
                  ) : isOverdue ? (
                    <AlertCircle className="w-6 h-6 text-red-500 fill-current opacity-80" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-zinc-700 group-hover:border-zinc-500 transition-colors" />
                  )}
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Next 5 Days Preview */}
      <section className="space-y-4">
        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-2">Coming Up</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
          {upcomingDays.map((day, ix) => (
            <div 
              key={ix}
              onClick={() => navigate('/upcoming')}
              className="flex-shrink-0 w-28 bento-card p-4 flex flex-col items-center text-center space-y-1 hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tighter">{day.label}</span>
              <span className="text-2xl font-bold text-white tracking-tight">{day.count}</span>
              <span className="text-[10px] font-bold text-zinc-600 uppercase">topics</span>
            </div>
          ))}
        </div>
      </section>

      {/* Add Topic Modal */}
      <AnimatePresence>
        {isAddingTopic && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingTopic(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:bottom-10 md:left-1/2 md:-translate-x-1/2 md:w-[500px] bg-background border-t border-x border-outline/30 rounded-t-[3rem] md:rounded-[2.5rem] z-[101] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-y-auto no-scrollbar p-8 flex flex-col max-h-[95vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">New Topic</h2>
                <button 
                  onClick={() => setIsAddingTopic(false)}
                  className="p-3 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTopic} className="space-y-8 flex-1">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Topic Name</label>
                    <input 
                      required
                      className="w-full h-16 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 font-bold text-white outline-none focus:border-primary transition-all placeholder:text-zinc-700" 
                      placeholder="e.g., Quantum Mechanics"
                      value={newTopic.name}
                      onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Subject (Module)</label>
                    <input 
                      required
                      className="w-full h-16 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 font-bold text-white outline-none focus:border-primary transition-all placeholder:text-zinc-700" 
                      placeholder="e.g., Chemistry or Biology"
                      value={newTopic.subjectName}
                      onChange={(e) => setNewTopic({ ...newTopic, subjectName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Description (Optional)</label>
                    <textarea 
                      className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 font-medium text-white outline-none focus:border-primary transition-all placeholder:text-zinc-700 resize-none" 
                      placeholder="Brief overview..."
                      value={newTopic.description}
                      onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 mt-auto"
                  >
                    <ListPlus className="w-6 h-6" />
                    Save Topic
                  </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
