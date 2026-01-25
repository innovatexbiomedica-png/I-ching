import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Map, ChevronRight, Check, Lock, Play, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Paths = () => {
  const { language, getToken } = useAuth();
  const { pathId } = useParams();
  const [paths, setPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaths();
  }, []);

  useEffect(() => {
    if (pathId) {
      fetchPathDetail(pathId);
    } else {
      setSelectedPath(null);
    }
  }, [pathId]);

  const fetchPaths = async () => {
    try {
      const response = await axios.get(`${API}/paths`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPaths(response.data);
    } catch (error) {
      console.error('Error fetching paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPathDetail = async (id) => {
    try {
      const response = await axios.get(`${API}/paths/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setSelectedPath(response.data);
    } catch (error) {
      console.error('Error fetching path detail:', error);
    }
  };

  const handleStartPath = async (pathId) => {
    try {
      await axios.post(`${API}/paths/${pathId}/start`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success(language === 'it' ? 'Percorso iniziato!' : 'Path started!');
      fetchPathDetail(pathId);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error starting path');
    }
  };

  // Detail View
  if (selectedPath) {
    return (
      <div className="page-container">
        <div className="content-container">
          {/* Back Button */}
          <Link 
            to="/paths" 
            className="inline-flex items-center text-[#C44D38] hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'it' ? 'Torna ai Percorsi' : 'Back to Paths'}
          </Link>

          <div className="zen-card">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block">{selectedPath.emoji}</span>
              <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2">
                {selectedPath.name}
              </h1>
              <p className="text-[#595959]">{selectedPath.description}</p>
              
              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-[#595959] mb-1">
                  <span>{language === 'it' ? 'Progresso' : 'Progress'}</span>
                  <span>{selectedPath.completed_steps} / {selectedPath.total_steps}</span>
                </div>
                <div className="h-3 bg-[#E5E0D8] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C44D38] to-[#E67E22] rounded-full transition-all"
                    style={{ width: `${(selectedPath.completed_steps / selectedPath.total_steps) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            {!selectedPath.started && (
              <button
                onClick={() => handleStartPath(selectedPath.id)}
                className="btn-primary w-full mb-6 flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>{language === 'it' ? 'Inizia il Percorso' : 'Start the Path'}</span>
              </button>
            )}

            {/* Steps */}
            <div className="space-y-4">
              {selectedPath.steps.map((step, idx) => {
                const isAvailable = selectedPath.started && 
                  (idx === 0 || selectedPath.steps[idx - 1].completed);
                
                return (
                  <div 
                    key={idx}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      step.completed 
                        ? 'border-green-400 bg-green-50' 
                        : isAvailable
                          ? 'border-[#C44D38] bg-[#C44D38]/5'
                          : 'border-[#E5E0D8] bg-[#F8F6F3] opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? 'bg-green-500 text-white'
                            : isAvailable
                              ? 'bg-[#C44D38] text-white'
                              : 'bg-[#E5E0D8] text-[#8A8680]'
                        }`}>
                          {step.completed ? (
                            <Check className="w-5 h-5" />
                          ) : isAvailable ? (
                            <span className="font-bold">{step.day}</span>
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[#8A8680] mb-1">
                            {language === 'it' ? `Giorno ${step.day}` : `Day ${step.day}`}
                          </p>
                          <p className={`font-medium ${step.completed ? 'text-green-700' : 'text-[#2C2C2C]'}`}>
                            {step.question}
                          </p>
                        </div>
                      </div>
                      
                      {isAvailable && !step.completed && (
                        <Link 
                          to={`/consultation?path=${selectedPath.id}&step=${step.day}&question=${encodeURIComponent(step.question)}`}
                          className="btn-primary text-sm py-2"
                        >
                          {language === 'it' ? 'Consulta' : 'Consult'}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Completion */}
            {selectedPath.completed_steps === selectedPath.total_steps && (
              <div className="mt-8 text-center p-6 bg-gradient-to-r from-[#C44D38]/10 to-[#E67E22]/10 rounded-xl">
                <span className="text-5xl mb-4 block">🎉</span>
                <h3 className="font-serif text-xl text-[#2C2C2C] mb-2">
                  {language === 'it' ? 'Percorso Completato!' : 'Path Completed!'}
                </h3>
                <p className="text-[#595959]">
                  {language === 'it'
                    ? 'Congratulazioni! Hai completato questo percorso di crescita.'
                    : 'Congratulations! You have completed this growth path.'}
                </p>
              </div>
            )}
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C44D38] flex items-center justify-center">
            <Map className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-[#2C2C2C] mb-2">
            {language === 'it' ? 'Percorsi Guidati' : 'Guided Paths'}
          </h1>
          <p className="text-[#595959]">
            {language === 'it' 
              ? 'Journey tematici per esplorare aspetti specifici della tua vita'
              : 'Thematic journeys to explore specific aspects of your life'}
          </p>
        </div>

        {/* Paths Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-[#E5E0D8] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {paths.map(path => (
              <Link
                key={path.id}
                to={`/paths/${path.id}`}
                className="zen-card hover:border-[#C44D38] transition-colors group"
              >
                <div className="flex items-start space-x-4">
                  <span className="text-5xl">{path.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl text-[#2C2C2C] group-hover:text-[#C44D38] mb-1">
                      {path.name}
                    </h3>
                    <p className="text-sm text-[#595959] mb-3">{path.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#8A8680]">
                        {path.total_steps} {language === 'it' ? 'tappe' : 'steps'}
                      </span>
                      <ChevronRight className="w-5 h-5 text-[#C44D38] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Paths;
