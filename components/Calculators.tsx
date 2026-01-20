import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

// --- Helper Components ---
interface InputGroupProps {
    label: string;
    d: number;
    y: number;
    setD: (val: number) => void;
    setY: (val: number) => void;
    max: number;
    factor?: number; // 3 for LGS, 4 for YKS
}

const InputGroup = ({ label, d, y, setD, setY, max, factor = 4 }: InputGroupProps) => {
    const net = Math.max(0, d - (y / factor));

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700 w-32 text-sm">{label} <span className="text-slate-400 text-xs">({max})</span></span>
            <div className="flex gap-2 flex-1">
                {/* Doğru */}
                <div className="flex-1 relative">
                    <input 
                        type="number" min="0" max={max} placeholder="D" 
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-green-50 text-slate-900 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none" 
                        value={d || ''}
                        onChange={e => setD(Number(e.target.value))} 
                    />
                    <span className="absolute right-2 top-2 text-xs text-slate-400 font-bold">D</span>
                </div>
                {/* Yanlış */}
                <div className="flex-1 relative">
                    <input 
                        type="number" min="0" max={max} placeholder="Y" 
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-red-50 text-slate-900 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none" 
                        value={y || ''}
                        onChange={e => setY(Number(e.target.value))}
                    />
                    <span className="absolute right-2 top-2 text-xs text-slate-400 font-bold">Y</span>
                </div>
                {/* Net (Read Only) */}
                <div className="w-20 relative">
                    <div className="w-full border border-slate-200 bg-blue-50 rounded px-2 py-2 text-sm text-center font-bold text-slate-900 select-none">
                        {net.toFixed(2)}
                    </div>
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-slate-50 px-1 text-indigo-400 font-bold">NET</span>
                </div>
            </div>
        </div>
    );
};

const ResultCard = ({ label, score }: { label: string, score: number }) => (
    <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm text-center flex flex-col justify-center">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-black text-indigo-700">{score.toFixed(3)}</p>
    </div>
);

