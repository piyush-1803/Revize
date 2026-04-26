import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight, TrendingUp, Award, School, BookOpen } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
} from 'date-fns';

export const CalendarScreen: React.FC = () => {
  const { topics, subjects, loading } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getDayTopicsCount = (day: Date) => {
    return topics.filter(t => {
      if (!t.nextRevisionDate) return false;
      return isSameDay(new Date(t.nextRevisionDate), day);
    }).length;
  };

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-zinc-900/50 text-zinc-500 border border-zinc-800/50';
    if (count <= 2) return 'bg-primary/20 text-zinc-300';
    if (count <= 4) return 'bg-primary/40 text-zinc-100';
    if (count <= 6) return 'bg-primary/60 text-white';
    if (count <= 8) return 'bg-primary/80 text-white';
    return 'bg-primary text-white shadow-lg shadow-primary/20';
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Stats
  const totalTopics = topics.length;
  const avgPerDay = topics.length > 0 ? (topics.length / 30).toFixed(1) : 0;
  
  const subjectDistribution = topics.reduce((acc, t) => {
    acc[t.subjectId] = (acc[t.subjectId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSubjectId = Object.entries(subjectDistribution).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0];
  const topSubject = subjects.find(s => s.id === topSubjectId);

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-32 px-1 py-4"
    >
      <div className="flex items-center justify-between mb-8 pt-4">
        <h2 className="text-3xl font-bold text-white tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-3 bento-card flex items-center justify-center hover:bg-zinc-800"><ChevronLeft className="w-5 h-5 text-zinc-400 hover:text-white" /></button>
          <button onClick={nextMonth} className="p-3 bento-card flex items-center justify-center hover:bg-zinc-800"><ChevronRight className="w-5 h-5 text-zinc-400 hover:text-white" /></button>
        </div>
      </div>

      <div className="bento-card p-6 mb-8">
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="h-10 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            const count = getDayTopicsCount(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={i} 
                className={cn(
                  "h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all hover:scale-110 cursor-pointer overflow-hidden",
                  !isCurrentMonth && "opacity-20 pointer-events-none",
                  getIntensity(count),
                  isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background z-10"
                )}
              >
                <div className="flex flex-col items-center">
                  <span>{format(day, 'd')}</span>
                  {count > 0 && <span className="text-[8px] opacity-60 leading-none">{count}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bento-card p-6 flex flex-col items-center justify-center text-center">
          <span className="text-primary text-3xl font-bold tracking-tighter">{totalTopics}</span>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Total Topics</p>
        </div>
        <div className="bento-card p-6 flex flex-col items-center justify-center text-center">
          <span className="text-emerald-500 text-3xl font-bold tracking-tighter">{avgPerDay}</span>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Avg / Day</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 auto-rows-min">
        <div className="col-span-12 bento-card p-6 flex items-center gap-6">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${topSubject?.color}20` || 'rgba(99,102,241,0.2)' }}
          >
            <BookOpen className="w-9 h-9" style={{ color: topSubject?.color || '#6366f1' }} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white tracking-tight uppercase">Top Subject</h4>
            <p className="text-sm font-medium text-zinc-400">
              {topSubject ? `${topSubject.name} (${subjectDistribution[topSubject.id]} modules)` : 'No data yet'}
            </p>
          </div>
        </div>

        <div className="col-span-12 bg-primary p-6 rounded-[2.5rem] flex flex-col justify-between shadow-2xl shadow-primary/30 text-white relative overflow-hidden group min-h-[160px]">
          <TrendingUp className="w-10 h-10 opacity-80" />
          <div className="relative z-10">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">Momentum</h3>
            <p className="text-sm font-medium opacity-80">Consistency is the key to memory retention.</p>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/20 transition-colors"></div>
        </div>
      </div>
    </motion.div>
  );
};
