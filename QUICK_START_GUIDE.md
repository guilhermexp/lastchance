# Guia de Início Rápido - Task Memento AI

Este guia fornece instruções rápidas para começar a trabalhar com o projeto Task Memento AI.

## Pré-requisitos

- Node.js (versão 18+)
- NPM ou Yarn
- Editor de código (recomendado: VS Code ou IDEs do Lovable)

## Configuração Inicial

### 1. Clone o Repositório

```bash
git clone <URL_DO_REPOSITÓRIO>
cd task-memento-ai
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

```bash
npm run setup:env
```

Edite o arquivo `.env` criado com suas chaves de API:

```env
# Chaves mínimas necessárias para desenvolvimento básico
VITE_OPENAI_API_KEY=sua_chave_aqui
VITE_GEMINI_API_KEY=sua_chave_aqui
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 4. Verifique o Ambiente de Desenvolvimento

```bash
npm run verify
```

Este comando verifica se o ambiente está configurado corretamente, incluindo:
- Versão do Node.js
- Presença do arquivo .env
- Variáveis de ambiente necessárias
- Dependências instaladas
- Configuração do Vite

### 5. Inicie o Servidor de Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:8080`

## Estrutura Básica do Projeto

```
src/
  ├── components/     # Componentes React
  ├── contexts/       # Contextos React
  ├── hooks/          # Hooks personalizados
  ├── pages/          # Componentes de página
  ├── services/       # Serviços externos
  └── App.tsx         # Componente principal
```

## Principais Rotas

- `/` - Dashboard
- `/notes` - Página de notas
- `/tasks` - Página de tarefas
- `/kanban` - Página de kanban
- `/calendar` - Página de calendário
- `/mood` - Página de humor
- `/areas` - Página de áreas de vida
- `/settings` - Configurações

## Comandos Úteis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run lint` - Executa o linter no código
- `npm run preview` - Visualiza build de produção localmente
- `npm run verify` - Verifica se o ambiente está configurado corretamente

## Fluxos de Trabalho Comuns

### Criar uma Nova Nota

1. Acesse a página de notas (`/notes`)
2. Clique no botão "Nova Nota"
3. Preencha o título e conteúdo
4. Clique em "Salvar"

### Interagir com o Assistente AI

1. Clique no botão do assistente (ícone de IA)
2. Digite uma mensagem no campo de texto
3. Pressione Enter para enviar
4. Para salvar mensagens como notas, selecione-as e clique em "Salvar Conversa"

### Criar uma Nova Tarefa

1. Acesse a página de tarefas (`/tasks`)
2. Clique no botão "Nova Tarefa"
3. Preencha os detalhes da tarefa
4. Clique em "Salvar"

## Recursos para Desenvolvimento

- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Documentação completa
- [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) - Índice de documentação
- [DEPENDENCIES.md](./DEPENDENCIES.md) - Detalhes sobre dependências
- [LOVABLE_IDE_GUIDE.md](./LOVABLE_IDE_GUIDE.md) - Guia para IDEs do Lovable
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solução de problemas

## Próximos Passos

Após configurar o ambiente, recomendamos:

1. Explorar as diferentes páginas do aplicativo
2. Revisar os componentes principais em `src/components/`
3. Examinar os contextos em `src/contexts/` para entender o gerenciamento de estado
4. Consultar a documentação completa para informações detalhadas

## Suporte

Para dúvidas ou problemas:

- Consulte [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Entre em contato com a equipe de desenvolvimento
- Para usuários do Lovable: support@lovable.dev
