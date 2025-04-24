import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, ChevronRight, ChevronLeft, Maximize2, Minimize2, ThumbsUp, ThumbsDown, Copy, Save, Circle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useLeyaltAI } from '@/contexts/LeyaltAIContext';
import { useNotes } from '@/contexts/NotesContext';
import { useTranscription } from '@/contexts/TranscriptionContext';
import { ApiStatus } from '../leyalt/ApiStatus';
import { EnhancedChatMessages } from '../leyalt/chatbot/EnhancedChatMessages';
import { EnhancedChatInput } from '../leyalt/chatbot/EnhancedChatInput';
import { QuickCommands } from '../leyalt/chatbot/QuickCommands';
import { SaveToNoteModal } from '../leyalt/chatbot/SaveToNoteModal';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AuroraButton } from '@/components/ui/aurora-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UnifiedAssistantProps {
  /**
   * @deprecated Use detecção automática em vez de prop - mantido para compatibilidade
   */
  isIntegrated?: boolean;
  /**
   * ID da nota quando na página de detalhes da nota
   */
  noteId?: string;
  /**
   * Define se o assistente deve iniciar aberto
   */
  defaultOpen?: boolean;
}

/**
 * Assistente unificado - único componente de assistente para toda a aplicação
 * Detecta automaticamente o contexto atual e adapta sua aparência e comportamento
 */
