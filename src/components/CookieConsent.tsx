'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 z-50 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-slate-300 text-sm flex-1 text-center md:text-left">
                    <p>
                        Tento web používá k poskytování služeb a analýze návštěvnosti soubory cookie.
                        Používáním tohoto webu s tím souhlasíte.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                        Odmítnout
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg text-sm font-bold"
                    >
                        Souhlasím
                    </button>
                </div>
            </div>
        </div>
    );
}
