'use client';

import React, { useState } from 'react';
import { MapPin, Home, Banknote, ShieldCheck, ArrowRight, Loader2, ChevronLeft, Map } from 'lucide-react';
import { calculateAffordability, PropertyType } from '@/utils/calculator';
import { formatThousand, parseThousand } from '@/utils/format';
import { TownId, REGIONS, RegionId, MARKET_MAP } from '@/data/market-config';

const PROPERTY_TYPES: { label: string; value: PropertyType }[] = [
    { label: 'Byt (po rekonstrukci)', value: 'Byt (rekonstruovaný)' },
    { label: 'Byt (v původním stavu)', value: 'Byt (původní stav)' },
    { label: 'Starší dům', value: 'Starší dům' },
    { label: 'Novostavba', value: 'Stavba domu' },
    { label: 'Rekonstrukce', value: 'Rekonstrukce' },
    { label: 'Stavební pozemek', value: 'Pozemek' },
];

export default function HypoWizard() {
    const [step, setStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
    const [location, setLocation] = useState<TownId | null>(null);
    const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
    const [areaSize, setAreaSize] = useState<number>(0); // 0 = defaults
    const [income, setIncome] = useState<number>(45000);
    const [cash, setCash] = useState<number>(500000);

    // Lead Form
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [wantAgentOffers, setWantAgentOffers] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Result
    const [result, setResult] = useState<ReturnType<typeof calculateAffordability> | null>(null);

    const handleCalculate = () => {
        if (!location || !propertyType) return;

        setStep(10); // Loading step
        setIsLoading(true);

        setTimeout(() => {
            const res = calculateAffordability(income, cash, location, propertyType, areaSize);
            setResult(res);
            setIsLoading(false);
            setStep(11); // Result step
        }, 2000);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            type: 'mortgage',
            contact: { name, email, phone, wantAgentOffers },
            calculation: {
                location,
                region: selectedRegion,
                propertyType,
                areaSize: areaSize || (propertyType?.includes('Byt') ? 70 : 120),
                income,
                cash
            },
            result: {
                isSuccess: result?.status === 'YES',
                maxLoan: result?.maxLoan,
                failReason: result?.failReason,
                maxAffordableM2: result?.maxAffordableM2
            }
        };

        try {
            const response = await fetch('/api/send-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                const data = await response.json();
                console.error('Submission error:', data);
                alert(`Chyba: ${data.error || 'Neznámá chyba'}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Chyba připojení. Zkuste to prosím znovu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Step 1: Select REGION ---
    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="text-emerald-600" /> Kde to bude?
            </h2>
            <p className="text-slate-500 text-sm">Vyberte širší oblast, ve které hledáte.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(REGIONS) as RegionId[]).map((region) => (
                    <button
                        key={region}
                        onClick={() => { setSelectedRegion(region); setStep(1.5); }}
                        className="p-5 rounded-xl border-2 border-slate-200 text-left transition-all hover:border-emerald-400 hover:bg-slate-50 hover:shadow-md group"
                    >
                        <div className="font-bold text-lg text-slate-800 group-hover:text-emerald-700">{region}</div>
                        <div className="text-xs text-slate-400 mt-1">
                            {REGIONS[region].slice(0, 3).join(', ')}...
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // --- Step 1.5: Select SPECIFIC TOWN ---
    const renderStep1_5 = () => {
        if (!selectedRegion) return null;

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Zpět na oblasti
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Map className="text-emerald-600" /> Konkrétní obec ({selectedRegion})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {REGIONS[selectedRegion].map((town) => (
                        <button
                            key={town}
                            onClick={() => { setLocation(town); setStep(2); }}
                            className="p-4 rounded-xl border-2 border-slate-200 text-left transition-all hover:border-emerald-400 hover:bg-slate-50 hover:shadow-sm"
                        >
                            <div className="font-semibold text-slate-800">{town}</div>
                            <div className="text-[10px] text-slate-400 mt-1">
                                Byt cca {MARKET_MAP[town].flat_renovated.toLocaleString()} /m²
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderStep2 = () => {
        const isFlat = propertyType?.includes('Byt');
        const isLand = propertyType === 'Pozemek';

        const defaultSize = isLand ? 1000 : (isFlat ? 70 : 120);
        const currentSize = areaSize || defaultSize;

        // Dynamic Range for Slider
        const minSize = isLand ? 300 : 20;
        const maxSize = isLand ? 3000 : 300;
        const stepSize = isLand ? 50 : 5;

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setStep(1.5)} className="text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Změnit obec ({location})
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Home className="text-emerald-600" /> Typ nemovitosti?
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {PROPERTY_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => {
                                        setPropertyType(type.value);
                                        // Reset size to sensible default
                                        setAreaSize(type.value === 'Pozemek' ? 1000 : (type.value.includes('Byt') ? 70 : 120));
                                    }}
                                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${propertyType === type.value
                                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md'
                                        : 'border-slate-200 hover:border-emerald-400 bg-white'
                                        }`}
                                >
                                    <div className="font-bold">{type.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {propertyType && (
                        <div className="animate-in fade-in duration-500">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <Map className="text-emerald-600" /> Velikost?
                            </h2>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <label className="block text-sm font-medium text-slate-700">
                                    {isLand ? 'Plocha pozemku (m²)' : 'Užitná plocha (m²)'}
                                </label>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <input
                                        type="range"
                                        min={minSize}
                                        max={maxSize}
                                        step={stepSize}
                                        value={currentSize}
                                        onChange={(e) => setAreaSize(Number(e.target.value))}
                                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                    />
                                    <div className="min-w-[120px] relative">
                                        <input
                                            type="text"
                                            value={formatThousand(currentSize)}
                                            onChange={(e) => setAreaSize(parseThousand(e.target.value))}
                                            className="w-full pl-3 pr-10 py-2 text-right font-bold text-xl text-emerald-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">m²</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {propertyType === 'Rekonstrukce' ? 'Plocha domu před rekonstrukcí.' :
                                        propertyType === 'Stavba domu' ? 'Zamýšlená užitná plocha novostavby.' :
                                            propertyType === 'Pozemek' ? 'Celková výměra parcely.' :
                                                'Celková podlahová plocha.'}
                                </p>

                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Pokračovat <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // --- Step 3: Finance ---
    const renderStep3 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
            <div className="flex gap-2 mb-4">
                <button onClick={() => setStep(2)} className="text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1">
                    <ChevronLeft className="w-4 h-4" /> Zpět na typ
                </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Banknote className="text-emerald-600" /> Finance
            </h2>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                {/* Income Slider */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                        Čistý měsíční příjem domácnosti
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <input
                            type="range"
                            min="20000"
                            max="150000"
                            step="1000"
                            value={income}
                            onChange={(e) => setIncome(Number(e.target.value))}
                            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="min-w-[140px] relative">
                            <input
                                type="text"
                                value={formatThousand(income)}
                                onChange={(e) => setIncome(parseThousand(e.target.value))}
                                className="w-full pl-3 pr-14 py-2 text-right font-bold text-xl text-emerald-700 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">Kč</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">Příjem všech žadatelů dohromady (po zdanění). Kalkulace na 30 let.</p>
                </div>

                {/* Savings Input */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">
                        Vlastní úspory (Hotovost)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formatThousand(cash)}
                            onChange={(e) => setCash(parseThousand(e.target.value))}
                            className="block w-full rounded-lg border-2 border-slate-200 pl-4 pr-16 py-3 text-lg font-semibold focus:border-emerald-500 focus:ring-emerald-500 outline-none"
                        />
                        <div className="absolute inset-y-0 right-12 flex items-center pointer-events-none text-slate-400 font-bold">
                            Kč
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCalculate}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
                >
                    Spočítat možnosti <ArrowRight />
                </button>
            </div>
        </div>
    );

    const renderLoader = () => (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500 text-center">
            <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-6" />
            <h3 className="text-xl font-semibold text-slate-700">Počítám limity bank...</h3>
            <p className="text-slate-500 mt-2">Ověřuji tržní ceny v lokalitě {location}</p>
            <div className="mt-8 bg-slate-100 p-4 rounded-lg max-w-sm text-xs text-slate-500">
                <p><strong>Poznámka:</strong> Využíváme analytická data trhu pro rok 2026.</p>
                <p className="mt-1">Pro přesnou nabídku úrokových sazeb je nutný individuální scoring v bance (API napojení).</p>
            </div>
        </div>
    );

    const renderResult = () => {
        if (!result) return null;

        const isSuccess = result.status === 'YES';

        let title = "Výpočet je hotový!";
        let description = `Pro lokalitu <strong>${location}</strong> (${areaSize || 'standard'} m²) a váš příjem jsme našli řešení.`;
        let icon = <ShieldCheck className="w-8 h-8 text-emerald-600" />;
        let buttonText = "Chci poslat detailní nabídku";
        let bgColor = "bg-emerald-100";

        if (!isSuccess) {
            title = "Je to složitější...";
            // @ts-ignore
            if (result.failReason === 'LTV') {
                description = "Limity ČNB vyžadují více vlastních úspor (LTV).";
            }
            // @ts-ignore
            else if (result.failReason === 'DSTI') {
                description = "Splátka hypotéky by byla příliš vysoká vůči příjmům.";
            } else {
                description = "Vaše zadání naráží na limity trhu a ČNB.";
            }

            // ADDED: Affordable Size Message
            if (result.maxAffordableM2 && result.maxAffordableM2 > 0) {
                description += `<br><br>S vaším rozpočtem byste v této lokalitě bezpečně dosáhli na <strong>${result.maxAffordableM2} m²</strong> (požadujete ${areaSize || 0} m²).`;
            }

            description += "<br><br><strong>Domluvte si nezávaznou schůzku pro nalezení řešení.</strong>";
            buttonText = "Chci detailní nabídku (Schůzka)";
            icon = <Banknote className="w-8 h-8 text-amber-600" />;
            bgColor = "bg-amber-100";
        }

        return (
            <div className="relative max-w-2xl mx-auto py-10 animate-in zoom-in-95 duration-500">
                {/* BLURRED BACKGROUND CONTENT */}
                <div className="absolute inset-0 z-0 bg-white p-6 rounded-3xl border border-slate-200 blur-sm scale-[1.02] opacity-50 select-none overflow-hidden flex flex-col items-center justify-center">
                    {isSuccess ? (
                        <>
                            <div className="text-6xl font-bold text-slate-300 mb-4">{result.maxLoan.toLocaleString()} Kč</div>
                            <div className="text-4xl font-bold text-slate-200">ANO, DOSÁHNETE</div>
                        </>
                    ) : (
                        <>
                            <div className="text-6xl font-bold text-slate-300 mb-4">{result.maxAffordableM2} m²</div>
                            <div className="text-4xl font-bold text-slate-200">MOŽNÁ JEN MENŠÍ?</div>
                        </>
                    )}
                </div>

                {/* LEAD CAPTURE OVERLAY */}
                <div className={`relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-3xl border-2 ${isSuccess ? 'border-emerald-100' : 'border-amber-100'} shadow-2xl text-center`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${bgColor} rounded-full mb-6`}>
                        {icon}
                    </div>

                    <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{title}</h2>
                    <div className="text-lg text-slate-600 mb-8 max-w-md mx-auto leading-relaxed" dangerouslySetInnerHTML={{ __html: description }} />

                    <form onSubmit={handleLeadSubmit} className="space-y-4 max-w-sm mx-auto">
                        <div>
                            <input
                                type="text"
                                required
                                placeholder="Jméno a Příjmení"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full px-5 py-3 rounded-lg border ${isSuccess ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-amber-500 focus:ring-amber-200'} border-slate-300 focus:ring-2 outline-none transition-all text-slate-900 bg-white`}
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                required
                                placeholder="Váš Email (@)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-5 py-3 rounded-lg border ${isSuccess ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-amber-500 focus:ring-amber-200'} border-slate-300 focus:ring-2 outline-none transition-all text-slate-900 bg-white`}
                            />
                        </div>
                        <div>
                            <input
                                type="tel"
                                placeholder="Telefonní číslo (nepovinné)"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className={`w-full px-5 py-3 rounded-lg border ${isSuccess ? 'focus:border-emerald-500 focus:ring-emerald-200' : 'focus:border-amber-500 focus:ring-amber-200'} border-slate-300 focus:ring-2 outline-none text-slate-900 bg-white`}
                            />
                        </div>

                        {/* Agent Offers Checkbox (Coming Soon) */}
                        <div className="flex items-start gap-3 text-left bg-slate-50 p-3 rounded-lg border border-slate-100 opacity-70">
                            <input
                                type="checkbox"
                                id="agentOffers"
                                disabled
                                checked={false}
                                className="mt-1 w-5 h-5 text-slate-400 rounded border-slate-300 cursor-not-allowed"
                            />
                            <label htmlFor="agentOffers" className="text-sm text-slate-500 cursor-not-allowed">
                                <strong>Chci nabídky nemovitostí od makléřů.</strong> <span className="text-xs uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded ml-1 font-bold">Coming Soon</span>
                                <br />
                                <span className="text-slate-400 text-xs text-opacity-80">Můžete dostat neveřejné nabídky dříve než ostatní.</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full ${isSuccess ? 'bg-slate-900 hover:bg-slate-800' : 'bg-amber-600 hover:bg-amber-700'} text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {isSubmitting ? 'Odesílám...' : buttonText}
                        </button>

                        <p className="text-xs text-slate-400 mt-4">
                            Odesláním souhlasíte se zpracováním osobních údajů.
                        </p>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Hypotéka <span className="text-emerald-600">Valašsko</span>
                    </h1>
                    <p className="text-slate-500 mt-2">Realitní check pro rok 2026</p>
                </div>

                <div className="transition-all duration-300">
                    {submitted ? (
                        <div className="max-w-2xl mx-auto py-12 text-center animate-in zoom-in-95 duration-500">
                            <div className="bg-white p-8 rounded-3xl border-2 border-emerald-100 shadow-xl">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShieldCheck className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Poptávka odeslána!</h2>
                                <p className="text-lg text-slate-600 mb-8">
                                    Výsledek jsme poslali na <strong>{email}</strong>. {wantAgentOffers ? 'Zároveň jsme aktivovali vyhledávání nabídek u místních makléřů.' : 'Ozveme se vám co nejdříve.'}
                                </p>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left mb-8">
                                    <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                                        <Banknote className="w-5 h-5 text-emerald-600" /> Splátka pro vybranou nemovitost
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mb-4 block">
                                        Pro úvěr <strong>{result?.loanNeeded.toLocaleString()} Kč</strong> a odhadovanou cenu {result?.marketPrice.toLocaleString()} Kč.
                                    </p>
                                    <div className="space-y-3">
                                        {[15, 20, 25, 30].map(years => {
                                            const rate = 0.048; // Common rate
                                            const monthlyRate = rate / 12;
                                            const payments = years * 12;
                                            const loan = result?.loanNeeded || 0;
                                            const monthlyPayment = Math.round(loan * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1));
                                            const isFeasible = monthlyPayment / income <= 0.45;

                                            return (
                                                <div key={years} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                                    <div>
                                                        <span className="font-semibold text-slate-700">{years} let</span>
                                                        {!isFeasible && <span className="ml-2 text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-bold uppercase">Limit příjmů</span>}
                                                    </div>
                                                    <div className={`text-lg font-bold ${isFeasible ? 'text-emerald-700' : 'text-slate-300 line-through'}`}>
                                                        {monthlyPayment.toLocaleString()} Kč / měs.
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-4 text-[11px] text-slate-400 italic">
                                        * Výpočet je orientační. Přesnou nabídku získáte po individuálním posouzení v bance. U variant označených "Limit příjmů" může být vyžadována další bonita nebo více úspor.
                                    </p>
                                </div>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-emerald-600 font-semibold hover:underline"
                                >
                                    Zkusit jiný výpočet
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {step === 1 && renderStep1()}
                            {step === 1.5 && renderStep1_5()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                            {step === 10 && renderLoader()}
                            {step === 11 && renderResult()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
