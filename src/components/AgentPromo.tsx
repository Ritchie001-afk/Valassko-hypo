import { Search, MapPin, Clock } from 'lucide-react';

export default function AgentPromo() {
    return (
        <section className="bg-slate-900 py-12 px-4 border-y border-slate-800">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
                <div className="bg-emerald-500/10 p-4 rounded-full">
                    <Search className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                        <span className="text-emerald-400">Připravujeme:</span> Nabídky nemovitostí od makléřů
                    </h3>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Brzy spustíme možnost propojení schválené hypotéky přímo s nákupem.
                        Dostanete se k neveřejným nabídkám dříve než ostatní.
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="flex -space-x-4 bg-slate-800 p-2 rounded-xl border border-slate-700">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-800">
                            <MapPin className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-800">
                            <Clock className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
