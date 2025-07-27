'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);
  const [showFeatures, setShowFeatures] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [isCheckingActive, setIsCheckingActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load recent sessions from localStorage
    const recent = JSON.parse(localStorage.getItem('peer-rank-recent-sessions') || '[]');
    setRecentSessions(recent.slice(0, 3));

    // Check for active sessions
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      setIsCheckingActive(true);
      const response = await fetch('/api/session/active');
      const data = await response.json();

      if (data.success && data.hasActiveSession && data.activeSessions.length > 0) {
        setActiveSession(data.activeSessions[0]);
      } else {
        setActiveSession(null);
      }
    } catch (error) {
      console.error('Error checking active sessions:', error);
      setActiveSession(null);
    } finally {
      setIsCheckingActive(false);
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setIsLoading(true);

    // Add to recent sessions
    const recent = JSON.parse(localStorage.getItem('peer-rank-recent-sessions') || '[]');
    const newSession = {
      roomCode: roomCode.trim().toUpperCase(),
      joinedAt: new Date().toISOString(),
      sessionName: `Session ${roomCode.trim().toUpperCase()}`
    };

    const updatedRecent = [newSession, ...recent.filter(s => s.roomCode !== newSession.roomCode)].slice(0, 5);
    localStorage.setItem('peer-rank-recent-sessions', JSON.stringify(updatedRecent));

    router.push(`/session/${roomCode.trim().toUpperCase()}`);
  };

  const handleCreateSession = async () => {
    // Check for active sessions before creating
    await checkActiveSession();

    if (activeSession) {
      const joinActive = window.confirm(`Only one session can be active at a time. There's an active session: ${activeSession.sessionName} (${activeSession.roomCode}). Would you like to join it instead?`);
      if (joinActive) {
        router.push(`/session/${activeSession.roomCode}`);
      }
      return;
    }

    router.push('/create');
  };

  const handleQuickJoin = (code) => {
    setRoomCode(code);
    router.push(`/session/${code}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-32 h-32 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 lg:py-16">
        {/* Navigation Bar */}
        <nav className="flex justify-between items-center mb-8 lg:mb-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PR</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Peer Rank
            </span>
          </div>
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </nav>

        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Peer Rank
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 lg:mb-8 max-w-4xl mx-auto leading-relaxed">
            Real-time collaborative code review platform where students review, vote, and rank feedback quality
          </p>

          {/* Stats */}
          <div className="flex justify-center space-x-8 mb-8 text-sm md:text-base">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">10+</div>
              <div className="text-gray-500">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Real-time</div>
              <div className="text-gray-500">Collaboration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-gray-500">Free</div>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="max-w-6xl mx-auto">
          {/* Active Session Alert */}
          {activeSession && (
            <div className="mb-6 lg:mb-8 px-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                        Active Session Found
                      </h3>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 mb-3">
                      There's currently an active session: <strong>{activeSession.sessionName}</strong> ({activeSession.roomCode}) with {activeSession.participantCount} participants.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => router.push(`/session/${activeSession.roomCode}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Join Active Session
                      </button>
                      <button
                        onClick={checkActiveSession}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 px-4">
            {/* Join Session Card */}
            <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl lg:rounded-3xl shadow-xl p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">Join Session</h2>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">Enter a room code to join an existing review session</p>
              </div>

              <form onSubmit={handleJoinSession} className="space-y-4">
                <div>
                  <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    id="roomCode"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 lg:py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white text-center text-lg font-mono tracking-widest transition-all duration-200"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !roomCode.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 lg:py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    'Join Session'
                  )}
                </button>
              </form>

              {/* Recent Sessions */}
              {recentSessions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Sessions</h3>
                  <div className="space-y-2">
                    {recentSessions.map((session, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickJoin(session.roomCode)}
                        className="w-full text-left px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-200 flex items-center justify-between group"
                      >
                        <span className="font-mono text-blue-600 dark:text-blue-400">{session.roomCode}</span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Create Session Card */}
            <div className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 rounded-2xl lg:rounded-3xl shadow-xl p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Session</h2>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">Start a new code review session with custom settings</p>
              </div>

              <button
                onClick={handleCreateSession}
                className={`w-full font-semibold py-3 lg:py-4 px-6 rounded-xl transition-all duration-200 transform shadow-lg mb-6 ${activeSession
                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:scale-105'
                  }`}
                disabled={isCheckingActive || activeSession}
              >
                {isCheckingActive ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Checking...
                  </div>
                ) : activeSession ? (
                  'Session Already Active'
                ) : (
                  'Create New Session'
                )}
              </button>

              {/* Quick Features */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Multiple programming languages
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time collaboration
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Code execution & testing
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Session analytics & ranking
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          {showFeatures && (
            <div className="max-w-6xl mx-auto px-4 mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 md:mb-12">Platform Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-Time Code Review</h4>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Collaborative code editing with syntax highlighting and instant feedback</p>
                </div>

                <div className="text-center bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Peer Feedback & Voting</h4>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Give and receive feedback with upvoting system for quality comments</p>
                </div>

                <div className="text-center bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ranking & Analytics</h4>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Track performance with peer rankings and detailed session analytics</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
