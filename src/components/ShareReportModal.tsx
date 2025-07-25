'use client';

import { useState } from 'react';
import { CheckCircle, Share2, Mail, Copy, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface QuizResult {
  id: number;
  email: string;
  company: string;
  jobTitle: string;
  score: number;
  aiReport: string | null;
  createdAt: string;
}

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: QuizResult;
}

export default function ShareReportModal({ isOpen, onClose, result }: ShareReportModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const generateShareUrl = async () => {
    if (shareUrl) return shareUrl; // Already generated
    
    setGenerating(true);
    try {
      console.log('🔗 Generating share URL for result ID:', result.id);
      const response = await fetch('/api/generate-share-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responseId: result.id }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Share URL generated:', data.shareUrl);
        setShareUrl(data.shareUrl);
        return data.shareUrl;
      } else {
        console.warn('⚠️ Failed to generate slug, using fallback URL');
        // Fallback to current URL with ID
        const fallbackUrl = `${window.location.origin}/results?id=${result.id}`;
        setShareUrl(fallbackUrl);
        return fallbackUrl;
      }
    } catch (error) {
      console.error('❌ Error generating share URL:', error);
      // Fallback to current URL with ID
      const fallbackUrl = `${window.location.origin}/results?id=${result.id}`;
      setShareUrl(fallbackUrl);
      return fallbackUrl;
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    const url = await generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareViaEmail = async () => {
    const url = await generateShareUrl();
    const subject = encodeURIComponent(`Meu Relatório AI Champion - Score ${result.score}/100`);
    const body = encodeURIComponent(`Olá!

Acabei de completar uma avaliação de prontidão para IA e recebi meu relatório personalizado.

🎯 Score: ${result.score}/100
🏢 Empresa: ${result.company}
📊 Ver relatório completo: ${url}

Este é um link permanente onde você pode acessar meu relatório detalhado sobre como me tornar um campeão de IA na minha organização.

Abraços!`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = async () => {
    const url = await generateShareUrl();
    const message = encodeURIComponent(`🚀 *Meu Relatório AI Champion*

Acabei de completar uma avaliação de prontidão para IA!

🎯 Score: *${result.score}/100*
🏢 Empresa: ${result.company}

📊 Ver meu relatório completo: ${url}

Este relatório mostra como posso me tornar um campeão de IA na minha organização! 🔥`);
    
    window.open(`https://wa.me/?text=${message}`);
  };

  const shareViaLinkedIn = async () => {
    const url = await generateShareUrl();
    const message = encodeURIComponent(`Acabei de completar uma avaliação completa da minha prontidão para IA e os resultados são muito interessantes!

🎯 Score de Prontidão IA: ${result.score}/100
🏢 Análise personalizada para: ${result.company}

Recebi um relatório detalhado com estratégias específicas para me tornar um campeão de IA na minha organização.

#IA #InteligenciaArtificial #Lideranca #Inovacao #TransformacaoDigital

Ver relatório: ${url}`);
    
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${message}`);
  };

  // Initialize share URL when modal opens
  if (isOpen && !shareUrl && !generating) {
    generateShareUrl();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="aura-card max-w-lg w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 aura-text-secondary hover:aura-text-primary text-2xl"
        >
          ×
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
               style={{ background: 'linear-gradient(135deg, #EC4E22, #FFA850)' }}>
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="aura-heading text-2xl mb-2">Compartilhe Seu Relatório</h3>
          <p className="aura-text-secondary">Compartilhe seu relatório personalizado de IA</p>
        </div>

        {generating && (
          <div className="text-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-aura-vermelho-cinnabar mx-auto mb-2"></div>
            <p className="text-sm aura-text-secondary">Gerando link personalizado...</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Copy Link Button */}
          <button
            onClick={copyToClipboard}
            disabled={generating}
            className={`w-full aura-button ${copied ? 'aura-button-primary' : 'aura-button-secondary'} flex items-center justify-center gap-3 ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Link Copiado!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar Link Permanente
              </>
            )}
          </button>

          {/* Email Button */}
          <button
            onClick={shareViaEmail}
            disabled={generating}
            className={`w-full aura-button aura-button-secondary flex items-center justify-center gap-3 ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Mail className="w-5 h-5" />
            Compartilhar por Email
          </button>

          {/* WhatsApp Button */}
          <button
            onClick={shareViaWhatsApp}
            disabled={generating}
            className={`w-full aura-button aura-button-secondary flex items-center justify-center gap-3 ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <MessageCircle className="w-5 h-5" />
            Compartilhar no WhatsApp
          </button>

          {/* LinkedIn Button */}
          <button
            onClick={shareViaLinkedIn}
            disabled={generating}
            className={`w-full aura-button aura-button-secondary flex items-center justify-center gap-3 ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">in</span>
            Compartilhar no LinkedIn
          </button>
        </div>

        {/* Permanent Link Display */}
        {shareUrl && (
          <div className="mt-6 p-4 aura-glass rounded-xl">
            <p className="text-xs aura-text-secondary mb-2">Link permanente:</p>
            <p className="text-sm aura-text-primary break-all font-mono">{shareUrl}</p>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs aura-text-secondary">Link sempre acessível - nunca expira</span>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="mt-6 p-4 aura-glass rounded-xl">
          <h4 className="aura-heading text-sm mb-3">Vantagens do link permanente:</h4>
          <ul className="space-y-2 text-xs aura-text-secondary">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Acesso a qualquer momento
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Compartilhável com colegas e gestores
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              URL profissional e personalizada
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Sempre atualizado com seu progresso
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}