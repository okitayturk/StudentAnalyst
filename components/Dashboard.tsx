import React, { useEffect, useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend 
} from 'recharts';
import { db } from '../services/db';
import { ExamResult, Student, ExamType } from '../types';
import { Users, GraduationCap, TrendingUp, Filter, User, BookOpen, BarChart2 } from 'lucide-react';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316'];

const TREND_METRICS = [
    { key: 'score', label: 'Genel Puan Ortalaması' },
    { key: 'turkish', label: 'Türkçe Net Ortalaması' },
    { key: 'math', label: 'Matematik Net Ortalaması' },
    { key: 'science', label: 'Fen Bilimleri Net Ortalaması' },
    { key: 'social', label: 'Sosyal Bilgiler Net Ortalaması' },
    { key: 'physics', label: 'Fizik Net Ortalaması' },
    { key: 'chemistry', label: 'Kimya Net Ortalaması' },
    { key: 'biology', label: 'Biyoloji Net Ortalaması' },
    { key: 'literature', label: 'Edebiyat Net Ortalaması' },
    { key: 'history1', label: 'Tarih-1 Net Ortalaması' },
    { key: 'geography1', label: 'Coğrafya-1 Net Ortalaması' },
];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Filters
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('Tümü');
  
  // Chart Metric Filter
  const [selectedTrendMetric, setSelectedTrendMetric] = useState<string>('score');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const studentsData = await db.getStudents();
        const examsData = await db.getExams();
        
        setStudents(studentsData);
        setExams(examsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Helpers ---
  const getFormattedMonth = (dateStr: string) => {
    if (dateStr === 'Tümü') return 'Tüm Zamanlar';
    // dateStr format: YYYY-MM
    const [year, month] = dateStr.split('-');
    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return `${year} - ${monthNames[parseInt(month) - 1]}`;
  };

  // --- Calculations ---

  // 1. Filter Exams by Student AND Exam Type
  const filteredExams = useMemo(() => {
      let result = exams;

      // Filter by Student
      if (selectedStudentId !== 'all') {
          result = result.filter(e => e.studentId === selectedStudentId);
      }

      // Filter by Exam Type
      if (selectedExamType !== 'all') {
          result = result.filter(e => e.type === selectedExamType);
      }

      return result;
  }, [exams, selectedStudentId, selectedExamType]);

  // 2. General Stats (Based on filtered exams)
  const stats = useMemo(() => {
    const totalScore = filteredExams.reduce((acc, curr) => acc + curr.totalScore, 0);
    const avg = filteredExams.length > 0 ? Math.round(totalScore / filteredExams.length) : 0;
    
    // If a specific student is selected, count is 1 (if they exist), otherwise total student count
    const displayedStudentCount = selectedStudentId === 'all' 
        ? students.length 
        : (students.find(s => s.id === selectedStudentId) ? 1 : 0);

    return {
        studentCount: displayedStudentCount,
        examCount: filteredExams.length,
        avgScore: avg
    };
  }, [filteredExams, students, selectedStudentId]);

  // 3. Monthly Trend Data (Line Chart) - Based on filtered exams AND selected Metric
  const monthlyTrendData = useMemo(() => {
    const grouped: Record<string, { total: number; count: number }> = {};
    
    filteredExams.forEach(exam => {
        if (!exam.examDate) return;
        const month = exam.examDate.substring(0, 7); // YYYY-MM
        if (!grouped[month]) grouped[month] = { total: 0, count: 0 };
        
        // Determine value based on selected metric
        let val = 0;
        if (selectedTrendMetric === 'score') {
            val = exam.totalScore;
        } else {
            // Dynamic key access for nets (e.g., turkishNet, mathNet)
            const key = `${selectedTrendMetric}Net` as keyof ExamResult;
            // @ts-ignore
            val = (exam[key] as number) || 0;
        }

        grouped[month].total += val;
        grouped[month].count += 1;
    });

    return Object.keys(grouped).sort().map(month => ({
        name: month,
        displayName: getFormattedMonth(month),
        value: Math.round((grouped[month].total / grouped[month].count) * 100) / 100 // Round to 2 decimals
    }));
  }, [filteredExams, selectedTrendMetric]);

  // 4. Subject Data (Bar Chart) - Based on filtered exams AND selected month
  const subjectChartData = useMemo(() => {
    let currentSet = filteredExams;

    if (selectedMonth !== 'Tümü') {
        currentSet = filteredExams.filter(e => e.examDate && e.examDate.substring(0, 7) === selectedMonth);
    }

    if (currentSet.length === 0) return [];

    // Initialize accumulator for all possible subjects
    const totals = {
        turkish: 0, math: 0, science: 0, social: 0, lang: 0, rel: 0,
        literature: 0, history1: 0, geography1: 0,
        history2: 0, geography2: 0, philosophy: 0,
        physics: 0, chemistry: 0, biology: 0
    };

    const count = currentSet.length;

    currentSet.forEach(curr => {
        totals.turkish += curr.turkishNet || 0;
        totals.math += curr.mathNet || 0;
        totals.science += curr.scienceNet || 0;
        totals.social += curr.socialNet || 0;
        totals.lang += curr.langNet || 0;
        totals.rel += curr.relNet || 0;
        totals.literature += curr.literatureNet || 0;
        totals.history1 += curr.history1Net || 0;
        totals.geography1 += curr.geography1Net || 0;
        totals.history2 += curr.history2Net || 0;
        totals.geography2 += curr.geography2Net || 0;
        totals.philosophy += curr.philosophyNet || 0;
        totals.physics += curr.physicsNet || 0;
        totals.chemistry += curr.chemistryNet || 0;
        totals.biology += curr.biologyNet || 0;
    });
    
    // Explicitly type the array to avoid "Variable 'data' implicitly has type 'any[]'" error
    const data: { name: string; value: number }[] = [];

    // Helper to push only if relevant or has value
    const pushIfRelevant = (key: keyof typeof totals, name: string) => {
        const val = totals[key];
        // Display if value > 0 OR if it's a standard field and we are in 'all' mode
        // For dashboard clarity, we usually only show what has data
        if (val > 0) {
            data.push({ name, value: Math.round(val / count * 10) / 10 });
        }
    };

    // Standard
    pushIfRelevant('turkish', 'Türkçe');
    pushIfRelevant('math', 'Matematik');
    pushIfRelevant('science', 'Fen Bil.');
    pushIfRelevant('social', 'Sosyal');
    pushIfRelevant('lang', 'Yabancı Dil');
    pushIfRelevant('rel', 'Din Kültürü');

    // AYT Specifics
    pushIfRelevant('literature', 'Edebiyat');
    pushIfRelevant('history1', 'Tarih-1');
    pushIfRelevant('geography1', 'Coğrafya-1');
    pushIfRelevant('history2', 'Tarih-2');
    pushIfRelevant('geography2', 'Coğrafya-2');
    pushIfRelevant('philosophy', 'Felsefe');
    pushIfRelevant('physics', 'Fizik');
    pushIfRelevant('chemistry', 'Kimya');
    pushIfRelevant('biology', 'Biyoloji');

    return data;
  }, [filteredExams, selectedMonth]);

  // Available months based on the currently filtered exams
  const availableMonths = useMemo(() => {
      const months = new Set(filteredExams.map(e => e.examDate ? e.examDate.substring(0, 7) : '').filter(Boolean));
      return Array.from(months).sort().reverse();
  }, [filteredExams]);

  // Reset month filter if selected month is not available in new student selection
  useEffect(() => {
      if (selectedMonth !== 'Tümü' && !availableMonths.includes(selectedMonth)) {
          setSelectedMonth('Tümü');
      }
  }, [selectedStudentId, selectedExamType, availableMonths]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Veriler yükleniyor...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Main Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">
            {selectedStudentId === 'all' ? 'Genel Bakış' : 'Öğrenci Analizi'}
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
            {/* Exam Type Filter */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <BookOpen size={18} className="text-indigo-600 ml-2" />
                <select 
                    className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer min-w-[140px] outline-none"
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                >
                    <option value="all">Tüm Sınav Türleri</option>
                    {Object.values(ExamType).map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            {/* Student Filter */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <User size={18} className="text-indigo-600 ml-2" />
                <select 
                    className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer min-w-[180px] outline-none"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                    <option value="all">Tüm Öğrenciler</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Users size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">
                    {selectedStudentId === 'all' ? 'Toplam Öğrenci' : 'Seçili Öğrenci'}
                </p>
                <p className="text-2xl font-bold text-slate-800">{stats.studentCount}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                <GraduationCap size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">
                    {selectedExamType !== 'all' ? `${selectedExamType} Sayısı` : 'Toplam Deneme'}
                </p>
                <p className="text-2xl font-bold text-slate-800">{stats.examCount}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                <TrendingUp size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500">Ortalama Puan</p>
                <p className="text-2xl font-bold text-slate-800">{stats.avgScore}</p>
            </div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart - Monthly Progress Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-lg font-semibold text-slate-800">Aylık Değişim Grafiği</h3>
                
                 {/* Chart Metric Filter */}
                 <div className="relative z-10">
                    <BarChart2 className="absolute left-2 top-2 text-slate-400" size={14} />
                    <select 
                        value={selectedTrendMetric}
                        onChange={(e) => setSelectedTrendMetric(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 min-w-[180px]"
                    >
                        {TREND_METRICS.map(m => (
                            <option key={m.key} value={m.key}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="w-full h-80">
                {monthlyTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="displayName" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{fill: '#64748b'}}
                                dy={10}
                            />
                            <YAxis 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{fill: '#64748b'}}
                                domain={[0, 'auto']}
                            />
                            <Tooltip 
                                contentStyle={{
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                }} 
                                formatter={(value: number) => [value, selectedTrendMetric === 'score' ? 'Puan' : 'Net']}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#4f46e5" 
                                strokeWidth={3}
                                dot={{r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff'}}
                                activeDot={{r: 6}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg">
                        Veri bulunamadı.
                    </div>
                )}
            </div>
        </div>

        {/* Bar Chart - Subject Nets with Filter */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h3 className="text-lg font-semibold text-slate-800">Ders Bazlı Ortalama Netler</h3>
                
                {/* Month Filter */}
                <div className="relative z-10">
                    <Filter className="absolute left-2 top-2 text-slate-400" size={14} />
                    <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 min-w-[150px]"
                    >
                        <option value="Tümü">Tüm Zamanlar</option>
                        {availableMonths.map(m => (
                            <option key={m} value={m}>{getFormattedMonth(m)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="w-full h-80">
                 {subjectChartData.length > 0 && subjectChartData.some(x => x.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="name" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                interval={0} 
                                tick={{fill: '#64748b', fontSize: 10}}
                            />
                            <YAxis 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{fill: '#64748b'}}
                            />
                            <Tooltip 
                                cursor={{fill: '#f1f5f9'}}
                                contentStyle={{
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                }}
                            />
                            <Bar dataKey="value" name="Ortalama Net" radius={[4, 4, 0, 0]}>
                                {subjectChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg">
                        {selectedMonth !== 'Tümü' ? `${getFormattedMonth(selectedMonth)} dönemine ait veri yok.` : 'Veri bulunamadı.'}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;