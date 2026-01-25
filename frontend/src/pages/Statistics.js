import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Trophy, Star, TrendingUp, Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;

const Statistics = () => {
  const { language, getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API}/statistics`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#E5E0D8] rounded w-1/3 mx-auto"></div>
            <div className="h-40 bg-[#E5E0D8] rounded-xl"></div>
            <div className="h-40 bg-[#E5E0D8] rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const level = stats.level;

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C44D38] flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2">
            {language === 'it' ? 'Le Tue Statistiche' : 'Your Statistics'}
          </h1>
        </div>

        {/* Level Card */}
        <div className="zen-card mb-6 bg-gradient-to-r from-[#C44D38]/10 to-[#2C2C2C]/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-5xl">{level.current.emoji}</div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8A8680]">
                  {language === 'it' ? 'Livello' : 'Level'} {level.current.level}
                </p>
                <h2 className="font-serif text-2xl text-[#2C2C2C]">
                  {language === 'it' ? level.current.title_it : level.current.title_en}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#C44D38]">{stats.total_consultations}</p>
              <p className="text-xs text-[#595959]">
                {language === 'it' ? 'consultazioni' : 'consultations'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {level.next && (
            <div>
              <div className="flex justify-between text-xs text-[#595959] mb-1">
                <span>{level.current.title_it || level.current.title_en}</span>
                <span>{level.next.title_it || level.next.title_en}</span>
              </div>
              <div className="h-3 bg-[#E5E0D8] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#C44D38] to-[#E67E22] rounded-full transition-all duration-500"
                  style={{ width: `${level.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-[#595959] mt-1 text-center">
                {language === 'it' 
                  ? `Ancora ${level.consultations_needed} consultazioni per il prossimo livello`
                  : `${level.consultations_needed} more consultations to next level`}
              </p>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="zen-card mb-6">
          <h3 className="font-serif text-lg text-[#2C2C2C] mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-[#C44D38]" />
            {language === 'it' ? 'I Tuoi Badge' : 'Your Badges'}
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {stats.badges.map((badge, idx) => (
              <div 
                key={idx}
                className={`text-center p-3 rounded-xl transition-all ${
                  badge.earned 
                    ? 'bg-[#C44D38]/10' 
                    : 'bg-[#E5E0D8]/50 opacity-50'
                }`}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <p className="text-xs font-medium text-[#2C2C2C] mt-1">
                  {language === 'it' ? badge.name_it : badge.name_en}
                </p>
                {!badge.earned && (
                  <Lock className="w-3 h-3 mx-auto mt-1 text-[#8A8680]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Premium Stats */}
        {stats.premium_required ? (
          <div className="zen-card text-center">
            <Crown className="w-12 h-12 mx-auto text-[#C44D38] mb-4" />
            <h3 className="font-serif text-xl text-[#2C2C2C] mb-2">
              {language === 'it' ? 'Statistiche Premium' : 'Premium Statistics'}
            </h3>
            <p className="text-[#595959] mb-4">
              {language === 'it'
                ? 'Passa a Premium per vedere statistiche dettagliate: esagrammi più frequenti, distribuzione argomenti, trend mensili e altro!'
                : 'Upgrade to Premium to see detailed statistics: most frequent hexagrams, topic distribution, monthly trends and more!'}
            </p>
            <Link to="/subscription" className="btn-primary inline-block">
              {language === 'it' ? 'Passa a Premium' : 'Upgrade to Premium'}
            </Link>
          </div>
        ) : (
          <>
            {/* Frequent Hexagrams */}
            {stats.frequent_hexagrams && stats.frequent_hexagrams.length > 0 && (
              <div className="zen-card mb-6">
                <h3 className="font-serif text-lg text-[#2C2C2C] mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-[#C44D38]" />
                  {language === 'it' ? 'Esagrammi Più Frequenti' : 'Most Frequent Hexagrams'}
                </h3>
                <div className="space-y-3">
                  {stats.frequent_hexagrams.map((hex, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-full bg-[#C44D38]/10 flex items-center justify-center text-sm font-bold text-[#C44D38]">
                          {hex.number}
                        </span>
                        <span className="text-[#2C2C2C]">{hex.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#C44D38] rounded-full"
                            style={{ width: `${(hex.count / stats.total_consultations) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-[#595959] w-8 text-right">{hex.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics Distribution */}
            {stats.topics_distribution && Object.keys(stats.topics_distribution).length > 0 && (
              <div className="zen-card mb-6">
                <h3 className="font-serif text-lg text-[#2C2C2C] mb-4">
                  {language === 'it' ? 'Distribuzione Argomenti' : 'Topics Distribution'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(stats.topics_distribution).map(([topic, count], idx) => {
                    const topicLabels = {
                      amore: { it: 'Amore', en: 'Love', emoji: '❤️' },
                      lavoro: { it: 'Lavoro', en: 'Work', emoji: '💼' },
                      fortuna: { it: 'Fortuna', en: 'Fortune', emoji: '🍀' },
                      soldi: { it: 'Soldi', en: 'Money', emoji: '💰' },
                      spirituale: { it: 'Spirituale', en: 'Spiritual', emoji: '🧘' },
                      personale: { it: 'Personale', en: 'Personal', emoji: '🌱' },
                    };
                    const label = topicLabels[topic] || { it: topic, en: topic, emoji: '✨' };
                    return (
                      <div key={idx} className="bg-[#F8F6F3] rounded-xl p-3 text-center">
                        <span className="text-2xl">{label.emoji}</span>
                        <p className="text-sm font-medium text-[#2C2C2C]">
                          {language === 'it' ? label.it : label.en}
                        </p>
                        <p className="text-lg font-bold text-[#C44D38]">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Monthly Trend */}
            {stats.monthly_trend && stats.monthly_trend.length > 0 && (
              <div className="zen-card">
                <h3 className="font-serif text-lg text-[#2C2C2C] mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-[#C44D38]" />
                  {language === 'it' ? 'Trend Mensile' : 'Monthly Trend'}
                </h3>
                <div className="flex items-end justify-around h-32">
                  {stats.monthly_trend.map((month, idx) => {
                    const maxCount = Math.max(...stats.monthly_trend.map(m => m.count));
                    const height = maxCount > 0 ? (month.count / maxCount) * 100 : 0;
                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div 
                          className="w-8 bg-gradient-to-t from-[#C44D38] to-[#E67E22] rounded-t-lg transition-all duration-500"
                          style={{ height: `${Math.max(height, 10)}%` }}
                        ></div>
                        <p className="text-xs text-[#595959] mt-1">{month.month.slice(5)}</p>
                        <p className="text-xs font-bold text-[#2C2C2C]">{month.count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unique Hexagrams */}
            <div className="zen-card mt-6 text-center">
              <h3 className="font-serif text-lg text-[#2C2C2C] mb-2">
                {language === 'it' ? 'Esagrammi Incontrati' : 'Hexagrams Encountered'}
              </h3>
              <p className="text-4xl font-bold text-[#C44D38]">
                {stats.unique_hexagrams_count} <span className="text-lg text-[#595959]">/ 64</span>
              </p>
              <div className="w-full h-3 bg-[#E5E0D8] rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#C44D38] to-[#E67E22] rounded-full"
                  style={{ width: `${(stats.unique_hexagrams_count / 64) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-[#595959] mt-2">
                {stats.unique_hexagrams_count === 64
                  ? (language === 'it' ? '🏆 Hai incontrato tutti gli esagrammi!' : '🏆 You encountered all hexagrams!')
                  : (language === 'it' ? `${64 - stats.unique_hexagrams_count} ancora da scoprire` : `${64 - stats.unique_hexagrams_count} more to discover`)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
