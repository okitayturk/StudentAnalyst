import React, { useState, useMemo, useEffect } from 'react';
import { highSchoolData } from '../data/highSchoolData';
import { School, Search, FilterX, MapPin, ChevronLeft, ChevronRight, Languages } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const HighSchoolScores: React.FC = () => {
  const [filters, setFilters] = useState({
    district: '',
    type: '',
    minScore: '',
    maxPercentile: ''
  });

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const options = useMemo(() => {
    const districts = Array.from(new Set(highSchoolData.map(i => i.district))).sort();
    const types = Array.from(new Set(highSchoolData.map(i => i.type))).sort();
    return { districts, types };
  }, []);

  const filteredData = useMemo(() => {
    return highSchoolData.filter(item => {
      const matchDistrict = filters.district === '' || item.district === filters.district;
      const matchType = filters.type === '' || item.type === filters.type;
      const matchMinScore = filters.minScore === '' || item.score >= parseFloat(filters.minScore);
      const matchPercentile = filters.maxPercentile === '' || item.percentile <= parseFloat(filters.maxPercentile);
      
      return matchDistrict && matchType && matchMinScore && matchPercentile;
    });
  }, [filters]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = filteredData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ district: '', type: '', minScore: '', maxPercentile: '' });
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <School className="text-indigo-600" />
            Ankara Lise Taban Puanları (2025 LGS)
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            2025 LGS verileri kullanılarak hazırlanmıştır. Sadece Ankara ili okullarını içerir.
          </p>
        </div>
        {hasActiveFilters && (
            <button 
                onClick={clearFilters}
                className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
                <FilterX size={16} />
                Filtreleri Temizle
            </button>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* District Filter */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">İlçe</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filters.district}
                        onChange={(e) => handleFilterChange('district', e.target.value)}
                    >
                        <option value="">Tüm İlçeler</option>
                        {options.districts.map(dist => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Type Filter */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Okul Türü</label>
                <div className="relative">
                    <School className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <select 
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                        <option value="">Tüm Okul Türleri</option>
                        {options.types.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

             {/* Score Filter */}
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Min. Taban Puan</label>
                <input 
                    type="number" 
                    placeholder="Örn: 400"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filters.minScore}
                    onChange={(e) => handleFilterChange('minScore', e.target.value)}
                />
            </div>

            {/* Percentile Filter */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Maks. Yüzdelik (%)</label>
                <input 
                    type="number" 
                    placeholder="Örn: 5.0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filters.maxPercentile}
                    onChange={(e) => handleFilterChange('maxPercentile', e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
                        <th className="px-6 py-4 font-medium">Okul / İlçe</th>
                        <th className="px-6 py-4 font-medium">Tür</th>
                        <th className="px-6 py-4 font-medium">Eğitim Dili</th>
                        <th className="px-6 py-4 font-medium text-right">Kontenjan</th>
                        <th className="px-6 py-4 font-medium text-right text-indigo-600">Yüzdelik</th>
                        <th className="px-6 py-4 font-medium text-right text-slate-800">Taban Puan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {currentData.length > 0 ? (
                        currentData.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800">{item.schoolName}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <MapPin size={12} /> {item.city} / {item.district}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 text-xs rounded border ${
                                        item.type === 'Fen Lisesi' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                        item.type === 'Anadolu Lisesi' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                        item.type === 'Sosyal Bilimler' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <Languages size={14} className="text-slate-400"/>
                                        {item.language}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-right">
                                    {item.quota}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-indigo-600">
                                    %{item.percentile.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right font-black text-slate-800 text-base">
                                    {item.score.toFixed(4)}
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
        
        {/* Pagination Controls */}
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
      </div>
    </div>
  );
};

export default HighSchoolScores;