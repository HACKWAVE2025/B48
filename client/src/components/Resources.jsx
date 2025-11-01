import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Library, FileText, Video, Download, ExternalLink, X } from 'lucide-react';
import AutoText from './AutoText';
import resourcesData from '../data/resourcesData';

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Flatten all lessons from all subjects for searching
  const allLessons = useMemo(() => {
    const lessons = [];
    Object.keys(resourcesData).forEach((category) => {
      resourcesData[category].subjects.forEach((subject) => {
        subject.lessons.forEach((lesson) => {
          lessons.push({
            ...lesson,
            subject: subject.name,
            category: category
          });
        });
      });
    });
    return lessons;
  }, []);

  // Filter lessons based on search query
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) {
      return allLessons;
    }
    
    const query = searchQuery.toLowerCase();
    return allLessons.filter((lesson) => 
      lesson.title.toLowerCase().includes(query) ||
      lesson.subject.toLowerCase().includes(query)
    );
  }, [searchQuery, allLessons]);

  const getSubjectColor = (subjectName) => {
    switch (subjectName.toLowerCase()) {
      case 'biology':
        return 'from-green-500 to-emerald-500';
      case 'computer science':
        return 'from-blue-500 to-cyan-500';
      case 'physics':
        return 'from-purple-500 to-pink-500';
      case 'chemistry':
        return 'from-orange-500 to-red-500';
      case 'mathematics':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-[#5E936C] to-[#93DA97]';
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-5 py-4 relative bg-gradient-to-br from-[#E8FFD7] to-white min-h-screen">
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <BookOpen className="w-2 h-2 text-[#5E936C] opacity-60" />
          </div>
        ))}
      </div>

      <div className="w-full relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-[#93DA97]/30 rounded-3xl p-8 mb-8 shadow-sm">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-4 rounded-full shadow-sm">
              <Library className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#3E5F44]">
                <AutoText>Learning Resources</AutoText>
              </h1>
              <p className="text-[#557063] text-lg mt-2">
                <AutoText>Search for any topic to access notes and video tutorials</AutoText>
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-[#5E936C]" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for topics (e.g., Photosynthesis, CPU Scheduling...)"
              className="w-full pl-12 pr-12 py-4 border-2 border-[#93DA97] rounded-2xl text-[#3E5F44] placeholder-[#557063]/60 focus:outline-none focus:border-[#5E936C] transition-colors duration-300 text-lg bg-white/80"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#557063] hover:text-[#5E936C] transition-colors duration-300"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="mt-4 text-[#557063] text-sm">
            <AutoText>
              {filteredLessons.length} {filteredLessons.length === 1 ? 'resource' : 'resources'} found
            </AutoText>
          </div>
        </div>

        {/* Results Grid */}
        {filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredLessons.map((lesson, index) => {
              const colorClass = getSubjectColor(lesson.subject);
              
              return (
                <div
                  key={index}
                  className="bg-white border border-[#93DA97]/30 hover:border-[#5E936C] rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  {/* Lesson Header */}
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`bg-gradient-to-r ${colorClass} p-3 rounded-lg shadow-sm shrink-0`}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#3E5F44] mb-2 leading-tight">
                        {lesson.title}
                      </h3>
                      <div className="inline-flex items-center space-x-2 bg-[#E8FFD7] px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-[#5E936C]">
                          {lesson.subject}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resources Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Textbook/Notes */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-[#3E5F44]">
                          <AutoText>Study Notes</AutoText>
                        </h4>
                      </div>
                      {lesson.resources.notes && lesson.resources.notes !== 'N/A' ? (
                        <div className="space-y-2">
                          <p className="text-sm text-[#557063] mb-3">
                            Comprehensive notes and key points
                          </p>
                          <a
                            href={`/${lesson.resources.notes}`}
                            download
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Notes</span>
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-[#557063] italic">
                          Notes coming soon...
                        </p>
                      )}
                    </div>

                    {/* Video */}
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-bold text-[#3E5F44]">
                          <AutoText>Video Tutorial</AutoText>
                        </h4>
                      </div>
                      {lesson.resources.video && lesson.resources.video !== 'N/A' ? (
                        <div className="space-y-2">
                          <p className="text-sm text-[#557063] mb-3">
                            Interactive video explanation
                          </p>
                          <a
                            href={lesson.resources.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Watch Video</span>
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-[#557063] italic">
                          Video coming soon...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#93DA97]/30 rounded-2xl p-12 text-center">
            <div className="bg-gradient-to-r from-[#5E936C] to-[#93DA97] p-6 rounded-full shadow-sm mx-auto mb-6 w-20 h-20 flex items-center justify-center">
              <Search className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#3E5F44] mb-3">
              <AutoText>No resources found</AutoText>
            </h3>
            <p className="text-[#557063] text-lg">
              <AutoText>Try searching for different keywords or topics</AutoText>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;