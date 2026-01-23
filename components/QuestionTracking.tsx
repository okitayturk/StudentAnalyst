import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { Student, DailyQuestionLog } from '../types';
import { PenTool, Calendar, Save, BarChart2, CheckCircle, GraduationCap, Edit2, ChevronRight, Eraser, Filter, Calculator } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Define the two main groups as requested
const SUBJECTS_GROUPS = {
    'LGS': ['Türkçe', 'Matematik', 'Fen', 'Sosyal', 'Din', 'İngilizce', 'Paragraf'],
    'YKS': ['Türkçe', 'Matematik', 'Geometri', 'Tarih', 'Coğrafya', 'Paragraf', 'Fizik', 'Kimya', 'Biyoloji', 'Felsefe', 'Din']
};

const COLORS = [
    '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', 
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#a855f7',
    '#d946ef', '#e11d48', '#0f172a'
];

const QuestionTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'analysis'>('entry');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Entry State ---
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Changed state to hold correct/incorrect objects
  const [inputs, setInputs] = useState<Record<string, { correct: number; incorrect: number }>>({});
  
  // History state for the list below form
  const [recentHistory, setRecentHistory] = useState<DailyQuestionLog[]>([]);

  // Filters for History List (Entry Mode)
  const [filterMonth, setFilterMonth] = useState<string>(''); 
  const [filterWeek, setFilterWeek] = useState<string>(''); 

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  
  // Tab state for Entry Mode (LGS vs YKS)
  const [activeExamGroup, setActiveExamGroup] = useState<'LGS' | 'YKS'>('LGS');

  // --- Analysis State ---
  // Instead of simple range string, we now use separate filters like Entry mode
  const [analysisFilterMonth, setAnalysisFilterMonth] = useState<string>('');
  const [analysisFilterWeek, setAnalysisFilterWeek] = useState<string>('');
  
  const [logs, setLogs] = useState<DailyQuestionLog[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
        const data = await db.getStudents();
        setStudents(data);
        if (data.length > 0) {
            setSelectedStudentId(data[0].id);
            // Auto-select group based on grade level (simple heuristic)
            const grade = parseInt(data[0].gradeLevel);
            if (!isNaN(grade) && grade > 8) setActiveExamGroup('YKS');
            else setActiveExamGroup('LGS');
        }
        setLoading(false);
    };
    fetchStudents();
  }, []);

  // Fetch existing log when student or date changes in Entry Mode
  useEffect(() => {
    const checkExistingLog = async () => {
        if (!selectedStudentId || activeTab !== 'entry') return;
        
        // Fetch last 365 days to populate history list and support filtering
        const recentLogs = await db.getQuestionLogs(selectedStudentId, 365); 
        
        // Update history list (sorted by date descending)
        setRecentHistory([...recentLogs].sort((a, b) => b.date.localeCompare(a.date)));

        const found = recentLogs.find(l => l.date === entryDate);
        
        if (found) {
            // Check if data is in old format (numbers) or new format (objects)
            const normalizedInputs: Record<string, { correct: number; incorrect: number }> = {};
            
            Object.entries(found.subjects).forEach(([key, val]) => {
                const v = val as any;
                if (typeof v === 'number') {
                    // Convert old number format to new format
                    normalizedInputs[key] = { correct: v, incorrect: 0 };
                } else {
                    normalizedInputs[key] = v;
                }
            });
            setInputs(normalizedInputs);
        } else {
            setInputs({});
        }
    };
    checkExistingLog();
  }, [selectedStudentId, entryDate, activeTab, saveStatus]); 

  // Fetch logs for Analysis Mode
  useEffect(() => {
    if (activeTab === 'analysis' && selectedStudentId) {
        // Always fetch 365 days for analysis to allow deep filtering
        const fetchLogs = async () => {
            const data = await db.getQuestionLogs(selectedStudentId, 365);
            setLogs(data);
        };
        fetchLogs();
    }
  }, [activeTab, selectedStudentId]);


  const handleInputChange = (subject: string, type: 'correct' | 'incorrect', val: string) => {
      const num = parseInt(val) || 0;
      setInputs(prev => ({ 
          ...prev, 
          [subject]: {
              ...(prev[subject] || { correct: 0, incorrect: 0 }),
              [type]: num
          }
      }));
  };

  const handleEditHistory = (log: DailyQuestionLog) => {
      setEntryDate(log.date);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClear = () => {
      if (confirm('Girilen tüm verileri temizlemek istiyor musunuz?')) {
          setInputs({});
      }
  };

  const handleSave = async () => {
      if (!selectedStudentId) return;
      setSaveStatus('saving');
      
      const total = Object.values(inputs).reduce((a, b: any) => a + (b.correct || 0) + (b.incorrect || 0), 0) as number;
      
      const logData = {
          studentId: selectedStudentId,
          date: entryDate,
          subjects: inputs,
          total
      };

      try {
          await db.saveQuestionLog(logData);
          setSaveStatus('success');
          setTimeout(() => {
              setSaveStatus('idle');
              // Reset date to today to exit "edit mode" for past entries
              setEntryDate(new Date().toISOString().split('T')[0]);
          }, 1500);
      } catch (error) {
          console.error(error);
          setSaveStatus('idle');
          alert("Kaydedilirken hata oluştu.");
      }
  };

  // --- Helpers for Filtering ---

  // Get Monday of the week for a date
  const getMonday = (d: Date) => {
      d = new Date(d);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(d.setDate(diff));
  };

  // Helper to format Month Label (2024-01 -> Ocak 2024)
  const formatMonthLabel = (yyyy_mm: string) => {
      const [year, month] = yyyy_mm.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
  };

  // --- Entry Mode Filters ---
  const availableMonths = useMemo(() => {
      const months = new Set<string>();
      recentHistory.forEach(log => months.add(log.date.substring(0, 7)));
      return Array.from(months).sort().reverse();
  }, [recentHistory]);

  const availableWeeks = useMemo(() => {
      const weeksMap = new Map<string, string>(); 
      recentHistory.forEach(log => {
          const date = new Date(log.date);
          const monday = getMonday(date);
          const mondayStr = monday.toISOString().split('T')[0];
          if (!weeksMap.has(mondayStr)) {
              const sunday = new Date(monday);
              sunday.setDate(monday.getDate() + 6);
              const label = `${monday.getDate()} ${monday.toLocaleString('tr-TR', { month: 'long' })} - ${sunday.getDate()} ${sunday.toLocaleString('tr-TR', { month: 'long' })}`;
              weeksMap.set(mondayStr, label);
          }
      });
      return Array.from(weeksMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [recentHistory]);

  const filteredHistory = useMemo(() => {
      return recentHistory.filter(log => {
          let matchMonth = true;
          let matchWeek = true;
          if (filterMonth) matchMonth = log.date.startsWith(filterMonth);
          if (filterWeek) {
              const logDateStr = log.date;
              const monday = new Date(filterWeek);
              const sunday = new Date(monday);
              sunday.setDate(monday.getDate() + 6);
              const sundayStr = sunday.toISOString().split('T')[0];
              matchWeek = logDateStr >= filterWeek && logDateStr <= sundayStr;
          }
          return matchMonth && matchWeek;
      });
  }, [recentHistory, filterMonth, filterWeek]);

  const summaryStats = useMemo(() => {
      let questions = 0;
      let correct = 0;
      let incorrect = 0;
      filteredHistory.forEach(log => {
          questions += log.total;
          Object.values(log.subjects).forEach((val: any) => {
               if (typeof val === 'number') {
                   correct += val;
               } else {
                   correct += val.correct || 0;
                   incorrect += val.incorrect || 0;
               }
          });
      });
      return { questions, correct, incorrect };
  }, [filteredHistory]);


  // --- Analysis Mode Filters ---
  
  // Re-calculate available weeks/months based on `logs` (Analysis data source)
  const availableAnalysisMonths = useMemo(() => {
      const months = new Set<string>();
      logs.forEach(log => months.add(log.date.substring(0, 7)));
      return Array.from(months).sort().reverse();
  }, [logs]);

  const availableAnalysisWeeks = useMemo(() => {
      const weeksMap = new Map<string, string>(); 
      logs.forEach(log => {
          const date = new Date(log.date);
          const monday = getMonday(date);
          const mondayStr = monday.toISOString().split('T')[0];
          if (!weeksMap.has(mondayStr)) {
              const sunday = new Date(monday);
              sunday.setDate(monday.getDate() + 6);
              const label = `${monday.getDate()} ${monday.toLocaleString('tr-TR', { month: 'long' })} - ${sunday.getDate()} ${sunday.toLocaleString('tr-TR', { month: 'long' })}`;
              weeksMap.set(mondayStr, label);
          }
      });
      return Array.from(weeksMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [logs]);

  const filteredAnalysisLogs = useMemo(() => {
      return logs.filter(log => {
          let matchMonth = true;
          let matchWeek = true;
          if (analysisFilterMonth) matchMonth = log.date.startsWith(analysisFilterMonth);
          if (analysisFilterWeek) {
              const logDateStr = log.date;
              const monday = new Date(analysisFilterWeek);
              const sunday = new Date(monday);
              sunday.setDate(monday.getDate() + 6);
              const sundayStr = sunday.toISOString().split('T')[0];
              matchWeek = logDateStr >= analysisFilterWeek && logDateStr <= sundayStr;
          }
          return matchMonth && matchWeek;
      });
  }, [logs, analysisFilterMonth, analysisFilterWeek]);


  // --- Analysis Data Preparation ---
  const chartData = useMemo(() => {
      return filteredAnalysisLogs.map(log => {
          const flattenedSubjects: Record<string, number> = {};
          
          Object.entries(log.subjects).forEach(([key, val]) => {
              const v = val as any;
              if (typeof v === 'number') {
                  flattenedSubjects[key] = v;
              } else {
                  flattenedSubjects[key] = (v.correct || 0) + (v.incorrect || 0);
              }
          });

          const item: any = {
              date: log.date.split('-').slice(1).join('/'), // MM/DD
              ...flattenedSubjects,
              Toplam: log.total
          };
          return item;
      });
  }, [filteredAnalysisLogs]);

  // Find which subjects have data to show in legend
  const activeSubjects = useMemo(() => {
      const keys = new Set<string>();
      logs.forEach(l => Object.keys(l.subjects).forEach(k => {
          // Check for data existence in both old and new formats
          const val = l.subjects[k] as any;
          if (typeof val === 'number') {
              if (val > 0) keys.add(k);
          } else {
              if (((val.correct || 0) + (val.incorrect || 0)) > 0) keys.add(k);
          }
      }));
      return Array.from(keys);
  }, [logs]);


  if (loading) return <div className="p-8 text-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div>
               <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                   <PenTool className="text-indigo-600"/>
                   Soru Takibi
               </h2>
               <p className="text-sm text-slate-500">Öğrencilerin günlük çözdüğü soru sayıları ve analizi.</p>
           </div>
           
           <div className="flex bg-slate-100 p-1 rounded-lg">
               <button 
                onClick={() => setActiveTab('entry')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'entry' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   Veri Girişi
               </button>
               <button 
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'analysis' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   Analiz & Grafik
               </button>
           </div>
       </div>

       {/* Common Filters */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-64">
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Öğrenci Seçimi</label>
                <select 
                    className="w-full border border-slate-300 rounded-lg px-3 py-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium h-12"
                    value={selectedStudentId}
                    onChange={(e) => {
                        setSelectedStudentId(e.target.value);
                        // Auto switch group hint
                        const s = students.find(x => x.id === e.target.value);
                        if(s) {
                             const grade = parseInt(s.gradeLevel);
                             if (!isNaN(grade) && grade > 8) setActiveExamGroup('YKS');
                             else setActiveExamGroup('LGS');
                        }
                    }}
                >
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                </select>
            </div>
            
            {activeTab === 'entry' && (
                <div className="w-full md:w-48">
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Tarih</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18}/>
                        <input 
                            type="date" 
                            className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-3 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none h-12 text-slate-800"
                            value={entryDate}
                            onChange={(e) => setEntryDate(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Analysis Filters moved here to be prominent */}
            {activeTab === 'analysis' && (
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto mt-auto">
                    <div className="w-full md:w-40">
                         <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Ay Filtresi</label>
                         <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <select 
                                className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-12"
                                value={analysisFilterMonth}
                                onChange={(e) => {
                                    setAnalysisFilterMonth(e.target.value);
                                    setAnalysisFilterWeek(''); // Reset week
                                }}
                            >
                                <option value="">Tüm Aylar</option>
                                {availableAnalysisMonths.map(m => (
                                    <option key={m} value={m}>{formatMonthLabel(m)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-56">
                         <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Hafta Filtresi</label>
                         <div className="relative">
                            <Filter size={16} className="absolute left-3 top-3.5 text-slate-400" />
                            <select 
                                className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-12"
                                value={analysisFilterWeek}
                                onChange={(e) => {
                                    setAnalysisFilterWeek(e.target.value);
                                }}
                            >
                                <option value="">Tüm Haftalar</option>
                                {availableAnalysisWeeks.map(([monday, label]) => (
                                    <option key={monday} value={monday}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
       </div>

       {/* --- ENTRY MODE --- */}
       {activeTab === 'entry' && (
           <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        
                        {/* LGS / YKS Tabs */}
                        <div className="flex border-b border-slate-200 mb-6">
                            <button
                                onClick={() => setActiveExamGroup('LGS')}
                                className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors ${activeExamGroup === 'LGS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                LGS Dersleri
                            </button>
                            <button
                                onClick={() => setActiveExamGroup('YKS')}
                                className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors ${activeExamGroup === 'YKS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                YKS Dersleri
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {SUBJECTS_GROUPS[activeExamGroup].map((sub) => (
                                <div key={sub} className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-base font-bold text-slate-800">{sub}</label>
                                        <span className="text-xs font-semibold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                                            {((inputs[sub] as any)?.correct || 0) + ((inputs[sub] as any)?.incorrect || 0)} Toplam
                                        </span>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-green-600 mb-1 uppercase tracking-wider">Doğru</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                placeholder="0"
                                                className="w-full border border-slate-300 rounded-md p-2 text-center font-bold text-xl bg-white text-green-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none h-12"
                                                value={inputs[sub]?.correct ?? ''}
                                                onChange={(e) => handleInputChange(sub, 'correct', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-red-600 mb-1 uppercase tracking-wider">Yanlış</label>
                                            <input 
                                                type="number" 
                                                min="0"
                                                placeholder="0"
                                                className="w-full border border-slate-300 rounded-md p-2 text-center font-bold text-xl bg-white text-red-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none h-12"
                                                value={inputs[sub]?.incorrect ?? ''}
                                                onChange={(e) => handleInputChange(sub, 'incorrect', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-100 pt-6">
                            <div className="text-slate-600 font-medium flex items-center gap-2">
                                <GraduationCap className="text-indigo-400" />
                                <span className="text-sm">Günlük Toplam:</span>
                                <span className="text-3xl font-black text-indigo-600">
                                    {Object.values(inputs).reduce((a, b: any) => a + (b.correct || 0) + (b.incorrect || 0), 0)}
                                </span>
                                <span className="text-sm">Soru</span>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button 
                                    type="button"
                                    onClick={handleClear}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                                >
                                    <Eraser size={20} /> Temizle
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition shadow-lg ${saveStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                    disabled={saveStatus === 'saving'}
                                >
                                    {saveStatus === 'saving' ? 'Kaydediliyor...' : saveStatus === 'success' ? (
                                        <>
                                            <CheckCircle size={20} /> Kaydedildi
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} /> Kaydet
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                </div>

                {/* History List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Edit2 size={16} className="text-indigo-600" />
                            Son Kayıtlar (Düzenlemek için tıklayın)
                        </h3>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                             <div className="relative">
                                <Calendar size={14} className="absolute left-3 top-3 text-slate-400" />
                                <select 
                                    className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-40"
                                    value={filterMonth}
                                    onChange={(e) => {
                                        setFilterMonth(e.target.value);
                                        setFilterWeek(''); // Reset week when month changes
                                    }}
                                >
                                    <option value="">Tüm Aylar</option>
                                    {availableMonths.map(m => (
                                        <option key={m} value={m}>{formatMonthLabel(m)}</option>
                                    ))}
                                </select>
                             </div>
                             
                             <div className="relative">
                                <Filter size={14} className="absolute left-3 top-3 text-slate-400" />
                                <select 
                                    className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
                                    value={filterWeek}
                                    onChange={(e) => {
                                        setFilterWeek(e.target.value);
                                    }}
                                >
                                    <option value="">Tüm Haftalar</option>
                                    {availableWeeks.map(([monday, label]) => (
                                        <option key={monday} value={monday}>{label}</option>
                                    ))}
                                </select>
                             </div>
                        </div>
                    </div>
                    
                    {/* Summary for Filtered Data */}
                    <div className="bg-indigo-50/50 px-6 py-3 border-b border-indigo-100 flex flex-col sm:flex-row justify-between items-center text-sm gap-2">
                        <span className="font-bold text-indigo-900 flex items-center gap-2">
                             <Calculator size={16} className="text-indigo-600"/>
                             {filterWeek ? 'Seçili Hafta Toplamı' : (filterMonth ? 'Seçili Ay Toplamı' : 'Listelenen Toplam')}:
                        </span>
                        <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">
                            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-4">
                                <span className="text-slate-500 text-xs uppercase font-bold">Soru</span>
                                <span className="font-black text-slate-800 text-lg">{summaryStats.questions}</span>
                            </div>
                            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-4">
                                <span className="text-green-600 text-xs uppercase font-bold">Doğru</span>
                                <span className="font-black text-green-700 text-lg">{summaryStats.correct}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-red-500 text-xs uppercase font-bold">Yanlış</span>
                                <span className="font-black text-red-600 text-lg">{summaryStats.incorrect}</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 bg-white border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Tarih</th>
                                    <th className="px-6 py-3 font-medium text-center">Toplam Soru</th>
                                    <th className="px-6 py-3 font-medium text-center text-green-600">Toplam Doğru</th>
                                    <th className="px-6 py-3 font-medium text-center text-red-500">Toplam Yanlış</th>
                                    <th className="px-6 py-3 font-medium text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((log) => {
                                        // Calculate breakdown for display
                                        let totalCorrect = 0;
                                        let totalIncorrect = 0;
                                        Object.values(log.subjects).forEach((val: any) => {
                                            if (typeof val === 'number') {
                                                totalCorrect += val;
                                            } else {
                                                totalCorrect += val.correct || 0;
                                                totalIncorrect += val.incorrect || 0;
                                            }
                                        });

                                        return (
                                            <tr 
                                                key={log.id} 
                                                className={`hover:bg-indigo-50 transition-colors cursor-pointer group ${log.date === entryDate ? 'bg-indigo-50/60' : ''}`}
                                                onClick={() => handleEditHistory(log)}
                                            >
                                                <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {log.date.split('-').reverse().join('.')}
                                                    {log.date === entryDate && (
                                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded ml-2 font-bold">Düzenleniyor</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-slate-800">{log.total}</td>
                                                <td className="px-6 py-4 text-center font-bold text-green-600 bg-green-50/30">{totalCorrect}</td>
                                                <td className="px-6 py-4 text-center font-bold text-red-500 bg-red-50/30">{totalIncorrect}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1 ml-auto group-hover:underline"
                                                    >
                                                        Düzenle <ChevronRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center p-8 text-slate-400">
                                            {recentHistory.length > 0 ? 'Filtreye uygun kayıt bulunamadı.' : 'Henüz kayıt bulunamadı.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
           </div>
       )}

       {/* --- ANALYSIS MODE --- */}
       {activeTab === 'analysis' && (
           <div className="space-y-6">
                {/* Main Stacked Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <BarChart2 className="text-indigo-500" />
                        Ders Bazlı Günlük Dağılım
                    </h3>
                    <div className="w-full h-96">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Legend />
                                    {activeSubjects.map((sub, idx) => (
                                        <Bar 
                                            key={sub} 
                                            dataKey={sub} 
                                            stackId="a" 
                                            fill={COLORS[idx % COLORS.length]} 
                                            radius={[0,0,0,0]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Kayıt bulunamadı.
                            </div>
                        )}
                    </div>
                </div>

                 {/* Trend Line Chart */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">
                        Günlük Toplam Soru Trendi
                    </h3>
                    <div className="w-full h-80">
                         {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip 
                                         contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Line type="monotone" dataKey="Toplam" stroke="#4f46e5" strokeWidth={3} dot={{r:4}} />
                                </LineChart>
                            </ResponsiveContainer>
                         ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Kayıt bulunamadı.
                            </div>
                         )}
                    </div>
                 </div>
           </div>
       )}
    </div>
  );
};

export default QuestionTracking;