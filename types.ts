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
  AYT = 'AYT',
  GENERAL = 'GENEL'
}

export interface ExamResult {
  id: string;
  studentId: string;
  examDate: string; // YYYY-MM-DD
  examName: string;
  type: ExamType;
  
  // Detailed Inputs
  turkishCorrect?: number; turkishIncorrect?: number;
  mathCorrect?: number; mathIncorrect?: number;
  scienceCorrect?: number; scienceIncorrect?: number;
  socialCorrect?: number; socialIncorrect?: number;
  langCorrect?: number; langIncorrect?: number;
  relCorrect?: number; relIncorrect?: number;

  // Calculated Nets (Stored for easier analysis)
  turkishNet: number;
  mathNet: number;
  scienceNet: number;
  socialNet: number;
  
  // Specific for LGS/AYT
  langNet?: number; // Yabancı Dil
  relNet?: number; // Din Kültürü
  
  totalScore: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalExams: number;
  avgScore: number;
}