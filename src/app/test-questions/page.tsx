'use client';

import { quizQuestions } from '@/lib/questions';

export default function TestQuestionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-aura-coral/5 to-aura-violeta/5 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-aura-violeta mb-8">Teste das Novas Perguntas</h1>
        
        <div className="space-y-6">
          {quizQuestions.map((question, index) => (
            <div 
              key={question.id} 
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/60"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl font-bold text-aura-vermelho-cinnabar">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {question.question}
                  </h3>
                  {question.subtitle && (
                    <p className="text-sm text-gray-600 mb-4">{question.subtitle}</p>
                  )}
                  
                  <div className="mt-4">
                    <span className="text-xs text-gray-500">
                      Tipo: {question.type} | Peso: {question.weight} | ID: {question.id}
                    </span>
                  </div>
                  
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="mt-4 space-y-2">
                      {question.options.map((option, i) => (
                        <div key={i} className="text-sm text-gray-700 pl-4">
                          • {option}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'card-select' && question.cards && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {question.cards.map((card, i) => (
                        <div key={i} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{card.icon}</span>
                            <div>
                              <div className="font-medium text-sm">{card.title}</div>
                              <div className="text-xs text-gray-600">{card.description}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'slider' && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{question.scaleLabels?.min}</span>
                        <span>{question.scaleLabels?.max}</span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-300 rounded-full"></div>
                    </div>
                  )}
                  
                  {question.type === 'text-area' && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">
                        {question.placeholder?.substring(0, 100)}...
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Max: {question.maxLength} caracteres | 
                        {question.optional ? ' Opcional' : ' Obrigatório'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-aura-violeta mb-4">Resumo do Quiz</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total de perguntas:</p>
              <p className="text-xl font-semibold">{quizQuestions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Peso total:</p>
              <p className="text-xl font-semibold">
                {quizQuestions.reduce((sum, q) => sum + q.weight, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}