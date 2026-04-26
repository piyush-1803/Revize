import React from 'react';
import { motion } from 'motion/react';
import { Info, AlertTriangle, History, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { startOfDay, isBefore, isToday, format, addDays } from 'date-fns';

export const MissedScreen: React.FC = () => {
    const navigate = useNavigate();
    const { topics, updateTopic, loading } = useData();

    const today = startOfDay(new Date());

    const overdueTopics = topics.filter(t => {
      if (!t.nextRevisionDate || t.status === 'PAUSED') return false;
      const nextDate = startOfDay(new Date(t.nextRevisionDate));
      return isBefore(nextDate, today) && !isToday(nextDate);
    }).sort((a, b) => new Date(a.nextRevisionDate).getTime() - new Date(b.nextRevisionDate).getTime());

    const handleReschedule = async (topicId: string) => {
      await updateTopic(topicId, {
        nextRevisionDate: new Date().toISOString()
      });
    };

    const handleSkip = async (topicId: string, currentStreak: number) => {
      const intervals = [1, 3, 7, 14, 30, 60];
      const nextInterval = intervals[Math.min(currentStreak, intervals.length - 1)];
      const nextDate = addDays(new Date(), nextInterval);

      await updateTopic(topicId, {
        nextRevisionDate: nextDate.toISOString(),
        history: [...(topics.find(t => t.id === topicId)?.history || []), {
          date: new Date().toISOString(),
          status: 'SKIPPED'
        }]
      });
    };

    if (loading) return null;
    
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-32 pt-4 px-1"
        >
            {overdueTopics.length > 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 mb-10 flex gap-5 shadow-2xl shadow-amber-500/5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Info className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                      <p className="text-base font-bold text-amber-200 leading-tight tracking-tight italic uppercase">Catch up time.</p>
                      <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest mt-1">
                        You have {overdueTopics.length} overdue {overdueTopics.length === 1 ? 'task' : 'tasks'} pending.
                      </p>
                  </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-12 mb-10 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <History className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Stay Current</h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2 leading-relaxed">
                      You are completely caught up with your schedule.<br/>No missed revisions!
                    </p>
                  </div>
              </div>
            )}

            <div className="space-y-12">
                {overdueTopics.map((topic, i) => {
                  const nextDate = new Date(topic.nextRevisionDate);
                  const isCritical = i === 0;

                  return (
                    <section key={topic.id}>
                        <div className={cn(
                          "flex items-center gap-3 mb-5 px-2",
                          isCritical ? "text-red-500" : "text-zinc-500"
                        )}>
                            {isCritical ? <AlertTriangle className="w-4 h-4 fill-current" /> : <History className="w-4 h-4 italic" />}
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] italic">
                              {isCritical ? 'Critical Delay' : 'Minor Delay'} • {format(nextDate, 'MMM d')}
                            </h2>
                        </div>

                        <div className="bento-card p-6 overflow-hidden relative group">
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div onClick={() => navigate(`/topic/${topic.id}`)} className="cursor-pointer">
                                    <h3 className="text-xl font-bold text-white tracking-tight leading-tight italic group-hover:text-primary transition-colors">{topic.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]", isCritical ? "bg-red-500" : "bg-zinc-500")}></span>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Was due {format(nextDate, 'MMM d')}</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest italic">
                                    {topic.difficulty}
                                </div>
                            </div>
                            <div className="flex gap-4 relative z-10">
                                <button 
                                  onClick={() => handleReschedule(topic.id)}
                                  className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold active:scale-95 transition-all text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                >
                                  Reschedule to Today
                                </button>
                                <button 
                                  onClick={() => handleSkip(topic.id, topic.streak)}
                                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-400 py-4 rounded-2xl font-bold active:bg-zinc-800 transition-colors text-xs uppercase tracking-widest"
                                >
                                  Skip
                                </button>
                            </div>
                            {isCritical && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full"></div>}
                        </div>
                    </section>
                  );
                })}

                <section 
                  onClick={() => navigate('/today')}
                  className="relative overflow-hidden rounded-[2.5rem] h-40 flex items-center p-10 mt-16 group cursor-pointer bento-card border-outline shadow-2xl"
                >
                    <img 
                        src="https://images.unsplash.com/photo-1518199266791-73994947c52b?auto=format&fit=crop&q=80&w=1000" 
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.3] grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                        alt="Motivation" 
                    />
                    <div className="relative z-10 text-white flex flex-col justify-center">
                        <h4 className="text-3xl font-black italic uppercase tracking-tighter shadow-sm">Keep Going.</h4>
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mt-1 max-w-[180px] leading-relaxed">Consistency is the key to mastery.</p>
                    </div>
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowRight className="w-6 h-6" />
                    </div>
                </section>
            </div>
        </motion.div>
    );
};
