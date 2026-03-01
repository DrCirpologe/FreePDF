export default function Datenschutz() {
    return (
        <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Datenschutzerklärung</h1>
                <p className="text-lg text-gray-600">Informationen zum Schutz Ihrer persönlichen Daten gemäß DSGVO</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-10">

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">1. Verantwortlicher</h2>
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
                        <h3 className="font-bold text-lg text-blue-900 mb-4">CIRPAN Software Development</h3>
                        <div className="space-y-3 text-gray-700">
                            <p><strong className="text-gray-900">Inhaber:</strong> Oğuzhan Cirpan</p>
                            <p><strong className="text-gray-900">Adresse:</strong> Wien, Österreich</p>
                            <p>
                                <strong className="text-gray-900">E-Mail:</strong>{' '}
                                <a href="mailto:info.cirpan@gmail.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                                    info.cirpan@gmail.com
                                </a>
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Erhebung und Verarbeitung personenbezogener Daten</h2>

                    <div className="space-y-6 text-gray-600 leading-relaxed">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">2.1 Beim Besuch der Website</h3>
                            <p>
                                Bei jedem Zugriff auf unsere Website werden automatisch Informationen allgemeiner Natur erfasst.
                                Diese Informationen (Server-Logfiles) beinhalten etwa die Art des Webbrowsers, das verwendete
                                Betriebssystem, den Domainnamen Ihres Internet-Service-Providers und ähnliches.
                                Hierbei handelt es sich ausschließlich um Informationen, die keine Rückschlüsse auf Ihre Person zulassen.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">2.2 Lokale Verarbeitung von PDFs</h3>
                            <p>
                                Alle von uns angebotenen PDF-Werkzeuge (z.B. Zusammenfügen, Aufteilen, Komprimieren) werden
                                <strong> vollständig lokal in Ihrem Webbrowser</strong> ausgeführt.
                                Ihre Dateien verlassen niemals Ihren Computer und werden zu keinem Zeitpunkt an unsere Server
                                übertragen oder dort gespeichert. Dies garantiert ein Höchstmaß an Privatsphäre und Datensicherheit.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">2.3 Kontaktformular</h3>
                            <p>
                                Wenn Sie unser Kontaktformular nutzen, werden die von Ihnen eingegebenen Daten zur Bearbeitung
                                Ihrer Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir
                                nicht ohne Ihre Einwilligung weiter.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cookies</h2>
                    <div className="space-y-4 text-gray-600 leading-relaxed">
                        <p>
                            Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die im Internetbrowser bzw.
                            vom Internetbrowser auf dem Computersystem des Nutzers gespeichert werden.
                        </p>
                        <h3 className="font-bold text-gray-900 mt-4 mb-2">3.1 Notwendige Cookies</h3>
                        <p>
                            Diese Cookies sind für das Funktionieren der Website unbedingt erforderlich und können in
                            unseren Systemen nicht deaktiviert werden. Sie werden normalerweise nur als Reaktion auf
                            von Ihnen getätigte Aktionen gesetzt, wie etwa das Speichern Ihrer Cookie-Präferenzen für das Banner.
                        </p>
                        <h3 className="font-bold text-gray-900 mt-4 mb-2">3.2 Cookie-Einstellungen</h3>
                        <p>
                            Sie können Ihre Cookie-Präferenzen jederzeit in den Einstellungen Ihres Browsers ändern oder löschen.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Ihre Rechte</h2>
                    <p className="text-gray-600 mb-4">Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li><strong>Recht auf Auskunft:</strong> Sie können Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten verlangen.</li>
                        <li><strong>Recht auf Berichtigung:</strong> Sie haben ein Recht auf unverzügliche Berichtigung unrichtiger Daten.</li>
                        <li><strong>Recht auf Löschung:</strong> Sie können die Löschung Ihrer personenbezogenen Daten verlangen.</li>
                        <li><strong>Recht auf Einschränkung:</strong> Sie können die Einschränkung der Verarbeitung verlangen.</li>
                        <li><strong>Recht auf Datenübertragbarkeit:</strong> Sie haben das Recht, Ihre Daten in einem strukturierten Format zu erhalten.</li>
                        <li><strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung Ihrer Daten widersprechen.</li>
                    </ul>
                    <p className="text-gray-600 mt-4">
                        Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:{' '}
                        <a href="mailto:info.cirpan@gmail.com" className="text-blue-600 hover:text-blue-800 transition-colors">info.cirpan@gmail.com</a>
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Speicherdauer & Datensicherheit</h2>
                    <div className="space-y-4 text-gray-600 leading-relaxed">
                        <p>
                            Personenbezogene Daten werden nur so lange gespeichert, wie es für den jeweiligen Zweck
                            erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Kontaktanfragen werden für
                            die Dauer der Bearbeitung und für eventuelle Rückfragen für einen Zeitraum von maximal 3 Jahren gespeichert.
                        </p>
                        <p>
                            Wir verwenden angemessene technische und organisatorische Sicherheitsmaßnahmen, um Ihre
                            Daten gegen zufällige oder vorsätzliche Manipulationen, teilweisen oder vollständigen
                            Verlust, Zerstörung oder gegen den unbefugten Zugriff Dritter zu schützen.
                        </p>
                    </div>
                </section>

                <div className="text-sm text-gray-400 border-t border-gray-100 pt-8 mt-12">
                    <p><strong>Stand:</strong> Oktober 2025</p>
                </div>
            </div>
        </div>
    );
}
