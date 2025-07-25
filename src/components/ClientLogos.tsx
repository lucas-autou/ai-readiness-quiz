'use client';

import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';

const clients = [
  { 
    name: "L'Oréal", 
    displayName: "L'ORÉAL",
    logo: '/logos/logoLoreal.png'
  },
  { 
    name: 'Fiat', 
    displayName: 'FIAT',
    logo: '/logos/Fiat_logo.svg'
  },
  { 
    name: 'Petrobras', 
    displayName: 'PETROBRAS',
    logo: '/logos/LogoPetrobras.gif'
  },
  { 
    name: 'Saint-Gobain', 
    displayName: 'SAINT-GOBAIN',
    logo: '/logos/Saint-Gobain.png'
  },
  { 
    name: 'Dasa', 
    displayName: 'DASA',
    logo: '/logos/dasa.png'
  },
  { 
    name: 'Jaguar', 
    displayName: 'JAGUAR',
    logo: '/logos/jaguar-lr.png'
  },
  { 
    name: 'B3', 
    displayName: 'B3',
    logo: '/logos/logob3.png'
  },
  { 
    name: 'Nestlé', 
    displayName: 'NESTLÉ',
    logo: '/logos/pngwing.com (1) copy.png'
  },
  { 
    name: 'Stellantis', 
    displayName: 'STELLANTIS',
    logo: '/logos/pngegg (1).png'
  },
  { 
    name: 'Prudential', 
    displayName: 'PRUDENTIAL',
    logo: '/logos/prudential.png'
  },
];

export default function ClientLogos() {
  const { t } = useTranslation();
  
  return (
    <section className="py-16 text-center">
      <div className="max-w-6xl mx-auto px-4">
        <p className="aura-text-secondary text-lg mb-12">
          {t('home.trustedBy')}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 items-center justify-items-center">
          {clients.map((client) => (
            <div
              key={client.name}
              className="group relative flex items-center justify-center p-4"
              style={{ minWidth: '100px', minHeight: '60px' }}
            >
              <Image 
                src={client.logo}
                alt={`${client.name} logo`}
                width={120}
                height={40}
                className="w-auto h-8 md:h-10 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                style={{ maxWidth: '120px', maxHeight: '40px' }}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm aura-text-secondary">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold aura-text-primary">500+</span>
            <span>{t('home.leadersTransformed')}</span>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold aura-text-primary">97%</span>
            <span>{t('home.satisfactionRate')}</span>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold aura-text-primary">15+</span>
            <span>{t('home.industriesServed')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}