import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { ExamResult, Student } from '../types';
import { ArrowLeft, Calendar, FileText, TrendingUp, CheckCircle, XCircle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const ExamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamResult | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!id) return;
    const allExams = db.getExams();
    const foundExam = allExams.find(e => e.id === id);
    
    if (foundExam) {
      setExam(foundExam);
      const allStudents = db.getStudents();
      const foundStudent = allStudents.find(s => s.id === foundExam.studentId);
      setStudent(foundStudent || null);
    } else {
      // Exam not found
      navigate('/students');
    }
  }, [id, navigate]);

  if (!exam || !student) {
    return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;
  }

  // Prepare data for charts and table
  const subjects = [
    { key: 'turkish', label: 'Türkçe', color: '#ef4444' },
    { key: 'math', label: 'Matematik', color: '#3b82f6' },
    { key: 'science', label: 'Fen Bil.', color: '#10b981' },
    { key: 'social', label: 'Sosyal', color: '#f59e0b' },
    { key: 'lang', label: 'Yabancı Dil', color: '#8b5cf6' },
    { key: 'rel', label: 'Din Kül.', color: '#06b6d4' },
  ];

  // Filter out subjects that don't exist in the data (e.g. for TYT where lang might be 0/null if not entered)
  // Or simply show all but handle zeros.
  const chartData = subjects.map(sub => {
    // @ts-ignore - Dynamic access to optional properties
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
  // Only show subjects that have data to keep charts clean

  const totalCorrect = chartData.reduce((acc, curr) => acc + curr.Dogru, 0);
  const totalIncorrect = chartData.reduce((acc, curr) => acc + curr.Yanlis, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
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

      {/* Summary Stats Cards */}
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
                    {/* Sum of nets from chartData might differ slightly due to float precision, usually prefer pre-calc stats but chartData sum is fine for display */}
                     {chartData.reduce((acc, curr) => acc + curr.Net, 0).toFixed(2)}
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detailed Table */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-slate-500"/>
                    Ders Bazlı Sonuçlar
                </h3>
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
                            <tr key={row.name} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-medium text-slate-700">{row.name}</td>
                                <td className="px-4 py-3 text-center font-bold text-slate-600">{row.Dogru}</td>
                                <td className="px-4 py-3 text-center font-bold text-slate-400">{row.Yanlis}</td>
                                <td className="px-4 py-3 text-center font-black text-indigo-600 bg-indigo-50/30">{row.Net}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-800 mb-6">Net Karşılaştırması</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Legend />
                        <Bar dataKey="Dogru" name="Doğru" fill="#22c55e" stackId="a" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Yanlis" name="Yanlış" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Net" name="Net Değeri" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;