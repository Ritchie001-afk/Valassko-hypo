'use client';

import React from 'react';
import { Activity, Car, Home, Shield, Umbrella, HeartPulse, ArrowRight } from 'lucide-react';

const ServiceCard = ({
    icon: Icon,
    title,
    description,
    buttonText,
    colorClass,
    onClick
}: {
    icon: React.ElementType,
    title: string,
    description: string,
    buttonText: string,
    colorClass: string,
    onClick: () => void
}) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center mb-6`}>
            <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-600 mb-8 leading-relaxed flex-grow">
            {description}
        </p>
        <button
            onClick={onClick}
            className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 hover:gap-3 transition-all group"
        >
            {buttonText} <ArrowRight className="w-4 h-4" />
        </button>
    </div>
);

export default function ServicesSection({ onSelectService }: { onSelectService?: (service: string) => void }) {
    const handleSelect = (serviceId: string) => {
        if (onSelectService) {
            onSelectService(serviceId);
        }
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-slate-900">
                        Ochrana pro <span className="text-emerald-600">Valašský život</span>
                    </h2>
                    <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
                        Hory jsou krásné, ale umí být tvrdé. Specifická rizika našeho regionu vyžadují pojištění,
                        které opravdu funguje, když se něco stane.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ServiceCard
                        icon={HeartPulse}
                        title="Úrazovka pro sportovce a dříče"
                        description="Lyže na Bílé, kolo na Bečvě nebo práce v lese? Zkontroluji, jestli vaše stará pojistka kryje dnešní náklady léčení. Většina starších smluv je nebezpečně podhodnocená."
                        buttonText="Revize úrazovky zdarma"
                        colorClass="bg-red-500 shadow-red-200"
                        onClick={() => handleSelect('life')}
                    />

                    <ServiceCard
                        icon={Car}
                        title="Auta v horách"
                        description="Srnky, led a úzké cesty. Valašsko je pro auta náročné. Srovnám vám cenu povinného ručení i havarijka napříč trhem a najdu tu nejlepší ochranu pro vašeho plechového parťáka."
                        buttonText="Chci levnější pojistku"
                        colorClass="bg-blue-600 shadow-blue-200"
                        onClick={() => handleSelect('auto')}
                    />

                    <ServiceCard
                        icon={Home}
                        title="Dům v bezpečí"
                        description="Vichřice, sníh, pády stromů a spodní voda. Máte dům pojištěný na aktuální hodnotu stavebního materiálu? Neriskujte podpojištění a dejte svému domovu jistotu."
                        buttonText="Ověřit smlouvu"
                        colorClass="bg-emerald-600 shadow-emerald-200"
                        onClick={() => handleSelect('property')}
                    />
                </div>
            </div>
        </section>
    );
}
