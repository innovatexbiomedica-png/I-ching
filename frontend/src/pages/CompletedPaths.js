import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  BookOpen,
  ChevronDown,
  ChevronUp,
  Star,
  Target,
  Lightbulb,
  ListChecks,
  Heart
} from 'lucide-react';

const API = `${(process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com")}/api`;

const CompletedPaths = () => {
  const { language, getToken } = useAuth();
  const { completedPathId } = useParams();
  const navigate = useNavigate();
  const [completedPaths, setCompletedPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedConsultations, setExpandedConsultations] = useState({});

  useEffect(() => {
    fetchCompletedPaths();
  }, []);

  useEffect(() => {
    if (completedPathId) {
      fetchPathDetail(completedPathId);
    }
  }, [completedPathId]);

  const fetchCompletedPaths = async () => {
    try {
      const response = await axios.get(`${API}/paths/completed`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCompletedPaths(response.data);
    } catch (error) {
      console.error('Error fetching completed paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPathDetail = async (id) => {
    try {
      const response = await axios.get(`${API}/paths/completed/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSelectedPath(response.data);
    } catch (error) {
      console.error('Error fetching path detail:', error);
    }
  };

  const toggleConsultation = (index) => {
    setExpandedConsultations(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Detail View
  if (selectedPath) {
    return (
      <div className="page-container">
        <div className="content-container max-w-4xl">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/completed-paths')}
            className="inline-flex items-center text-[#C44D38] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'it' ? 'Torna ai Percorsi Completati' : 'Back to Completed Paths'}
          </button>

          {/* Header */}
          <div className="zen-card mb-6">
            <div className="text-center">
              <span className="text-6xl mb-4 block">{selectedPath.path_emoji}</span>
              <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2">
                {selectedPath.path_name}
              </h1>
              <div className="flex items-center justify-center text-sm text-[#595959] space-x-4">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(selectedPath.completed_at)}
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                  {language === 'it' ? 'Completato' : 'Completed'}
                </span>
              </div>
            </div>
          </div>

          {/* Synthesis Section */}
          <div className="zen-card mb-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-xl text-[#2C2C2C]">
                  {language === 'it' ? 'Sintesi del Tuo Percorso' : 'Your Path Synthesis'}
                </h2>
                <p className="text-sm text-[#595959]">
                  {language === 'it' 
                    ? 'Analisi integrata basata su tutti i tuoi esagrammi' 
                    : 'Integrated analysis based on all your hexagrams'}
                </p>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-[#2C2C2C] leading-relaxed">
                {selectedPath.synthesis}
              </div>
            </div>
          </div>

          {/* Consultations Accordion */}
          <div className="zen-card">
            <h3 className="font-serif text-lg text-[#2C2C2C] mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-[#C44D38]" />
              {language === 'it' ? 'Le Tue Consultazioni' : 'Your Consultations'}
              <span className="ml-2 text-sm text-[#595959]">
                ({selectedPath.consultations?.length || 0})
              </span>
            </h3>

            <div className="space-y-3">
              {selectedPath.consultations?.map((consultation, idx) => (
                <div 
                  key={idx}
                  className="border border-[#E5E0D8] rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleConsultation(idx)}
                    className="w-full p-4 flex items-center justify-between hover:bg-[#F8F6F3] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#C44D38]/10 flex items-center justify-center text-lg font-serif text-[#C44D38]">
                        {consultation.hexagram_number}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[#2C2C2C]">
                          {consultation.hexagram_name}
                        </p>
                        <p className="text-sm text-[#595959] line-clamp-1">
                          {consultation.question}
                        </p>
                      </div>
                    </div>
                    {expandedConsultations[idx] ? (
                      <ChevronUp className="w-5 h-5 text-[#595959]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#595959]" />
                    )}
                  </button>

                  {expandedConsultations[idx] && (
                    <div className="p-4 pt-0 border-t border-[#E5E0D8] bg-[#F8F6F3]/50">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[#8A8680] mb-1">
                            {language === 'it' ? 'Domanda' : 'Question'}
                          </p>
                          <p className="text-[#2C2C2C]">{consultation.question}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[#8A8680] mb-1">
                            {language === 'it' ? 'Significato' : 'Meaning'}
                          </p>
                          <p className="text-[#595959]">{consultation.hexagram_meaning}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[#8A8680] mb-1">
                            {language === 'it' ? 'Giudizio' : 'Judgment'}
                          </p>
                          <p className="text-[#595959] italic">{consultation.judgment}</p>
                        </div>
                        {consultation.moving_lines?.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wider text-[#8A8680] mb-1">
                              {language === 'it' ? 'Linee Mutanti' : 'Moving Lines'}
                            </p>
                            <p className="text-[#595959]">
                              {consultation.moving_lines.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2">
            {language === 'it' ? 'Percorsi Completati' : 'Completed Paths'}
          </h1>
          <p className="text-[#595959]">
            {language === 'it' 
              ? 'Rivedi le sintesi dei tuoi percorsi di crescita' 
              : 'Review your growth path syntheses'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#C44D38] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : completedPaths.length === 0 ? (
          <div className="zen-card text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E5E0D8] flex items-center justify-center">
              <Target className="w-8 h-8 text-[#8A8680]" />
            </div>
            <h3 className="font-serif text-xl text-[#2C2C2C] mb-2">
              {language === 'it' ? 'Nessun percorso completato' : 'No completed paths'}
            </h3>
            <p className="text-[#595959] mb-6">
              {language === 'it' 
                ? 'Completa un percorso guidato per vedere qui la tua sintesi personalizzata' 
                : 'Complete a guided path to see your personalized synthesis here'}
            </p>
            <Link to="/paths" className="btn-primary inline-flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              {language === 'it' ? 'Esplora i Percorsi' : 'Explore Paths'}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {completedPaths.map((path) => (
              <Link
                key={path.id}
                to={`/completed-paths/${path.id}`}
                className={`zen-card hover:shadow-lg transition-all flex items-center justify-between group ${
                  !path.is_read ? 'border-2 border-purple-400 bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{path.path_emoji}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif text-lg text-[#2C2C2C] group-hover:text-[#C44D38] transition-colors">
                        {path.path_name}
                      </h3>
                      {!path.is_read && (
                        <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                          {language === 'it' ? 'Nuovo' : 'New'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#595959]">
                      {formatDate(path.completed_at)} • {path.consultations?.length || 0} {language === 'it' ? 'consultazioni' : 'consultations'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-[#C44D38]">
                  <span className="text-sm">
                    {language === 'it' ? 'Leggi sintesi' : 'Read synthesis'}
                  </span>
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedPaths;
