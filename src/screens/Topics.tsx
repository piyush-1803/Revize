import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, Play, Plus, X, ListPlus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { formatDistanceToNow, isToday, isBefore } from 'date-fns';

export const TopicsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { topics, subjects, loading, addTopic, addSubject } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', subjectName: '', description: '' });

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubjectId ? t.subjectId === selectedSubjectId : true;
    return matchesSearch && matchesSubject;
  });

  const topicsBySubject = subjects.map(s => ({
    ...s,
    topics: filteredTopics.filter(t => t.subjectId === s.id)
  })).filter(s => s.topics.length > 0 || !searchTerm);

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

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 px-1 py-4"
    >
      <section className="mb-10">
        <div className="relative w-full mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input 
            className="w-full h-14 pl-14 pr-6 bg-surface/50 border border-outline/30 rounded-2xl text-sm font-medium text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-zinc-600" 
            placeholder="Search your topics..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
           <button 
             onClick={() => setSelectedSubjectId(null)}
             className={cn(
               "px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all",
               !selectedSubjectId ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface border border-outline/50 text-zinc-400 hover:text-white"
             )}
           >
             All
           </button>
           {subjects.map(s => (
             <button 
               key={s.id} 
               onClick={() => setSelectedSubjectId(s.id)}
               className={cn(
                 "px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all",
                 selectedSubjectId === s.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-surface border border-outline/50 text-zinc-400 hover:text-white"
               )}
             >
               {s.name}
             </button>
           ))}
        </div>
      </section>

      <div className="space-y-8">
        {topicsBySubject.map((s, idx) => (
          <details key={s.id} className="group" open={idx === 0 || !!searchTerm}>
            <summary className="flex items-center justify-between list-none cursor-pointer py-2 group-active:opacity-70 transition-opacity">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: s.color }}></div>
                <h2 className="text-2xl font-bold text-white tracking-tight uppercase">{s.name}</h2>
                <span className="text-[10px] font-bold text-zinc-500 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 uppercase tracking-[0.2em]">{s.topics.length}</span>
              </div>
              <ChevronDown className="w-6 h-6 transition-transform group-open:rotate-180 text-zinc-500" />
            </summary>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
              {s.topics.length > 0 ? s.topics.map(topic => {
                const nextDate = new Date(topic.nextRevisionDate);
                const isOverdue = isBefore(nextDate, new Date()) && !isToday(nextDate);
                
                return (
                  <div 
                    key={topic.id} 
                    onClick={() => navigate(`/topic/${topic.id}`)}
                    className="bento-card p-6 flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-primary transition-colors">{topic.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isToday(nextDate) || isOverdue ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-primary")}></span>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
                            {isToday(nextDate) ? 'Due Today' : isOverdue ? 'Overdue' : `Next rev: ${formatDistanceToNow(nextDate, { addSuffix: true })}`}
                          </span>
                        </div>
                      </div>
                      <button className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg shadow-primary/20">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Mastery</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5, 6].map(step => (
                          <div key={step} className={cn("w-3 h-1.5 rounded-full transition-all duration-500", step <= topic.streak ? "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "bg-zinc-800")}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full p-12 text-center bento-card border-dashed border-2 flex flex-col items-center gap-4 border-zinc-800">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No matching topics</p>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>

      {/* Add Topic FAB */}
      <button 
        onClick={() => setIsAddingTopic(true)}
        className="fixed right-6 bottom-28 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center hover:bg-primary-container transition-all active:scale-95 z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

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
                    className="w-full h-16 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 font-bold text-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-700" 
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
                  Save Module
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
