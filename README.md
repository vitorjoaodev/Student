# 📚 Estudos Manager / Academic Study Manager

> Um aplicativo web progressivo (PWA) sofisticado para estudantes universitários organizarem seus estudos com tarefas, mapas mentais, Pomodoro e mais.  
> A sophisticated Progressive Web App (PWA) designed for university students to organize their studies with tasks, mind maps, Pomodoro timer, and more.

---

## 🧠 Estudos Manager - Aplicativo de Gerenciamento Acadêmico  
## 🧠 Academic Study Manager App

Um PWA completo para estudantes universitários com recursos de organização de tarefas, visualização de mapa mental, temporizador Pomodoro, entre outros.  
A full PWA for college students with task management, mind map visualization, Pomodoro timer, and more.

---

## 🏗️ Arquitetura e Design | Architecture and Design

### 🔎 Visão Geral da Arquitetura / Architecture Overview

O projeto é dividido em três camadas principais:  
The project follows a well-structured layered architecture:

- **Frontend**: React App com Redux + React Query  
- **Backend**: Express.js RESTful API com armazenamento em memória  
- **Compartilhado**: Esquemas e tipos compartilhados entre client/server

├── client/ # Frontend (React)
│ ├── src/
│ │ ├── components/ # Reusable components
│ │ ├── contexts/ # Context API
│ │ ├── hooks/ # Custom hooks
│ │ ├── lib/ # Utilities
│ │ ├── pages/ # Page components
│ │ ├── store/ # Redux logic
├── server/ # Backend (Express)
│ ├── index.ts
│ ├── routes.ts
│ ├── storage.ts
└── shared/ # Shared schemas and types
└── schema.ts

markdown
Copiar
Editar

---

### 🧩 Padrões de Design | Design Patterns

- **Flux Architecture**: via Redux
- **Container/Presentational Components**
- **Custom Hooks**: `useTaskManagement`, `usePomodoroTimer`
- **Context API**: para estados globais
- **Render Props & HOCs**
- **Repository Pattern**: com `IStorage`
- **Observer Pattern**: reatividade via Redux

---

## 🧱 Componentização | Component Structure

- **Componentes Base / Base Components**: Buttons, Inputs, Cards  
- **Componentes Compostos / Composite Components**: `TaskCard`, `GoalVisualization`  
- **Componentes de Layout / Layout Components**: `Layout`, `Sidebar`  
- **Componentes de Página / Page Components**: `Dashboard`, `Pomodoro`, `MindMapView`

Todos os componentes são responsivos e acessíveis.  
All components follow responsive and accessible design principles.

---

## 🧪 Tecnologias Utilizadas | Technologies Used

### 🔹 Frontend

- React
- Redux + Redux Toolkit (RTK)
- TanStack Query
- TypeScript
- Tailwind CSS
- shadcn/ui
- Wouter
- Jest + Testing Library
- Vite

### 🔹 Backend

- Express.js
- Drizzle ORM
- Zod

### 🔹 PWA

- Workbox (Service Workers)
- PWA Manifest

---

## 🔌 Funcionalidade Offline e PWA | PWA & Offline Features

### 🌐 Capacidades Offline | Offline Capabilities

- **Assets em cache** (JS, CSS, imagens)
- **Respostas de API em cache** com `Stale-While-Revalidate`
- **Sincronização em segundo plano**
- **Estado persistente** com `localStorage`

### 🧠 Estratégias de Cache | Caching Strategies

- `Cache First`: imagens, ícones
- `Stale While Revalidate`: dados da API
- `Network First`: dados críticos

### ⚙️ Service Worker

- Pre-caching de recursos
- Estratégias por tipo de arquivo
- Limpeza automática de caches antigos
- Sincronização offline
- Notificações push

---

## 🛠️ Executando o Projeto | Running the Project

### 📦 Requisitos | Requirements

- Node.js 18+ e npm

### 🧪 Instalação / Installation

```bash
npm install
💻 Desenvolvimento / Development
bash
Copiar
Editar
npm run dev
🚀 Produção / Build
bash
Copiar
Editar
npm run build
npm start
✅ Testes / Testing
bash
Copiar
Editar
npm test                  # Testes unitários
npm run test:coverage     # Cobertura de testes
npm run test:watch        # Modo de desenvolvimento
👨‍💻 Desenvolvedor / Developer
João Vitor Belasque © 2025
LinkedIn | Portfólio

📄 Licença | License
Distribuído sob a licença MIT.
Distributed under the MIT License.
