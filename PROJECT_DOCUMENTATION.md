# Documentação Completa do Projeto Task Memento AI

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Principais Funcionalidades](#principais-funcionalidades)
6. [Integrações de IA](#integrações-de-ia)
7. [Fluxos de Trabalho](#fluxos-de-trabalho)
8. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
9. [Solução de Problemas](#solução-de-problemas)
10. [Boas Práticas](#boas-práticas)
11. [Recursos Adicionais](#recursos-adicionais)

## Visão Geral

Task Memento AI é um assistente inteligente para gestão de notas, tarefas e produtividade pessoal. O projeto integra tecnologias avançadas de IA (Gemini e OpenAI) para fornecer recursos como transcrição de áudio, análise de imagens e processamento inteligente de conteúdo.

### Stack Tecnológico

- **Framework**: React 18.3.1 com Vite
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS com shadcn/ui
- **Gerenciamento de Estado**: TanStack Query (React Query) v5
- **Roteamento**: React Router DOM v6
- **Componentes UI**: 
  - Radix UI (diversos componentes base)
  - Lucide React (ícones)
  - Recharts (gráficos)
  - DND Kit (drag and drop)

### Principais Módulos

- **Sistema de Notas**: Criação, edição e organização de notas com suporte a markdown
- **Assistente AI**: Chat interativo com processamento de comandos e análise de conteúdo
- **Gestão de Tarefas**: Criação, acompanhamento e categorização de tarefas
- **Áreas de Vida**: Visualização e gerenciamento de áreas de vida com gráfico "Wheel of Life"
- **Registro de Humor**: Acompanhamento de estados emocionais ao longo do tempo
- **Calendário**: Visualização e gerenciamento de eventos e tarefas
- **Kanban**: Organização visual de tarefas em quadros

## Arquitetura do Sistema

O Task Memento AI segue uma arquitetura baseada em componentes React com gerenciamento de estado através de Context API e React Query. A aplicação é estruturada em torno de vários contextos principais que gerenciam diferentes aspectos do sistema.

### Diagrama de Arquitetura

```
+----------------------------------+
|            Aplicação             |
+----------------------------------+
|                                  |
|  +-------------+  +------------+ |
|  |  Contextos  |  |  Serviços  | |
|  +-------------+  +------------+ |
|  | - NotesContext | - openaiService | 
|  | - TasksContext | - geminiService |
|  | - LeyaltAIContext | - mediaService |
|  | - AreasContext | - storageService |
|  | - MoodContext  | - documentService |
|  +-------------+  +------------+ |
|                                  |
|  +-------------+  +------------+ |
|  | Componentes |  |   Hooks    | |
|  +-------------+  +------------+ |
|  | - Notes      | - useAutoSave |
|  | - Tasks      | - useMindMap  |
|  | - Assistant  | - useKanban   |
|  | - Calendar   | - useMedia    |
|  | - UI         | - useToast    |
|  +-------------+  +------------+ |
|                                  |
+----------------------------------+
```

### Fluxo de Dados

1. **Entrada do Usuário**: Interações do usuário são capturadas pelos componentes React
2. **Processamento**: Os dados são processados pelos contextos e serviços apropriados
3. **Armazenamento**: Os dados são armazenados localmente ou no Supabase
4. **Renderização**: A interface é atualizada para refletir as mudanças

## Configuração do Ambiente

### Pré-requisitos

- Node.js (versão recomendada: 18+)
- NPM ou Yarn
- Chaves de API para serviços externos (OpenAI, Gemini, Supabase)

### Instalação

```bash
# Clonar o repositório
git clone <URL_DO_REPOSITÓRIO>
cd task-memento-ai

# Instalar dependências
npm install

# Configurar variáveis de ambiente
npm run setup:env
# Edite o arquivo .env criado com suas chaves de API

# Iniciar servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

O arquivo `.env` deve conter as seguintes variáveis:

```env
# Chave de API da OpenAI para transcrição de áudio
OPENAI_API_KEY=sua_chave_aqui

# Configurações de IA
VITE_DEFAULT_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=sua_chave_aqui
VITE_GEMINI_MODEL=gemini-1.5-flash
VITE_OPENAI_API_KEY=sua_chave_aqui
VITE_OPENAI_MODEL=gpt-4o

# Configurações do Supabase
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui

# Configurações de AssemblyAI para transcrição
VITE_ASSEMBLY_API_KEY=sua_chave_aqui

# Configuração da API do YouTube
VITE_YOUTUBE_API_KEY=sua_chave_aqui
```

### Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera build de produção
- `npm run build:dev`: Gera build de desenvolvimento
- `npm run lint`: Executa o linter no código
- `npm run setup:env`: Configura variáveis de ambiente
- `npm run preview`: Visualiza build de produção localmente
- `npm run test:transcricao`: Testa a funcionalidade de transcrição
- `npm run test:gemini`: Testa a integração com Gemini
- `npm run test:instagram`: Testa a funcionalidade de transcrição de Instagram

## Estrutura do Projeto

### Diretórios Principais

```
task-memento-ai/
├── dist-scripts/       # Scripts compilados
├── docs/               # Documentação adicional
├── public/             # Arquivos estáticos
├── scripts/            # Scripts de utilidade
├── server/             # Código do servidor
└── src/                # Código-fonte principal
    ├── components/     # Componentes React
    │   ├── areas/      # Componentes de áreas de vida
    │   ├── assistant/  # Componentes do assistente
    │   ├── calendar/   # Componentes de calendário
    │   ├── dashboard/  # Componentes do dashboard
    │   ├── kanban/     # Componentes do kanban
    │   ├── layout/     # Componentes de layout
    │   ├── leyalt/     # Componentes específicos do Leyalt
    │   ├── media/      # Componentes de mídia
    │   ├── mood/       # Componentes de humor
    │   ├── notes/      # Componentes de notas
    │   ├── settings/   # Componentes de configurações
    │   ├── social/     # Componentes sociais
    │   ├── tasks/      # Componentes de tarefas
    │   └── ui/         # Componentes UI base
    ├── contexts/       # Contextos React
    │   ├── collaboration/  # Contextos de colaboração
    │   ├── leyalt-ai/      # Contextos do assistente AI
    │   ├── notes/          # Contextos de notas
    │   ├── supabase/       # Contextos do Supabase
    │   └── tasks/          # Contextos de tarefas
    ├── hooks/          # Hooks personalizados
    │   ├── use-media-upload/  # Hooks de upload de mídia
    │   └── use-search/        # Hooks de busca
    ├── lib/            # Bibliotecas e utilitários
    ├── pages/          # Componentes de página
    ├── routes/         # Configuração de rotas
    ├── services/       # Serviços externos
    │   ├── ai/         # Serviços de IA
    │   ├── cache/      # Serviços de cache
    │   ├── gemini/     # Serviços do Gemini
    │   ├── media/      # Serviços de mídia
    │   ├── openai/     # Serviços do OpenAI
    │   ├── search/     # Serviços de busca
    │   └── telemetry/  # Serviços de telemetria
    ├── types/          # Definições de tipos
    ├── utils/          # Funções utilitárias
    └── workers/        # Web Workers
```

### Arquivos Principais

- `src/App.tsx`: Componente principal da aplicação
- `src/main.tsx`: Ponto de entrada da aplicação
- `src/routes/AppRoutes.tsx`: Configuração de rotas
- `src/contexts/NotesContext.tsx`: Gerenciamento de notas
- `src/contexts/TasksContext.tsx`: Gerenciamento de tarefas
- `src/contexts/LeyaltAIContext.tsx`: Gerenciamento do assistente AI

## Principais Funcionalidades

### Sistema de Notas

O sistema de notas permite aos usuários criar, editar e organizar notas com suporte a markdown.

**Características principais:**
- Criação e edição de notas
- Suporte a markdown
- Organização por espaços
- Transformação em mapas mentais
- Sistema Kanban integrado
- Adição de conteúdo do assistente a notas existentes

**Componentes principais:**
- `src/components/notes/`: Componentes de notas
- `src/contexts/NotesContext.tsx`: Contexto de notas
- `src/services/noteService.ts`: Serviço de notas

### Assistente AI

O assistente AI fornece um chat interativo com processamento de comandos e análise de conteúdo.

**Características principais:**
- Chat interativo
- Processamento de comandos
- Transcrição de áudio
- Análise de imagens
- Transformação de texto
- Envio de mensagens selecionadas para notas existentes

**Componentes principais:**
- `src/components/assistant/`: Componentes do assistente
- `src/contexts/LeyaltAIContext.tsx`: Contexto do assistente
- `src/services/openai.ts`: Serviço do OpenAI
- `src/services/gemini/`: Serviços do Gemini

### Gestão de Tarefas

O sistema de gestão de tarefas permite aos usuários criar, acompanhar e categorizar tarefas.

**Características principais:**
- Criação e acompanhamento
- Recorrência
- Categorização
- Priorização
- Integração com calendário

**Componentes principais:**
- `src/components/tasks/`: Componentes de tarefas
- `src/contexts/TasksContext.tsx`: Contexto de tarefas
- `src/services/taskService.ts`: Serviço de tarefas

### Áreas de Vida

O módulo de áreas de vida permite aos usuários visualizar e gerenciar áreas de vida com um gráfico "Wheel of Life".

**Características principais:**
- Visualização em gráfico de radar
- Definição de metas por área
- Acompanhamento de progresso

**Componentes principais:**
- `src/components/areas/`: Componentes de áreas
- `src/contexts/AreasContext.tsx`: Contexto de áreas
- `src/components/areas/WheelOfLifeChart.tsx`: Gráfico de áreas de vida

### Registro de Humor

O módulo de registro de humor permite aos usuários acompanhar estados emocionais ao longo do tempo.

**Características principais:**
- Registro diário de humor
- Visualização em gráficos
- Análise de tendências

**Componentes principais:**
- `src/components/mood/`: Componentes de humor
- `src/contexts/MoodContext.tsx`: Contexto de humor

## Integrações de IA

### OpenAI

A integração com OpenAI é usada principalmente para processamento de texto e transcrição de áudio.

**Configuração:**
- Modelo: gpt-4o
- Chave de API: Configurada em VITE_OPENAI_API_KEY

**Serviços:**
- `src/services/openai.ts`: Serviço principal
- `src/services/openai/`: Serviços específicos

### Google Gemini

A integração com Google Gemini é usada principalmente para análise de imagens e como fallback para o OpenAI.

**Configuração:**
- Modelo: gemini-1.5-flash
- Chave de API: Configurada em VITE_GEMINI_API_KEY

**Serviços:**
- `src/services/gemini/`: Serviços do Gemini

### AssemblyAI

A integração com AssemblyAI é usada para transcrição de áudio.

**Configuração:**
- Chave de API: Configurada em VITE_ASSEMBLY_API_KEY

**Serviços:**
- `src/services/transcriptionService.ts`: Serviço de transcrição

## Fluxos de Trabalho

### Fluxo de Criação de Nota

1. Usuário acessa a página de notas
2. Usuário clica no botão "Nova Nota"
3. Usuário preenche o título e conteúdo da nota
4. Usuário clica em "Salvar"
5. A nota é salva no contexto de notas e persistida localmente

### Fluxo de Interação com Assistente

1. Usuário clica no botão do assistente
2. Usuário digita uma mensagem
3. A mensagem é enviada para o serviço de IA apropriado (OpenAI ou Gemini)
4. A resposta é exibida no chat
5. Usuário pode selecionar mensagens e salvá-las como notas

### Fluxo de Gestão de Tarefas

1. Usuário acessa a página de tarefas
2. Usuário cria uma nova tarefa com título, descrição e data
3. A tarefa é exibida na lista de tarefas
4. Usuário pode marcar a tarefa como concluída ou editá-la
5. As tarefas são sincronizadas com o calendário

## Guia de Desenvolvimento

### Trabalhando com Componentes

#### Criando Novos Componentes

1. Crie um novo arquivo na pasta apropriada em `src/components/`
2. Use a seguinte estrutura básica:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  // Defina as props aqui
}

export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // Lógica do componente

  return (
    <div className="...">
      {/* JSX do componente */}
    </div>
  );
}
```

#### Estilização de Componentes

Utilizamos Tailwind CSS para estilização. Para classes condicionais, use a função `cn` do utilitário:

```tsx
<div className={cn(
  "base-class",
  condition && "conditional-class",
  variant === 'primary' ? "primary-class" : "secondary-class"
)}>
```

### Trabalhando com Contextos

#### Criando Novos Contextos

1. Crie um novo arquivo na pasta `src/contexts/`
2. Use a seguinte estrutura básica:

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MyContextType {
  // Defina o tipo do contexto aqui
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyProvider({ children }: { children: ReactNode }) {
  // Lógica do provedor

  const value = {
    // Valores e funções a serem expostos
  };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return context;
}
```

### Trabalhando com Serviços

#### Criando Novos Serviços

1. Crie um novo arquivo na pasta `src/services/`
2. Use a seguinte estrutura básica:

```tsx
import { logger } from '@/utils/logger';

export async function myService(param1: string, param2: number) {
  try {
    // Lógica do serviço
    return result;
  } catch (error) {
    logger.error('Erro no serviço:', error);
    throw new Error('Mensagem de erro amigável');
  }
}
```

### Trabalhando com Hooks

#### Criando Novos Hooks

1. Crie um novo arquivo na pasta `src/hooks/`
2. Use a seguinte estrutura básica:

```tsx
import { useState, useEffect } from 'react';

export function useMyHook(param: string) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    // Lógica do hook
    return () => {
      // Limpeza, se necessário
    };
  }, [param]);

  function handleSomething() {
    // Função exposta pelo hook
  }

  return {
    state,
    handleSomething,
  };
}
```

## Solução de Problemas

### Problemas Comuns e Soluções

#### Erro de Importação de Arquivo de Declaração de Tipos

**Problema**: Erro ao importar arquivos `.d.ts` diretamente.

**Solução**: Não importe arquivos `.d.ts` diretamente. Eles são usados pelo TypeScript automaticamente durante a compilação.

#### Problemas de Tipagem

**Problema**: Erros de tipo em componentes ou hooks.

**Solução**:
1. Verifique se todos os tipos estão corretamente definidos
2. Use o operador `as` com cautela para conversões de tipo
3. Verifique se está importando os tipos corretos

#### Problemas de Renderização

**Problema**: Componentes não renderizam como esperado.

**Solução**:
1. Verifique as dependências dos hooks (useEffect, useMemo, useCallback)
2. Use o React DevTools para inspecionar a árvore de componentes
3. Verifique se os estados estão sendo atualizados corretamente

#### Problemas com o Assistente AI

**Problema**: Funcionalidades do assistente não funcionam corretamente.

**Solução**:
1. Verifique se as chaves de API estão configuradas corretamente
2. Inspecione as respostas da API no console
3. Verifique se os contextos estão sendo usados corretamente

### Logs e Depuração

O projeto utiliza um sistema de logs personalizado através do utilitário `logger`:

```tsx
import { logger } from '@/utils/logger';

// Níveis de log disponíveis
logger.debug('Mensagem de debug');
logger.info('Mensagem informativa');
logger.warn('Aviso');
logger.error('Erro', error);
```

## Boas Práticas

### TypeScript

1. **Defina Tipos Explicitamente**:
   ```typescript
   // Bom
   const items: Item[] = getItems();
   
   // Evite
   const items = getItems();
   ```

2. **Use Interfaces para Objetos e Types para Uniões**:
   ```typescript
   // Para objetos
   interface User {
     id: string;
     name: string;
   }
   
   // Para uniões
   type Status = 'pending' | 'completed' | 'failed';
   ```

### React

1. **Use Hooks Personalizados**:
   Extraia lógica complexa para hooks personalizados:
   ```typescript
   function useCustomLogic() {
     // Lógica complexa aqui
     return { data, actions };
   }
   ```

2. **Memoize Componentes e Callbacks**:
   ```typescript
   // Memoize componentes
   const MemoizedComponent = React.memo(MyComponent);
   
   // Memoize callbacks
   const handleClick = useCallback(() => {
     // Lógica
   }, [dependencies]);
   ```

3. **Evite Renderizações Desnecessárias**:
   Use `useMemo` para valores computados:
   ```typescript
   const computedValue = useMemo(() => {
     return expensiveComputation(a, b);
   }, [a, b]);
   ```

### Tailwind CSS

1. **Use Variantes para Componentes**:
   ```typescript
   const buttonVariants = {
     primary: "bg-blue-500 hover:bg-blue-600",
     secondary: "bg-gray-500 hover:bg-gray-600"
   };
   
   <button className={buttonVariants[variant]}>Click me</button>
   ```

2. **Extraia Classes Comuns**:
   ```typescript
   const cardClass = "rounded-lg shadow-md p-4 bg-white";
   ```

### Convenções de Nomenclatura

- **Arquivos de Componentes**: PascalCase (ex: `Button.tsx`)
- **Arquivos de Hooks**: camelCase com prefixo "use" (ex: `useAuth.ts`)
- **Arquivos de Contexto**: PascalCase com sufixo "Context" (ex: `NotesContext.tsx`)
- **Arquivos de Serviços**: camelCase (ex: `openaiService.ts`)
- **Arquivos de Tipos**: camelCase ou PascalCase dependendo do conteúdo (ex: `types.ts` ou `NotesTypes.ts`)

## Recursos Adicionais

### Documentação

- [README.md](./README.md): Visão geral do projeto
- [DEPENDENCIES.md](./DEPENDENCIES.md): Detalhes sobre dependências
- [LOVABLE_IDE_GUIDE.md](./LOVABLE_IDE_GUIDE.md): Guia específico para IDEs do Lovable
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md): Solução de problemas comuns

### Links Externos

- [Documentação do React](https://react.dev/)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação do Vite](https://vitejs.dev/guide/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs/)
- [Documentação do shadcn/ui](https://ui.shadcn.com/)
- [Documentação do Lovable](https://docs.lovable.dev/)

### Suporte

Para dúvidas ou problemas específicos relacionados às IDEs do Lovable, entre em contato com:

- Equipe de Suporte: support@lovable.dev
- Canal Discord: [Link para o canal](https://discord.com/channels/1119885301872070706/1280461670979993613)
