import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { Student, DailyQuestionLog } from '../types';
import { PenTool, Calendar, Save, BarChart2, CheckCircle, GraduationCap, Edit2, ChevronRight, Eraser, Filter, Calculator, PieChart as PieChartIcon, TrendingUp, XCircle, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ReferenceLine, ReferenceArea } from 'recharts';

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
  const [analysisFilterMonth, setAnalysisFilterMonth] = useState<string>('');
  const [analysisFilterWeek, setAnalysisFilterWeek] = useState<string>('');
  
  // NEW: Trend Chart Subject Filters
  const [correctTrendFilter, setCorrectTrendFilter] = useState<string>('all');
  const [incorrectTrendFilter, setIncorrectTrendFilter] = useState<string>('all');
  const [pieChartFilter, setPieChartFilter] = useState<string>('all');
  
  // NEW: Main Bar Chart Time Scale (Global for Analysis Tab)
  const [chartTimeScale, setChartTimeScale] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Dynamic Target Threshold State
  const [targetThreshold, setTargetThreshold] = useState<number>(80);

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

  // Update default threshold when time scale changes
  useEffect(() => {
    if (chartTimeScale === 'weekly') setTargetThreshold(560);
    else if (chartTimeScale === 'monthly') setTargetThreshold(2400);
    else setTargetThreshold(80);
  }, [chartTimeScale]);

  // Generate options for the threshold dropdown
  const thresholdOptions = useMemo(() => {
      if (chartTimeScale === 'daily') {
          return [
              10, 20, 30, 40, 50, 60, 70, 75, 80, 90, 100, 
              110, 120, 130, 140, 150, 175, 200, 250, 300, 400, 500
          ];
      }
      if (chartTimeScale === 'weekly') {
          // Daily * 7 approx
          return [
              70, 140, 210, 280, 350, 420, 490, 500, 560, 630, 700, 
              770, 840, 900, 1000, 1200, 1500, 2000
          ];
      }
      // Monthly (Daily * 30 approx)
      return [
          300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 
          3300, 3600, 4000, 4500, 5000, 6000, 7500, 9000, 10000
      ];
  }, [chartTimeScale]);

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


  // --- CENTRAL AGGREGATION LOGIC ---
  // Create a single aggregated dataset based on chartTimeScale
  const aggregatedData = useMemo(() => {
      if (filteredAnalysisLogs.length === 0) return [];

      const grouped: Record<string, any> = {};

      filteredAnalysisLogs.forEach(log => {
          let key = '';
          let label = '';
          let sortKey = '';

          if (chartTimeScale === 'daily') {
             key = log.date;
             sortKey = log.date;
             label = log.date.split('-').slice(1).join('/');
          } else if (chartTimeScale === 'weekly') {
             const date = new Date(log.date);
             const monday = getMonday(date);
             sortKey = monday.toISOString().split('T')[0];
             const sunday = new Date(monday);
             sunday.setDate(monday.getDate() + 6);
             label = `${monday.getDate()}/${monday.getMonth()+1} - ${sunday.getDate()}/${sunday.getMonth()+1}`;
             key = sortKey;
          } else { // monthly
             key = log.date.substring(0, 7); // YYYY-MM
             sortKey = key;
             const [y, m] = key.split('-');
             const d = new Date(parseInt(y), parseInt(m)-1);
             label = d.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
          }

          if (!grouped[key]) {
              grouped[key] = { 
                  date: label, 
                  rawDate: sortKey, 
                  total: 0, 
                  totalCorrect: 0, 
                  totalIncorrect: 0,
                  subjects: {} // Store breakdown
              };
          }

          grouped[key].total += log.total;

          Object.entries(log.subjects).forEach(([subj, val]) => {
              const v = val as any;
              let c = 0, i = 0;
              if (typeof v === 'number') {
                  c = v; // Legacy number format
              } else {
                  c = v.correct || 0;
                  i = v.incorrect || 0;
              }
              
              grouped[key].totalCorrect += c;
              grouped[key].totalIncorrect += i;

              if (!grouped[key].subjects[subj]) grouped[key].subjects[subj] = { c: 0, i: 0 };
              grouped[key].subjects[subj].c += c;
              grouped[key].subjects[subj].i += i;
          });
      });

      return Object.values(grouped).sort((a: any, b: any) => a.rawDate.localeCompare(b.rawDate));
  }, [filteredAnalysisLogs, chartTimeScale]);

  // 1. Stacked Bar Data (Ders Bazlı Dağılım)
  const chartData = useMemo(() => {
      return aggregatedData.map((item: any) => {
          const subjCounts: any = {};
          Object.entries(item.subjects).forEach(([k, v]: any) => subjCounts[k] = v.c + v.i);
          return {
              date: item.date,
              rawDate: item.rawDate,
              ...subjCounts,
              Toplam: item.total
          };
      });
  }, [aggregatedData]);

  // Calculate Threshold Stats for Total Questions (Above/Below Target)
  const thresholdStats = useMemo(() => {
      let below = 0;
      let above = 0;
      chartData.forEach((d: any) => {
          if (d.Toplam < targetThreshold) below++;
          else above++;
      });
      return { below, above };
  }, [chartData, targetThreshold]);

  // 2. Correct/Incorrect Bar Data
  const dailyTotalAccuracyData = useMemo(() => {
      return aggregatedData.map((item: any) => ({
          date: item.date,
          Doğru: item.totalCorrect,
          Yanlış: item.totalIncorrect
      }));
  }, [aggregatedData]);

  // Calculate Y-Axis Domain for Accuracy Chart
  const accuracyChartDomain = useMemo(() => {
    if (dailyTotalAccuracyData.length === 0) return [0, 'auto'];
    
    // For stacked bars, we need the sum of the stack
    const totals = dailyTotalAccuracyData.map(d => (d.Doğru || 0) + (d.Yanlış || 0));
    const maxVal = Math.max(...totals);
    
    // Ensure the domain covers the target threshold comfortably
    const topEdge = Math.max(maxVal, targetThreshold);

    // Add about 10% padding if maxVal is close to target or larger
    return [0, Math.ceil(topEdge * 1.1)];
  }, [dailyTotalAccuracyData, targetThreshold]);

  // Calculate Y-Axis Domain for Total Trend Chart
  const totalTrendDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 'auto'];

    const totals = chartData.map((d: any) => d.Toplam || 0);
    const maxVal = Math.max(...totals);
    
    // Ensure the domain covers the target threshold comfortably
    const topEdge = Math.max(maxVal, targetThreshold);

    return [0, Math.ceil(topEdge * 1.1)];
  }, [chartData, targetThreshold]);


  // 3. Trend Data Generator (Success Rates)
  const getTrendData = (subjectFilter: string, type: 'correct' | 'incorrect') => {
      return aggregatedData.map((item: any) => {
          let c = 0, i = 0;
          if (subjectFilter === 'all') {
              c = item.totalCorrect;
              i = item.totalIncorrect;
          } else {
              const s = item.subjects[subjectFilter];
              if (s) { c = s.c; i = s.i; }
          }
          
          const total = c + i;
          const percentage = total > 0 ? (type === 'correct' ? c : i) / total * 100 : 0;
          
          return {
              date: item.date,
              value: parseFloat(percentage.toFixed(1))
          };
      });
  };

  const correctTrendData = useMemo(() => getTrendData(correctTrendFilter, 'correct'), [aggregatedData, correctTrendFilter]);
  const incorrectTrendData = useMemo(() => getTrendData(incorrectTrendFilter, 'incorrect'), [aggregatedData, incorrectTrendFilter]);

  // Calculate Threshold Stats for Correct Rate (Above/Below 85%)
  const correctThresholdStats = useMemo(() => {
      let below = 0;
      let above = 0;
      correctTrendData.forEach((d: any) => {
          if (d.value < 85) below++;
          else above++;
      });
      return { below, above };
  }, [correctTrendData]);

  // Calculate Threshold Stats for Incorrect Rate (Above/Below 15%)
  const incorrectThresholdStats = useMemo(() => {
      let good = 0; // <= 15
      let bad = 0;  // > 15
      incorrectTrendData.forEach((d: any) => {
          if (d.value > 15) bad++;
          else good++;
      });
      return { good, bad };
  }, [incorrectTrendData]);

  // Dynamic Y-Axis domains
  const correctRateDomain = useMemo(() => {
      if (correctTrendData.length === 0) return [0, 100];
      const minVal = Math.min(...correctTrendData.map((d: any) => d.value));
      if (minVal < 50) return [0, 100];
      if (minVal < 75) return [50, 100];
      return [75, 100];
  }, [correctTrendData]);

  const incorrectRateDomain = useMemo(() => {
      if (incorrectTrendData.length === 0) return [0, 100];
      const maxVal = Math.max(...incorrectTrendData.map((d: any) => d.value));
      if (maxVal > 50) return [0, 100];
      if (maxVal > 25) return [0, 50];
      return [0, 25];
  }, [incorrectTrendData]);

  // Pie Chart Data (Global Aggregate)
  const pieChartData = useMemo(() => {
      let correct = 0;
      let incorrect = 0;
      
      // Calculate from filtered logs directly as Pie is usually a snapshot of the selected period
      filteredAnalysisLogs.forEach(log => {
          const processSubject = (key: string, val: any) => {
               let c = 0, i = 0;
               if (typeof val === 'number') c = val;
               else { c = val.correct || 0; i = val.incorrect || 0; }
               correct += c;
               incorrect += i;
          };

          if (pieChartFilter === 'all') {
              Object.entries(log.subjects).forEach(([k, v]) => processSubject(k, v));
          } else {
              const val = log.subjects[pieChartFilter];
              if (val) processSubject(pieChartFilter, val);
          }
      });
      
      if (correct === 0 && incorrect === 0) return [];

      return [
          { name: 'Doğru', value: correct, color: '#10b981' }, 
          { name: 'Yanlış', value: incorrect, color: '#ef4444' } 
      ];
  }, [filteredAnalysisLogs, pieChartFilter]);

  // Find which subjects have data to show in legend
  const activeSubjects = useMemo(() => {
      const keys = new Set<string>();
      logs.forEach(l => Object.keys(l.subjects).forEach(k => {
          const val = l.subjects[k] as any;
          if (typeof val === 'number') {
              if (val > 0) keys.add(k);
          } else {
              if (((val.correct || 0) + (val.incorrect || 0)) > 0) keys.add(k);
          }
      }));
      return Array.from(keys);
  }, [logs]);

  // Reusable Time Scale Toggle Button Group
  const TimeScaleControls = () => (
    <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
         <button 
            onClick={() => setChartTimeScale('daily')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${chartTimeScale === 'daily' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
         >
             Günlük
         </button>
         <button 
            onClick={() => setChartTimeScale('weekly')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${chartTimeScale === 'weekly' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
         >
             Haftalık
         </button>
         <button 
            onClick={() => setChartTimeScale('monthly')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${chartTimeScale === 'monthly' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
         >
             Aylık
         </button>
    </div>
  );

  // NEW: Reusable Target Dropdown for Chart Headers
  const TargetDropdown = () => (
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Target size={12} />
            Hedef:
        </span>
        <select 
            className="bg-transparent text-xs font-bold text-indigo-600 focus:outline-none cursor-pointer appearance-none pr-1"
            value={targetThreshold}
            onChange={(e) => setTargetThreshold(Number(e.target.value))}
        >
            {thresholdOptions.map(val => (
                <option key={val} value={val}>{val}</option>
            ))}
        </select>
    </div>
  );

  const getTimeLabel = () => chartTimeScale === 'daily' ? 'Günlük' : chartTimeScale === 'weekly' ? 'Haftalık' : 'Aylık';

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

            {/* Analysis Filters */}
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

       {/* ... rest of the component (Charts) ... */}
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
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BarChart2 className="text-indigo-500" />
                            Ders Bazlı {getTimeLabel()} Dağılım
                        </h3>
                        <TimeScaleControls />
                    </div>
                    
                    <div className="w-full h-96">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" fontSize={chartTimeScale !== 'daily' ? 10 : 12}/>
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

                 {/* Daily Correct/Incorrect Chart */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle className="text-green-600" size={20} />
                            {getTimeLabel()} Doğru / Yanlış Dağılımı
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm">
                                %{thresholdStats.above + thresholdStats.below > 0 
                                    ? Math.round((thresholdStats.above / (thresholdStats.above + thresholdStats.below)) * 100) 
                                    : 0} Başarı
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                                    <CheckCircle size={14} /> {thresholdStats.above}
                                </span>
                                <span className="flex items-center gap-1 text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                                    <XCircle size={14} /> {thresholdStats.below}
                                </span>
                            </div>
                            <TargetDropdown />
                            <TimeScaleControls />
                        </div>
                    </div>

                    <div className="w-full h-80">
                        {dailyTotalAccuracyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyTotalAccuracyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <ReferenceArea y1={accuracyChartDomain[0]} y2={targetThreshold} fill="#fee2e2" fillOpacity={0.5} stroke="none" />
                                    <XAxis dataKey="date" fontSize={chartTimeScale !== 'daily' ? 10 : 12}/>
                                    <YAxis domain={accuracyChartDomain as any} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Legend />
                                    <ReferenceLine 
                                        y={targetThreshold} 
                                        stroke="red" 
                                        strokeDasharray="3 3" 
                                        label={{ position: 'insideTopRight', value: `Hedef: ${targetThreshold}`, fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} 
                                    />
                                    <Bar dataKey="Doğru" stackId="a" fill="#10b981" radius={[0,0,4,4]} />
                                    <Bar dataKey="Yanlış" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
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
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800">
                            {getTimeLabel()} Toplam Soru Trendi
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm">
                                %{thresholdStats.above + thresholdStats.below > 0 
                                    ? Math.round((thresholdStats.above / (thresholdStats.above + thresholdStats.below)) * 100) 
                                    : 0} Başarı
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                                    <CheckCircle size={14} /> {thresholdStats.above}
                                </span>
                                <span className="flex items-center gap-1 text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                                    <XCircle size={14} /> {thresholdStats.below}
                                </span>
                            </div>
                            <TargetDropdown />
                            <TimeScaleControls />
                        </div>
                    </div>

                    <div className="w-full h-80">
                         {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <ReferenceArea y1={totalTrendDomain[0]} y2={targetThreshold} fill="#fee2e2" fillOpacity={0.5} stroke="none" />
                                    <XAxis dataKey="date" fontSize={chartTimeScale !== 'daily' ? 10 : 12}/>
                                    <YAxis domain={totalTrendDomain as any} />
                                    <Tooltip 
                                         contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <ReferenceLine 
                                        y={targetThreshold} 
                                        stroke="red" 
                                        strokeDasharray="3 3"
                                        label={{ position: 'insideTopRight', value: `Hedef: ${targetThreshold}`, fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="Toplam" 
                                        stroke="#4f46e5" 
                                        strokeWidth={3} 
                                        dot={{r:4}} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                         ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                Kayıt bulunamadı.
                            </div>
                         )}
                    </div>
                 </div>

                 {/* Correct/Incorrect Pie Chart (TOTAL with FILTER) */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <PieChartIcon className="text-indigo-500" />
                            Doğru / Yanlış Dağılımı {pieChartFilter !== 'all' ? `(${pieChartFilter})` : '(Genel)'}
                        </h3>
                        <select 
                            className="text-xs border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                            value={pieChartFilter}
                            onChange={(e) => setPieChartFilter(e.target.value)}
                        >
                            <option value="all">Genel (Tümü)</option>
                            {activeSubjects.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-80">
                         {pieChartData.length > 0 ? (
                            <>
                                <div className="w-full md:w-1/2 h-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                            />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                                        <span className="text-3xl font-black text-slate-800">
                                            {pieChartData.reduce((a, b) => a + b.value, 0)}
                                        </span>
                                        <span className="block text-xs text-slate-500 font-bold uppercase">Soru</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center min-w-[120px]">
                                        <p className="text-xs text-green-600 font-bold uppercase mb-1">Doğru</p>
                                        <p className="text-2xl font-black text-green-700">{pieChartData.find(x => x.name === 'Doğru')?.value || 0}</p>
                                     </div>
                                     <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center min-w-[120px]">
                                        <p className="text-xs text-red-600 font-bold uppercase mb-1">Yanlış</p>
                                        <p className="text-2xl font-black text-red-700">{pieChartData.find(x => x.name === 'Yanlış')?.value || 0}</p>
                                     </div>
                                </div>
                            </>
                         ) : (
                            <div className="text-slate-400">Kayıt bulunamadı.</div>
                         )}
                    </div>
                 </div>

                 {/* Correct & Incorrect Trend Charts Split */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Correct Trend */}
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="text-green-600" />
                                Doğru Başarı Oranı (%)
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm">
                                    %{correctThresholdStats.above + correctThresholdStats.below > 0 
                                        ? Math.round((correctThresholdStats.above / (correctThresholdStats.above + correctThresholdStats.below)) * 100) 
                                        : 0} Başarı
                                </div>
                                <div className="flex items-center gap-3 text-sm mr-4">
                                    <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                                        <CheckCircle size={14} /> {correctThresholdStats.above}
                                    </span>
                                    <span className="flex items-center gap-1 text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                                        <XCircle size={14} /> {correctThresholdStats.below}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-auto">
                                <TimeScaleControls />
                                <select 
                                    className="text-xs border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={correctTrendFilter}
                                    onChange={(e) => setCorrectTrendFilter(e.target.value)}
                                >
                                    <option value="all">Genel (Tümü)</option>
                                    {activeSubjects.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="w-full h-80">
                            {correctTrendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={correctTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <ReferenceArea y1={correctRateDomain[0]} y2={85} fill="#fee2e2" fillOpacity={0.5} stroke="none" />
                                        <XAxis dataKey="date" fontSize={chartTimeScale !== 'daily' ? 10 : 12}/>
                                        <YAxis domain={correctRateDomain} />
                                        <Tooltip 
                                             contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                             formatter={(value: number) => [`%${value}`, 'Doğru Oranı']}
                                        />
                                        <Legend />
                                        <ReferenceLine y={85} stroke="red" strokeDasharray="3 3" />
                                        <Line type="monotone" dataKey="value" name="Doğru Oranı" stroke="#10b981" strokeWidth={3} dot={{r:4}} activeDot={{r: 6}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    Kayıt bulunamadı.
                                </div>
                            )}
                        </div>
                     </div>

                     {/* Incorrect Trend */}
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="text-red-500" />
                                Yanlış Oranı (%)
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="px-3 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm">
                                    %{incorrectThresholdStats.good + incorrectThresholdStats.bad > 0 
                                        ? Math.round((incorrectThresholdStats.good / (incorrectThresholdStats.good + incorrectThresholdStats.bad)) * 100) 
                                        : 0} Başarı
                                </div>
                                <div className="flex items-center gap-3 text-sm mr-4">
                                    <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                                        <CheckCircle size={14} /> {incorrectThresholdStats.good}
                                    </span>
                                    <span className="flex items-center gap-1 text-red-500 font-bold bg-red-50 px-2 py-1 rounded">
                                        <XCircle size={14} /> {incorrectThresholdStats.bad}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-auto">
                                <TimeScaleControls />
                                <select 
                                    className="text-xs border border-slate-200 rounded-lg py-1.5 px-3 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={incorrectTrendFilter}
                                    onChange={(e) => setIncorrectTrendFilter(e.target.value)}
                                >
                                    <option value="all">Genel (Tümü)</option>
                                    {activeSubjects.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="w-full h-80">
                            {incorrectTrendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={incorrectTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <ReferenceArea y1={15} y2={incorrectRateDomain[1]} fill="#fee2e2" fillOpacity={0.5} stroke="none" />
                                        <XAxis dataKey="date" fontSize={chartTimeScale !== 'daily' ? 10 : 12}/>
                                        <YAxis domain={incorrectRateDomain} />
                                        <Tooltip 
                                             contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                             formatter={(value: number) => [`%${value}`, 'Yanlış Oranı']}
                                        />
                                        <Legend />
                                        <ReferenceLine y={15} stroke="red" strokeDasharray="3 3" />
                                        <Line type="monotone" dataKey="value" name="Yanlış Oranı" stroke="#ef4444" strokeWidth={3} dot={{r:4}} activeDot={{r: 6}} />
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
           </div>
       )}
    </div>
  );
};

export default QuestionTracking;