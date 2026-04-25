import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API = `${(process.env.REACT_APP_BACKEND_URL || "https://iching-backend-ac3n.onrender.com")}/api`;

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Extract session_id from URL fragment
        const hash = window.location.hash;
        const sessionIdMatch = hash.match(/session_id=([^&]+)/);
        
        if (!sessionIdMatch) {
          console.error('No session_id found in URL');
          navigate('/login', { replace: true });
          return;
        }

        const sessionId = sessionIdMatch[1];

        // Exchange session_id for session data via our backend
        const response = await axios.post(`${API}/auth/google/callback`, {
          session_id: sessionId
        }, {
          withCredentials: true
        });

        if (response.data && response.data.user) {
          // Store token in localStorage as backup
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }
          
          // Clear URL fragment and navigate to dashboard
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/', { 
            replace: true, 
            state: { user: response.data.user } 
          });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { 
          replace: true, 
          state: { error: 'Errore durante l\'autenticazione con Google. Riprova.' } 
        });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F6F3] to-[#EDE8E0]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#C44D38] animate-spin mx-auto mb-4" />
        <p className="text-[#595959]">Completamento accesso con Google...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
