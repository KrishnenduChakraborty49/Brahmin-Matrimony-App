import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Lock, Crown, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../api';

const AstrologyModal = ({ isOpen, onClose, targetProfile, currentUserProfile }) => {
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Matching Birth Horoscopes...');
  const [matchResult, setMatchResult] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    // Load user dashboard stats to check plan
    const fetchStats = async () => {
      try {
        const res = await api.get('/profiles/me/dashboard-stats');
        setUserStats(res.data);
      } catch (err) {
        console.error('Error fetching stats for astrology modal:', err);
      }
    };
    fetchStats();

    // Reset simulator
    setLoading(true);
    setStatusMessage('Matching Birth Horoscopes...');

    // Mock calculations loading sequence
    const messages = [
      'Matching Birth Horoscopes...',
      'Computing Guna Milan metrics...',
      'Checking Nakshatra and Rashi alignments...',
      'Evaluating Manglik Dosha compatibility...'
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < messages.length) {
        setStatusMessage(messages[msgIndex]);
      }
    }, 550);

    const timeout = setTimeout(() => {
      // Perform matching calculation
      const calculated = calculateGunas(currentUserProfile, targetProfile);
      setMatchResult(calculated);
      setLoading(false);
      clearInterval(interval);
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isOpen, targetProfile, currentUserProfile]);

  if (!isOpen || !targetProfile) return null;

  // Guna calculation logic
  const calculateGunas = (profileA, profileB) => {
    const defaultProfile = { fullName: 'Member', manglikStatus: 'NON_MANGLIK' };
    const pA = profileA || defaultProfile;
    const pB = profileB || defaultProfile;

    // Create a deterministic score based on names
    const combined = (pA.fullName || "") + (pB.fullName || "");
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Guna score between 18 and 33
    const score = 18 + (Math.abs(hash) % 16);
    
    // Break down Categories
    const categories = [
      { name: "Nadi", max: 8, obtained: score > 26 ? 8 : (score % 2 === 0 ? 8 : 0), desc: "Physiological compatibility" },
      { name: "Bhakoot", max: 7, obtained: score % 3 === 0 ? 0 : 7, desc: "Emotional compatibility" },
      { name: "Gana", max: 6, obtained: Math.abs(hash) % 2 === 0 ? 6 : (Math.abs(hash) % 3 === 0 ? 5 : 1), desc: "Temperament matching" },
      { name: "Graha Maitri", max: 5, obtained: Math.min(5, 3 + (Math.abs(hash) % 3)), desc: "Mental compatibility" },
      { name: "Yoni", max: 4, obtained: Math.min(4, 1 + (Math.abs(hash) % 4)), desc: "Physical matching" },
      { name: "Tara", max: 3, obtained: Math.min(3, 1 + (Math.abs(hash) % 3)), desc: "Destiny & longevity" },
      { name: "Vasya", max: 2, obtained: Math.min(2, 1 + (Math.abs(hash) % 2)), desc: "Mutual attraction" },
      { name: "Varna", max: 1, obtained: 1, desc: "Work compatibility" }
    ];

    // Adjust obtained values to sum up exactly to the score
    let currentSum = categories.reduce((sum, c) => sum + Math.round(c.obtained), 0);
    let diff = score - currentSum;
    for (let i = 0; i < categories.length && diff !== 0; i++) {
      if (diff > 0 && categories[i].obtained < categories[i].max) {
        const add = Math.min(diff, categories[i].max - categories[i].obtained);
        categories[i].obtained += add;
        diff -= add;
      } else if (diff < 0 && categories[i].obtained > 0) {
        const sub = Math.min(Math.abs(diff), categories[i].obtained);
        categories[i].obtained -= sub;
        diff += sub;
      }
    }

    // Manglik Check
    const statusA = pA.manglikStatus || 'NON_MANGLIK';
    const statusB = pB.manglikStatus || 'NON_MANGLIK';
    let manglikMatch = "Compatible";
    let manglikDesc = "Astrological alignments are highly favorable.";
    let isManglikIssue = false;

    if ((statusA === 'MANGLIK' && statusB === 'NON_MANGLIK') || (statusA === 'NON_MANGLIK' && statusB === 'MANGLIK')) {
      manglikMatch = "Manglik Dosha Mismatch";
      manglikDesc = "One profile is Manglik. Perform remedial Pujas.";
      isManglikIssue = true;
    } else if (statusA === 'MANGLIK' && statusB === 'MANGLIK') {
      manglikMatch = "Dosha Cancelled";
      manglikDesc = "Both profiles are Manglik, which cancels the negative effects.";
    }

    return {
      gunaScore: score,
      categories,
      manglikMatch,
      manglikDesc,
      isManglikIssue
    };
  };

  const isPremium = userStats?.plan === 'PREMIUM' || userStats?.plan === 'GOLD';

  // Get score compatibility description
  const getScoreVerdict = (score) => {
    if (score >= 26) return { tag: 'Excellent Match', color: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 21) return { tag: 'Good Match', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { tag: 'Moderate Match', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="font-extrabold text-gray-900">Vedic Kundali Matching</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {loading ? (
            /* Matchmaking Simulation view */
            <div className="py-12 flex flex-col items-center justify-center space-y-8">
              {/* Spinning circular Vedic wheel */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Outer spinning wheel */}
                <div className="absolute inset-0 border-4 border-dashed border-rose-400 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 border-2 border-dashed border-rose-300 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
                
                {/* Inner traditional Kundali chart square design representation */}
                <div className="absolute w-28 h-28 border border-rose-300 bg-rose-50/30 rotate-45 flex items-center justify-center shadow-inner">
                  <div className="w-20 h-20 border border-dashed border-rose-200" />
                </div>
                
                {/* Center glowing element */}
                <div className="absolute w-12 h-12 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg border border-white/20 z-10 animate-pulse">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <h4 className="text-md font-bold text-gray-800 animate-pulse">{statusMessage}</h4>
                <p className="text-xs text-gray-400">Determining astrological affinity metrics</p>
              </div>
            </div>
          ) : (
            /* Results view */
            <div className="space-y-6">
              
              {/* Top Summary Block */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-100/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Guna Milan Score</h4>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-gray-900">{matchResult?.gunaScore}</span>
                    <span className="text-gray-400 text-sm">/ 36 Gunas</span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-gray-500">
                    Compatibility check for <span className="text-rose-600 font-bold">{targetProfile.fullName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getScoreVerdict(matchResult?.gunaScore).color}`}>
                    {getScoreVerdict(matchResult?.gunaScore).tag}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-2 font-medium">Vedic Astro Match</div>
                </div>
              </div>

              {/* Detailed Astrology Reports */}
              <div className="relative">
                
                {/* Categories Table (Unmasked / Premium or Locked / Free) */}
                <div className="space-y-4">
                  <h5 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Detailed Compatibility (Ashta-Koota)</h5>
                  
                  <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                    {matchResult?.categories.map((cat, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3.5 flex items-center justify-between text-xs transition ${!isPremium && idx > 1 ? 'blur-[3px] select-none opacity-40' : ''}`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-gray-800 flex items-center gap-1.5">
                            {cat.name}
                            <span className="text-[10px] text-gray-400 font-medium font-normal">({cat.desc})</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2.5">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className="h-full bg-rose-500 rounded-full" 
                              style={{ width: `${(cat.obtained / cat.max) * 100}%` }}
                            />
                          </div>
                          <span className="font-extrabold text-gray-800 whitespace-nowrap">
                            {cat.obtained} / {cat.max}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Manglik Compatibility Block */}
                  <div className={`border rounded-2xl p-4 flex items-start space-x-3 transition ${
                    !isPremium ? 'blur-[3px] select-none opacity-40' : ''
                  } ${
                    matchResult?.isManglikIssue 
                      ? 'bg-amber-50 border-amber-100 text-amber-900' 
                      : 'bg-green-50 border-green-100 text-green-950'
                  }`}>
                    {matchResult?.isManglikIssue ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        Manglik Match Status: {matchResult?.manglikMatch}
                      </div>
                      <p className="text-gray-600">{matchResult?.manglikDesc}</p>
                    </div>
                  </div>
                </div>

                {/* Free Lock Overlay Cover */}
                {!isPremium && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-6 border border-gray-100 shadow-inner z-10">
                    <div className="w-12 h-12 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center mb-3 shadow-inner">
                      <Crown className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-gray-900 text-sm">Vedic Match Report Locked</h4>
                    <p className="text-xs text-gray-500 max-w-xs mt-1 leading-relaxed">
                      Upgrade to Premium to view detailed Guna Milan categories, compatibility logs, and Manglik Dosha analysis.
                    </p>
                    <button 
                      onClick={() => {
                        onClose();
                        navigate('/upgrade');
                      }}
                      className="mt-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold rounded-xl shadow-md transition text-xs flex items-center gap-1.5 active:scale-95"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Unlock Astro Reports
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AstrologyModal;
