import React from 'react';
import { ExternalLink, Code2, GraduationCap, User, Globe } from 'lucide-react';

const About = () => {

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-140px)]">
            <div className="w-full max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
                <div className="header-section text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600">
                        About PrepTracker
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Your ultimate companion for placement preparation tracking.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Resources Card */}
                    <div className="glass-card p-6 md:col-span-2">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Code2 className="text-orange-400" />
                            Curriculum Resources
                        </h2>

                        <div className="space-y-6">
                            <div className="resource-item flex items-start gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                                    <GraduationCap size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Apna College Alpha Batch</h3>
                                    <p className="text-slate-400 text-sm">
                                        Comprehensive roadmap for full stack development and core CS concepts.
                                        The lecture schedule in this app follows the structured learning path provided by the Alpha Batch.
                                    </p>
                                </div>
                            </div>

                            <div className="resource-item flex items-start gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="p-3 rounded-full bg-orange-500/20 text-orange-400">
                                    <Code2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Striver's A2Z DSA Sheet</h3>
                                    <p className="text-slate-400 text-sm">
                                        The definitive guide to Data Structures and Algorithms.
                                        This app integrates the complete 450+ question sheet to help you master problem-solving.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Developer Card */}
                    <div className="glass-card p-6 md:col-span-2">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <User className="text-orange-400" />
                            Developer
                        </h2>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500/30">
                                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-4xl font-bold text-slate-500">
                                        YR
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-2xl font-bold mb-2">Yashraj Rastogi</h3>
                                <p className="text-slate-400 mb-6">
                                    Full Stack Developer & UI/UX Enthusiast. Built this tool to help students stay consistent and track their progress effectively.
                                </p>

                                <a
                                    href="https://yashraj-rastogi.vercel.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all transform hover:scale-105 font-medium"
                                >
                                    <Globe size={18} />
                                    Visit Portfolio Website
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center text-slate-500 text-sm mt-12 pb-6">
                    &copy; {new Date().getFullYear()} PrepTracker. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default About;
