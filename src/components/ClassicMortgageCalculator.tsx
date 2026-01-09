'use client';

import React, { useState } from 'react';
import { Calculator, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { BANK_CONSTANTS } from '@/data/market-config';

export default function ClassicMortgageCalculator() {
    // Inputs
    const [income, setIncome] = useState(35000);
    const [cash, setCash] = useState(200000);
    const [desiredLoan, setDesiredLoan] = useState(2000000);

    // Calculation State
    const [result, setResult] = useState<{ isPossible: boolean; maxPossible: number; monthlyPayment: number; years: number } | null>(null);

    // Lead Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const calculate = () => {
        const monthlyRate = BANK_CONSTANTS.INTEREST_RATE / 12;
        const maxAllowedPayment = income * BANK_CONSTANTS.MAX_DSTI;

        let bestYears = 30;
        let bestPayment = 0;
        let isPossibleAny = false;

        // Try to find shortest term between 20 and 30 years
        for (let y = 20; y <= 30; y++) {
            const numPayments = y * 12;
            const paymentForDesired = desiredLoan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

            if (paymentForDesired <= maxAllowedPayment) {
                bestYears = y;
                bestPayment = paymentForDesired;
                isPossibleAny = true;
                break; // Found the shortest possible term
            }
        }

        // If not possible even at 30 years, calculate stats for 30 years anyway (as "Not Possible")
        if (!isPossibleAny) {
            bestYears = 30;
            const numPayments = 30 * 12;
            bestPayment = desiredLoan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        }

        // Max Loan for 30 years (always show max potential)
        const numPayments30 = 30 * 12;
        const maxLoan30 = maxAllowedPayment * (Math.pow(1 + monthlyRate, numPayments30) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments30));

        setResult({
            isPossible: isPossibleAny,
            maxPossible: Math.floor(maxLoan30),
            monthlyPayment: Math.round(bestPayment),
            years: bestYears
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                type: 'mortgage',
                contact: { name, email, phone },
                calculation: {
                    type: 'classic',
                    income,
                    cash,
                    desiredLoan,
                    isPossible: result?.isPossible
                }
            };

            const response = await fetch('/api/send-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                const err = await response.json();
                alert(`Chyba: ${err.error}`);
            }
        } catch (e) {
            alert('Chyba odesílání.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-emerald-100 animate-in zoom-in-95">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-800">Díky, {name}!</h3>
                <div className="text-slate-600 mt-2 text-lg">
                    {result?.isPossible
                        ? 'Vypadá to nadějně. Ozveme se vám s konkrétní nabídkou.'
                        : 'i když to teď nevychází, zkusíme najít řešení. Ozveme se.'}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 border border-slate-100">
            <div className="bg-slate-900 p-6 md:p-8 text-white text-center">
                <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                    <Calculator className="text-emerald-400" /> "Vím, kolik potřebuju"
                </h2>
                <div className="text-slate-300">Rychlá kontrola podle vašich příjmů a limitů ČNB.</div>
            </div>

            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* INPUTS */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Čistý měsíční příjem (domácnosti)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step={1000}
                                value={income}
                                onChange={e => setIncome(Number(e.target.value))}
                                className="w-full pl-4 pr-16 py-3 text-xl font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-12 top-3 text-slate-400 font-medium pointer-events-none">Kč</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Vlastní úspory</label>
                        <div className="relative">
                            <input
                                type="number"
                                step={10000}
                                value={cash}
                                onChange={e => setCash(Number(e.target.value))}
                                className="w-full pl-4 pr-16 py-3 text-xl font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-12 top-3 text-slate-400 font-medium pointer-events-none">Kč</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Kolik si chci půjčit?</label>
                        <div className="relative">
                            <input
                                type="number"
                                step={10000}
                                value={desiredLoan}
                                onChange={e => setDesiredLoan(Number(e.target.value))}
                                className="w-full pl-4 pr-16 py-3 text-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            <span className="absolute right-12 top-3 text-emerald-600 font-medium pointer-events-none">Kč</span>
                        </div>
                    </div>

                    <button
                        onClick={calculate}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Spočítat možnosti
                    </button>
                </div>

                {/* RESULTS */}
                <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200 flex flex-col justify-center min-h-[400px]">
                    {!result ? (
                        <div className="text-center text-slate-400">
                            <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <div className="text-slate-500">Zadejte údaje a klikněte na Spočítat</div>
                        </div>
                    ) : (
                        <div className="animate-in zoom-in-95 duration-300">
                            {result.isPossible ? (
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-emerald-700 mb-2">Máme pro vás řešení!</h3>
                                    <div className="text-slate-600">Na tuto částku s vaším příjmem dosáhnete.</div>
                                    <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-100">
                                        <div className="text-sm text-slate-500">Měsíční splátka ({result.years} let)</div>
                                        <div className="text-2xl font-bold text-slate-900">{result.monthlyPayment.toLocaleString()} Kč</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                                        <AlertTriangle className="w-8 h-8 text-amber-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-amber-700 mb-2">Tohle bude těsné...</h3>
                                    <div className="text-slate-600">Přímo na tuto částku to teď nevychází (limit ČNB), ale můžeme najít cestu.</div>
                                    <div className="mt-4 text-sm text-slate-500">
                                        Max. možná hypotéka: <strong>{result.maxPossible.toLocaleString()} Kč</strong>
                                    </div>
                                </div>
                            )}

                            {/* LEAD FORM */}
                            <form onSubmit={handleSubmit} className="space-y-3 mt-6 border-t pt-6 border-slate-200">
                                <h4 className="font-bold text-slate-800 text-center mb-2">Chci nezávaznou nabídku</h4>
                                <input
                                    required
                                    type="text"
                                    placeholder="Jméno"
                                    value={name} onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white"
                                />
                                <input
                                    required
                                    type="email"
                                    placeholder="Email"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white"
                                />
                                <input
                                    type="tel"
                                    placeholder="Telefon (nepovinné)"
                                    value={phone} onChange={e => setPhone(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 text-slate-900 bg-white"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full font-bold py-3 rounded-xl text-white shadow-md transition-all ${result.isPossible ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                                >
                                    {isSubmitting ? 'Odesílám...' : 'Odeslat poptávku'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
