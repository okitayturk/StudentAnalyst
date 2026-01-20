import { Student, ExamResult, ExamType } from '../types';

// Keys for LocalStorage
const STORAGE_KEYS = {
  STUDENTS: 'app_students_v1',
  EXAMS: 'app_exams_v1',
};

// Helper to generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const db = {
  // --- Students ---
  getStudents: (): Student[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : [];
  },

  addStudent: (student: Omit<Student, 'id' | 'createdAt'>): Student => {
    const students = db.getStudents();
    const newStudent: Student = {
      ...student,
      id: generateId(),
      createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([...students, newStudent]));
    return newStudent;
  },

  deleteStudent: (id: string) => {
    const students = db.getStudents().filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    
    // Also delete associated exams
    const exams = db.getExams().filter(e => e.studentId !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  },

  // --- Exams ---
  getExams: (): ExamResult[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return data ? JSON.parse(data) : [];
  },

  getExamsByStudent: (studentId: string): ExamResult[] => {
    return db.getExams().filter((e) => e.studentId === studentId);
  },

  addExam: (exam: Omit<ExamResult, 'id'>): ExamResult => {
    const exams = db.getExams();
    const newExam: ExamResult = {
      ...exam,
      id: generateId(),
    };
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify([...exams, newExam]));
    return newExam;
  },

  deleteExam: (id: string) => {
    const exams = db.getExams().filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  },
  
  // --- Analysis Helpers ---
  getMonthlyAverages: (studentId?: string) => {
    const exams = studentId ? db.getExamsByStudent(studentId) : db.getExams();
    // Group by Month (YYYY-MM)
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

  getSubjectAverages: (studentId?: string) => {
      const exams = studentId ? db.getExamsByStudent(studentId) : db.getExams();
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
