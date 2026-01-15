import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../lib/translations';
import axios from 'axios';
import { format } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { Plus, BookOpen, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, language, getToken, hasSubscription } = useAuth();
  const t = useTranslation(language);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await axios.get(`${API}/consultations`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setConsultations(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'dd MMMM yyyy', { 
      locale: language === 'it' ? it : enUS 
    });
  };

  const subscriptionEndDate = user?.subscription_end 
    ? formatDate(user.subscription_end)
    : null;

  return (
    <div className="section-zen" data-testid="dashboard-page">
      <div className="container-zen">
        {/* Welcome Header */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2C2C2C] mb-4" data-testid="welcome-message">
            {t.dashboard.welcome}, <span className="text-[#C44D38]">{user?.name}</span>
          </h1>
          <div className="w-16 h-px bg-[#C44D38]" />
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Subscription Status */}
          <div className="zen-card animate-fade-in-up stagger-1" data-testid="subscription-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-[#2C2C2C]">
                {t.dashboard.subscription}
              </h3>
              <span className={`subscription-badge ${hasSubscription ? 'subscription-badge-active' : 'subscription-badge-inactive'}`}>
                {hasSubscription ? t.dashboard.active : t.dashboard.inactive}
              </span>
            </div>
            {hasSubscription && subscriptionEndDate && (
              <p className="text-sm text-[#595959]">
                {t.dashboard.expiresOn}: {subscriptionEndDate}
              </p>
            )}
            {!hasSubscription && (
              <Link to="/pricing" className="text-[#C44D38] text-sm hover:underline">
                {language === 'it' ? 'Sottoscrivi ora →' : 'Subscribe now →'}
              </Link>
            )}
          </div>

          {/* Total Consultations */}
          <div className="zen-card animate-fade-in-up stagger-2" data-testid="consultations-count">
            <h3 className="font-serif text-lg text-[#2C2C2C] mb-4">
              {t.dashboard.totalConsultations}
            </h3>
            <p className="stat-number">{consultations.length}</p>
          </div>

          {/* New Consultation CTA */}
          <div className="zen-card animate-fade-in-up stagger-3 flex flex-col justify-between" data-testid="new-consultation-cta">
            <h3 className="font-serif text-lg text-[#2C2C2C] mb-4">
              {t.dashboard.newConsultation}
            </h3>
            <Link to="/consult">
              <Button className="w-full btn-primary flex items-center justify-center space-x-2" data-testid="new-consultation-btn">
                <Plus className="w-5 h-5" />
                <span>{t.dashboard.newConsultation}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-[#2C2C2C]">
              {t.dashboard.recentConsultations}
            </h2>
            {consultations.length > 0 && (
              <Link 
                to="/history" 
                className="text-[#C44D38] hover:underline flex items-center space-x-1"
                data-testid="view-all-link"
              >
                <span>{t.common.viewDetails}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#C44D38]" />
            </div>
          ) : consultations.length === 0 ? (
            <div className="zen-card text-center py-12" data-testid="no-consultations">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#D1CDC7]" />
              <p className="text-[#595959] mb-4">{t.dashboard.noConsultations}</p>
              <Link to="/consult" className="text-[#C44D38] hover:underline">
                {t.dashboard.startFirst}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  to={`/history/${consultation.id}`}
                  className="block"
                  data-testid={`consultation-${consultation.id}`}
                >
                  <div className="history-card hover:border-[#C44D38]/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-4 h-4 text-[#595959]" />
                          <span className="text-sm text-[#595959]">
                            {formatDate(consultation.created_at)}
                          </span>
                        </div>
                        <p className="text-[#2C2C2C] mb-2 line-clamp-2">
                          {consultation.question}
                        </p>
                        <p className="font-serif text-[#C44D38]">
                          {consultation.hexagram_name}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#D1CDC7] flex-shrink-0 ml-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
