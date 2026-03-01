import { useState, useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('freepdf_cookie_consent');
        if (!consent) {
            // Small delay to let page load first
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('freepdf_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('freepdf_cookie_consent', 'rejected');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 inset-x-0 pb-4 sm:pb-6 z-[100] animate-slide-up px-4 sm:px-6 lg:px-8 pointer-events-none">
            <div className="max-w-4xl mx-auto rounded-2xl shadow-xl bg-white border border-gray-100 p-6 pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center gap-6">

                <div className="flex-1 flex gap-4">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-full h-fit">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Wir respektieren deine Privatsphäre</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Wir verwenden Cookies, um die Nutzererfahrung zu verbessern und unsere Website zu analysieren.
                            Da alle PDF-Tools direkt in deinem Browser laufen, speichern wir keine deiner Dateien
                            auf unseren Servern.
                        </p>
                    </div>
                </div>

                <div className="flex w-full sm:w-auto gap-3 sm:flex-col shrink-0">
                    <button
                        onClick={handleAccept}
                        className="flex-1 sm:flex-none btn-primary px-6 py-2.5 rounded-xl font-medium text-sm hover:shadow-glow"
                    >
                        Alle Akzeptieren
                    </button>
                    <button
                        onClick={handleReject}
                        className="flex-1 sm:flex-none bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors"
                    >
                        Ablehnen
                    </button>
                </div>

                <button
                    onClick={handleReject}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 sm:hidden"
                >
                    <X size={20} />
                </button>

            </div>
        </div>
    );
}
