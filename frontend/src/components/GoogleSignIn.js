import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = (process.env.REACT_APP_BACKEND_URL || 'https://iching-backend-ac3n.onrender.com') + '/api';

// Load Google Identity Services script once, globally.
let gisLoaded = null;
function loadGis() {
  if (gisLoaded) return gisLoaded;
  gisLoaded = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(s);
  });
  return gisLoaded;
}

const CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  '530318233533-748rakb44paferck3s37573hsnhvocj3.apps.googleusercontent.com';

/**
 * Drop-in Google Sign-In button.
 * Renders the official Google button and handles the full flow:
 *  - Loads GIS script
 *  - Initializes with our Client ID
 *  - On success: POST /api/auth/google with credential -> stores our JWT -> navigates to /dashboard
 */
export default function GoogleSignIn({ text = 'continue_with' }) {
  const ref = useRef(null);
  const { setUserAndToken, language } = useAuth() || {};
  const navigate = useNavigate();
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) {
      setUnavailable(true);
      return;
    }
    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || !ref.current) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (response) => {
            try {
              const r = await axios.post(`${API}/auth/google`, {
                credential: response.credential,
              });
              const { token, user } = r.data;
              localStorage.setItem('token', token);
              localStorage.setItem('language', user.language || 'it');
              if (typeof setUserAndToken === 'function') {
                setUserAndToken(user, token);
              }
              toast.success(language === 'en' ? 'Logged in with Google' : 'Accesso con Google riuscito');
              navigate('/dashboard');
            } catch (err) {
              const msg = err.response?.data?.detail || (language === 'en' ? 'Google sign-in failed' : 'Login Google fallito');
              toast.error(msg);
            }
          },
        });

        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          width: ref.current.offsetWidth || 340,
          text,                 // 'continue_with' | 'signin_with' | 'signup_with'
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      })
      .catch(() => setUnavailable(true));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, navigate, language]);

  if (unavailable) {
    return (
      <div className="w-full mb-3 text-xs text-center text-[#7a6f63] py-2">
        {language === 'en'
          ? 'Google Sign-In not configured. Use email & password.'
          : 'Accesso Google non configurato. Usa email e password.'}
      </div>
    );
  }

  return <div ref={ref} className="w-full flex justify-center mb-2" />;
}
