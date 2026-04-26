export type TopicStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type RevisionStatus = 'COMPLETED' | 'SKIPPED' | 'RESCHEDULED';

export interface Attachment {
  id: string;
  type: 'NOTE' | 'IMAGE' | 'DIAGRAM' | 'PDF';
  name: string;
}

export interface RevisionRecord {
  date: string;
  status: RevisionStatus;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  createdAt: string;
  lastRevised?: string;
  nextRevisionDate: string;
  status: TopicStatus;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  streak: number;
  history: RevisionRecord[];
  attachments: Attachment[];
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}
