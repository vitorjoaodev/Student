# Estudos Manager - Aplicativo de Gerenciamento Acadêmico

Um aplicativo web progressivo (PWA) sofisticado projetado para estudantes universitários organizarem seus estudos através de recursos avançados de gerenciamento de tarefas, visualização de mapa mental, temporizador Pomodoro e muito mais.

![Estudos Manager](attached_assets/Design%20sem%20nome%20(10).jpg)

## Arquitetura e Design

### Visão Geral da Arquitetura

O projeto segue uma arquitetura de camadas bem definida:

- **Frontend**: Aplicação React com gerenciamento de estado via Redux e React Query
- **Backend**: API RESTful Express.js com armazenamento em memória
- **Compartilhado**: Esquemas e tipos compartilhados entre frontend e backend

```
├── client/                # Frontend da aplicação (React)
│   ├── src/               # Código fonte do cliente
│   │   ├── components/    # Componentes React reutilizáveis
│   │   ├── contexts/      # Contextos React
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── lib/           # Utilidades e funções auxiliares
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── store/         # Redux store, slices e actions
│   │   └── ...
├── server/                # Backend da aplicação (Express)
│   ├── index.ts           # Ponto de entrada do servidor
│   ├── routes.ts          # Definição de rotas da API
│   ├── storage.ts         # Implementação de armazenamento
│   └── ...
└── shared/                # Código compartilhado entre frontend e backend
    └── schema.ts          # Definição do esquema de dados e tipos
```

### Padrões de Design

O projeto utiliza diversos padrões de design e práticas modernas:

- **Arquitetura Flux**: Implementada através do Redux para gerenciamento de estado global
- **Container/Presentational Components**: Separação entre componentes lógicos e de apresentação
- **Custom Hooks**: Encapsulamento de lógica reutilizável em hooks personalizados (useTaskManagement, usePomodoroTimer)
- **Context API**: Para estados compartilhados entre componentes (UserContext)
- **Render Props & HOCs**: Para compartilhar comportamentos entre componentes 
- **Padrão Repository**: Abstração do acesso a dados através da interface IStorage
- **Padrão Observer**: Implementado indiretamente via Redux para atualizações reativas

### Estrutura de Componentes Reutilizáveis

O projeto utiliza uma estrutura de componentes modular e reutilizável:

1. **Componentes Base**: Elementos UI fundamentais (botões, inputs, cards)
2. **Componentes Compostos**: Combinações de componentes base (TaskCard, GoalVisualization)
3. **Componentes de Layout**: Estruturas para organização de conteúdo (Layout, Sidebar)
4. **Componentes de Página**: Componentes específicos para cada funcionalidade (Dashboard, Pomodoro, MindMapView)

Todos os componentes seguem princípios de design responsivo e acessibilidade.

## Tecnologias Utilizadas

### Frontend
- **React**: Biblioteca para construção de interfaces
- **Redux + RTK**: Gerenciamento de estado global
- **TanStack Query**: Gerenciamento de estado do servidor e cache
- **TypeScript**: Tipagem estática para melhor manutenção
- **Tailwind CSS**: Framework CSS utilitário
- **shadcn/ui**: Componentes de UI reutilizáveis
- **Wouter**: Sistema de roteamento leve
- **Jest + Testing Library**: Framework de testes
- **Vite**: Ferramenta de build rápida

### Backend
- **Express.js**: Framework web para Node.js
- **Drizzle ORM**: ORM para interação com banco de dados 
- **Zod**: Validação de esquemas

### PWA
- **Workbox**: Biblioteca para implementar Service Workers
- **PWA Manifest**: Configuração para instalação e comportamento de app nativo

## Funcionalidade PWA e Offline

O aplicativo é uma Progressive Web Application (PWA) completa com as seguintes capacidades:

### Capacidades Offline
- **Caching de Assets**: Todos os recursos estáticos (JS, CSS, imagens) são armazenados em cache
- **Caching de API**: As respostas da API são armazenadas em cache com estratégia Stale-While-Revalidate
- **Sincronização em Segundo Plano**: Alterações feitas offline são sincronizadas quando a conexão é restabelecida
- **Estado Persistente**: Redux persiste o estado no localStorage para preservar dados entre sessões

### Estratégias de Cache
- **Cache First**: Para recursos estáticos como imagens e ícones
- **Stale While Revalidate**: Para endpoints da API e recursos dinâmicos
- **Network First**: Para dados críticos que devem ser atualizados frequentemente

### Service Worker
O Service Worker implementa:
- Precaching de assets durante a instalação
- Gerenciamento de diferentes estratégias de cache por tipo de recurso
- Limpeza automática de caches antigos
- Sincronização em segundo plano de tarefas criadas offline
- Tratamento de notificações push

## Executando o Projeto

### Requisitos
- Node.js 18+ e npm

### Instalação
```bash
# Instala as dependências
npm install
```

### Desenvolvimento
```bash
# Inicia o servidor de desenvolvimento
npm run dev
```

### Build
```bash
# Cria a versão de produção
npm run build

# Executa a versão de produção
npm start
```

### Testes
```bash
# Executa todos os testes unitários
npm test

# Executa testes com relatório de cobertura
npm run test:coverage

# Executa testes em modo watch (desenvolvimento)
npm run test:watch
```

## Créditos

Desenvolvido por João Vitor Belasque © 2025