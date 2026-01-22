import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { ExamResult, Student, ExamType } from '../types';
import { ArrowLeft, Calendar, FileText, TrendingUp, CheckCircle, XCircle, Award, X, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

// Standard question counts for calculating "Empty" answers (Approximations/Standard)
const QUESTION_COUNTS: Record<string, Record<string, number>> = {
  [ExamType.LGS]: { turkish: 20, math: 20, science: 20, social: 10, rel: 10, lang: 10 },
  [ExamType.TYT]: { turkish: 40, math: 40, science: 20, social: 20 },
  [ExamType.AYT_SAY]: { math: 40, physics: 14, chemistry: 13, biology: 13 },
  [ExamType.AYT_EA]: { math: 40, literature: 24, history1: 10, geography1: 6 },
  [ExamType.AYT_SOZ]: { literature: 24, history1: 10, geography1: 6, history2: 11, geography2: 11, philosophy: 12 }
};

const PIE_COLORS = {
  correct: '#22c55e', // green-500
  incorrect: '#ef4444', // red-500
  empty: '#e2e8f0'    // slate-200
};

const ExamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamResult | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedSubject, setSelectedSubject] = useState<{
    key: string;
    label: string;
    correct: number;
    incorrect: number;
    empty: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const foundExam = await db.getExam(id);
            
            if (foundExam) {
              setExam(foundExam);
              const foundStudent = await db.getStudent(foundExam.studentId);
              setStudent(foundStudent || null);
            } else {
              navigate('/students');
            }
        } catch (e) {
            console.error(e);
            navigate('/students');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [id, navigate]);

  const handleSubjectClick = (subject: { key: string, label: string }, correct: number, incorrect: number) => {
    if (!exam) return;

    let totalQuestions = 0;
    // Try to get standard count based on Exam Type
    if (QUESTION_COUNTS[exam.type] && QUESTION_COUNTS[exam.type][subject.key]) {
        totalQuestions = QUESTION_COUNTS[exam.type][subject.key];
    } else {
        // Fallback
        totalQuestions = Math.max(20, correct + incorrect);
    }

    const empty = Math.max(0, totalQuestions - (correct + incorrect));

    setSelectedSubject({
        key: subject.key,
        label: subject.label,
        correct,
        incorrect,
        empty
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;
  }

  if (!exam || !student) {
    return <div className="p-8 text-center text-slate-500">Veri bulunamadı.</div>;
  }

  // All potential subjects. Filter later based on values.
  const allSubjects = [
    { key: 'turkish', label: 'Türkçe' },
    { key: 'math', label: 'Matematik' },
    { key: 'science', label: 'Fen Bil.' },
    { key: 'social', label: 'Sosyal' },
    { key: 'lang', label: 'Yabancı Dil' },
    { key: 'rel', label: 'Din Kül.' },
    
    // AYT
    { key: 'literature', label: 'Edebiyat' },
    { key: 'history1', label: 'Tarih-1' },
    { key: 'geography1', label: 'Coğrafya-1' },
    { key: 'history2', label: 'Tarih-2' },
    { key: 'geography2', label: 'Coğrafya-2' },
    { key: 'philosophy', label: 'Felsefe' },
    { key: 'physics', label: 'Fizik' },
    { key: 'chemistry', label: 'Kimya' },
    { key: 'biology', label: 'Biyoloji' },
  ];

  const chartData = allSubjects.map(sub => {
    // @ts-ignore
    const d = exam[`${sub.key}Correct`] || 0;
    // @ts-ignore
    const y = exam[`${sub.key}Incorrect`] || 0;
    // @ts-ignore
    const net = exam[`${sub.key}Net`] || 0;

    return {
      name: sub.label,
      Dogru: d,
      Yanlis: y,
      Net: net,
      fullKey: sub.key
    };
  }).filter(item => item.Dogru > 0 || item.Yanlis > 0 || item.Net > 0); 

  const totalCorrect = chartData.reduce((acc, curr) => acc + curr.Dogru, 0);
  const totalIncorrect = chartData.reduce((acc, curr) => acc + curr.Yanlis, 0);

  // Data for Pie Chart
  const pieData = selectedSubject ? [
    { name: 'Doğru', value: selectedSubject.correct, color: PIE_COLORS.correct },
    { name: 'Yanlış', value: selectedSubject.incorrect, color: PIE_COLORS.incorrect },
    { name: 'Boş', value: selectedSubject.empty, color: PIE_COLORS.empty }
  ].filter(x => x.value > 0) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
           <Link to="/students" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-2 transition-colors">
              <ArrowLeft size={16} className="mr-1" />
              Öğrenci Listesine Dön
           </Link>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-indigo-600" />
              {exam.examName} Detayı
           </h1>
           <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
              <span className="flex items-center gap-1"><Calendar size={14}/> {exam.examDate}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">{exam.type}</span>
              <span className="font-medium text-slate-700">{student.fullName} ({student.gradeLevel}. Sınıf)</span>
           </div>
        </div>
        <div className="bg-indigo-50 px-6 py-4 rounded-xl border border-indigo-100 text-center min-w-[150px]">
            <p className="text-sm text-indigo-600 font-medium mb-1">Toplam Puan</p>
            <p className="text-4xl font-black text-indigo-700">{exam.totalScore.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <CheckCircle size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">Toplam Doğru</p>
                <p className="text-2xl font-bold text-slate-800">{totalCorrect}</p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <XCircle size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">Toplam Yanlış</p>
                <p className="text-2xl font-bold text-slate-800">{totalIncorrect}</p>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Award size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">Toplam Net</p>
                <p className="text-2xl font-bold text-slate-800">
                     {chartData.reduce((acc, curr) => acc + curr.Net, 0).toFixed(2)}
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-slate-500"/>
                    Ders Bazlı Sonuçlar
                </h3>
                <p className="text-xs text-slate-400 mt-1">Detaylı analiz için dersin üzerine tıklayın.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-white text-slate-500 border-b border-slate-100">
                            <th className="px-4 py-3 font-medium">Ders</th>
                            <th className="px-4 py-3 font-medium text-center text-green-600">D</th>
                            <th className="px-4 py-3 font-medium text-center text-red-500">Y</th>
                            <th className="px-4 py-3 font-medium text-center text-indigo-600">Net</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {chartData.map((row) => (
                            <tr 
                                key={row.name} 
                                onClick={() => handleSubjectClick({ key: row.fullKey, label: row.name }, row.Dogru, row.Yanlis)}
                                className="hover:bg-indigo-50 cursor-pointer transition-colors group"
                            >
                                <td className="px-4 py-3 font-medium text-slate-700 group-hover:text-indigo-700 flex items-center gap-2">
                                    {row.name}
                                    <PieChartIcon size={14} className="opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity" />
                                </td>
                                <td className="px-4 py-3 text-center font-bold text-slate-600">{row.Dogru}</td>
                                <td className="px-4 py-3 text-center font-bold text-slate-400">{row.Yanlis}</td>
                                <td className="px-4 py-3 text-center font-black text-indigo-600 bg-indigo-50/30 group-hover:bg-indigo-100">{row.Net}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6">Net Karşılaştırması</h3>
            <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={11} interval={0} />
                        <YAxis />
                        <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Legend />
                        <Bar dataKey="Dogru" name="Doğru" fill="#22c55e" stackId="a" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Yanlis" name="Yanlış" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Net" name="Net Değeri" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedSubject(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{selectedSubject.label}</h3>
                        <p className="text-sm text-slate-500">Soru Dağılımı Analizi</p>
                    </div>
                    <button onClick={() => setSelectedSubject(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 transition">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="h-64 w-full relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center">
                        <span className="text-2xl font-bold text-slate-800">
                            {selectedSubject.correct + selectedSubject.incorrect + selectedSubject.empty}
                        </span>
                        <span className="block text-xs text-slate-500">Soru</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                        <p className="text-xs text-green-600 font-bold uppercase">Doğru</p>
                        <p className="text-lg font-black text-green-700">{selectedSubject.correct}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                        <p className="text-xs text-red-600 font-bold uppercase">Yanlış</p>
                        <p className="text-lg font-black text-red-700">{selectedSubject.incorrect}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 font-bold uppercase">Boş</p>
                        <p className="text-lg font-black text-slate-700">{selectedSubject.empty}</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ExamDetails;