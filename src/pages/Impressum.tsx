export default function Impressum() {
    return (
        <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Impressum</h1>
                <p className="text-lg text-gray-600">Rechtliche Angaben und Kontaktinformationen</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-10">

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Anbieter</h2>
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
                            <p>
                                <strong className="text-gray-900">Website:</strong>{' '}
                                <a href="https://cirpan-software-development.at" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                                    https://cirpan-software-development.at
                                </a>
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Haftungsausschluss</h2>

                    <div className="space-y-6 text-gray-600 leading-relaxed">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Inhalt des Onlineangebotes</h3>
                            <p>
                                Der Autor übernimmt keinerlei Gewähr für die Aktualität, Korrektheit, Vollständigkeit oder
                                Qualität der bereitgestellten Informationen. Haftungsansprüche gegen den Autor, welche sich
                                auf Schäden materieller oder ideeller Art beziehen, die durch die Nutzung oder Nichtnutzung
                                der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und unvollständiger
                                Informationen verursacht wurden, sind grundsätzlich ausgeschlossen.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Verweise und Links</h3>
                            <p>
                                Bei direkten oder indirekten Verweisen auf fremde Internetseiten ("Links"), die außerhalb
                                des Verantwortungsbereiches des Autors liegen, würde eine Haftungsverpflichtung ausschließlich
                                in dem Fall in Kraft treten, in dem der Autor von den Inhalten Kenntnis hat und es ihm
                                technisch möglich und zumutbar wäre, die Nutzung im Falle rechtswidriger Inhalte zu verhindern.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Urheberrecht</h3>
                            <p>
                                Der Autor ist bestrebt, in allen Publikationen die Urheberrechte der verwendeten Grafiken,
                                Tondokumente, Videosequenzen und Texte zu beachten, von ihm selbst erstellte Grafiken,
                                Tondokumente, Videosequenzen und Texte zu nutzen oder auf lizenzfreie Grafiken, Tondokumente,
                                Videosequenzen und Texte zurückzugreifen.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Rechtswirksamkeit</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Dieser Haftungsausschluss ist als Teil des Internetangebotes zu betrachten, von dem aus
                        auf diese Seite verwiesen wurde. Sofern Teile oder einzelne Formulierungen dieses Textes
                        der geltenden Rechtslage nicht, nicht mehr oder nicht vollständig entsprechen sollten,
                        bleiben die übrigen Teile des Dokumentes in ihrem Inhalt und ihrer Gültigkeit davon unberührt.
                    </p>
                </section>

            </div>
        </div>
    );
}
