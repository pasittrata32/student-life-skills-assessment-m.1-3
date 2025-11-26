
export interface Student {
  id: number;
  no: number;
  prefix: string;
  firstName: string;
  lastName: string;
  room: string; // e.g., "m1a", "m1b"
}

export interface Teacher {
  username: string;
  name: string;
  room: string; // e.g., "m1a"
}

export interface Question {
  id: number;
  text: string;
}

export interface Indicator {
  id: number;
  title: string;
  questions: Question[];
}

export interface AssessmentData {
  studentId: number;
  scores: Record<number, number>; // questionId -> score (0-3)
  comments: {
    strength: string;
    development: string;
  };
  teacherName: string;
  date: string;
}

export interface ExportRow {
  No: number;
  StudentName: string;
  [key: string]: string | number; // For dynamic Q1, Q2... and Total
}