// --- LGS Component ---
const LGSCalculator = () => {
    const [inputs, setInputs] = useState({
        turkD: 0, turkY: 0,
        matD: 0, matY: 0,
        fenD: 0, fenY: 0,
        inkD: 0, inkY: 0,
        dinD: 0, dinY: 0,
        dilD: 0, dilY: 0
    });
    const [result, setResult] = useState<number | null>(null);

    const calcNet = (d: number, y: number) => Math.max(0, d - (y / 3));

    const handleCalc = () => {
        const turkNet = calcNet(inputs.turkD, inputs.turkY);
        const matNet = calcNet(inputs.matD, inputs.matY);
        const fenNet = calcNet(inputs.fenD, inputs.fenY);
        const inkNet = calcNet(inputs.inkD, inputs.inkY);
        const dinNet = calcNet(inputs.dinD, inputs.dinY);
        const dilNet = calcNet(inputs.dilD, inputs.dilY);

        // Approximate 2024 coefficients
        let score = 194.76 
             + (turkNet * 3.84)
             + (matNet * 4.90)
             + (fenNet * 3.96)
             + (inkNet * 1.54)
             + (dinNet * 1.62)
             + (dilNet * 1.52);

        if (score > 500) score = 500;
        if (score < 100) score = 100;

        setResult(score);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div>
                <InputGroup factor={3} label="Türkçe" max={20} d={inputs.turkD} y={inputs.turkY} setD={(v:number)=>setInputs({...inputs, turkD:v})} setY={(v:number)=>setInputs({...inputs, turkY:v})} />
                <InputGroup factor={3} label="Matematik" max={20} d={inputs.matD} y={inputs.matY} setD={(v:number)=>setInputs({...inputs, matD:v})} setY={(v:number)=>setInputs({...inputs, matY:v})} />
                <InputGroup factor={3} label="Fen Bilimleri" max={20} d={inputs.fenD} y={inputs.fenY} setD={(v:number)=>setInputs({...inputs, fenD:v})} setY={(v:number)=>setInputs({...inputs, fenY:v})} />
                <InputGroup factor={3} label="İnkılap Tarihi" max={10} d={inputs.inkD} y={inputs.inkY} setD={(v:number)=>setInputs({...inputs, inkD:v})} setY={(v:number)=>setInputs({...inputs, inkY:v})} />
                <InputGroup factor={3} label="Din Kültürü" max={10} d={inputs.dinD} y={inputs.dinY} setD={(v:number)=>setInputs({...inputs, dinD:v})} setY={(v:number)=>setInputs({...inputs, dinY:v})} />
                <InputGroup factor={3} label="Yabancı Dil" max={10} d={inputs.dilD} y={inputs.dilY} setD={(v:number)=>setInputs({...inputs, dilD:v})} setY={(v:number)=>setInputs({...inputs, dilY:v})} />
                
                <button onClick={handleCalc} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold mt-2 hover:bg-indigo-700 shadow-lg transition transform active:scale-95">
                    HESAPLA
                </button>
            </div>
            
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
                {result ? (
                    <>
                        <div className="mb-2 text-slate-500 font-medium">LGS Puanınız</div>
                        <div className="text-6xl font-black text-indigo-600 tracking-tight">{result.toFixed(3)}</div>
                        <div className="mt-4 text-sm text-slate-400">Tahmini sonuçtur, resmi sınavla farklılık gösterebilir.</div>
                    </>
                ) : (
                    <div className="text-slate-400">
                        <Calculator size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Netlerinizi girip hesapla butonuna basınız.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- TYT Component ---
const YKSCalculator = () => {
    const [inputs, setInputs] = useState({
        turkD: 0, turkY: 0,
        sosD: 0, sosY: 0,
        matD: 0, matY: 0,
        fenD: 0, fenY: 0,
        obp: 0
    });
    const [result, setResult] = useState<number | null>(null);

    const calcNet = (d: number, y: number) => Math.max(0, d - (y / 4));

    const handleCalc = () => {
        const turkNet = calcNet(inputs.turkD, inputs.turkY);
        const sosNet = calcNet(inputs.sosD, inputs.sosY);
        const matNet = calcNet(inputs.matD, inputs.matY);
        const fenNet = calcNet(inputs.fenD, inputs.fenY);

        const rawScore = 100 
            + (turkNet * 3.3) 
            + (sosNet * 3.4) 
            + (matNet * 3.3) 
            + (fenNet * 3.4);
        
        let placementScore = rawScore + (inputs.obp * 0.6);
        if (placementScore > 560) placementScore = 560;

        setResult(placementScore);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div>
                <InputGroup factor={4} label="Türkçe" max={40} d={inputs.turkD} y={inputs.turkY} setD={(v:number)=>setInputs({...inputs, turkD:v})} setY={(v:number)=>setInputs({...inputs, turkY:v})} />
                <InputGroup factor={4} label="Sosyal Bil." max={20} d={inputs.sosD} y={inputs.sosY} setD={(v:number)=>setInputs({...inputs, sosD:v})} setY={(v:number)=>setInputs({...inputs, sosY:v})} />
                <InputGroup factor={4} label="Temel Mat." max={40} d={inputs.matD} y={inputs.matY} setD={(v:number)=>setInputs({...inputs, matD:v})} setY={(v:number)=>setInputs({...inputs, matY:v})} />
                <InputGroup factor={4} label="Fen Bil." max={20} d={inputs.fenD} y={inputs.fenY} setD={(v:number)=>setInputs({...inputs, fenD:v})} setY={(v:number)=>setInputs({...inputs, fenY:v})} />
                
                <div className="mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Diploma Notu (OBP)</label>
                    <input 
                        type="number" max="100" placeholder="Örn: 85.5"
                        className="w-full border border-slate-300 rounded-lg p-3 bg-gray-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={inputs.obp || ''}
                        onChange={e => setInputs({...inputs, obp: Number(e.target.value)})}
                    />
                </div>

                <button onClick={handleCalc} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold mt-2 hover:bg-indigo-700 shadow-lg transition transform active:scale-95">
                    HESAPLA
                </button>
            </div>
             <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
                {result ? (
                    <>
                        <div className="mb-2 text-slate-500 font-medium">TYT Yerleştirme Puanı</div>
                        <div className="text-6xl font-black text-indigo-600 tracking-tight">{result.toFixed(3)}</div>
                        <div className="mt-4 text-sm text-slate-400">OBP Eklenmiş Tahmini Puandır.</div>
                    </>
                ) : (
                    <div className="text-slate-400">
                        <Calculator size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Netlerinizi ve OBP'nizi girip hesapla butonuna basınız.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- AYT Component ---
const AYTCalculator = () => {
    // We need TYT Inputs + AYT Inputs
    const [tytInputs, setTytInputs] = useState({
        turk: 0, sos: 0, mat: 0, fen: 0, obp: 0
    });

    const [aytInputs, setAytInputs] = useState({
        matD: 0, matY: 0,
        fizD: 0, fizY: 0,
        kimD: 0, kimY: 0,
        biyoD: 0, biyoY: 0,
        edbD: 0, edbY: 0,
        tar1D: 0, tar1Y: 0,
        cog1D: 0, cog1Y: 0,
        tar2D: 0, tar2Y: 0,
        cog2D: 0, cog2Y: 0,
        felD: 0, felY: 0,
        dinD: 0, dinY: 0,
        dilD: 0, dilY: 0
    });

    const [results, setResults] = useState<{say: number, ea: number, soz: number, dil: number} | null>(null);

    const calcNet = (d: number, y: number) => Math.max(0, d - (y / 4));

    const handleCalc = () => {
        // TYT Score Component (Approx 40% impact, simplified calculation for contribution)
        // Standard formula: Base 100 + Nets * Coeffs.
        // AYT Score: Base 100 + TYT contribution (40%) + AYT Nets (60%).
        
        // 1. Calculate TYT Contribution Points (Purely estimates based on recent years)
        const tytScoreRaw = 100 + (tytInputs.turk * 1.32) + (tytInputs.sos * 1.36) + (tytInputs.mat * 1.32) + (tytInputs.fen * 1.36);
        const tytContribution = tytScoreRaw * 0.4;

        // 2. Calculate AYT Nets
        const matNet = calcNet(aytInputs.matD, aytInputs.matY);
        const fizNet = calcNet(aytInputs.fizD, aytInputs.fizY);
        const kimNet = calcNet(aytInputs.kimD, aytInputs.kimY);
        const biyoNet = calcNet(aytInputs.biyoD, aytInputs.biyoY);
        const edbNet = calcNet(aytInputs.edbD, aytInputs.edbY);
        const tar1Net = calcNet(aytInputs.tar1D, aytInputs.tar1Y);
        const cog1Net = calcNet(aytInputs.cog1D, aytInputs.cog1Y);
        const tar2Net = calcNet(aytInputs.tar2D, aytInputs.tar2Y);
        const cog2Net = calcNet(aytInputs.cog2D, aytInputs.cog2Y);
        const felNet = calcNet(aytInputs.felD, aytInputs.felY);
        const dinNet = calcNet(aytInputs.dinD, aytInputs.dinY);
        const dilNet = calcNet(aytInputs.dilD, aytInputs.dilY);

        const obpAdd = tytInputs.obp * 0.6;

        // 3. Calculate Scores (Approx Coeffs)
        
        // SAYISAL: Mat + Fen (Fiz, Kim, Biyo)
        const sayRaw = 100 + tytContribution + (matNet * 3) + (fizNet * 2.85) + (kimNet * 3.07) + (biyoNet * 3.07);
        const say = sayRaw + obpAdd;

        // EŞİT AĞIRLIK: Mat + Edb/Sos1
        const eaRaw = 100 + tytContribution + (matNet * 3) + (edbNet * 3) + (tar1Net * 2.8) + (cog1Net * 3.33);
        const ea = eaRaw + obpAdd;

        // SÖZEL: Edb/Sos1 + Sos2
        const sozRaw = 100 + tytContribution + (edbNet * 3) + (tar1Net * 2.8) + (cog1Net * 3.33) + (tar2Net * 2.91) + (cog2Net * 2.91) + (felNet * 3) + (dinNet * 3.33);
        const soz = sozRaw + obpAdd;

        // DİL
        const dilRaw = 100 + tytContribution + (dilNet * 3);
        const dil = dilRaw + obpAdd;

        setResults({
            say: Math.min(560, say),
            ea: Math.min(560, ea),
            soz: Math.min(560, soz),
            dil: Math.min(560, dil)
        });
    };

    return (
        <div>
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Inputs Column */}
                <div className="space-y-6">
                    {/* TYT Section */}
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-3 border-b border-orange-200 pb-2">1. TYT Netleri & OBP</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><label className="text-xs font-bold text-slate-500">Türkçe Net</label><input type="number" className="w-full border rounded p-2 bg-white text-slate-900" onChange={e => setTytInputs({...tytInputs, turk: Number(e.target.value)})}/></div>
                            <div><label className="text-xs font-bold text-slate-500">Sosyal Net</label><input type="number" className="w-full border rounded p-2 bg-white text-slate-900" onChange={e => setTytInputs({...tytInputs, sos: Number(e.target.value)})}/></div>
                            <div><label className="text-xs font-bold text-slate-500">Matematik Net</label><input type="number" className="w-full border rounded p-2 bg-white text-slate-900" onChange={e => setTytInputs({...tytInputs, mat: Number(e.target.value)})}/></div>
                            <div><label className="text-xs font-bold text-slate-500">Fen Net</label><input type="number" className="w-full border rounded p-2 bg-white text-slate-900" onChange={e => setTytInputs({...tytInputs, fen: Number(e.target.value)})}/></div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500">Diploma Puanı (OBP)</label>
                            <input type="number" max="100" className="w-full border rounded p-2 bg-gray-50 text-slate-900" placeholder="Örn: 90" onChange={e => setTytInputs({...tytInputs, obp: Number(e.target.value)})}/>
                        </div>
                    </div>

                    {/* AYT Section */}
                    <div>
                        <h3 className="font-bold text-indigo-800 mb-3 border-b border-indigo-100 pb-2">2. AYT Sonuçları</h3>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                             <InputGroup factor={4} label="Matematik" max={40} d={aytInputs.matD} y={aytInputs.matY} setD={(v:number)=>setAytInputs({...aytInputs, matD:v})} setY={(v:number)=>setAytInputs({...aytInputs, matY:v})} />
                             <InputGroup factor={4} label="Fizik" max={14} d={aytInputs.fizD} y={aytInputs.fizY} setD={(v:number)=>setAytInputs({...aytInputs, fizD:v})} setY={(v:number)=>setAytInputs({...aytInputs, fizY:v})} />
                             <InputGroup factor={4} label="Kimya" max={13} d={aytInputs.kimD} y={aytInputs.kimY} setD={(v:number)=>setAytInputs({...aytInputs, kimD:v})} setY={(v:number)=>setAytInputs({...aytInputs, kimY:v})} />
                             <InputGroup factor={4} label="Biyoloji" max={13} d={aytInputs.biyoD} y={aytInputs.biyoY} setD={(v:number)=>setAytInputs({...aytInputs, biyoD:v})} setY={(v:number)=>setAytInputs({...aytInputs, biyoY:v})} />
                             <hr className="my-4 border-slate-200"/>
                             <InputGroup factor={4} label="Edebiyat" max={24} d={aytInputs.edbD} y={aytInputs.edbY} setD={(v:number)=>setAytInputs({...aytInputs, edbD:v})} setY={(v:number)=>setAytInputs({...aytInputs, edbY:v})} />
                             <InputGroup factor={4} label="Tarih-1" max={10} d={aytInputs.tar1D} y={aytInputs.tar1Y} setD={(v:number)=>setAytInputs({...aytInputs, tar1D:v})} setY={(v:number)=>setAytInputs({...aytInputs, tar1Y:v})} />
                             <InputGroup factor={4} label="Coğrafya-1" max={6} d={aytInputs.cog1D} y={aytInputs.cog1Y} setD={(v:number)=>setAytInputs({...aytInputs, cog1D:v})} setY={(v:number)=>setAytInputs({...aytInputs, cog1Y:v})} />
                             <hr className="my-4 border-slate-200"/>
                             <InputGroup factor={4} label="Tarih-2" max={11} d={aytInputs.tar2D} y={aytInputs.tar2Y} setD={(v:number)=>setAytInputs({...aytInputs, tar2D:v})} setY={(v:number)=>setAytInputs({...aytInputs, tar2Y:v})} />
                             <InputGroup factor={4} label="Coğrafya-2" max={11} d={aytInputs.cog2D} y={aytInputs.cog2Y} setD={(v:number)=>setAytInputs({...aytInputs, cog2D:v})} setY={(v:number)=>setAytInputs({...aytInputs, cog2Y:v})} />
                             <InputGroup factor={4} label="Felsefe Grb." max={12} d={aytInputs.felD} y={aytInputs.felY} setD={(v:number)=>setAytInputs({...aytInputs, felD:v})} setY={(v:number)=>setAytInputs({...aytInputs, felY:v})} />
                             <InputGroup factor={4} label="Din Kültürü" max={6} d={aytInputs.dinD} y={aytInputs.dinY} setD={(v:number)=>setAytInputs({...aytInputs, dinD:v})} setY={(v:number)=>setAytInputs({...aytInputs, dinY:v})} />
                             <hr className="my-4 border-slate-200"/>
                             <InputGroup factor={4} label="Yabancı Dil" max={80} d={aytInputs.dilD} y={aytInputs.dilY} setD={(v:number)=>setAytInputs({...aytInputs, dilD:v})} setY={(v:number)=>setAytInputs({...aytInputs, dilY:v})} />
                        </div>
                    </div>
                </div>

                {/* Results Column */}
                <div className="flex flex-col gap-4">
                    <button onClick={handleCalc} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition transform active:scale-95">
                        HESAPLA
                    </button>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex-1">
                        <h4 className="text-center font-bold text-slate-800 mb-6 text-lg">Sonuçlar (Yerleştirme)</h4>
                        {results ? (
                            <div className="grid grid-cols-2 gap-4">
                                <ResultCard label="SAYISAL" score={results.say} />
                                <ResultCard label="EŞİT AĞIRLIK" score={results.ea} />
                                <ResultCard label="SÖZEL" score={results.soz} />
                                <ResultCard label="DİL" score={results.dil} />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <Calculator size={48} className="mb-4 opacity-20" />
                                <p className="text-center text-sm">Verileri doldurup hesapla butonuna basınız.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Calculators: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LGS' | 'TYT' | 'AYT'>('LGS');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto">
        <div className="bg-indigo-50 p-6 border-b border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <Calculator className="text-indigo-600" />
                <h2 className="text-xl font-bold text-indigo-900">Puan Hesaplama Robotu</h2>
            </div>
            <div className="flex bg-white rounded-lg p-1 shadow-sm border border-indigo-100 overflow-x-auto max-w-full">
                <button 
                    onClick={() => setActiveTab('LGS')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition ${activeTab === 'LGS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    LGS
                </button>
                <button 
                    onClick={() => setActiveTab('TYT')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition ${activeTab === 'TYT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    TYT
                </button>
                <button 
                    onClick={() => setActiveTab('AYT')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition ${activeTab === 'AYT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    AYT
                </button>
            </div>
        </div>

        <div className="p-6">
            {activeTab === 'LGS' && <LGSCalculator />}
            {activeTab === 'TYT' && <YKSCalculator />}
            {activeTab === 'AYT' && <AYTCalculator />}
        </div>
    </div>
  );
};

export default Calculators;