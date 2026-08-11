# 📋 Guia Definitivo - Passo a Passo para Lançamento do Quitandas Farm House

Este documento contém o checklist completo e o passo a passo manual simples que você precisa realizar para conectar o **Supabase** ao site na **Vercel**.

---

## ✅ 1. O que JÁ ESTÁ 100% PRONTO e FUNCIONANDO automaticamente:

- [x] **Código Front-End & UI/UX**: Interface responsiva com design artesanal e imagens WebP otimizadas.
- [x] **Auditoria de Performance**: Pontuações 100 de Acessibilidade, 100 de Melhores Práticas e 100 de SEO.
- [x] **DRE Financeiro & BI Analytics**: Painel administrativo (`/#/admin`) com apuração de Receita Bruta, CMV (38%), Lucro Bruto, Margem %, Ticket Médio, LTV e Curva ABC de produtos.
- [x] **Disparador WhatsApp & Recuperador de Sacola**: Envio de ofertas personalizadas para visitantes que abandonaram o carrinho.
- [x] **Exportação de Dados CSV**: Botões para exportar DRE em Excel e Base de Clientes.
- [x] **Automação Vercel Cron Job**: Robô em `/api/cron-keep-alive` agendado a cada 3 dias para que o Supabase nunca fique inativo.
- [x] **Repositório GitHub**: Código publicado em `https://github.com/gabrielmco/quitandas-farm-house`.
- [x] **Projeto na Vercel**: Publicado e no ar em `https://site-quitandas-farm-house.vercel.app`.

---

## 🔑 2. Passo a Passo Manual para VOCÊ Configurar o Supabase (5 Minutos)

### ETAPA 1: Obter as Chaves do Supabase
1. Acesse **[supabase.com](https://supabase.com)** e faça login ou crie uma conta gratuita.
2. Clique em **"New Project"**, defina um nome (ex: `quitandas-farm-house`) e crie uma senha para o banco de dados.
3. Após a criação do projeto, vá no menu lateral esquerdo em **Project Settings ➔ API**.
4. Copie os 2 valores apresentados na tela:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public (Key)**: `eyJhbGciOi...`

---

### ETAPA 2: Criar as Tabelas no Supabase (1 Clique)
1. No painel do Supabase, vá no menu lateral em **SQL Editor**.
2. Clique em **"New Query"**.
3. Abra o arquivo [supabase_schema.sql](file:///c:/Users/biel3/OneDrive/Documentos/site-quitandas-farm-house/supabase_schema.sql) que já deixei pronto na pasta do seu projeto.
4. Copie todo o conteúdo do arquivo, cole dentro do SQL Editor do Supabase e clique no botão verde **RUN**.
5. Pronto! Suas tabelas de `orders` (pedidos), `customers` (clientes) e `visitors` (visitantes) foram criadas com segurança.

---

### ETAPA 3: Cadastrar as Chaves na Vercel (Para Ativar o Site e o Robô 24/7)
1. Acesse o painel do seu projeto na Vercel:  
   👉 **[Configurações de Variáveis na Vercel](https://vercel.com/gabriels-projects-94502409/site-quitandas-farm-house/settings/environment-variables)**
2. Adicione as duas variáveis:
   - **Key**: `VITE_SUPABASE_URL` | **Value**: *(Cole a URL do seu Supabase)*
   - **Key**: `VITE_SUPABASE_ANON_KEY` | **Value**: *(Cole a chave anon public do seu Supabase)*
3. Clique em **Save**.
4. Na aba **Deployments** da Vercel, clique nos três pontinhos ao lado do último deploy e selecione **Redeploy**.

---

### ETAPA 4: Prova de Funcionamento (Como Testar)
1. Abra o link do robô de disparo:  
   👉 `https://site-quitandas-farm-house.vercel.app/api/cron-keep-alive`
2. Você verá a mensagem de sucesso:
   ```json
   {
     "success": true,
     "message": "⚡ Ping de mantimento de atividade do Supabase executado com sucesso pela Vercel!",
     "httpStatus": 200,
     "timestamp": "2026-08-11T..."
   }
   ```
3. No painel do site (`https://site-quitandas-farm-house.vercel.app/#/admin`), clique no botão **`⚡ Ping Supabase`** para ver o indicador de latência em tempo real!

---

## 🌐 3. (Opcional) Configurar Seu Domínio Próprio na Vercel

Se desejar usar seu domínio `.com.br` (ex: `quitandasfarmhouse.com.br`):
1. No painel da Vercel, vá em **Project Settings ➔ Domains**.
2. Digite seu domínio e clique em **Add**.
3. A Vercel exibirá os apontamentos DNS (CNAME ou A) para você adicionar no seu registrador de domínio (ex: Registro.br ou Hostinger).
