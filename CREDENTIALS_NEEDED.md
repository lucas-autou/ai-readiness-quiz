# 🔑 Credenciais Necessárias para Deploy

Você precisa obter estas credenciais antes de fazer o deploy:

## 1. 🤖 Anthropic API Key (OBRIGATÓRIO)

### Como obter:
1. Acesse: **https://console.anthropic.com/**
2. Faça login ou crie conta
3. Vá em **"API Keys"**
4. Clique **"Create Key"**
5. Copie a chave que começa com: `sk-ant-api03-...`

### Formato:
```
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### ⚠️ IMPORTANTE:
- Chave é **paga por uso** (Claude API)
- Custos: ~$0.0015 por 1K tokens (muito barato)
- Necessário para gerar relatórios de AI

---

## 2. 🗄️ Supabase Database (OBRIGATÓRIO)

### Como obter:
1. Acesse: **https://supabase.com/dashboard**
2. Clique **"New Project"**
3. Escolha nome: `ai-readiness-quiz`
4. Escolha região: **South America (São Paulo)** para Brasil
5. Aguarde criação (~2 min)

### Dados a copiar:
```
SUPABASE_URL=https://XXXXXXXXXX.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXXX
```

### Onde encontrar:
- **Dashboard** > **Settings** > **API**
- Copiar: **Project URL** e **Anon public**

### ⚠️ IMPORTANTE:
- Totalmente **gratuito** até 500MB
- Necessário para armazenar respostas do quiz

---

## 3. 📧 Email Service (OPCIONAL)

### Se quiser enviar emails:
1. Acesse: **https://resend.com/**
2. Crie conta gratuita
3. Vá em **"API Keys"**
4. Create Key
5. Copie a chave: `re_...`

### Formato:
```
EMAIL_SERVICE_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### ⚠️ OPCIONAL:
- 3.000 emails/mês gratuitos
- Não obrigatório para funcionamento básico

---

## 📋 Checklist de Credenciais

Antes do deploy, confirme que você tem:

- [ ] ✅ **Anthropic API Key** (`sk-ant-api03-...`)
- [ ] ✅ **Supabase URL** (`https://xxx.supabase.co`)  
- [ ] ✅ **Supabase Anon Key** (`eyJhbGciOiJIUzI1Ni...`)
- [ ] ⏸️ **Email Service Key** (opcional: `re_xxx...`)

---

## 🔒 Segurança

### ⚠️ NUNCA compartilhe essas chaves:
- Não publique no GitHub
- Não envie por email/chat  
- Mantenha seguras no Vercel

### ✅ Use apenas no Vercel:
- Environment Variables são seguras
- Não aparecem no código fonte
- Criptografadas automaticamente

---

## 💰 Custos Estimados

### Anthropic Claude:
- **$0.0015** por 1K tokens input
- **$0.0075** por 1K tokens output  
- **~$0.10** por relatório gerado
- **$30/mês** para ~300 relatórios

### Supabase:
- **Gratuito** até 500MB
- **$25/mês** para uso profissional

### Vercel:
- **Gratuito** para projetos pessoais
- Deploy ilimitado

### Total estimado:
- **$0-30/mês** dependendo do volume

---

## 🚀 Próximo Passo

Depois de obter essas credenciais:

1. Siga o **DEPLOY_GUIDE.md**
2. Cole as credenciais no Vercel
3. Faça deploy! 

Precisa de ajuda para obter alguma credencial?