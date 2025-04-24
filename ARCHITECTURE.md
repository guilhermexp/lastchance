# Arquitetura Técnica - Task Memento AI

Este documento descreve a arquitetura técnica do projeto Task Memento AI, incluindo padrões de design, decisões técnicas e fluxos de dados.

## Visão Geral da Arquitetura

O Task Memento AI segue uma arquitetura de componentes React com gerenciamento de estado distribuído através de múltiplos contextos. A aplicação é construída com TypeScript e utiliza Vite como bundler.

### Diagrama de Arquitetura de Alto Nível

```
+-----------------------------------------------+
|                  Aplicação                    |
+-----------------------------------------------+
|                                               |
|  +---------------+      +------------------+  |
|  |   Interface   |      | Gerenciamento de |  |
|  |   do Usuário  |<---->|      Estado      |  |
|  +---------------+      +------------------+  |
|         ^                        ^            |
|         |                        |            |
|         v                        v            |
|  +---------------+      +------------------+  |
|  |   Serviços    |<---->|  Armazenamento   |  |
|  |   Externos    |      |    de Dados      |  |
|  +---------------+      +------------------+  |
|                                               |
+-----------------------------------------------+
```

## Camadas da Aplicação

### 1. Interface do Usuário (UI)

A camada de interface do usuário é composta por componentes React organizados em uma hierarquia lógica.

#### Componentes

- **Componentes de Página**: Representam páginas completas da aplicação (ex: `NotesPage.tsx`)
- **Componentes de Funcionalidade**: Implementam funcionalidades específicas (ex: `NoteEditor.tsx`)
- **Componentes de UI**: Elementos de interface reutilizáveis (ex: `Button.tsx`)

#### Biblioteca de UI

O projeto utiliza componentes do Radix UI através da implementação do shadcn/ui, que fornece:

- Componentes acessíveis e sem estilo (headless)
- Personalização através do Tailwind CSS
- Comportamentos consistentes e testados

### 2. Gerenciamento de Estado

O gerenciamento de estado é distribuído através de múltiplos contextos React, cada um responsável por um domínio específico da aplicação.

#### Contextos Principais

- **NotesContext**: Gerencia o estado das notas
- **TasksContext**: Gerencia o estado das tarefas
- **LeyaltAIContext**: Gerencia o estado do assistente AI
- **AreasContext**: Gerencia o estado das áreas de vida
- **MoodContext**: Gerencia o estado do registro de humor
- **ThemeContext**: Gerencia o tema da aplicação (claro/escuro)
- **SidebarContext**: Gerencia o estado da barra lateral

#### Padrão de Implementação de Contexto

Cada contexto segue um padrão consistente:

```tsx
// 1. Definição de tipos
interface MyContextType {
  // Estado e funções expostas
}

// 2. Criação do contexto
const MyContext = createContext<MyContextType | undefined>(undefined);

// 3. Implementação do provedor
export function MyProvider({ children }: { children: ReactNode }) {
  // Estado e lógica
  const value = {
    // Valores e funções expostas
  };
  
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

// 4. Hook personalizado para consumir o contexto
export function useMyContext() {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useMyContext must be used within a MyProvider');
  }
  return context;
}
```

#### Gerenciamento de Estado Assíncrono

Para operações assíncronas e comunicação com APIs, o projeto utiliza TanStack Query (React Query), que fornece:

- Cache de dados
- Revalidação automática
- Gerenciamento de estado de carregamento e erro
- Deduplicação de requisições

### 3. Serviços

A camada de serviços encapsula a lógica de comunicação com APIs externas e processamento de dados.

#### Serviços Principais

- **openaiService**: Comunicação com a API da OpenAI
- **geminiService**: Comunicação com a API do Google Gemini
- **noteService**: Operações relacionadas a notas
- **taskService**: Operações relacionadas a tarefas
- **transcriptionService**: Serviços de transcrição de áudio
- **storageService**: Gerenciamento de armazenamento local

#### Padrão de Implementação de Serviço

Os serviços seguem um padrão consistente:

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

### 4. Armazenamento de Dados

O projeto utiliza múltiplas estratégias de armazenamento:

- **Local Storage**: Para dados que precisam persistir entre sessões
- **Supabase**: Para armazenamento em nuvem e sincronização entre dispositivos
- **Estado em Memória**: Para dados temporários durante a sessão

## Padrões de Design

### Componentes Funcionais e Hooks

O projeto utiliza exclusivamente componentes funcionais React com hooks para gerenciamento de estado e efeitos colaterais.

#### Hooks Personalizados

Hooks personalizados são utilizados para extrair e reutilizar lógica complexa:

```tsx
export function useAutoSave<T>(
  value: T,
  saveFunction: (value: T) => Promise<void>,
  delay: number = 1000
) {
  const timeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      saveFunction(value);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, saveFunction, delay]);
}
```

### Composição de Componentes

O projeto favorece a composição de componentes sobre herança, seguindo o princípio de "composição sobre herança" do React.

#### Exemplo de Composição

```tsx
function NoteCard({ note, actions }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{note.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {note.content}
      </CardContent>
      <CardFooter>
        <NoteActions actions={actions} />
      </CardFooter>
    </Card>
  );
}
```

### Renderização Condicional

O projeto utiliza renderização condicional para mostrar diferentes interfaces baseadas no estado:

```tsx
function MyComponent({ isLoading, data, error }) {
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error.message} />;
  }
  
  return <DataDisplay data={data} />;
}
```

