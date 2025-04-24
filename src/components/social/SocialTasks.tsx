import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SocialEmptyState } from "./SocialEmptyState";
import { TaskPriority } from "@/contexts/tasks/types";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MessageSquare, Plus, UserPlus, Users, Kanban, UserCheck, MoreHorizontal } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCollaboration } from "@/contexts/collaboration/CollaborationContext";
import { SharedTask } from "@/contexts/collaboration/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function SocialTasks() {
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { 
    sharedTasks, 
    currentUser,
    createSharedTask,
    updateSharedTask,
    addTaskCollaborator,
    removeTaskCollaborator,
    addComment,
    kanbanBoards
  } = useCollaboration();

  // Criar uma nova tarefa compartilhada
  const handleCreateSharedTask = () => {
    toast({
      title: "Nova tarefa compartilhada",
      description: "Crie uma nova tarefa para colaborar com outros usuários.",
    });
  };
  
  // Wrapper para a função do contexto de colaboração
  const handleNewSharedTask = () => {
    createSharedTask({
      title: "Nova tarefa compartilhada",
      priority: "medium",
      description: "Clique para editar esta tarefa"
    }, []);
  };

  // Convidar colaborador para uma tarefa
  const inviteCollaborator = (taskId: string) => {
    toast({
      title: "Convite para colaborador",
      description: "Selecione pessoas para convidar para esta tarefa.",
    });
  };

  // Entrar na conversa da tarefa
  const joinTaskDiscussion = (taskId: string, taskTitle: string) => {
    toast({
      title: "Conversa da tarefa",
      description: `Entrando na conversa sobre "${taskTitle}".`,
    });
  };

  // Abrir detalhes da tarefa
  const openTaskDetails = (taskId: string) => {
    toast({
      title: "Detalhes da tarefa",
      description: "Visualizando detalhes da tarefa compartilhada.",
    });
  };

  // Calcular status com base na task
  const getTaskStatus = (task: SharedTask) => {
    if (task.completed) return "completed";
    if (task.columnId === "review") return "review";
    if (task.columnId === "inProgress") return "inProgress";
    return "todo";
  };
  
  // Renderizar o status da tarefa
  const renderTaskStatus = (task: SharedTask) => {
    const status = getTaskStatus(task);
    switch (status) {
      case "todo":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">A Fazer</Badge>;
      case "inProgress":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Em Andamento</Badge>;
      case "review":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">Em Revisão</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Concluída</Badge>;
      default:
        return null;
    }
  };

  // Renderizar a prioridade da tarefa
  const renderPriority = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Alta</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Média</Badge>;
      case "low":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Baixa</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tarefas Compartilhadas</h3>
        
        <div>
          {sharedTasks.length > 0 && (
            <Button
              onClick={handleNewSharedTask}
              className="space-x-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Tarefa</span>
            </Button>
          )}
        </div>
      </div>

      {sharedTasks.length === 0 ? (
        <SocialEmptyState
          title="Sem tarefas compartilhadas"
          description="Colabore com outros usuários criando e compartilhando tarefas."
          buttonText="Criar Tarefa Compartilhada"
          onAction={handleNewSharedTask}
          icon={<Users className="h-12 w-12 text-muted-foreground" />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sharedTasks.map((task) => (
            <Card key={task.id} onClick={() => openTaskDetails(task.id)} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base truncate" title={task.title}>
                    {task.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    {renderTaskStatus(task)}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {task.lastActivity ? 
                          formatDistanceToNow(task.lastActivity, { addSuffix: true, locale: ptBR }) : 
                          "Sem atividade recente"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  {renderTaskStatus(task)}
                
                  <div>
                    {renderPriority(task.priority)}
                  </div>
                </div>
                
                {task.description && !isMobile && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {task.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progresso</span>
                      <span>{task.completed ? 100 : 50}%</span>
                    </div>
                    <Progress value={task.completed ? 100 : 50} className="h-2" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {task.tags && task.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        Vence em {format(task.dueDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  {task.lastActivity && (
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        Atualizado {formatDistanceToNow(task.lastActivity, { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {task.collaborators.slice(0, 3).map((collaborator, index) => (
                        <Avatar key={index} className="border-2 border-background h-8 w-8 relative">
                          {collaborator.avatar ? (
                            <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {collaborator.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          )}
                          
                          {collaborator.role === "owner" && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                              <UserCheck className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </Avatar>
                      ))}
                      
                      {task.collaborators.length > 3 && (
                        <Avatar className="border-2 border-background h-8 w-8">
                          <AvatarFallback className="bg-muted text-xs">
                            +{task.collaborators.length - 3}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{task.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    inviteCollaborator(task.id);
                  }}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Convidar</span>
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    joinTaskDiscussion(task.id, task.title);
                  }}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Conversar</span>
                </Button>
                
                {/* Menu de opções adicionais */}
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem
                        onClick={() => {
                          // Verificar se tem algum quadro Kanban associado
                          const associatedBoard = kanbanBoards.find(board => 
                            board.collaborators.some(collab => 
                              task.collaborators.some(taskCollab => 
                                taskCollab.userId === collab.userId
                              )
                            )
                          );
                          
                          if (associatedBoard) {
                            toast({
                              title: "Abrir no Kanban",
                              description: `Abrindo tarefa no quadro ${associatedBoard.title}`,
                            });
                          } else {
                            toast({
                              title: "Quadro não encontrado",
                              description: "Crie um quadro Kanban para esta equipe primeiro.",
                            });
                          }
                        }}
                      >
                        <Kanban className="mr-2 h-4 w-4" />
                        Ver no Kanban
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
