# 🧪 Checklist de Teste - Produção

## 📋 URLs para Testar

Substitua `[SUA-URL]` pela URL do Vercel:

### 1. 🏠 **Homepage**
```
https://[SUA-URL].vercel.app
```
**✅ Deve mostrar:** Landing page com título "AI Readiness Quiz"

### 2. 🎯 **Quiz Page**
```
https://[SUA-URL].vercel.app/quiz
```
**✅ Deve mostrar:** Formulário com perguntas de negócio

### 3. 🔧 **Setup Database**
```
https://[SUA-URL].vercel.app/setup
```
**✅ Deve mostrar:** Página para configurar Supabase

### 4. 🎨 **Visual Test**
```
https://[SUA-URL].vercel.app/visual-test
```
**✅ Deve mostrar:** Página com tema Aura (cores laranja/rosa)

### 5. 🧪 **API Test**
```
https://[SUA-URL].vercel.app/api/test-db
```
**✅ Deve retornar:** JSON com status das tabelas

## 🚨 **Possíveis Problemas:**

### ❌ Se der erro 500:
- **Causa**: Faltam variáveis de ambiente
- **Solução**: Verificar Environment Variables no Vercel

### ❌ Se der erro 404:
- **Causa**: Build falhou
- **Solução**: Verificar logs no Vercel Dashboard

### ❌ Se carregar mas quebrar funcionalidades:
- **Causa**: APIs não funcionando
- **Solução**: Verificar credenciais Anthropic/Supabase

## 📊 **Como Verificar Logs:**

1. **Vercel Dashboard** > Seu projeto `aura-live`
2. **"Functions"** tab > Ver logs das APIs
3. **"Deployments"** > Ver se último deploy teve sucesso

## 🔑 **Variáveis Necessárias:**

Confirme no Vercel > Settings > Environment Variables:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
SUPABASE_URL=https://xxxxx.supabase.co  
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...
```

## ✅ **Status Esperado:**

- [ ] **Homepage** carrega
- [ ] **Quiz** carrega e mostra perguntas
- [ ] **Setup** carrega (mesmo que dê erro de DB)
- [ ] **Visual Test** mostra tema correto
- [ ] **API** responde (mesmo que erro de credenciais)

---

**🎯 Me informe:**
1. Qual a URL exata do seu projeto?
2. Quais páginas estão funcionando?
3. Há algum erro específico?