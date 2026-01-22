import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Student, ExamType } from '../types';
import { Save, CheckCircle, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExamEntry: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State structure optimized for detailed entry
  const [studentId, setStudentId] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState<ExamType>(ExamType.LGS);
  const [totalScore, setTotalScore] = useState<string>(''); // Manual entry as string initially

  // Extended Subject State for all exam types
  const [subjects, setSubjects] = useState({
    // LGS & TYT
    turkish: { d: 0, y: 0 },
    math: { d: 0, y: 0 },
    science: { d: 0, y: 0 },
    social: { d: 0, y: 0 },
    lang: { d: 0, y: 0 }, 
    rel: { d: 0, y: 0 },
    
    // AYT Specific
    literature: { d: 0, y: 0 },
    history1: { d: 0, y: 0 },
    geography1: { d: 0, y: 0 },
    history2: { d: 0, y: 0 },
    geography2: { d: 0, y: 0 },
    philosophy: { d: 0, y: 0 },
    physics: { d: 0, y: 0 },
    chemistry: { d: 0, y: 0 },
    biology: { d: 0, y: 0 },
  });

  useEffect(() => {
    const fetchStudents = async () => {
        const s = await db.getStudents();
        setStudents(s);
        if (s.length > 0) setStudentId(s[0].id);
    };
    fetchStudents();
  }, []);

  // Helper to calculate Net: 3 Wrong removes 1 Right (LGS), 4 Wrong removes 1 Right (YKS)
  const calculateNet = (d: number, y: number, type: ExamType) => {
    const factor = type === ExamType.LGS ? 3 : 4;
    const net = d - (y / factor);
    return Math.max(0, parseFloat(net.toFixed(2))); // Prevent negative nets
  };

  const handleSubjectChange = (subject: keyof typeof subjects, field: 'd' | 'y', value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setSubjects(prev => ({
        ...prev,
        [subject]: {
            ...prev[subject],
            [field]: numValue
        }
    }));
  };

  const getActiveSubjects = (): { key: keyof typeof subjects, label: string }[] => {
      switch (examType) {
          case ExamType.LGS:
          case ExamType.GENERAL:
              return [
                  { key: 'turkish', label: 'Türkçe' },
                  { key: 'math', label: 'Matematik' },
                  { key: 'science', label: 'Fen Bilimleri' },
                  { key: 'social', label: 'İnkılap / Sosyal' },
                  { key: 'lang', label: 'Yabancı Dil' },
                  { key: 'rel', label: 'Din Kültürü' },
              ];
          case ExamType.TYT:
              return [
                  { key: 'turkish', label: 'Türkçe' },
                  { key: 'math', label: 'Matematik' },
                  { key: 'science', label: 'Fen Bilimleri' },
                  { key: 'social', label: 'Sosyal Bilimler' },
              ];
          case ExamType.AYT_EA:
              return [
                  { key: 'literature', label: 'Türk Dili ve Edebiyatı' },
                  { key: 'history1', label: 'Tarih-1' },
                  { key: 'geography1', label: 'Coğrafya-1' },
                  { key: 'math', label: 'Matematik' },
              ];
          case ExamType.AYT_SAY:
              return [
                  { key: 'math', label: 'Matematik' },
                  { key: 'physics', label: 'Fizik' },
                  { key: 'chemistry', label: 'Kimya' },
                  { key: 'biology', label: 'Biyoloji' },
              ];
          case ExamType.AYT_SOZ:
              return [
                  { key: 'literature', label: 'Türk Dili ve Edebiyatı' },
                  { key: 'history1', label: 'Tarih-1' },
                  { key: 'geography1', label: 'Coğrafya-1' },
                  { key: 'history2', label: 'Tarih-2' },
                  { key: 'geography2', label: 'Coğrafya-2' },
                  { key: 'philosophy', label: 'Felsefe Grubu' },
              ];
          default:
              return [];
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
        alert("Lütfen bir öğrenci seçiniz.");
        return;
    }

    if (!totalScore) {
        alert("Lütfen deneme puanını giriniz.");
        return;
    }
    
    setIsSubmitting(true);

    // Prepare data object
    // Helper to extract values
    const getVals = (key: keyof typeof subjects) => ({
        d: subjects[key].d,
        y: subjects[key].y,
        n: calculateNet(subjects[key].d, subjects[key].y, examType)
    });

    const examData = {
        studentId,
        examDate,
        examName,
        type: examType,
        totalScore: parseFloat(totalScore),
        
        // Base Nets
        turkishNet: getVals('turkish').n,
        mathNet: getVals('math').n,
        scienceNet: getVals('science').n,
        socialNet: getVals('social').n,
        langNet: getVals('lang').n,
        relNet: getVals('rel').n,
        
        // AYT Specific Nets
        literatureNet: getVals('literature').n,
        history1Net: getVals('history1').n,
        geography1Net: getVals('geography1').n,
        history2Net: getVals('history2').n,
        geography2Net: getVals('geography2').n,
        philosophyNet: getVals('philosophy').n,
        physicsNet: getVals('physics').n,
        chemistryNet: getVals('chemistry').n,
        biologyNet: getVals('biology').n,

        // Raw Data Storage (Mapping all just in case, empty ones will be 0)
        turkishCorrect: subjects.turkish.d, turkishIncorrect: subjects.turkish.y,
        mathCorrect: subjects.math.d, mathIncorrect: subjects.math.y,
        scienceCorrect: subjects.science.d, scienceIncorrect: subjects.science.y,
        socialCorrect: subjects.social.d, socialIncorrect: subjects.social.y,
        langCorrect: subjects.lang.d, langIncorrect: subjects.lang.y,
        relCorrect: subjects.rel.d, relIncorrect: subjects.rel.y,
        
        literatureCorrect: subjects.literature.d, literatureIncorrect: subjects.literature.y,
        history1Correct: subjects.history1.d, history1Incorrect: subjects.history1.y,
        geography1Correct: subjects.geography1.d, geography1Incorrect: subjects.geography1.y,
        history2Correct: subjects.history2.d, history2Incorrect: subjects.history2.y,
        geography2Correct: subjects.geography2.d, geography2Incorrect: subjects.geography2.y,
        philosophyCorrect: subjects.philosophy.d, philosophyIncorrect: subjects.philosophy.y,
        physicsCorrect: subjects.physics.d, physicsIncorrect: subjects.physics.y,
        chemistryCorrect: subjects.chemistry.d, chemistryIncorrect: subjects.chemistry.y,
        biologyCorrect: subjects.biology.d, biologyIncorrect: subjects.biology.y,
    };

    try {
        await db.addExam(examData);
        setSuccessMsg('Deneme başarıyla kaydedildi!');
        setTimeout(() => {
            setSuccessMsg('');
            navigate('/students'); 
        }, 1500);
    } catch (err) {
        console.error(err);
        alert("Hata oluştu.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Subject Input Component
  const SubjectInput: React.FC<{ label: string, subKey: keyof typeof subjects }> = ({ label, subKey }) => {
      const d = subjects[subKey].d;
      const y = subjects[subKey].y;
      const net = calculateNet(d, y, examType);

      return (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2 h-10">
                  {label}
              </p>
              <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                      <label className="block text-sm text-green-700 font-bold mb-2">Doğru</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full text-center border border-slate-300 rounded-lg p-3 text-lg font-semibold bg-green-50 text-slate-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        value={subjects[subKey].d || ''}
                        onChange={(e) => handleSubjectChange(subKey, 'd', e.target.value)}
                      />
                  </div>
                  <div className="text-center">
                      <label className="block text-sm text-red-600 font-bold mb-2">Yanlış</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full text-center border border-slate-300 rounded-lg p-3 text-lg font-semibold bg-red-50 text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        value={subjects[subKey].y || ''}
                        onChange={(e) => handleSubjectChange(subKey, 'y', e.target.value)}
                      />
                  </div>
                  <div className="text-center">
                      <label className="block text-sm text-indigo-700 font-bold mb-2">NET</label>
                      <div className="w-full bg-blue-50 border-2 border-indigo-100 rounded-lg p-3 text-slate-900 font-bold text-lg h-[54px] flex items-center justify-center">
                          {net}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const activeSubjects = getActiveSubjects();

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <Save className="text-indigo-600" />
        Deneme Sonucu Gir
      </h2>

      {students.length === 0 ? (
         <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
            Sisteme kayıtlı öğrenci bulunmamaktadır. Lütfen önce "Öğrenciler" menüsünden öğrenci ekleyiniz.
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Top Section: Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Öğrenci</label>
                    <select 
                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                    >
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.fullName} ({s.gradeLevel}. Sınıf)</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tarih</label>
                    <input 
                        type="date" 
                        required
                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={examDate}
                        onChange={e => setExamDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Yayın/Deneme Adı</label>
                    <input 
                        type="text" 
                        required
                        placeholder="Örn: X Yayını 1. Deneme"
                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={examName}
                        onChange={e => setExamName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sınav Türü</label>
                    <select 
                        className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={examType}
                        onChange={e => {
                            setExamType(e.target.value as ExamType);
                            // Reset subjects on type change could be done here, but keeping values is also UX friendly
                        }}
                    >
                        {Object.values(ExamType).map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Middle Section: Subject Inputs */}
            <div className="border-t border-slate-100 pt-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Net Hesaplama ({examType})</h3>
                    <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                        {examType === ExamType.LGS ? "3 Yanlış 1 Doğruyu Götürür" : "4 Yanlış 1 Doğruyu Götürür"}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeSubjects.map((sub) => (
                        <SubjectInput key={sub.key} label={sub.label} subKey={sub.key} />
                    ))}
                </div>
            </div>

            {/* Bottom Section: Total Score */}
            <div className="border-t border-slate-100 pt-8">
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        <p className="text-indigo-800 font-medium mb-1">Puan Girişi</p>
                        <p className="text-sm text-indigo-600/70">Hesaplanan puanı manuel olarak giriniz.</p>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                         <div className="relative flex-1 md:flex-none">
                            <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={20} />
                            <input 
                                type="number" 
                                step="0.001"
                                required
                                placeholder="0.000"
                                className="w-full md:w-48 pl-12 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none font-bold text-2xl text-indigo-700 text-right"
                                value={totalScore}
                                onChange={e => setTotalScore(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center gap-2 h-[54px]"
                        >
                            <Save size={22} />
                            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div>
            </div>

            {successMsg && (
                <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-3 justify-center font-medium border border-green-200">
                    <CheckCircle size={24} />
                    {successMsg}
                </div>
            )}
        </form>
      )}
    </div>
  );
};

export default ExamEntry;