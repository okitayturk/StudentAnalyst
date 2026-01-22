import { firestore } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDoc 
} from 'firebase/firestore';
import { Student, ExamResult } from '../types';

const STUDENTS_COLLECTION = 'students';
const EXAMS_COLLECTION = 'exams';

export const db = {
  // --- Students ---
  getStudents: async (): Promise<Student[]> => {
    const querySnapshot = await getDocs(collection(firestore, STUDENTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
  },

  getStudent: async (id: string): Promise<Student | null> => {
    const docRef = doc(firestore, STUDENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Student;
    }
    return null;
  },

  addStudent: async (student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> => {
    const newStudentData = {
      ...student,
      createdAt: Date.now(),
    };
    const docRef = await addDoc(collection(firestore, STUDENTS_COLLECTION), newStudentData);
    return { id: docRef.id, ...newStudentData } as Student;
  },

  deleteStudent: async (id: string) => {
    // 1. Delete the student
    await deleteDoc(doc(firestore, STUDENTS_COLLECTION, id));
    
    // 2. Delete associated exams
    const examsQuery = query(collection(firestore, EXAMS_COLLECTION), where("studentId", "==", id));
    const examsSnapshot = await getDocs(examsQuery);
    
    const deletePromises = examsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },

  // --- Exams ---
  getExams: async (): Promise<ExamResult[]> => {
    const querySnapshot = await getDocs(collection(firestore, EXAMS_COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult));
  },

  getExam: async (id: string): Promise<ExamResult | null> => {
      const docRef = doc(firestore, EXAMS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as ExamResult;
      }
      return null;
  },

  getExamsByStudent: async (studentId: string): Promise<ExamResult[]> => {
    const q = query(collection(firestore, EXAMS_COLLECTION), where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult));
  },

  addExam: async (exam: Omit<ExamResult, 'id'>): Promise<ExamResult> => {
    const docRef = await addDoc(collection(firestore, EXAMS_COLLECTION), exam);
    return { id: docRef.id, ...exam } as ExamResult;
  },

  deleteExam: async (id: string) => {
    await deleteDoc(doc(firestore, EXAMS_COLLECTION, id));
  },
  
  // --- Analysis Helpers ---
  getMonthlyAverages: async (studentId?: string) => {
    // Fetch exams first
    let exams: ExamResult[] = [];
    if (studentId) {
        exams = await db.getExamsByStudent(studentId);
    } else {
        exams = await db.getExams();
    }

    // Client-side aggregation
    const grouped: Record<string, { total: number; count: number }> = {};
    
    exams.forEach(exam => {
        const month = exam.examDate.substring(0, 7); // 2023-10
        if (!grouped[month]) grouped[month] = { total: 0, count: 0 };
        grouped[month].total += exam.totalScore;
        grouped[month].count += 1;
    });

    return Object.keys(grouped).sort().map(month => ({
        name: month,
        score: Math.round(grouped[month].total / grouped[month].count)
    }));
  },

  getSubjectAverages: async (studentId?: string) => {
      let exams: ExamResult[] = [];
      if (studentId) {
          exams = await db.getExamsByStudent(studentId);
      } else {
          exams = await db.getExams();
      }

      if (exams.length === 0) return [];

      const totals = exams.reduce((acc, curr) => ({
          turkish: acc.turkish + curr.turkishNet,
          math: acc.math + curr.mathNet,
          science: acc.science + curr.scienceNet,
          social: acc.social + curr.socialNet
      }), { turkish: 0, math: 0, science: 0, social: 0 });

      return [
          { name: 'Türkçe', value: Math.round(totals.turkish / exams.length * 10) / 10 },
          { name: 'Matematik', value: Math.round(totals.math / exams.length * 10) / 10 },
          { name: 'Fen', value: Math.round(totals.science / exams.length * 10) / 10 },
          { name: 'Sosyal', value: Math.round(totals.social / exams.length * 10) / 10 },
      ];
  }
};