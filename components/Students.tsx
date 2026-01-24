import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { Student, ExamResult } from '../types';
import { Trash2, UserPlus, Search, Users, Eye, BarChart2, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
                <p className="font-bold text-slate-800 mb-1">{data.examName}</p>
                <p className="text-xs text-slate-500 mb-2">{data.fullDate} • {data.type}</p>
                <div className="flex items-center gap-2">
                     <span 
                        className="w-2 h-2 rounded-full"
                        style={{ 
                            backgroundColor: data.type === 'TYT' ? '#0ea5e9' : 
                                           data.type.includes('AYT') ? '#f43f5e' : 
                                           data.type === 'Ortalama' ? '#f59e0b' : '#4f46e5' 
                        }}
                     ></span>
                     <span className="font-semibold text-slate-700">Puan: {Number(data.score).toFixed(3)}</span>
                </div>
            </div>
        );
    }
    return null;
};

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Selected student for details
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentExams, setStudentExams] = useState<ExamResult[]>([]);
  
  // Chart View Mode
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    gradeLevel: '8',
    schoolNumber: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const data = await db.getStudents();
    setStudents(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.schoolNumber) return;
    
    await db.addStudent(formData);
    setIsModalOpen(false);
    setFormData({ fullName: '', gradeLevel: '8', schoolNumber: '' });
    loadStudents();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Öğrenciyi silmek istediğinize emin misiniz? Tüm deneme verileri de silinecektir.')) {
        await db.deleteStudent(id);
        loadStudents();
        if (selectedStudent?.id === id) {
            setSelectedStudent(null);
            setStudentExams([]);
        }
    }
  };

  const handleSelectStudent = async (student: Student) => {
      setSelectedStudent(student);
      const exams = await db.getExamsByStudent(student.id);
      setStudentExams(exams);
  };

  const handleDeleteExam = async (examId: string) => {
      if(confirm('Silmek istiyor musunuz?')) {
          await db.deleteExam(examId);
          if (selectedStudent) {
              handleSelectStudent(selectedStudent); // Refresh details
          }
      }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.schoolNumber.includes(searchTerm)
  );

  // Calculate Chart Data based on View Mode
  const chartData = useMemo(() => {
      if (!selectedStudent || studentExams.length === 0) return [];
      
      const sortedExams = [...studentExams].sort((a, b) => a.examDate.localeCompare(b.examDate));

      if (viewMode === 'daily') {
          return sortedExams.map(exam => {
              const [year, month, day] = exam.examDate.split('-');
              return {
                  name: `${day}/${month}`,
                  fullDate: exam.examDate,
                  score: exam.totalScore,
                  examName: exam.examName,
                  type: exam.type,
                  rawDate: exam.examDate
              };
          });
      } else {
          // Monthly Aggregation
          const grouped: Record<string, { total: number; count: number; rawDate: string }> = {};

          sortedExams.forEach(exam => {
              const monthKey = exam.examDate.substring(0, 7); // YYYY-MM
              if (!grouped[monthKey]) {
                  grouped[monthKey] = { total: 0, count: 0, rawDate: monthKey };
              }
              grouped[monthKey].total += exam.totalScore;
              grouped[monthKey].count += 1;
          });

          return Object.values(grouped)
              .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
              .map(item => {
                  const [y, m] = item.rawDate.split('-');
                  const dateObj = new Date(parseInt(y), parseInt(m) - 1);
                  // Format month name in Turkish
                  const monthName = dateObj.toLocaleString('tr-TR', { month: 'long' });
                  
                  return {
                      name: monthName,
                      fullDate: `${monthName} ${y}`,
                      score: item.total / item.count,
                      examName: `${item.count} Sınav Ortalaması`,
                      type: 'Ortalama'
                  };
              });
      }
  }, [studentExams, viewMode, selectedStudent]);

  // Calculate Y-Axis Domain based on max score in the current data
  const yAxisDomain = useMemo(() => {
      if (chartData.length === 0) return [0, 'auto'];
      
      const maxScore = Math.max(...chartData.map(s => Number(s.score)));

      if (maxScore <= 300) {
          return [150, 300];
      } else if (maxScore <= 500) {
          return [150, 500];
      } else {
          return [200, 650];
      }
  }, [chartData]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Left List */}
      <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800">Öğrenci Listesi</h2>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition"
            >
                <UserPlus size={18} />
            </button>
        </div>
        
        <div className="p-4 bg-slate-50 border-b border-slate-100">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Ara..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {loading ? (
                <div className="text-center p-4 text-slate-400">Yükleniyor...</div>
            ) : filteredStudents.length === 0 ? (
                <p className="text-center text-slate-400 text-sm mt-4">Kayıtlı öğrenci yok.</p>
            ) : (
                filteredStudents.map(student => (
                    <div 
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${selectedStudent?.id === student.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                        <div>
                            <p className="font-medium text-slate-800">{student.fullName}</p>
                            <p className="text-xs text-slate-500">{student.gradeLevel}. Sınıf | No: {student.schoolNumber}</p>
                        </div>
                        <button onClick={(e) => handleDelete(student.id, e)} className="text-slate-400 hover:text-red-500 p-1">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Right Details */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 overflow-y-auto">
        {selectedStudent ? (
            <div className="flex flex-col min-h-full">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{selectedStudent.fullName}</h2>
                    <p className="text-slate-500">{selectedStudent.gradeLevel}. Sınıf - {selectedStudent.schoolNumber}</p>
                </div>

                <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-semibold text-slate-800">Kişisel Gelişim Grafiği</h3>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => setViewMode('daily')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode === 'daily' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Günlük
                                </button>
                                <button 
                                    onClick={() => setViewMode('monthly')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode === 'monthly' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Aylık
                                </button>
                            </div>
                        </div>
                        
                        {/* Legend */}
                        <div className="flex items-center gap-3 text-xs">
                             {viewMode === 'daily' ? (
                                 <>
                                     <div className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded-full bg-[#0ea5e9]"></span>
                                        <span className="text-slate-600 font-medium">TYT</span>
                                     </div>
                                     <div className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded-full bg-[#f43f5e]"></span>
                                        <span className="text-slate-600 font-medium">AYT</span>
                                     </div>
                                     <div className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded-full bg-[#4f46e5]"></span>
                                        <span className="text-slate-600 font-medium">Diğer</span>
                                     </div>
                                 </>
                             ) : (
                                <div className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
                                    <span className="text-slate-600 font-medium">Aylık Ortalama</span>
                                </div>
                             )}
                        </div>
                    </div>

                    {/* Explicit Height Container */}
                    <div className="w-full h-80 bg-slate-50 rounded-lg p-4 border border-slate-100 mb-6">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis 
                                        dataKey="name" 
                                        fontSize={11} 
                                        stroke="#64748b" 
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis 
                                        fontSize={11} 
                                        stroke="#64748b" 
                                        tickLine={false}
                                        axisLine={false}
                                        domain={yAxisDomain}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke={viewMode === 'monthly' ? "#f59e0b" : "#4f46e5"} 
                                        strokeWidth={3}
                                        activeDot={{ r: 6 }}
                                        dot={(props: any) => {
                                            const { cx, cy, payload } = props;
                                            let fill = '#4f46e5';
                                            
                                            if (viewMode === 'monthly') {
                                                fill = '#f59e0b'; // Amber for average
                                            } else {
                                                if (payload.type === 'TYT') fill = '#0ea5e9';
                                                else if (payload.type && payload.type.includes('AYT')) fill = '#f43f5e';
                                            }
                                            
                                            return (
                                                <circle 
                                                    key={props.key}
                                                    cx={cx} 
                                                    cy={cy} 
                                                    r={5} 
                                                    fill={fill} 
                                                    stroke="white" 
                                                    strokeWidth={2} 
                                                />
                                            );
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">Henüz deneme verisi yok.</div>
                        )}
                    </div>
                    
                    <div className="mt-6">
                        <h4 className="font-medium text-slate-700 mb-2">Son Denemeler</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600">
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">Tarih</th>
                                        <th className="p-3">Sınav Adı</th>
                                        <th className="p-3">Tür</th>
                                        <th className="p-3">Puan</th>
                                        <th className="p-3 text-center">İşlem</th>
                                        <th className="p-3 rounded-tr-lg text-center">Sil</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentExams.sort((a,b) => b.examDate.localeCompare(a.examDate)).map(exam => (
                                        <tr key={exam.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition-colors">
                                            <td className="p-3">{exam.examDate}</td>
                                            <td className="p-3 font-medium">{exam.examName}</td>
                                            <td className="p-3">
                                                <span 
                                                    className={`px-2 py-1 rounded text-xs border ${
                                                        exam.type === 'TYT' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                                        exam.type.includes('AYT') ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}
                                                >
                                                    {exam.type}
                                                </span>
                                            </td>
                                            <td className="p-3 font-bold text-indigo-600">{exam.totalScore.toFixed(2)}</td>
                                            <td className="p-3 text-center">
                                                <Link 
                                                    to={`/exam/${exam.id}`}
                                                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition"
                                                >
                                                    <Eye size={16} />
                                                    İncele
                                                </Link>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button 
                                                    onClick={() => handleDeleteExam(exam.id)}
                                                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                                                >
                                                    <Trash2 size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {studentExams.length === 0 && (
                                <p className="text-center p-4 text-slate-400">Kayıt bulunamadı.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users size={48} className="mb-4 opacity-20" />
                <p>Detayları görmek için listeden bir öğrenci seçin.</p>
            </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Yeni Öğrenci Ekle</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sınıf Seviyesi</label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={formData.gradeLevel}
                                onChange={e => setFormData({...formData, gradeLevel: e.target.value})}
                            >
                                {['5', '6', '7', '8', '9', '10', '11', '12', 'Mezun'].map(g => (
                                    <option key={g} value={g}>{g}. Sınıf</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Okul No</label>
                            <input 
                                required
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={formData.schoolNumber}
                                onChange={e => setFormData({...formData, schoolNumber: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            İptal
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Students;