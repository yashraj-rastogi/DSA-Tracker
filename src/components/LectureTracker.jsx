import { useState, useMemo } from 'react';
import {
    BookOpen,
    CheckCircle,
    Circle,
    Filter,
    ChevronDown,
    ChevronRight,
    Search
} from 'lucide-react';
import lectureData from '../data/lectureData';

const LectureTracker = ({ data, toggleLecture }) => {
    const [filterType, setFilterType] = useState('all');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    // Get unique types
    const types = useMemo(() => {
        const typeSet = new Set(lectureData.map(l => l.type));
        return ['all', ...Array.from(typeSet)];
    }, []);

    // Group lectures by type
    const groupedLectures = useMemo(() => {
        const groups = {};
        lectureData.forEach(lecture => {
            if (!groups[lecture.type]) {
                groups[lecture.type] = [];
            }
            groups[lecture.type].push(lecture);
        });
        return groups;
    }, []);

    // Filter lectures
    const filteredGroups = useMemo(() => {
        let results = filterType === 'all' ? { ...groupedLectures } : { [filterType]: groupedLectures[filterType] || [] };

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const filtered = {};
            Object.entries(results).forEach(([type, lectures]) => {
                const matchedLectures = lectures.filter(l =>
                    l.title.toLowerCase().includes(query) ||
                    l.type.toLowerCase().includes(query)
                );
                if (matchedLectures.length > 0) {
                    filtered[type] = matchedLectures;
                }
            });
            return filtered;
        }

        return results;
    }, [filterType, groupedLectures, searchQuery]);

    const toggleGroup = (type) => {
        setExpandedGroups(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    const getTypeClass = (type) => {
        const classes = {
            'Intro': 'type-intro',
            'Lec': 'type-lec',
            'Practice': 'type-practice',
            'Mentor': 'type-mentor',
            'PYQ': 'type-pyq',
            'Sunday': 'type-sunday',
            'Material': 'type-material'
        };
        return classes[type] || 'type-lec';
    };

    const getGroupStats = (lectures) => {
        const completed = lectures.filter(l => data.completedLectures.includes(l.id)).length;
        return { completed, total: lectures.length };
    };

    // Initialize all groups as expanded
    const isGroupExpanded = (type) => {
        return expandedGroups[type] !== false;
    };

    const completionPercentage = Math.round((data.completedLectures.length / lectureData.length) * 100);

    return (
        <div className="animate-fade-in space-y-4">
            {/* Header */}
            <div className="glass-card p-4 md:p-6">
                <div className="flex flex-col gap-4">
                    {/* Title Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold">Lecture Schedule</h2>
                                <p className="text-slate-400 text-sm">
                                    {data.completedLectures.length} of {lectureData.length} completed ({completionPercentage}%)
                                </p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-auto">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search lectures..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-10 w-full sm:w-64"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
                        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="flex gap-2">
                            {types.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`filter-btn whitespace-nowrap ${filterType === type ? 'active' : ''}`}
                                >
                                    {type === 'all' ? 'All' : type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Overall Progress</span>
                    <span className="text-sm font-semibold text-orange-400">{completionPercentage}%</span>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill lectures"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
            </div>

            {/* Lecture Groups */}
            <div className="space-y-3">
                {Object.entries(filteredGroups).map(([type, lectures]) => {
                    const stats = getGroupStats(lectures);
                    const isExpanded = isGroupExpanded(type);
                    const groupPercentage = Math.round((stats.completed / stats.total) * 100);

                    return (
                        <div key={type} className="glass-card overflow-hidden">
                            {/* Group Header */}
                            <button
                                onClick={() => toggleGroup(type)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {isExpanded ? (
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-slate-400" />
                                    )}
                                    <span className={`type-badge ${getTypeClass(type)}`}>{type}</span>
                                    <span className="font-semibold hidden sm:inline">{lectures.length} items</span>
                                    <span className="font-semibold sm:hidden text-sm">{lectures.length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm text-slate-400">
                                        {stats.completed}/{stats.total}
                                    </span>
                                    <div className="w-16 sm:w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
                                            style={{ width: `${groupPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            </button>

                            {/* Lectures List */}
                            {isExpanded && (
                                <div className="border-t border-slate-700/50">
                                    {lectures.map((lecture) => {
                                        const isCompleted = data.completedLectures.includes(lecture.id);

                                        return (
                                            <div
                                                key={lecture.id}
                                                onClick={() => toggleLecture(lecture.id)}
                                                className={`lecture-item border-b border-slate-700/30 last:border-b-0 ${isCompleted ? 'completed' : ''}`}
                                            >
                                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                    <div className="relative flex-shrink-0">
                                                        {isCompleted ? (
                                                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                        <span className="text-slate-500 text-xs sm:text-sm font-mono flex-shrink-0">
                                                            #{lecture.id}
                                                        </span>
                                                        <span className={`lecture-title text-sm sm:text-base truncate ${isCompleted ? 'text-slate-500' : 'text-slate-200'}`}>
                                                            {lecture.title}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className={`type-badge ${getTypeClass(lecture.type)} flex-shrink-0 text-xs`}>
                                                    {lecture.type}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {Object.keys(filteredGroups).length === 0 && (
                    <div className="glass-card p-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Lectures Found</h3>
                        <p className="text-slate-400">
                            Try adjusting your search or filter.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LectureTracker;
