import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Book, Sparkles, School, Edit, CheckCircle, Calendar, History, Lock, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { SUBJECTS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Topic, Subject } from '../types';

export const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { signIn, logout, user } = useAuth();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-between min-h-screen p-6 text-center bg-background"
    >
      <div className="pt-12 flex flex-col items-center gap-4">
        <div className="text-primary text-3xl font-black tracking-tighter uppercase italic">Revize</div>
        {user && (
          <button 
            onClick={logout}
            className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors"
          >
            Sign out ({user.email})
          </button>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center max-w-md w-full">
        <div className="relative w-full grid grid-cols-4 grid-rows-6 gap-3 min-h-[400px] mb-12">
          {/* Mock Bento Illustration */}
          <div className="col-span-2 row-span-3 bento-card p-4 flex flex-col justify-between overflow-hidden relative">
            <Calendar className="w-8 h-8 text-primary" />
            <div className="space-y-1 text-left">
              <div className="h-2 w-12 bg-primary/20 rounded-full"></div>
              <div className="h-4 w-20 bg-primary/40 rounded-full"></div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-2xl rounded-full"></div>
          </div>
          <div className="col-span-1 row-span-2 bento-card flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="col-span-1 row-span-2 bento-card flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="col-span-2 row-span-4 bento-card p-4 space-y-3">
            <div className="h-6 w-full bg-zinc-800 rounded-xl"></div>
            <div className="h-6 w-3/4 bg-zinc-800 rounded-xl"></div>
            <div className="h-6 w-full bg-zinc-800 rounded-xl"></div>
            <div className="h-6 w-1/2 bg-primary/20 rounded-xl"></div>
          </div>
          <div className="col-span-2 row-span-3 bento-card flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
              <School className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
          Master Your Revisions
        </h1>
        <p className="text-lg text-zinc-400 max-w-[280px] font-medium">
          Smart scheduling for consistent learning
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center gap-2">
          <div className="h-1.5 w-8 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
          <div className="h-1.5 w-2 rounded-full bg-zinc-800"></div>
          <div className="h-1.5 w-2 rounded-full bg-zinc-800"></div>
        </div>
        
        <button 
          onClick={onNext}
          className="w-full h-16 bg-primary text-white rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-all duration-200 font-bold text-lg uppercase tracking-widest"
        >
          Get Started
          <ArrowRight className="w-6 h-6" />
        </button>
        
        <button 
          onClick={signIn}
          className="text-zinc-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest"
        >
          Already have an account? <span className="text-primary font-black">Sign in here</span>
        </button>
      </div>
    </motion.div>
  );
};

