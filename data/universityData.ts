export interface UniversityProgram {
  id: string;
  city: string;
  university: string;
  department: string;
  type: string; // 'Devlet' | 'Vakıf' | 'Kıbrıs' | 'Yurtdışı'
  score: number;
  rank: number;
  quota: number;
}

// Data is now fetched dynamically in the component.
// Exporting empty array to prevent build errors if referenced elsewhere before update.
export const universityData: UniversityProgram[] = [];