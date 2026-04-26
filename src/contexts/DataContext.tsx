import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  orderBy,
  where
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Topic, Subject, RevisionRecord } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface DataContextType {
  topics: Topic[];
  subjects: Subject[];
  loading: boolean;
  addTopic: (topic: Partial<Topic>) => Promise<string | undefined>;
  updateTopic: (topicId: string, updates: Partial<Topic>) => Promise<void>;
  deleteTopic: (topicId: string) => Promise<void>;
  addSubject: (subject: Partial<Subject>) => Promise<string | undefined>;
  deleteSubject: (subjectId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTopics([]);
      setSubjects([]);
      setLoading(false);
      return;
    }

    const subjectsPath = `users/${user.uid}/subjects`;
    const unsubSubjects = onSnapshot(
      collection(db, subjectsPath),
      (snapshot) => {
        const subjectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
        setSubjects(subjectsData);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, subjectsPath)
    );

    const topicsPath = `users/${user.uid}/topics`;
    const unsubTopics = onSnapshot(
      collection(db, topicsPath),
      (snapshot) => {
        const topicsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
        setTopics(topicsData);
        setLoading(false);
      },
      (error) => {
        console.error("Topics snapshot error:", error);
        setLoading(false);
        // Optional: handleFirestoreError(error, OperationType.LIST, topicsPath)
      }
    );

    return () => {
      unsubSubjects();
      unsubTopics();
    };
  }, [user]);

  const addTopic = async (topic: Partial<Topic>): Promise<string | undefined> => {
    if (!user) return;
    const path = `users/${user.uid}/topics`;
    try {
      const docRef = await addDoc(collection(db, path), {
        ...topic,
        userId: user.uid,
        streak: 0,
        history: [],
        attachments: topic.attachments || [],
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateTopic = async (topicId: string, updates: Partial<Topic>) => {
    if (!user) return;
    const path = `users/${user.uid}/topics/${topicId}`;
    try {
      await updateDoc(doc(db, path), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/topics/${topicId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addSubject = async (subject: Partial<Subject>): Promise<string | undefined> => {
    if (!user) return;
    const path = `users/${user.uid}/subjects`;
    try {
      const docRef = await addDoc(collection(db, path), {
        ...subject,
        userId: user.uid,
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deleteSubject = async (subjectId: string) => {
    if (!user) return;
    const subjectPath = `users/${user.uid}/subjects/${subjectId}`;
    const topicsPath = `users/${user.uid}/topics`;
    
    try {
      // Find all topics belonging to this subject
      const associatedTopics = topics.filter(t => t.subjectId === subjectId);
      
      // Delete all associated topics
      const deletePromises = associatedTopics.map(t => deleteDoc(doc(db, `${topicsPath}/${t.id}`)));
      await Promise.all(deletePromises);
      
      // Delete the subject itself
      await deleteDoc(doc(db, subjectPath));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, subjectPath);
    }
  };

  return (
    <DataContext.Provider value={{ topics, subjects, loading, addTopic, updateTopic, deleteTopic, addSubject, deleteSubject }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
