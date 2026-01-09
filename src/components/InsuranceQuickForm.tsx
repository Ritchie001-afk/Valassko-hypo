'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Send, MessageSquare, Car, Home, HeartPulse, HelpCircle, CheckCircle2 } from 'lucide-react';

type Topic = 'auto' | 'property' | 'life' | 'other';

const TOPICS: { id: Topic; label: string; icon: React.ElementType }[] = [
    { id: 'life', label: 'Život / Úraz', icon: HeartPulse },
    { id: 'auto', label: 'Auto / Moto', icon: Car },
    { id: 'property', label: 'Dům / Byt', icon: Home },
    { id: 'other', label: 'Jiné / Dotaz', icon: HelpCircle },
];

export default function InsuranceQuickForm({ initialTopic }: { initialTopic?: string }) {
    const [selectedTopic, setSelectedTopic] = useState<Topic>('life');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Effect to update local state if prop changes (e.g. clicked on different card)
    useEffect(() => {
        if (initialTopic && TOPICS.map(t => t.id).includes(initialTopic as Topic)) {
            setSelectedTopic(initialTopic as Topic);
        }
    }, [initialTopic]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                type: 'insurance',
                topic: TOPICS.find(t => t.id === selectedTopic)?.label,
                contact: { name, phone, email },
                note
            };

            const response = await fetch('/api/send-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                const errData = await response.json();
                console.error('Insurance submit failed:', response.status, errData);
                throw new Error(errData.error || 'Failed');
            }
        } catch (error) {
            console.error('Submit Error:', error);
            alert('Chyba při odesílání: Zkontrolujte prosím připojení a zkuste to znovu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <section id="contact-form" className="py-20 bg-slate-50 scroll-mt-20">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-emerald-100 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">Vše odesláno!</h2>
                        <p className="text-slate-600 text-lg">
                            Díky za zprávu. Ozvu se vám na email <strong>{email}</strong> co nejdříve.
                        </p>
                        <button onClick={() => setSubmitted(false)} className="mt-8 text-emerald-600 font-semibold hover:underline">
                            Poslat další dotaz
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="contact-form" className="py-20 bg-slate-50 scroll-mt-20">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">

                    {/* Left: Context / Motivation */}
                    <div className="bg-slate-900 p-10 md:w-2/5 flex flex-col text-white justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">Rychlá poptávka</h2>
                            <p className="text-slate-300 leading-relaxed mb-8">
                                Nechce se vám nic hledat? Napište mi, co řešíte, a já se vám ozvu s konkrétním srovnáním nebo radou.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-semibold">Nezávazná konzultace</span>
                                </div>
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-semibold">Srovnání celého trhu</span>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Blob */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-20"></div>
                    </div>

                    {/* Right: Form */}
                    <div className="p-10 md:w-3/5">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">O co máte zájem?</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {TOPICS.map((t) => {
                                        const Icon = t.icon;
                                        const isSelected = selectedTopic === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setSelectedTopic(t.id)}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${isSelected
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                                                    : 'border-slate-100 hover:border-emerald-200 text-slate-600'
                                                    }`}
                                            >
                                                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                                                <span className="text-sm">{t.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Jméno</label>
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 bg-white"
                                        placeholder="Jan Novák"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefon (nepovinné)</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 bg-white"
                                        placeholder="777 123 456"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 bg-white"
                                        placeholder="vas@email.cz"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Poznámka (nepovinné)</label>
                                <textarea
                                    rows={2}
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none text-slate-900 bg-white"
                                    placeholder="Např. končí mi fixace, chci pojistit nové auto..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Odesílám...' : <>Odeslat poptávku <Send className="w-4 h-4" /></>}
                            </button>

                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
}
