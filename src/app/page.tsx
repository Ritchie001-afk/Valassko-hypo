'use client';

import HypoWizard from '@/components/HypoWizard';
import ClassicMortgageCalculator from '@/components/ClassicMortgageCalculator';
import ServicesSection from '@/components/ServicesSection';
import InsuranceQuickForm from '@/components/InsuranceQuickForm';
import AgentPromo from '@/components/AgentPromo';
import { useState } from 'react';
import { Home as HomeIcon, Calculator } from 'lucide-react';

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<string>('life');
  const [calculatorMode, setCalculatorMode] = useState<'property' | 'classic'>('property');

  const handleServiceSelect = (topic: string) => {
    setSelectedTopic(topic);
    const formElement = document.getElementById('contact-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            name: "Hypotéka Valašsko",
            description:
              "Nezávislé srovnání hypoték a refinancování pro oblast Valašska (Rožnov, Vsetín, Valmez).",
            provider: {
              "@type": "Organization",
              name: "Finance Valašsko",
              url: "https://finance-valassko.cz",
            },
            areaServed: {
              "@type": "Place",
              name: "Valašsko",
            },
            serviceType: "Mortgage Broker",
          }),
        }}
      />

      {/* Hero Tabs */}
      <div className="bg-slate-900 pt-12 pb-20 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">
          Hypotéka na Valašsku <span className="text-emerald-400">JEDNODUŠE</span>
        </h1>

        <div className="inline-flex bg-slate-800 p-1 rounded-2xl mb-8 shadow-xl border border-slate-700">
          <button
            onClick={() => setCalculatorMode('property')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${calculatorMode === 'property'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <HomeIcon className="w-5 h-5" /> Podle nemovitosti
          </button>
          <button
            onClick={() => setCalculatorMode('classic')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${calculatorMode === 'classic'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Calculator className="w-5 h-5" /> Vím, kolik potřebuju
          </button>
        </div>
      </div>

      <div className="-mt-16 mb-8 relative z-10 px-4">
        {calculatorMode === 'property' ? <HypoWizard /> : <ClassicMortgageCalculator />}
      </div>

      <AgentPromo />

      {/* Insurance Cross-sell */}
      <ServicesSection onSelectService={handleServiceSelect} />

      {/* Lead Magnet */}
      <InsuranceQuickForm initialTopic={selectedTopic} />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm px-4">
        <p className="mb-2">© 2026 Hypo Valašsko. Všechna práva vyhrazena.</p>
        <p className="mb-4 text-slate-500 text-xs">Výpočty jsou pouze orientační a neslouží jako návrh na uzavření smlouvy.</p>
        <p className="text-slate-600 text-xs">
          Pwrd by Stavrex.cz
        </p>
      </footer>
    </main>
  );
}
