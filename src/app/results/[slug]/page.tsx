import { Metadata } from 'next';
import { getQuizResponseBySlug } from '@/lib/supabase';
import SlugResultsPageClient from './client-page';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  
  try {
    // Fetch the quiz result to generate dynamic metadata
    const result = await getQuizResponseBySlug(slug);
    
    if (!result) {
      return {
        title: 'Relatório AI Champion - Não Encontrado',
        description: 'Relatório não encontrado. Verifique o link e tente novamente.',
      };
    }

    // Create personalized metadata
    const title = `Relatório AI Champion - ${result.company} (${result.score}/100)`;
    const description = `Relatório personalizado de prontidão para IA para ${result.company}. Score: ${result.score}/100. Estratégias específicas para se tornar um campeão de IA na organização.`;
    
    // Determine score level for more descriptive content
    let scoreLevel = 'Iniciante';
    let emoji = '🏗️';
    if (result.score >= 80) { scoreLevel = 'Campeão'; emoji = '🚀'; }
    else if (result.score >= 60) { scoreLevel = 'Explorador'; emoji = '⚡'; }
    else if (result.score >= 40) { scoreLevel = 'Curioso'; emoji = '🎯'; }

    const fullDescription = `${emoji} Relatório AI Champion para ${result.company}

🎯 Score de Prontidão: ${result.score}/100 (${scoreLevel})
🏢 Empresa: ${result.company}
📋 Cargo: ${result.job_title}

Este relatório personalizado contém estratégias específicas, desafios identificados, impacto na carreira e um roadmap detalhado para implementação de IA.

#IA #InteligenciaArtificial #Lideranca #TransformacaoDigital`;

    return {
      title,
      description: fullDescription,
      openGraph: {
        title,
        description: fullDescription,
        type: 'article',
        images: [
          {
            url: `/api/og-image?company=${encodeURIComponent(result.company)}&score=${result.score}&level=${encodeURIComponent(scoreLevel)}`,
            width: 1200,
            height: 630,
            alt: `Relatório AI Champion - ${result.company} - Score ${result.score}/100`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: description,
        images: [`/api/og-image?company=${encodeURIComponent(result.company)}&score=${result.score}&level=${encodeURIComponent(scoreLevel)}`],
      },
      alternates: {
        canonical: `/results/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Relatório AI Champion',
      description: 'Descubra seu potencial como campeão de IA na sua organização.',
    };
  }
}

export default function SlugResultsPage({ params }: Props) {
  return <SlugResultsPageClient />;
}