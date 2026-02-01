import { useState, useMemo } from 'react';
import {
    Code2,
    ExternalLink,
    Filter,
    Search,
    CheckCircle2,
    Circle,
    RotateCcw,
    ChevronDown,
    ChevronRight,
    Youtube,
    FileText,
    Sparkles,
    BookOpen,
    Star
} from 'lucide-react';
import dsaQuestions from '../data/dsaQuestions';

const DSATracker = ({ updateDSAStatus, getDSAStatus, getSolvedCount }) => {
    const [filterTopic, setFilterTopic] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showTopicDropdown, setShowTopicDropdown] = useState(false);
    const [expandedTopics, setExpandedTopics] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});

    // Flatten the nested data structure
    const flattenedQuestions = useMemo(() => {
        const questions = [];
        if (!dsaQuestions?.content) return questions;

        dsaQuestions.content.forEach((topic, topicIndex) => {
            topic.categoryList?.forEach((category, categoryIndex) => {
                category.questionList?.forEach((question, questionIndex) => {
                    questions.push({
                        id: question.questionId || `${topicIndex}_${categoryIndex}_${questionIndex}`,
                        topic: topic.contentHeading,
                        subtopic: category.categoryName,
                        problem: question.questionHeading,
                        questionLink: question.questionLink || '',
                        gfgLink: question.gfgLink || '',
                        leetCodeLink: question.leetCodeLink || '',
                        youTubeLink: question.youTubeLink || '',
                        topicIndex,
                        categoryIndex,
                        questionIndex: question.questionIndex ?? questionIndex,
                    });
                });
            });
        });
        return questions;
    }, []);

    const totalQuestions = flattenedQuestions.length;
    const solvedCount = getSolvedCount();
    const solvedPercentage = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

    const topics = useMemo(() => {
        const topicSet = new Set(flattenedQuestions.map(q => q.topic));
        return ['all', ...Array.from(topicSet)];
    }, [flattenedQuestions]);

    const filteredQuestions = useMemo(() => {
        return flattenedQuestions.filter(question => {
            const status = getDSAStatus(question.id);
            if (filterTopic !== 'all' && question.topic !== filterTopic) return false;
            if (filterStatus !== 'all' && status !== filterStatus) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    question.problem.toLowerCase().includes(query) ||
                    question.topic.toLowerCase().includes(query) ||
                    question.subtopic.toLowerCase().includes(query)
                );
            }
            return true;
        });
    }, [flattenedQuestions, filterTopic, filterStatus, searchQuery, getDSAStatus]);

    const groupedQuestions = useMemo(() => {
        const grouped = {};
        filteredQuestions.forEach(q => {
            if (!grouped[q.topic]) {
                grouped[q.topic] = { topicIndex: q.topicIndex, categories: {} };
            }
            if (!grouped[q.topic].categories[q.subtopic]) {
                grouped[q.topic].categories[q.subtopic] = { categoryIndex: q.categoryIndex, questions: [] };
            }
            grouped[q.topic].categories[q.subtopic].questions.push(q);
        });

        const sortedGrouped = {};
        Object.keys(grouped)
            .sort((a, b) => grouped[a].topicIndex - grouped[b].topicIndex)
            .forEach(topic => {
                sortedGrouped[topic] = grouped[topic];
                const sortedCategories = {};
                Object.keys(grouped[topic].categories)
                    .sort((a, b) => grouped[topic].categories[a].categoryIndex - grouped[topic].categories[b].categoryIndex)
                    .forEach(cat => {
                        sortedCategories[cat] = grouped[topic].categories[cat];
                        sortedCategories[cat].questions.sort((a, b) => a.questionIndex - b.questionIndex);
                    });
                sortedGrouped[topic].categories = sortedCategories;
            });

        return sortedGrouped;
    }, [filteredQuestions]);

    const getStatusIcon = (status, size = 'normal') => {
        const sizeClass = size === 'small' ? 'w-5 h-5' : 'w-6 h-6';
        switch (status) {
            case 'solved':
                return <CheckCircle2 className={`${sizeClass} text-emerald-500`} />;
            case 'revision':
                return <RotateCcw className={`${sizeClass} text-amber-500`} />;
            default:
                return <Circle className={`${sizeClass} text-slate-600`} />;
        }
    };

    const toggleTopic = (topic) => {
        setExpandedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
    };

    const toggleCategory = (key) => {
        setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const hasLinks = (question) => {
        return question.questionLink || question.gfgLink || question.leetCodeLink || question.youTubeLink;
    };

    // Initialize all as expanded
    useMemo(() => {
        if (Object.keys(expandedTopics).length === 0 && Object.keys(groupedQuestions).length > 0) {
            const initialExpanded = {};
            Object.keys(groupedQuestions).forEach(topic => {
                initialExpanded[topic] = true;
            });
            setExpandedTopics(initialExpanded);
        }
    }, [groupedQuestions]);

    return (
        <div className="space-y-6 px-2 sm:px-0">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                        <Code2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">DSA Question Sheet</h1>
                        <p className="text-slate-400 text-sm sm:text-base flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            {solvedCount} of {totalQuestions} solved ({solvedPercentage}%)
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-80">
                    <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-50 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all text-base"
                    />
                </div>
            </div>

            {/* Topic Stats - Horizontal Scroll */}
            <div className="flex gap-5 overflow-x-auto pb-4 mx-4 px-4 scrollbar-hide">
                {Object.entries(
                    flattenedQuestions.reduce((acc, q) => {
                        if (!acc[q.topic]) {
                            acc[q.topic] = { total: 0, solved: 0, topicIndex: q.topicIndex };
                        }
                        acc[q.topic].total++;
                        if (getDSAStatus(q.id) === 'solved') {
                            acc[q.topic].solved++;
                        }
                        return acc;
                    }, {})
                )
                    .sort((a, b) => a[1].topicIndex - b[1].topicIndex)
                    .map(([topic, stats]) => {
                        const percentage = Math.round((stats.solved / stats.total) * 100);
                        const isSelected = filterTopic === topic;

                        return (
                            <button
                                key={topic}
                                onClick={() => setFilterTopic(isSelected ? 'all' : topic)}
                                className={`flex-shrink-0 p-3 sm:p-4 rounded-xl border transition-all min-w-[120px] sm:min-w-[140px]
                                    ${isSelected
                                        ? 'bg-slate-800 border-amber-500/50 shadow-md shadow-amber-500/10'
                                        : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
                                    }`}
                            >
                                <div className="text-xs text-slate-400 mb-2 truncate">{topic}</div>
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <span className="text-lg sm:text-xl font-bold text-slate-50">{stats.solved}</span>
                                        <span className="text-slate-500 text-sm">/{stats.total}</span>
                                    </div>
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 relative">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="14" fill="none"
                                                className="text-slate-700/50" stroke="currentColor" strokeWidth="3" />
                                            <circle cx="18" cy="18" r="14" fill="none"
                                                className="text-amber-500"
                                                stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                                                strokeDasharray={`${percentage * 0.88} 88`} />
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-slate-400 mr-2">
                    <Filter className="w-4 h-4 relative top-px" />
                    <span className="text-sm font-medium hidden sm:inline">Filter:</span>
                </div>

                {['all', 'unsolved', 'solved', 'revision'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 w-23    sm:px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${filterStatus === status
                                ? 'bg-amber-500 text-slate-950 font-semibold'
                                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}

                <div className="relative ml-auto">
                    <button
                        onClick={() => setShowTopicDropdown(!showTopicDropdown)}
                        className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 transition-all flex items-center gap-2"
                    >
                        {filterTopic === 'all' ? 'All Topics' : filterTopic}
                        <ChevronDown className={`w-4 h-4 transition-transform ${showTopicDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showTopicDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowTopicDropdown(false)} />
                            <div className="absolute right-0 top-full mt-2 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto min-w-56 py-2">
                                {topics.map(topic => (
                                    <button
                                        key={topic}
                                        onClick={() => {
                                            setFilterTopic(topic);
                                            setShowTopicDropdown(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-700/50 transition-colors
                                            ${filterTopic === topic ? 'text-amber-400 bg-amber-500/10' : 'text-slate-300'}`}
                                    >
                                        {topic === 'all' ? 'All Topics' : topic}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Showing count */}
            <div className="text-base text-slate-500 pl-1 m-5">
                Showing {filteredQuestions.length} of {totalQuestions} questions
            </div>

            {/* Questions Container */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                {Object.entries(groupedQuestions).map(([topic, topicData]) => {
                    const isExpanded = expandedTopics[topic] !== false;
                    const topicSolved = Object.values(topicData.categories).reduce((acc, cat) =>
                        acc + cat.questions.filter(q => getDSAStatus(q.id) === 'solved').length, 0
                    );
                    const topicTotal = Object.values(topicData.categories).reduce((acc, cat) => acc + cat.questions.length, 0);
                    const topicProgress = Math.round((topicSolved / topicTotal) * 100);

                    return (
                        <div key={topic} className="border-b border-slate-800 last:border-b-0">
                            {/* Topic Header */}
                            <button
                                onClick={() => toggleTopic(topic)}
                                className="w-full px-4 lg:px-6 py-4 lg:py-5 flex items-center justify-between hover:bg-slate-800/30 transition-all group"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <ChevronDown className={`w-5 h-5 text-slate-500 group-hover:text-slate-300 flex-shrink-0 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
                                    <h2 className="text-lg lg:text-xl font-semibold text-slate-100 truncate group-hover:text-white transition-colors">{topic}</h2>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="w-24 lg:w-32 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                                            style={{ width: `${topicProgress}%` }}
                                        />
                                    </div>
                                    <span className="text-slate-400 font-medium bg-slate-800 px-3 py-1 rounded-full text-xs sm:text-sm">
                                        {topicSolved} / {topicTotal}
                                    </span>
                                </div>
                            </button>

                            {/* Categories */}
                            {isExpanded && (
                                <div className="border-t border-slate-800 bg-slate-900/50">
                                    {Object.entries(topicData.categories).map(([categoryName, categoryData]) => {
                                        const categoryKey = `${topic}_${categoryName}`;
                                        const isCatExpanded = expandedCategories[categoryKey] !== false;
                                        const catSolved = categoryData.questions.filter(q => getDSAStatus(q.id) === 'solved').length;
                                        const catProgress = Math.round((catSolved / categoryData.questions.length) * 100);

                                        return (
                                            <div key={categoryKey}>
                                                {/* Category Header */}
                                                <button
                                                    onClick={() => toggleCategory(categoryKey)}
                                                    className="w-full px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between hover:bg-slate-800/20 transition-all border-t border-slate-800/50"
                                                >
                                                    <div className="flex items-center gap-3 pl-8 lg:pl-10 min-w-0">
                                                        <ChevronRight className={`w-4 h-4 text-slate-600 flex-shrink-0 transition-transform duration-200 ${isCatExpanded ? 'rotate-90' : ''}`} />
                                                        <span className="text-base lg:text-lg text-slate-300 font-medium truncate">{categoryName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 flex-shrink-0">
                                                        <div className="w-20 lg:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                                            <div
                                                                className="h-full bg-cyan-500 rounded-full"
                                                                style={{ width: `${catProgress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-slate-500 text-sm">
                                                            {catSolved} / {categoryData.questions.length}
                                                        </span>
                                                    </div>
                                                </button>

                                                {/* Questions */}
                                                {isCatExpanded && (
                                                    <>
                                                        {/* DESKTOP TABLE VIEW */}
                                                        <div className="hidden lg:block">
                                                            {/* Table Header */}
                                                            <div className="px-6 py-3 border-t border-slate-800/50 bg-slate-800/40">
                                                                <div className="grid grid-cols-12 gap-4 pl-12 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                                    <div className="col-span-5">Problem</div>
                                                                    <div className="col-span-1 text-center">Article</div>
                                                                    <div className="col-span-1 text-center">Video</div>
                                                                    <div className="col-span-1 text-center">LeetCode</div>
                                                                    <div className="col-span-1 text-center">GFG</div>
                                                                    <div className="col-span-1 text-center">Revision</div>
                                                                    <div className="col-span-2 text-center">Status</div>
                                                                </div>
                                                            </div>

                                                            {/* Table Rows */}
                                                            {categoryData.questions.map((question) => {
                                                                const status = getDSAStatus(question.id);

                                                                return (
                                                                    <div
                                                                        key={question.id}
                                                                        className={`px-6 py-4 border-t border-slate-800/30 hover:bg-slate-800/30 transition-all
                                                                            ${status === 'solved' ? 'bg-emerald-950/10' : ''}`}
                                                                    >
                                                                        <div className="grid grid-cols-12 gap-4 items-center pl-12">
                                                                            {/* Problem Name */}
                                                                            <div className="col-span-5 flex items-center gap-3">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const newStatus = status === 'solved' ? 'unsolved' : 'solved';
                                                                                        updateDSAStatus(question.id, newStatus);
                                                                                    }}
                                                                                    className="hover:scale-110 transition-transform focus:outline-none"
                                                                                >
                                                                                    {getStatusIcon(status, 'small')}
                                                                                </button>
                                                                                <span className={`text-base font-medium ${status === 'solved' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                                                    {question.problem}
                                                                                </span>
                                                                            </div>

                                                                            {/* Article Link */}
                                                                            <div className="col-span-1 flex justify-center">
                                                                                {question.questionLink ? (
                                                                                    <a href={question.questionLink} target="_blank" rel="noopener noreferrer"
                                                                                        className="group w-9 h-9 rounded-lg bg-cyan-500/5 hover:bg-cyan-500/10 flex items-center justify-center transition-colors border border-cyan-500/10 hover:border-cyan-500/30">
                                                                                        <FileText className="w-4 h-4 text-cyan-500/70 group-hover:text-cyan-400" />
                                                                                    </a>
                                                                                ) : <span className="text-slate-800">—</span>}
                                                                            </div>

                                                                            {/* YouTube Link */}
                                                                            <div className="col-span-1 flex justify-center">
                                                                                {question.youTubeLink ? (
                                                                                    <a href={question.youTubeLink} target="_blank" rel="noopener noreferrer"
                                                                                        className="group w-9 h-9 rounded-lg bg-red-500/5 hover:bg-red-500/10 flex items-center justify-center transition-colors border border-red-500/10 hover:border-red-500/30">
                                                                                        <Youtube className="w-4 h-4 text-red-500/70 group-hover:text-red-400" />
                                                                                    </a>
                                                                                ) : <span className="text-slate-800">—</span>}
                                                                            </div>

                                                                            {/* LeetCode Link */}
                                                                            <div className="col-span-1 flex justify-center">
                                                                                {question.leetCodeLink ? (
                                                                                    <a href={question.leetCodeLink} target="_blank" rel="noopener noreferrer"
                                                                                        className="group w-9 h-9 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 flex items-center justify-center transition-colors border border-amber-500/10 hover:border-amber-500/30">
                                                                                        <ExternalLink className="w-4 h-4 text-amber-500/70 group-hover:text-amber-400" />
                                                                                    </a>
                                                                                ) : <span className="text-slate-800">—</span>}
                                                                            </div>

                                                                            {/* GFG Link */}
                                                                            <div className="col-span-1 flex justify-center">
                                                                                {question.gfgLink ? (
                                                                                    <a href={question.gfgLink} target="_blank" rel="noopener noreferrer"
                                                                                        className="group w-9 h-9 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 flex items-center justify-center transition-colors border border-emerald-500/10 hover:border-emerald-500/30">
                                                                                        <BookOpen className="w-4 h-4 text-emerald-500/70 group-hover:text-emerald-400" />
                                                                                    </a>
                                                                                ) : <span className="text-slate-800">—</span>}
                                                                            </div>

                                                                            {/* Revision Toggle */}
                                                                            <div className="col-span-1 flex justify-center">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const newStatus = status === 'revision' ? 'unsolved' : 'revision';
                                                                                        updateDSAStatus(question.id, newStatus);
                                                                                    }}
                                                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all border
                                                                                        ${status === 'revision'
                                                                                            ? 'bg-amber-500/10 border-amber-500/30'
                                                                                            : 'bg-transparent border-slate-800 hover:border-amber-500/30'
                                                                                        }`}
                                                                                >
                                                                                    <Star className={`w-4 h-4 ${status === 'revision' ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                                                                                </button>
                                                                            </div>

                                                                            {/* Status Dropdown */}
                                                                            <div className="col-span-2 flex justify-center">
                                                                                <select
                                                                                    value={status}
                                                                                    onChange={(e) => updateDSAStatus(question.id, e.target.value)}
                                                                                    className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide cursor-pointer transition-all focus:outline-none border
                                                                                        ${status === 'solved'
                                                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                                            : status === 'revision'
                                                                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                                                                        }`}
                                                                                >
                                                                                    <option value="unsolved">Unsolved</option>
                                                                                    <option value="solved">Solved</option>
                                                                                    <option value="revision">REV</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* MOBILE CARD VIEW */}
                                                        <div className="lg:hidden px-3 pb-3 space-y-3 pt-3 border-t border-slate-800/40">
                                                            {categoryData.questions.map((question) => {
                                                                const status = getDSAStatus(question.id);

                                                                return (
                                                                    <div
                                                                        key={question.id}
                                                                        className={`p-4 rounded-xl border transition-all
                                                                            ${status === 'solved'
                                                                                ? 'bg-emerald-950/20 border-emerald-500/20'
                                                                                : status === 'revision'
                                                                                    ? 'bg-amber-950/20 border-amber-500/20'
                                                                                    : 'bg-slate-800/40 border-slate-700/50'
                                                                            }`}
                                                                    >
                                                                        {/* Question Header */}
                                                                        <div className="flex items-start gap-3">
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newStatus = status === 'solved' ? 'unsolved' : 'solved';
                                                                                    updateDSAStatus(question.id, newStatus);
                                                                                }}
                                                                                className="flex-shrink-0 mt-0.5 active:scale-90 transition-transform"
                                                                            >
                                                                                {getStatusIcon(status)}
                                                                            </button>
                                                                            <p className={`text-base font-medium leading-relaxed flex-1 ${status === 'solved' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                                                {question.problem}
                                                                            </p>
                                                                        </div>

                                                                        {/* Links Row */}
                                                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/30">
                                                                            <div className="flex items-center gap-2">
                                                                                {question.questionLink && (
                                                                                    <a href={question.questionLink} target="_blank" rel="noopener noreferrer"
                                                                                        className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 active:scale-95 transition-transform">
                                                                                        <FileText className="w-5 h-5 text-cyan-400" />
                                                                                    </a>
                                                                                )}
                                                                                {question.youTubeLink && (
                                                                                    <a href={question.youTubeLink} target="_blank" rel="noopener noreferrer"
                                                                                        className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 active:scale-95 transition-transform">
                                                                                        <Youtube className="w-5 h-5 text-red-400" />
                                                                                    </a>
                                                                                )}
                                                                                {question.leetCodeLink && (
                                                                                    <a href={question.leetCodeLink} target="_blank" rel="noopener noreferrer"
                                                                                        className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 active:scale-95 transition-transform">
                                                                                        <ExternalLink className="w-5 h-5 text-amber-400" />
                                                                                    </a>
                                                                                )}
                                                                                {question.gfgLink && (
                                                                                    <a href={question.gfgLink} target="_blank" rel="noopener noreferrer"
                                                                                        className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 active:scale-95 transition-transform">
                                                                                        <BookOpen className="w-5 h-5 text-emerald-400" />
                                                                                    </a>
                                                                                )}
                                                                                {!hasLinks(question) && (
                                                                                    <span className="text-slate-600 text-sm">No links</span>
                                                                                )}
                                                                            </div>

                                                                            {/* Actions */}
                                                                            <div className="flex items-center gap-2">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const newStatus = status === 'revision' ? 'unsolved' : 'revision';
                                                                                        updateDSAStatus(question.id, newStatus);
                                                                                    }}
                                                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center border active:scale-95 transition-all
                                                                                        ${status === 'revision'
                                                                                            ? 'bg-amber-500/20 border-amber-500/30'
                                                                                            : 'bg-slate-800/50 border-slate-700/50'
                                                                                        }`}
                                                                                >
                                                                                    <Star className={`w-5 h-5 ${status === 'revision' ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                                                                                </button>
                                                                                <select
                                                                                    value={status}
                                                                                    onChange={(e) => updateDSAStatus(question.id, e.target.value)}
                                                                                    className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer border
                                                                                        ${status === 'solved'
                                                                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                                                            : status === 'revision'
                                                                                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                                                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                                                                        }`}
                                                                                >
                                                                                    <option value="unsolved">Unsolved</option>
                                                                                    <option value="solved">Solved</option>
                                                                                    <option value="revision">REV</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {Object.keys(groupedQuestions).length === 0 && (
                    <div className="text-center py-16">
                        <Code2 className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                        <h3 className="text-xl font-semibold text-slate-200 mb-2">No Questions Found</h3>
                        <p className="text-slate-500">Try adjusting your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DSATracker;
