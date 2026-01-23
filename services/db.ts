import { firestore } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDoc,
  setDoc,
  orderBy
} from 'firebase/firestore';
import { Student, ExamResult, DailyQuestionLog } from '../types';

const STUDENTS_COLLECTION = 'students';
const EXAMS_COLLECTION = 'exams';
const QUESTIONS_COLLECTION = 'question_logs';

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
    
    // 3. Delete associated question logs
    const qLogsQuery = query(collection(firestore, QUESTIONS_COLLECTION), where("studentId", "==", id));
    const qLogsSnapshot = await getDocs(qLogsQuery);
    const deleteLogsPromises = qLogsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteLogsPromises);
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

  // --- Question Logs ---
  
  // Add or Update a log for a specific date/student
  saveQuestionLog: async (log: Omit<DailyQuestionLog, 'id'>): Promise<void> => {
    // Check if log exists for this student and date
    // Note: Multiple where clauses might require an index in some cases, but == and == usually works.
    // If this fails, we can fetch by studentId and filter in memory as well, but usually this is fine.
    const q = query(
        collection(firestore, QUESTIONS_COLLECTION), 
        where("studentId", "==", log.studentId),
        where("date", "==", log.date)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        // Update existing
        const docId = snapshot.docs[0].id;
        await setDoc(doc(firestore, QUESTIONS_COLLECTION, docId), log, { merge: true });
    } else {
        // Create new
        await addDoc(collection(firestore, QUESTIONS_COLLECTION), log);
    }
  },

  getQuestionLogs: async (studentId: string, days: number = 30): Promise<DailyQuestionLog[]> => {
     // Calculate start date
     const date = new Date();
     date.setDate(date.getDate() - days);
     const startDate = date.toISOString().split('T')[0];

     // Query only by studentId to avoid composite index requirement (equality + inequality)
     const q = query(
         collection(firestore, QUESTIONS_COLLECTION),
         where("studentId", "==", studentId)
     );

     const snapshot = await getDocs(q);
     let logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyQuestionLog));
     
     // Client-side filtering
     logs = logs.filter(log => log.date >= startDate);

     // Client-side sorting
     return logs.sort((a, b) => a.date.localeCompare(b.date));
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