import React, { useState, useMemo, useEffect } from 'react';
import { UniversityProgram } from '../data/universityData';
import { BookOpen, Search, FilterX, Building2, MapPin, GraduationCap, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const UniversityScores: React.FC = () => {
  const [universityData, setUniversityData] = useState<UniversityProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    city: '',
    university: '',
    department: '',
    type: ''
  });

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
        const targetUrl = 'otobusbilet.runasp.net/veri/mebtaban.json';
        let json;

        try {
            // 1. Attempt Direct Fetch
            const response = await fetch(`http://${targetUrl}`);
            if (!response.ok) throw new Error('Direct fetch failed');
            json = await response.json();
        } catch (directError) {
            console.warn("Direct fetch failed, trying proxy 1...", directError);
            
            try {
                // 2. Attempt AllOrigins
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
                if (!response.ok) throw new Error('AllOrigins proxy failed');
                const wrapper = await response.json();
                if (!wrapper.contents) throw new Error('No content in wrapper');
                // allorigins might return string content, we need to parse it if so
                json = typeof wrapper.contents === 'string' ? JSON.parse(wrapper.contents) : wrapper.contents;
            } catch (proxy1Error) {
                console.warn("Proxy 1 failed, trying proxy 2...", proxy1Error);
                
                try {
                    // 3. Attempt CorsProxy.io
                    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent('http://' + targetUrl)}`);
                    if (!response.ok) throw new Error('CorsProxy failed');
                    json = await response.json();
                } catch (proxy2Error) {
                     console.warn("Proxy 2 failed, trying proxy 3 (CodeTabs)...", proxy2Error);
                     // 4. Attempt CodeTabs
                     const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
                     if (!response.ok) throw new Error('CodeTabs proxy failed');
                     json = await response.json();
                }
            }
        }
        
        // Map external JSON to internal structure
        const mappedData: UniversityProgram[] = json.map((item: any, index: number) => {
            const val = (keys: string[]) => {
                for(const k of keys) if(item[k] !== undefined) return item[k];
                return null;
            }

            const university = val(['universite', 'Universite', 'university']) || 'Bilinmiyor';
            const city = val(['sehir', 'Sehir', 'city', 'il']) || 'Bilinmiyor';
            const department = val(['bolum', 'Bolum', 'department', 'program']) || 'Bilinmiyor';
            const type = val(['tur', 'Tur', 'type', 'ozel_durum']) || (university.toLowerCase().includes('vakıf') ? 'Vakıf' : 'Devlet');
            
            const scoreRaw = val(['puan', 'taban_puan', 'TabanPuan', 'score']);
            const score = typeof scoreRaw === 'number' ? scoreRaw : parseFloat(scoreRaw?.replace(',', '.') || '0');

            const rankRaw = val(['sira', 'basari_sirasi', 'BasariSirasi', 'rank']);
            const rank = typeof rankRaw === 'number' ? rankRaw : parseInt(String(rankRaw || '0').replace(/\./g, ''));

            const quotaRaw = val(['kontenjan', 'Kontenjan', 'quota']);
            const quota = typeof quotaRaw === 'number' ? quotaRaw : parseInt(quotaRaw || '0');

            return {
                id: (item.id || index).toString(),
                city,
                university,
                department,
                type,
                score,
                rank,
                quota
            };
        });

        mappedData.sort((a, b) => b.score - a.score);

        setUniversityData(mappedData);
    } catch (err) {
        console.error("All fetch attempts failed:", err);
        setError("Veriler yüklenirken bir hata oluştu. Sunucu erişiminde problem olabilir veya veriler geçici olarak kullanılamıyor.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const options = useMemo(() => {
    if (universityData.length === 0) return { cities: [], universities: [], departments: [], types: [] };

    const cities = Array.from(new Set(universityData.map(i => i.city))).sort();
    const universities = Array.from(new Set(universityData.map(i => i.university))).sort();
    const departments = Array.from(new Set(universityData.map(i => i.department))).sort();
    const types = Array.from(new Set(universityData.map(i => i.type))).sort();
    return { cities, universities, departments, types };
  }, [universityData]);

  const filteredData = useMemo(() => {
    return universityData.filter(item => {
      const matchCity = filters.city === '' || item.city === filters.city;
      const matchUni = filters.university === '' || item.university === filters.university;
      const matchDept = filters.department === '' || item.department.includes(filters.department);
      const matchType = filters.type === '' || item.type === filters.type;
      
      return matchCity && matchUni && matchDept && matchType;
    });
  }, [filters, universityData]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = filteredData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ city: '', university: '', department: '', type: '' });
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            Üniversite Taban Puanları
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Veriler güncelleniyor...' : `2024 YKS Verileri - Toplam ${universityData.length.toLocaleString()} program listeleniyor.`}
          </p>
        </div>
        <div className="flex gap-2">
            {hasActiveFilters && (
                <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    <FilterX size={16} />
                    Filtreleri Temizle
                </button>
            )}
             <button 
                onClick={fetchData}
                className="flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                title="Yenile"
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Şehir</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filters.city}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Tüm Şehirler</option>
                        {options.cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Üniversite</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filters.university}
                        onChange={(e) => handleFilterChange('university', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Tüm Üniversiteler</option>
                        {options.universities.map(uni => (
                            <option key={uni} value={uni}>{uni}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Bölüm</label>
                <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filters.department}
                        onChange={(e) => handleFilterChange('department', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Tüm Bölümler</option>
                        {options.departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Tür</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Tüm Türler</option>
                        {options.types.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        {loading ? (
             <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
                <p>Veriler yükleniyor...</p>
             </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center h-96 text-red-500 px-6 text-center">
                <p className="font-bold text-lg mb-2">Hata Oluştu</p>
                <p>{error}</p>
                <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 text-red-700 font-medium">Tekrar Dene</button>
            </div>
        ) : (
            <>
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">
                        Sonuçlar ({filteredData.length})
                    </h3>
                    <span className="text-xs text-slate-500">Sayfa {currentPage} / {totalPages || 1}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Üniversite / Şehir</th>
                                <th className="px-6 py-4 font-medium">Bölüm</th>
                                <th className="px-6 py-4 font-medium">Tür</th>
                                <th className="px-6 py-4 font-medium text-right">Kontenjan</th>
                                <th className="px-6 py-4 font-medium text-right">Başarı Sırası</th>
                                <th className="px-6 py-4 font-medium text-right">Taban Puan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentData.length > 0 ? (
                                currentData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{item.university}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <MapPin size={12} /> {item.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">
                                            {item.department}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded border ${
                                                item.type === 'Devlet' 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                                    : (item.type === 'Vakıf' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-purple-50 text-purple-700 border-purple-100')
                                            }`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-right">
                                            {item.quota}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-right font-medium">
                                            {item.rank > 0 ? item.rank.toLocaleString('tr-TR') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-indigo-700 font-bold text-right text-base">
                                            {item.score > 0 ? item.score.toFixed(3) : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <Search size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>Seçilen kriterlere uygun sonuç bulunamadı.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center items-center gap-4">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                            <input 
                                type="number" 
                                min="1" 
                                max={totalPages}
                                value={currentPage}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if(val >= 1 && val <= totalPages) setCurrentPage(val);
                                }}
                                className="w-12 text-center p-1 border border-slate-300 rounded"
                            />
                            / {totalPages}
                        </div>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default UniversityScores;