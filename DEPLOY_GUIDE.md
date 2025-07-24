# 🚀 Guia de Deploy para Vercel

## ✅ Pré-requisitos Completados
- ✅ Repositório GitHub criado: https://github.com/lucas-autou/ai-readiness-quiz
- ✅ Código versionado e pronto para produção (v0.1.0)
- ✅ Configuração Vercel (`vercel.json`) já criada
- ✅ Variáveis de ambiente documentadas

## 🎯 Deploy em 5 Minutos

### 1. Acesse o Vercel
👉 **https://vercel.com/new**

### 2. Conecte o GitHub
- Clique em **"Import Git Repository"**
- Se necessário, autorize o Vercel no seu GitHub
- Selecione: **`lucas-autou/ai-readiness-quiz`**

### 3. Configure o Projeto
```
Project Name: ai-readiness-quiz
Framework Preset: Next.js (detectado automaticamente)
Root Directory: / (deixar padrão)
Build Command: npm run build (padrão)
Output Directory: .next (padrão)
Install Command: npm install (padrão)
```

### 4. **IMPORTANTE: Variáveis de Ambiente**
Antes de fazer deploy, adicione estas variáveis na seção **Environment Variables**:

#### 🔑 Variáveis Obrigatórias:
```env
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXX
SUPABASE_URL=https://XXXXXXXX.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXX
```

#### 🔑 Variável Opcional (se usar email):
```env
EMAIL_SERVICE_KEY=re_XXXXXXXXXXXXXXXX
```

### 5. Deploy!
- Clique em **"Deploy"**
- Aguarde 2-3 minutos
- 🎉 Sua aplicação estará online!

## 🌐 Após o Deploy

### URLs Esperadas:
- **Produção**: `https://ai-readiness-quiz-XXXXX.vercel.app`
- **Dashboard**: `https://vercel.com/lucas-autou/ai-readiness-quiz`

### Funcionalidades a Testar:
1. **Homepage** - Landing page carrega
2. **Quiz** - `/quiz` - Perguntas funcionam
3. **Setup Database** - `/setup` - Criar tabelas Supabase
4. **Visual Test** - `/visual-test` - Tema Aura funcionando

## 🔧 Configuração Automática

O projeto já possui:
- ✅ **Auto-deploy**: Push para `main` = deploy automático
- ✅ **Preview deploys**: PRs geram URLs de preview
- ✅ **Edge functions**: APIs otimizadas
- ✅ **TypeScript build**: Validação automática

## 🆘 Credenciais Necessárias

### 1. Anthropic API Key
```bash
# Obter em: https://console.anthropic.com/
# Exemplo: sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 2. Supabase Credenciais  
```bash
# Criar projeto em: https://supabase.com/dashboard
# URL: https://PROJETO.supabase.co
# Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXX
```

### 3. Email Service (Opcional)
```bash
# Criar conta em: https://resend.com/
# API Key: re_XXXXXXXXXXXXXXX
```

## 🔄 Próximos Passos Após Deploy

1. **Configurar Supabase**
   - Visitar: `https://sua-app.vercel.app/setup`
   - Ou executar SQL manual do arquivo `supabase_setup.sql`

2. **Testar Fluxo Completo**
   - Acessar quiz: `https://sua-app.vercel.app/quiz`
   - Completar um teste end-to-end

3. **Domínio Personalizado (Opcional)**
   - Configurar em: Vercel Dashboard > Domains
   - Adicionar seu domínio customizado

## 📊 Monitoramento

O Vercel fornece automaticamente:
- 📈 **Analytics**: Visitantes, performance
- 🚨 **Error tracking**: Erros em tempo real  
- 📊 **Build logs**: Histórico de deploys
- 🔍 **Function logs**: Debug de APIs

## 🆘 Troubleshooting

### Build Falhou?
- Verificar variáveis de ambiente
- Checar logs no dashboard Vercel
- Confirmar se todas deps estão no `package.json`

### APIs não funcionam?
- Verificar se Supabase está configurado
- Testar Anthropic API key
- Verificar logs das functions

---

**🎯 Resultado Final**: Aplicação Next.js em produção com domínio Vercel, deploy automático, e todas as funcionalidades de AI Quiz funcionando!