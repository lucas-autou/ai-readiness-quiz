'use client';

import { Shield, Award, Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function TrustBadges() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 py-8">
      {/* Leaders Transformed */}
      <div className="flex items-center gap-3 group">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
             style={{ background: 'linear-gradient(135deg, #EC4E22, #FFA850)' }}>
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold aura-text-primary">500+</div>
          <div className="text-sm aura-text-secondary">{t('home.leadersTransformed')}</div>
        </div>
      </div>
      
      {/* Satisfaction Rate */}
      <div className="flex items-center gap-3 group">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
             style={{ background: 'linear-gradient(135deg, #8850E2, #A855F7)' }}>
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold aura-text-primary">97%</div>
          <div className="text-sm aura-text-secondary">{t('home.satisfactionRate')}</div>
        </div>
      </div>
      
      {/* Guarantee */}
      <div className="flex items-center gap-3 group">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
             style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold aura-text-primary">100%</div>
          <div className="text-sm aura-text-secondary">{t('results.implementableIdeasGuarantee')}</div>
        </div>
      </div>
    </div>
  );
}