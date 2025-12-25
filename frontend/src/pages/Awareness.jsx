import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BookOpen, AlertTriangle, CheckCircle, Lightbulb, HelpCircle } from 'lucide-react';

function Awareness() {
    const [examples, setExamples] = useState([]);
    const [tips, setTips] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [activeTab, setActiveTab] = useState('examples');

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        try {
            const [exRes, tipRes, quizRes] = await Promise.all([
                api.get('/api/awareness/phishing-examples'),
                api.get('/api/awareness/security-tips'),
                api.get('/api/awareness/quiz')
            ]);
            setExamples(exRes.data);
            setTips(tipRes.data);
            setQuiz(quizRes.data);
        } catch (error) { console.error('Failed to load:', error); }
    };

    const handleQuizAnswer = (qId, answer) => {
        setQuizAnswers(prev => ({ ...prev, [qId]: answer }));
    };

    const tabs = [
        { key: 'examples', label: 'Phishing Examples', icon: AlertTriangle },
        { key: 'tips', label: 'Security Tips', icon: Lightbulb },
        { key: 'quiz', label: 'Test Yourself', icon: HelpCircle }
    ];

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-blue-500" /> Learn to Spot Phishing
                </h1>
                <p className="text-slate-400 mt-1">Educate yourself on common phishing tactics</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}>
                            <Icon className="w-4 h-4" /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Examples Tab */}
            {activeTab === 'examples' && (
                <div className="grid md:grid-cols-2 gap-4">
                    {examples.map((ex, i) => (
                        <div key={i} className="glass-card p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-white font-medium">{ex.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded ${ex.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' : ex.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {ex.difficulty}
                                    </span>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">{ex.description}</p>
                            <div>
                                <p className="text-xs text-slate-500 mb-2">Red Flags:</p>
                                {ex.red_flags.map((flag, j) => (
                                    <p key={j} className="text-slate-400 text-sm flex items-start gap-2">
                                        <span className="text-red-500">•</span> {flag}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tips Tab */}
            {activeTab === 'tips' && (
                <div className="grid md:grid-cols-2 gap-4">
                    {tips.map((tip, i) => (
                        <div key={i} className="glass-card p-6">
                            <Lightbulb className="w-6 h-6 text-yellow-400 mb-3" />
                            <h3 className="text-white font-medium mb-2">{tip.title}</h3>
                            <p className="text-slate-400 text-sm">{tip.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && quiz && (
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
                    {quiz.questions.map((q, i) => (
                        <div key={i} className="glass-card p-6">
                            <p className="text-white font-medium mb-4">{i + 1}. {q.question}</p>
                            <div className="space-y-2">
                                {q.options.map((opt, j) => {
                                    const answered = quizAnswers[q.id] !== undefined;
                                    const isSelected = quizAnswers[q.id] === j;
                                    const isCorrect = j === q.correct;
                                    return (
                                        <button key={j} onClick={() => !answered && handleQuizAnswer(q.id, j)}
                                            disabled={answered}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${answered ? (isCorrect ? 'bg-green-500/20 border border-green-500/50' : isSelected ? 'bg-red-500/20 border border-red-500/50' : 'bg-slate-800/50')
                                                    : 'bg-slate-800/50 hover:bg-slate-700/50'
                                                }`}>
                                            <span className={answered && isCorrect ? 'text-green-400' : answered && isSelected ? 'text-red-400' : 'text-slate-300'}>{opt}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {quizAnswers[q.id] !== undefined && (
                                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                                    <p className="text-blue-400 text-sm">{q.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Awareness;
