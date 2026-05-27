import React from 'react';
import { Link } from 'react-router-dom';

const SiteFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer
      className="w-full border-t border-[#E5E0D8] mt-auto py-6 px-4 text-[#7a6f63] text-xs"
      style={{ backgroundColor: 'rgba(249,247,242,0.6)' }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          © {year} <span className="font-medium text-[#2C2C2C]">I Ching del Benessere</span> —
          {' '}L'antica saggezza cinese per il mondo moderno
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-end">
          <Link to="/privacy" className="hover:text-[#C44D38] underline">Privacy</Link>
          <Link to="/cookie-policy" className="hover:text-[#C44D38] underline">Cookie</Link>
          <Link to="/terms" className="hover:text-[#C44D38] underline">Termini</Link>
          <Link to="/data-protection" className="hover:text-[#C44D38] underline">Protezione dati</Link>
          <a
            href="mailto:privacy@chingbenessere.it"
            className="hover:text-[#C44D38] underline"
          >
            Contatti
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;
