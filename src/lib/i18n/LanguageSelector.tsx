'use client';

import { useLanguage } from './context';
import { Language } from './types';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <div className="aura-glass rounded-2xl px-4 py-2.5 flex items-center gap-3
                      border border-white/10 hover:border-[#FFA850]/30
                      transition-all duration-300 hover:shadow-lg hover:shadow-[#FFA850]/10">
        <Globe className="w-5 h-5 text-[#FFA850] transition-transform duration-300 group-hover:rotate-12" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-transparent text-gray font-medium text-sm cursor-pointer
                     outline-none appearance-none pr-8
                     hover:text-[#FFA850] transition-colors duration-300"
        >
          <option value="en" className="bg-gray-900 text-gray py-2">English</option>
          <option value="pt" className="bg-gray-900 text-gray py-2">Português</option>
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-[#FFA850] transition-transform duration-300 group-hover:translate-y-0.5"
               fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
