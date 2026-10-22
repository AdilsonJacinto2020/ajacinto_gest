# ADIJACINTO – Sistema de Gestão & Faturação

Solução sob medida para a **ADIJACINTO – COMÉRCIO GREAL E PRESTAÇÃO DE SERVIÇOS (SU), LDA.**

- **NIF**: `5001375962`
- **Sede**: Luanda, Município de Luanda, Distrito Urbano de Samba, Bairro Morro Bento, Rua e Casa s/nº, junto ao Imetro.

---

## 🏗️ Arquitetura do Projeto

O projeto está dividido de forma limpa e modular exatamente de acordo com a sua solicitação:

- **Backend (`/backend`)**:
  - **NestJS 10+**
  - **TypeORM 0.3+**
  - **PostgreSQL** (compatível com Neon Postgres, Supabase ou Postgres local)
  - Módulos completos para:
    - `Points` (Abertura do Dia, Encerramento de Turno e Monitorização)
    - `Wallets` (Gestão de Saldo do Caixa Geral, mSeller, Afrimoney e Telplay/ZAP)
    - `Transfers` (Transferência de capital entre Caixa Geral e Pontos de Venda)
    - `Invoices` (Faturação multi-item com identificação de telemóvel/cartão e 0% IVA)

- **Frontend (`/frontend`)**:
  - **React 18** (Vite + TypeScript)
  - **Tailwind CSS** com design **Mobile-First** ultra rápido para telemóveis e tablets
  - Logotipo oficial da **ADIJACINTO** integrado
  - Geração de Faturas em **PDF** para partilhar por WhatsApp
  - Visualizador e gerador de **Talão Térmico (80mm)** para impressoras Bluetooth/USB

---

## 📦 Como Executar

### 1. Iniciar tudo junto (Backend + Frontend)
Na raiz do projeto:
```bash
npm run dev
```

### 2. Ou executar em terminais separados:
- **Backend (NestJS)**:
  ```bash
  cd backend
  npm run start:dev
  ```
  *(Acessível em `http://localhost:4000`)*

- **Frontend (React)**:
  ```bash
  cd frontend
  npm run dev
  ```
  *(Acessível em `http://localhost:3000`)*

---

## 📱 Planos Mapeados no Catálogo
1. **Unitel (mSeller)**: Planos de Voz (Optimo, BALA, Fala Tudo), Dados (Net 24h, Social, Plus, Balas de Dados) e Net Casa.
2. **Africell (Afrimoney)**: Voz & SMS, Ofertas Afrinet, Socializa e 4G Unlimited.
3. **ZAP Satélite**: ZAP Mini, Mais, Max, Premium e Plus (7, 14 e 30 dias) com preços editáveis.
4. **DStv**: DStv Fácil, Família, Grande, Bué, Premium, etc., com preços editáveis.