export function UnifiedAssistant({ 
  isIntegrated = false, // Mantido para compatibilidade
  noteId,
  defaultOpen = false
}: UnifiedAssistantProps) {
  // Detectar o contexto atual
  const location = useLocation();
  const isMobile = useIsMobile();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  
  // Detectar automaticamente se estamos na página de notas
  const isNotePage = location.pathname.includes('/notes/') || Boolean(noteId);
  const isSettingsPage = location.pathname.includes('/settings');
  const isKanbanPage = location.pathname.includes('/kanban');
  
  // Controles e estado do chat
  const {
    messages,
    addMessage,
    isLoading,
    createNoteFromMessages,
    processingState,
    isChatOpen,
    openChat,
    closeChat,
    toggleChat,
  } = useLeyaltAI();
  
  // Contextos
  const { currentTranscription, getTranscriptionForAI } = useTranscription();
  const { getNoteById, updateNote } = useNotes();
  
  // Estado para controlar a visibilidade do assistente (unificado com o contexto)
  const [isVisible, setIsVisible] = useState(defaultOpen || isChatOpen);
  
  // Estado para controlar se o assistente está expandido ou não
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sincronizar o estado local com o contexto global
  useEffect(() => {
    setIsVisible(isChatOpen);
  }, [isChatOpen]);
  
  // Efeito para abrir o chat se defaultOpen for true
  useEffect(() => {
    if (defaultOpen && !isChatOpen) {
      openChat();
    }
  }, [defaultOpen]);
  
  // Função para adicionar conteúdo a uma nota existente
  const appendToNote = async (noteId: string, messageIds: string[]) => {
    try {
      // Obter a nota existente
      const note = getNoteById(noteId);
      
      if (!note) {
        return { 
          success: false, 
          error: "Nota não encontrada", 
          message: "Nota não encontrada" 
        };
      }
      
      // Filtrar apenas as mensagens selecionadas
      const selectedMessages = messageIds.length > 0 
        ? messages.filter(msg => messageIds.includes(msg.id))
        : messages.filter(msg => msg.id !== "welcome");
      
      if (selectedMessages.length === 0) {
        return { 
          success: false, 
          error: "Nenhuma mensagem selecionada", 
          message: "Nenhuma mensagem selecionada" 
        };
      }
      
      // Criar conteúdo formatado a partir das mensagens
      const newContent = selectedMessages.map(msg => {
        const role = msg.role === "assistant" ? "Ghost Assistant" : "Você";
        return `**${role}**: ${msg.content}\n\n`;
      }).join("");
      
      // Adicionar o novo conteúdo à nota existente
      const updatedContent = note.content + "\n\n" + newContent;
      
      // Atualizar a nota
      updateNote(noteId, { 
        content: updatedContent,
        updatedAt: new Date()
      });
      
      return { 
        success: true, 
        data: note, 
        message: "Conteúdo adicionado à nota com sucesso" 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Erro ao adicionar conteúdo à nota:", errorMessage);
      return { 
        success: false, 
        error: errorMessage, 
        message: `Erro ao atualizar nota: ${errorMessage}` 
      };
    }
  };

  const [input, setInput] = useState("");
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [showCreateNoteInput, setShowCreateNoteInput] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Função para lidar com submissão de mensagem
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Adicionar transcrição atual ao contexto se disponível
      // Verificar se é um objeto com propriedade text ou uma string
      let transcriptionText = '';
      
      if (currentTranscription !== null) {
        if (typeof currentTranscription === 'object' && currentTranscription !== null && 'text' in currentTranscription) {
          transcriptionText = currentTranscription.text;
        } else if (currentTranscription !== null) {
          transcriptionText = String(currentTranscription);
        }
      }
      
      const transcriptionContext = transcriptionText 
        ? `\n\nContexto da transcrição: ${transcriptionText}` 
        : '';
        
      addMessage({
        role: "user",
        content: input.trim() + transcriptionContext
      });
      
      setInput("");
    }
  };

  // Função para lidar com clique de seleção em uma mensagem
  const toggleMessageSelection = (messageId: string) => {
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(selectedMessages.filter(id => id !== messageId));
    } else {
      setSelectedMessages([...selectedMessages, messageId]);
    }
  };

  // Função para criar nota das mensagens selecionadas
  const handleCreateNote = async () => {
    try {
      const title = noteTitle.trim() || `Conversa com Ghost Assistant - ${new Date().toLocaleString('pt-BR')}`;
      
      const result = await createNoteFromMessages(selectedMessages, title);
      
      if (result.success) {
        toast({
          title: "Nota criada",
          description: "Nota criada com sucesso a partir das mensagens"
        });
        // Resetar estado após criar a nota
        setSelectedMessages([]);
        setShowCreateNoteInput(false);
        setNoteTitle("");
      } else {
        toast({
          title: "Erro ao criar nota",
          description: result.message || "Ocorreu um erro ao criar a nota",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Erro ao criar nota:", errorMessage);
      toast({
        title: "Erro ao criar nota",
        description: "Ocorreu um erro ao criar a nota",
        variant: "destructive"
      });
    }
  };

  // Funções para lidar com a modal de criação de nota
  const handleCancelNoteCreation = () => {
    setShowCreateNoteInput(false);
    setNoteTitle("");
  };

  const handleShowCreateNoteInput = () => {
    setShowCreateNoteInput(true);
  };

  // Função para alternar a visibilidade do assistente (sincronizada com o contexto)
  const toggleVisibility = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    
    // Sincronizar com o contexto
    if (newState) {
      openChat();
    } else {
      closeChat();
    }
  };

  // Função para alternar o tamanho do assistente
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Função para copiar a última resposta do assistente
  const copyLastResponse = () => {
    // Obter a última mensagem do assistente
    const assistantMessages = messages.filter(msg => msg.role === "assistant");
    
    if (assistantMessages.length === 0) {
      toast({
        title: "Nenhuma resposta para copiar",
        description: "O assistente ainda não enviou nenhuma resposta",
        variant: "destructive"
      });
      return;
    }
    
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
    
    // Copiar para a área de transferência
    try {
      navigator.clipboard.writeText(lastAssistantMessage.content);
      toast({
        title: "Resposta copiada",
        description: "Resposta copiada para a área de transferência"
      });
    } catch (err) {
      console.error("Erro ao copiar resposta:", err);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a resposta",
        variant: "destructive"
      });
    }
  };

  // Função para avaliar a resposta (feedback)
  const provideFeedback = (isPositive: boolean) => {
    toast({
      title: isPositive ? "Feedback positivo enviado" : "Feedback negativo enviado",
      description: "Obrigado pelo seu feedback! Isso nos ajuda a melhorar"
    });
    
    // Aqui poderia ter uma integração com analytics ou backend
  };

  // Determinar o layout com base no contexto atual
  const isIntegratedLayout = isIntegrated || isNotePage;
  const shouldRenderAsPanel = isNotePage && !isSmallScreen;
  const shouldRenderAsFloating = !shouldRenderAsPanel;

  // Se for página de configurações, não renderizar o assistente
  if (isSettingsPage) {
    return null;
  }

  // Layout como painel integrado (versão nota)
  if (shouldRenderAsPanel) {
    return (
      <div className="flex flex-col h-full border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 w-full">
        <div className="flex flex-col h-full">
          {/* Cabeçalho */}
          <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold">Ghost Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedMessages.length > 0 && (
                <button 
                  onClick={() => {
                    if (noteId) {
                      appendToNote(noteId, selectedMessages)
                      .then(result => {
                        if (result.success) {
                          toast({
                            title: "Conteúdo adicionado",
                            description: result.message
                          });
                          setSelectedMessages([]);
                        } else {
                          toast({
                            title: "Erro ao adicionar conteúdo",
                            description: result.message,
                            variant: "destructive"
                          });
                        }
                      });
                    }
                  }}
                  className="hover:bg-white/20 rounded-full p-1 flex items-center gap-1 text-xs"
                  title="Adicionar à nota atual"
                >
                  <span>Adicionar {selectedMessages.length} mensagens</span>
                </button>
              )}
            </div>
          </div>

          {/* Status da API */}
          <div className="px-4 pt-2">
            <ApiStatus />
          </div>

          {/* Área do chat */}
          <EnhancedChatMessages 
            messages={messages}
            selectedMessages={selectedMessages}
            toggleMessageSelection={toggleMessageSelection}
            isLoading={isLoading}
            processingState={processingState}
            showSelectionActions={true}
            onCopy={() => copyLastResponse()}
            onFeedback={(isPositive) => provideFeedback(isPositive)}
          />

          {/* Modal para salvar conversa em nota */}
          <SaveToNoteModal
            showModal={showCreateNoteInput}
            selectedMessages={selectedMessages}
            noteTitle={noteTitle}
            onCancel={handleCancelNoteCreation}
            onCreateNote={handleCreateNote}
            onAppendToNote={(noteId) => {
              appendToNote(noteId, selectedMessages)
                .then(result => {
                  if (result.success) {
                    toast({
                      title: "Conteúdo adicionado",
                      description: result.message
                    });
                    setSelectedMessages([]);
                    setShowCreateNoteInput(false);
                  } else {
                    toast({
                      title: "Erro ao adicionar conteúdo",
                      description: result.message,
                      variant: "destructive"
                    });
                  }
                })
                .catch(error => {
                  toast({
                    title: "Erro ao adicionar conteúdo",
                    description: "Ocorreu um erro ao tentar adicionar o conteúdo à nota.",
                    variant: "destructive"
                  });
                });
            }}
          />

          {/* Comandos rápidos (apenas para mobile) */}
          {isMobile && (
            <QuickCommands
              onExecuteCommand={(command) => {
                if (typeof command === 'function') {
                  command();
                } else {
                  setInput(command);
                  inputRef.current?.focus();
                }
              }}
              onShowCreateNoteInput={handleShowCreateNoteInput}
            />
          )}

          {/* Área de entrada */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
            <EnhancedChatInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              processingState={processingState}
              inputRef={inputRef}
              placeholder={currentTranscription != null ? "Pergunte sobre esta transcrição..." : "Digite sua mensagem..."}
            />
            
            {currentTranscription != null && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                <p className="font-medium">Transcrição ativa disponível para consulta</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Layout flutuante (default)
  return (
    <>
      {/* Botão flutuante para abrir o assistente (visível apenas quando o assistente está fechado) */}
      {!isVisible && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "fixed z-10",
                isKanbanPage ? "bottom-24 right-4" : "bottom-4 right-4"
              )}>
                <AuroraButton
                  onClick={toggleVisibility}
                  className="flex items-center gap-2 px-4 py-2"
                  glowClassName="opacity-90 from-blue-500 via-indigo-400 to-purple-500"
                >
                  <Bot size={18} />
                  <span className={isMobile ? "hidden" : "inline"}>Ghost Assistant</span>
                </AuroraButton>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir Ghost Assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Versão mobile do assistente */}
      {isVisible && isMobile && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-200 ease-in-out shadow-xl overflow-hidden",
            "w-full h-[70vh] bottom-0 right-0 rounded-t-lg rounded-b-none",
            "flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800"
          )}
        >
          {/* Cabeçalho do assistente */}
          <div className="bg-blue-600 text-white p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-medium text-sm">Ghost Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:bg-blue-700 rounded-full"
                onClick={toggleVisibility}
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          <div className="flex-grow overflow-hidden flex flex-col h-full">
            {/* Status da API */}
            <div className="px-4 pt-2">
              <ApiStatus />
            </div>

            {/* Mensagens do chat */}
            <EnhancedChatMessages 
              messages={messages}
              selectedMessages={selectedMessages}
              toggleMessageSelection={toggleMessageSelection}
              isLoading={isLoading}
              processingState={processingState}
              showSelectionActions={true}
              onCopy={() => copyLastResponse()}
              onFeedback={(isPositive) => provideFeedback(isPositive)}
            />

            {/* Comandos rápidos (apenas para mobile) */}
            <QuickCommands
              onExecuteCommand={(command) => {
                if (typeof command === 'function') {
                  command();
                } else {
                  setInput(command);
                  inputRef.current?.focus();
                }
              }}
              onShowCreateNoteInput={handleShowCreateNoteInput}
            />

            {/* Área de entrada responsiva */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
              <EnhancedChatInput
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                processingState={processingState}
                inputRef={inputRef}
                placeholder={currentTranscription !== null ? "Pergunte sobre esta transcrição..." : "Digite sua mensagem..."}
              />
              
              {currentTranscription !== null && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  <p className="font-medium">Transcrição ativa disponível para consulta</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Versão desktop normal do assistente */}
      {isVisible && !isMobile && !isExpanded && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-200 ease-in-out",
            "w-96 h-[calc(100vh-4rem)] top-16 right-0 border-l border-t-0 border-r-0 border-b-0",
            "flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800",
            "shadow-md"
          )}
        >
          {/* Cabeçalho do assistente */}
          <div className="bg-blue-600 text-white p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={16} />
              <span className="font-medium text-sm">Ghost Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:bg-blue-700 rounded-full"
                onClick={toggleExpanded}
              >
                <Maximize2 size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:bg-blue-700 rounded-full"
                onClick={toggleVisibility}
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          <div className="flex-grow overflow-hidden flex flex-col h-full">
            {/* Status da API */}
            <div className="px-4 pt-2">
              <ApiStatus />
            </div>

            {/* Mensagens do chat */}
            <EnhancedChatMessages 
              messages={messages}
              selectedMessages={selectedMessages}
              toggleMessageSelection={toggleMessageSelection}
              isLoading={isLoading}
              processingState={processingState}
              showSelectionActions={true}
              onCopy={() => copyLastResponse()}
              onFeedback={(isPositive) => provideFeedback(isPositive)}
            />

            {/* Modal para salvar conversa em nota */}
            <SaveToNoteModal
              showModal={showCreateNoteInput}
              selectedMessages={selectedMessages}
              noteTitle={noteTitle}
              onCancel={handleCancelNoteCreation}
              onCreateNote={handleCreateNote}
              onAppendToNote={(noteId) => {
                appendToNote(noteId, selectedMessages)
                  .then(result => {
                    if (result.success) {
                      toast({
                        title: "Conteúdo adicionado",
                        description: result.message
                      });
                      // Resetar estado após adicionar à nota
                      setSelectedMessages([]);
                      setShowCreateNoteInput(false);
                    } else {
                      toast({
                        title: "Erro ao adicionar conteúdo",
                        description: result.message,
                        variant: "destructive"
                      });
                    }
                  })
                  .catch(error => {
                    toast({
                      title: "Erro ao adicionar conteúdo",
                      description: "Ocorreu um erro ao tentar adicionar o conteúdo à nota.",
                      variant: "destructive"
                    });
                  });
              }}
            />

            {/* Área de entrada responsiva */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
              <EnhancedChatInput
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                processingState={processingState}
                inputRef={inputRef}
                placeholder={currentTranscription !== null ? "Pergunte sobre esta transcrição..." : "Digite sua mensagem..."}
              />
              
              {currentTranscription !== null && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  <p className="font-medium">Transcrição ativa disponível para consulta</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Versão expandida do assistente (desktop) */}
      {isVisible && !isMobile && isExpanded && (
        <div
          className={cn(
            "fixed z-50 transition-all duration-200 ease-in-out shadow-xl",
            "w-5/6 h-5/6 bottom-[10%] right-[10%] rounded-lg",
            "flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800"
          )}
        >
          {/* Cabeçalho do assistente */}
          <div className="bg-blue-600 text-white p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={16} />
              <span className="font-medium text-sm">Ghost Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:bg-blue-700 rounded-full"
                onClick={toggleExpanded}
              >
                <Minimize2 size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-white hover:bg-blue-700 rounded-full"
                onClick={toggleVisibility}
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          <div className="flex-grow overflow-hidden flex flex-col h-full">
            {/* Status da API */}
            <div className="px-4 pt-2">
              <ApiStatus />
            </div>

            {/* Mensagens do chat */}
            <EnhancedChatMessages 
              messages={messages}
              selectedMessages={selectedMessages}
              toggleMessageSelection={toggleMessageSelection}
              isLoading={isLoading}
              processingState={processingState}
              showSelectionActions={true}
              onCopy={() => copyLastResponse()}
              onFeedback={(isPositive) => provideFeedback(isPositive)}
            />

            {/* Modal para salvar conversa em nota */}
            <SaveToNoteModal
              showModal={showCreateNoteInput}
              selectedMessages={selectedMessages}
              noteTitle={noteTitle}
              onCancel={handleCancelNoteCreation}
              onCreateNote={handleCreateNote}
              onAppendToNote={(noteId) => {
                appendToNote(noteId, selectedMessages)
                  .then(result => {
                    if (result.success) {
                      toast({
                        title: "Conteúdo adicionado",
                        description: result.message
                      });
                      // Resetar estado após adicionar à nota
                      setSelectedMessages([]);
                      setShowCreateNoteInput(false);
                    } else {
                      toast({
                        title: "Erro ao adicionar conteúdo",
                        description: result.message,
                        variant: "destructive"
                      });
                    }
                  })
                  .catch(error => {
                    toast({
                      title: "Erro ao adicionar conteúdo",
                      description: "Ocorreu um erro ao tentar adicionar o conteúdo à nota.",
                      variant: "destructive"
                    });
                  });
              }}
            />

            {/* Área de entrada responsiva */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
              <EnhancedChatInput
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                processingState={processingState}
                inputRef={inputRef}
                placeholder={currentTranscription !== null ? "Pergunte sobre esta transcrição..." : "Digite sua mensagem..."}
              />
              
              {currentTranscription !== null && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  <p className="font-medium">Transcrição ativa disponível para consulta</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
