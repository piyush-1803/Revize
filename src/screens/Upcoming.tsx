import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { useData } from '../contexts/DataContext';
import { format, isAfter, startOfDay, addDays, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const UpcomingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { topics, subjects, loading } = useData();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const today = startOfDay(new Date());
  
  const upcomingTopics = topics
    .filter(t => {
      if (!t.nextRevisionDate) return false;
      const nextDate = startOfDay(new Date(t.nextRevisionDate));
      const matchesSubject = selectedSubjectId ? t.subjectId === selectedSubjectId : true;
      return isAfter(nextDate, today) && matchesSubject;
    })
    .sort((a, b) => new Date(a.nextRevisionDate).getTime() - new Date(b.nextRevisionDate).getTime());

  const grouped = upcomingTopics.reduce((acc, topic) => {
    const dateStr = format(new Date(topic.nextRevisionDate), 'eeee, MMMM do');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(topic);
    return acc;
  }, {} as Record<string, typeof topics>);

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 px-1 py-4"
    >
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md pt-4 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-4">Upcoming</h2>
        
        <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
           <button 
             onClick={() => setSelectedSubjectId(null)}
             className={cn(
               "flex-none px-5 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all border",
               !selectedSubjectId 
                 ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                 : "bg-surface border-outline/50 text-zinc-400 hover:text-white hover:border-zinc-500"
             )}
           >
             All
           </button>
           {subjects.map(s => (
             <button 
               key={s.id}
               onClick={() => setSelectedSubjectId(s.id)}
               className={cn(
                 "flex-none px-5 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all border",
                 selectedSubjectId === s.id 
                   ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                   : "bg-surface border-outline/50 text-zinc-400 hover:text-white hover:border-zinc-500"
               )}
             >
               {s.name}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-10 mt-6 px-1">
        {Object.keys(grouped).length === 0 ? (
          <div className="bento-card p-12 text-center opacity-40">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
              No upcoming revisions found.<br/>Try adding more topics.
            </p>
          </div>
        ) : (Object.entries(grouped) as [string, typeof topics][]).map(([dateLabel, items]) => (
          <section key={dateLabel}>
            <div className="sticky top-[148px] z-20 py-3 bg-background/50 backdrop-blur-sm -mx-1 px-1">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{dateLabel}</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-2">
              {items.map(item => {
                const subject = subjects.find(s => s.id === item.subjectId);
                const diff = differenceInDays(startOfDay(new Date(item.nextRevisionDate)), today);
                
                return (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(`/topic/${item.id}`)}
                    className="bento-card p-5 group flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-5">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200"
                        style={{ backgroundColor: `${subject?.color}15` || 'rgba(99,102,241,0.1)', color: subject?.color || '#6366f1' }}
                      >
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white leading-tight tracking-tight">{item.name}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{subject?.name}</p>
                      </div>
                    </div>
                    <div 
                      className="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border" 
                      style={{ color: subject?.color || '#6366f1', borderColor: `${subject?.color}30` || 'rgba(99,102,241,0.2)' }}
                    >
                      In {diff} {diff === 1 ? 'Day' : 'Days'}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
};