export const SubjectStep: React.FC<{ onBack: () => void, onNext: (subject: string) => void }> = ({ onBack, onNext }) => {
  const [subject, setSubject] = useState('');
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-screen bg-background"
    >
      <header className="sticky top-0 z-40 w-full flex items-center justify-between px-4 h-16 bg-background/80 backdrop-blur-md border-b border-outline/30 shadow-sm">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-black text-xl text-primary tracking-tighter uppercase italic">Revize</span>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow flex flex-col p-6 max-w-md mx-auto w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <span>Step 2 of 4</span>
            <span className="text-primary italic">50% Complete</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full bg-primary w-1/2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Your first subject.</h1>
          <p className="text-zinc-400 font-medium leading-relaxed">Break down your goals into manageable topics worth mastering.</p>
        </div>

        <div className="mb-10 rounded-[2rem] overflow-hidden bento-card aspect-video flex items-center justify-center relative group">
          <img 
            src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1000" 
            alt="Subject" 
            className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mb-4 shadow-2xl shadow-primary/30">
              <Book className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1" htmlFor="subject">Subject name</label>
            <input 
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-16 px-5 bg-surface/50 border border-outline/30 rounded-2xl font-bold text-white placeholder:text-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none" 
              placeholder="e.g., Physics" 
              type="text"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {['Mathematics', 'Biology', 'Chemistry', 'History'].map(s => (
              <button 
                key={s}
                onClick={() => setSubject(s)}
                className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-500 transition-all active:scale-95 uppercase tracking-widest"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 left-0 w-full p-6 bg-background/80 backdrop-blur-md border-t border-outline/30 flex gap-4">
        <button 
          onClick={onBack}
          className="flex-1 h-14 rounded-2xl font-bold text-zinc-500 uppercase tracking-widest text-xs hover:text-white transition-all"
        >
          Back
        </button>
        <button 
          onClick={() => subject && onNext(subject)}
          disabled={!subject}
          className="flex-[2] h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-30 uppercase tracking-widest"
        >
          Next
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
};

export const TopicStep: React.FC<{ subject: string, onBack: () => void, onNext: (topic: string) => void }> = ({ subject, onBack, onNext }) => {
  const [topic, setTopic] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col min-h-screen bg-background"
    >
      <header className="sticky top-0 z-40 w-full flex items-center justify-between px-4 h-16 bg-background/80 backdrop-blur-md border-b border-outline/30 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-800 rounded-full text-white"><ArrowLeft className="w-6 h-6" /></button>
          <span className="font-black text-xl text-primary tracking-tighter uppercase italic">Revize</span>
        </div>
        <div className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Step 3 of 4</div>
      </header>

      <main className="flex-grow p-6 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Your first topic.</h1>
          <p className="text-zinc-400 font-medium italic">Small steps lead to big successes.</p>
        </div>

        <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden mb-10 bento-card group">
          <img 
            src="https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=1000" 
            alt="Topic" 
            className="w-full h-full object-cover grayscale brightness-40 group-hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-8">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 rounded-lg bg-primary/20 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary fill-current" />
              </div>
              <span className="font-bold tracking-tight">Mastery starts here</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Selected Subject</label>
            <div className="flex items-center gap-4 px-5 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-300">
              <School className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm uppercase tracking-widest">{subject || 'Organic Chemistry'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-primary uppercase tracking-widest px-1" htmlFor="topic">Topic Name</label>
            <div className="relative">
              <input 
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full h-16 px-6 bg-surface/50 border-2 border-primary/50 text-white font-bold tracking-tight rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none placeholder:text-zinc-700" 
                placeholder="e.g., Alkanes and Alkenes" 
                type="text"
              />
              <Edit className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-50" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1" htmlFor="desc">Description (Optional)</label>
            <textarea 
              id="desc"
              className="w-full px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm font-medium text-white placeholder:text-zinc-700 resize-none h-32 outline-none transition-all" 
              placeholder="Brief summary..."
            />
          </div>
        </div>

        <div className="pt-12 mb-20">
          <button 
            onClick={() => topic && onNext(topic)}
            disabled={!topic}
            className="w-full py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
          >
            Create Topic
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </main>
    </motion.div>
  );
};

export const ReadyStep: React.FC<{ topic: string, onBack: () => void, onFinish: () => void, completing?: boolean }> = ({ topic, onBack, onFinish, completing }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col min-h-screen bg-background overflow-hidden"
  >
     <header className="sticky top-0 z-40 w-full flex items-center justify-between px-4 h-16 bg-background/80 backdrop-blur-md border-b border-outline/30 shadow-sm">
        <div className="flex items-center gap-4">
           {!completing && <button onClick={onBack} className="p-2 text-white"><ArrowLeft className="w-6 h-6" /></button>}
           <span className="font-black text-xl text-primary tracking-tighter uppercase italic">Revize</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Step 4 of 4</span>
          <div className="flex gap-1 mt-1">
            <div className="h-1.5 w-3 bg-primary rounded-full"></div>
            <div className="h-1.5 w-3 bg-primary rounded-full"></div>
            <div className="h-1.5 w-3 bg-primary rounded-full"></div>
            <div className="h-1.5 w-10 bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 text-center">
        <div className="mt-12 mb-12">
            <div className="w-24 h-24 bg-primary text-white rounded-[2rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-primary/30 rotate-3">
                <Sparkles className="w-12 h-12 fill-current" />
            </div>
            <h1 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Plan Ready! 🎉</h1>
            <p className="text-zinc-400 font-medium max-w-[300px] mx-auto leading-relaxed italic">
              We've calculated the optimal intervals for: <span className="font-bold text-primary not-italic">{topic || 'Cell Biology'}</span>.
            </p>
        </div>

        <div className="w-full space-y-4 max-w-md">
            <div className="bg-primary p-6 rounded-3xl text-white shadow-2xl shadow-primary/20 flex items-center justify-between relative overflow-hidden group">
                <div className="text-left relative z-10">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-1">Session 1</p>
                    <p className="text-2xl font-black uppercase tracking-tight">Today</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10">Initial Review</div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bento-card p-6 flex flex-col justify-between h-40 text-left hover:bg-zinc-800 transition-colors cursor-pointer group">
                    <Calendar className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Session 2</p>
                        <p className="text-xl font-black text-white uppercase tracking-tight">Tomorrow</p>
                    </div>
                </div>
                <div className="bento-card p-6 flex flex-col justify-between h-40 text-left hover:bg-zinc-800 transition-colors cursor-pointer group">
                    <History className="w-8 h-8 text-secondary group-hover:scale-110 transition-transform" />
                    <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Session 3</p>
                        <p className="text-xl font-black text-white uppercase tracking-tight">In 3 days</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="bento-card p-4 flex flex-col justify-between h-32 hover:bg-zinc-800 transition-colors cursor-pointer group">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-tight">Session 4</p>
                  <p className="text-sm font-black text-white uppercase leading-tight">1 week</p>
               </div>
               <div className="bento-card p-4 flex flex-col justify-between h-32 hover:bg-zinc-800 transition-colors cursor-pointer group border-primary/20">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-tight">Session 5</p>
                  <p className="text-sm font-black text-white uppercase leading-tight">3 weeks</p>
               </div>
               <div className="bento-card p-4 flex flex-col justify-between h-32 hover:bg-zinc-800 transition-colors cursor-pointer group">
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-tight">Session 6</p>
                  <p className="text-sm font-black text-white uppercase leading-tight">1 month</p>
               </div>
            </div>
        </div>

        <div className="mt-auto pt-12 w-full max-w-md mb-8">
          <button 
            onClick={onFinish}
            disabled={completing}
            className={cn(
                "w-full bg-primary text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-primary-container",
                completing && "opacity-80 cursor-wait"
            )}
          >
            {completing ? (
                <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Synchronizing...
                </>
            ) : (
                <>
                    Go to Dashboard
                    <ArrowRight className="w-6 h-6" />
                </>
            )}
          </button>
          <p className="text-center mt-5 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Smart Spacing Active</p>
        </div>
      </main>
  </motion.div>
);

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [subjectName, setSubjectName] = useState('');
  const [topicName, setTopicName] = useState('');
  const { user, setIsOnboarded } = useAuth();
  const { addSubject, addTopic, subjects } = useData();
  const navigate = useNavigate();

  const [completing, setCompleting] = useState(false);

  const handleFinish = async () => {
    if (!user || completing) return;
    setCompleting(true);

    try {
      console.log("Onboarding: Starting completion sequence");
      
      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.warn("Notification permission error:", e);
        }
      }

      // 1. Create or find subject
      let subjectId = subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase())?.id;
      
      if (!subjectId) {
        console.log("Onboarding: Creating subject", subjectName);
        subjectId = await addSubject({ 
          name: subjectName, 
          color: '#6366f1' 
        });
      }

      if (!subjectId) {
        throw new Error("Could not initialize subject storage.");
      }

      console.log("Onboarding: Subject ready", subjectId);

      // 2. Add topic
      const nextDate = new Date();
      // Increase searchability for the created topic
      await addTopic({
        name: topicName,
        subjectId: subjectId,
        status: 'ACTIVE',
        difficulty: 'Medium',
        nextRevisionDate: nextDate.toISOString(),
      });
      
      console.log("Onboarding: Topic created");

      // 3. Update the user status in database
      await updateDoc(doc(db, 'users', user.uid), {
        isOnboarded: true,
        displayName: user.displayName || 'Scholar'
      });

      console.log("Onboarding: User profile updated");

      // 4. Update local auth state - THIS IS CRITICAL for App.tsx re-render
      setIsOnboarded(true);

      // 5. Navigate
      // Note: App.tsx will also see isOnboarded=true and might redirect, 
      // but doing it here explicitly with replace ensures a clean state.
      setTimeout(() => {
        navigate('/today', { replace: true });
      }, 100);
      
    } catch (err) {
      console.error("Onboarding Fatal Error:", err);
      let message = "Unknown error";
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          message = parsed.error || err.message;
        } catch {
          message = err.message;
        }
      }
      alert("Error finalizing setup: " + message);
      setCompleting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {step === 1 && <WelcomeStep key="s1" onNext={() => setStep(2)} />}
      {step === 2 && <SubjectStep key="s2" onBack={() => setStep(1)} onNext={(s) => { setSubjectName(s); setStep(3); }} />}
      {step === 3 && <TopicStep key="s3" subject={subjectName} onBack={() => setStep(2)} onNext={(t) => { setTopicName(t); setStep(4); }} />}
      {step === 4 && <ReadyStep key="s4" topic={topicName} onBack={() => setStep(3)} onFinish={handleFinish} completing={completing} />}
    </AnimatePresence>
  );
};