### Memoização

Para otimizar o desempenho, o projeto utiliza memoização para evitar renderizações desnecessárias:

```tsx
// Memoização de componentes
const MemoizedComponent = React.memo(MyComponent);

// Memoização de valores computados
const computedValue = useMemo(() => {
  return expensiveComputation(a, b);
}, [a, b]);

// Memoização de callbacks
const handleClick = useCallback(() => {
  // Lógica
}, [dependencies]);
```

## Fluxos de Dados

### Fluxo de Dados Unidirecional

O projeto segue o princípio de fluxo de dados unidirecional do React:

1. O estado é mantido nos contextos
2. Os componentes consomem o estado através de hooks
3. Os componentes disparam ações que atualizam o estado
4. A atualização do estado causa a re-renderização dos componentes

### Fluxo de Interação com APIs Externas

```
+-------------+     +-----------+     +-------------+     +-----------+
| Componente  |---->| Contexto  |---->|  Serviço    |---->|    API    |
+-------------+     +-----------+     +-------------+     +-----------+
       ^                  |                 |                  |
       |                  |                 |                  |
       +------------------+-----------------+------------------+
                          |
                     Fluxo de Dados
```

1. O componente dispara uma ação (ex: enviar mensagem para o assistente)
2. O contexto processa a ação e chama o serviço apropriado
3. O serviço faz a requisição para a API externa
4. A resposta da API é processada pelo serviço
5. O contexto atualiza o estado com os dados processados
6. O componente é re-renderizado com os novos dados

## Decisões Técnicas

### TypeScript

O projeto utiliza TypeScript para fornecer tipagem estática, melhorando a segurança do código e a experiência de desenvolvimento.

#### Benefícios

- Detecção de erros em tempo de compilação
- Melhor suporte de IDE (autocompletar, navegação de código)
- Documentação embutida através de tipos
- Refatoração mais segura

### Vite

O projeto utiliza Vite como bundler e servidor de desenvolvimento.

#### Benefícios

- Inicialização rápida do servidor de desenvolvimento
- Hot Module Replacement (HMR) eficiente
- Otimizações de build para produção
- Suporte nativo a TypeScript e JSX

### Tailwind CSS

O projeto utiliza Tailwind CSS para estilização.

#### Benefícios

- Desenvolvimento rápido com classes utilitárias
- Consistência de design através de um sistema de design
- Redução do tamanho do CSS em produção
- Facilidade de personalização

### React Router

O projeto utiliza React Router para gerenciamento de rotas.

#### Benefícios

- Roteamento declarativo
- Navegação programática
- Parâmetros de rota
- Rotas aninhadas

## Considerações de Desempenho

### Lazy Loading

O projeto utiliza lazy loading para carregar componentes sob demanda:

```tsx
const NotesPage = lazy(() => import("@/pages/NotesPage"));
```

### Code Splitting

O Vite realiza code splitting automaticamente, dividindo o código em chunks menores que são carregados sob demanda.

### Memoização

Como mencionado anteriormente, o projeto utiliza memoização para evitar renderizações desnecessárias.

## Considerações de Segurança

### Validação de Entrada

O projeto utiliza Zod para validação de entrada:

```tsx
const schema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().optional(),
});

const result = schema.safeParse(input);
if (!result.success) {
  // Tratar erro de validação
}
```

### Sanitização de Saída

O projeto sanitiza conteúdo HTML para evitar ataques XSS.

### Armazenamento Seguro

Chaves de API e tokens são armazenados em variáveis de ambiente e nunca expostos no cliente.

## Considerações de Acessibilidade

### Componentes Acessíveis

O projeto utiliza componentes do Radix UI, que são construídos com acessibilidade em mente:

- Suporte a navegação por teclado
- Atributos ARIA apropriados
- Foco gerenciado corretamente

### Testes de Acessibilidade

O projeto pode ser testado com ferramentas como Axe para garantir conformidade com diretrizes de acessibilidade.

## Considerações de Internacionalização

O projeto está preparado para suportar múltiplos idiomas no futuro, com estrutura para:

- Extração de strings para arquivos de tradução
- Detecção de idioma do navegador
- Formatação de datas e números específica por localidade

## Evolução da Arquitetura

### Áreas para Melhoria

- **Testes Automatizados**: Implementar testes unitários e de integração
- **Documentação de API**: Documentar APIs internas com JSDoc
- **Monitoramento**: Implementar monitoramento de erros e telemetria
- **PWA**: Transformar em Progressive Web App para melhor experiência offline

### Roadmap Técnico

1. **Curto Prazo**:
   - Melhorar cobertura de testes
   - Otimizar desempenho de renderização

2. **Médio Prazo**:
   - Implementar sincronização offline
   - Melhorar acessibilidade

3. **Longo Prazo**:
   - Migrar para arquitetura de micro-frontends
   - Implementar suporte a plugins

## Conclusão

A arquitetura do Task Memento AI foi projetada para ser modular, escalável e manutenível. A separação clara de responsabilidades entre componentes, contextos e serviços permite que o sistema evolua de forma organizada e que novas funcionalidades sejam adicionadas com facilidade.

O uso de tecnologias modernas como React, TypeScript, Vite e Tailwind CSS proporciona uma base sólida para o desenvolvimento, enquanto padrões como composição de componentes, hooks personalizados e fluxo de dados unidirecional garantem que o código seja consistente e fácil de entender.
