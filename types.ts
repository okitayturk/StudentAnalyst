export interface Student {
  id: string;
  fullName: string;
  gradeLevel: string; // 5, 6, 7, 8, 9, 10, 11, 12, Mezun
  schoolNumber: string;
  createdAt: number;
}

export enum ExamType {
  LGS = 'LGS',
  TYT = 'TYT',
  AYT_SAY = 'AYT SAY',
  AYT_EA = 'AYT EA',
  AYT_SOZ = 'AYT SÖZ',
  AYT = 'AYT (Genel)', // Backward compatibility
  GENERAL = 'GENEL'
}

export interface ExamResult {
  id: string;
  studentId: string;
  examDate: string; // YYYY-MM-DD
  examName: string;
  type: ExamType;
  
  // --- Common & TYT/LGS Inputs ---
  turkishCorrect?: number; turkishIncorrect?: number;
  mathCorrect?: number; mathIncorrect?: number;
  scienceCorrect?: number; scienceIncorrect?: number;
  socialCorrect?: number; socialIncorrect?: number;
  langCorrect?: number; langIncorrect?: number;
  relCorrect?: number; relIncorrect?: number;

  // --- AYT Specific Inputs ---
  literatureCorrect?: number; literatureIncorrect?: number; // Edebiyat
  history1Correct?: number; history1Incorrect?: number; // Tarih-1
  geography1Correct?: number; geography1Incorrect?: number; // Coğrafya-1
  history2Correct?: number; history2Incorrect?: number; // Tarih-2
  geography2Correct?: number; geography2Incorrect?: number; // Coğrafya-2
  philosophyCorrect?: number; philosophyIncorrect?: number; // Felsefe Grubu
  physicsCorrect?: number; physicsIncorrect?: number; // Fizik
  chemistryCorrect?: number; chemistryIncorrect?: number; // Kimya
  biologyCorrect?: number; biologyIncorrect?: number; // Biyoloji

  // --- Calculated Nets ---
  // Core
  turkishNet: number;
  mathNet: number;
  scienceNet: number;
  socialNet: number;
  
  // Extras
  langNet?: number;
  relNet?: number;
  
  // AYT Specific Nets
  literatureNet?: number;
  history1Net?: number;
  geography1Net?: number;
  history2Net?: number;
  geography2Net?: number;
  philosophyNet?: number;
  physicsNet?: number;
  chemistryNet?: number;
  biologyNet?: number;

  totalScore: number;
}

export interface DailyQuestionLog {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  subjects: Record<string, { correct: number; incorrect: number } | number>; // Updated to store breakdown and allow legacy number format
  total: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalExams: number;
  avgScore: number;
}