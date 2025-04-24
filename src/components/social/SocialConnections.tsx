import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  UserPlus, 
  Search, 
  Users, 
  Calendar, 
  X,
  Clock,
  Kanban,
  LayoutGrid,
  RotateCcw,
  ListTodo
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCollaboration } from "@/contexts/collaboration/CollaborationContext";
import { User } from "@/contexts/collaboration/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SocialConnections() {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { toast } = useToast();
  
  // Acessar o contexto de colaboração
  const { 
    currentUser, 
    connections, 
    sendConnectionRequest,
    updateUserStatus,
    getSuggestedCollaborators,
    kanbanBoards,
    sharedTasks,
    createKanbanBoard,
    createSharedTask
  } = useCollaboration();
  
  // Estados locais
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inviteType, setInviteType] = useState<"kanban" | "task">("kanban");
  const [newBoardTitle, setNewBoardTitle] = useState("");
  
  // Obter usuários conectados ao usuário atual
  const connectedUsers = getSuggestedCollaborators();
  
  // Filtrar usuários com base na pesquisa
  const filteredUsers = connectedUsers.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    (user.tags && user.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))) ||
    (user.skills && user.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase())))
  );
  
  // Função para adicionar uma nova conexão
  const addConnection = () => {
    setIsAddDialogOpen(true);
  };
  
  // Função para enviar solicitação de conexão
  const handleSendRequest = (userId: string) => {
    sendConnectionRequest(userId);
    setIsAddDialogOpen(false);
  };
  
  // Função para mudar status do usuário
  const changeUserStatus = (status: "online" | "offline" | "away") => {
    updateUserStatus(status);
  };

  // Função para remover uma conexão
  const removeConnection = (id: string) => {
    toast({
      title: "Conexão removida",
      description: "O usuário foi removido das suas conexões.",
    });
  };

  // Função para iniciar uma conversa
  const startConversation = (name: string) => {
    toast({
      title: "Chat iniciado",
      description: `Iniciando conversa com ${name}.`,
    });
  };

  // Função para enviar convite para colaboração em tarefas/kanban
  const sendCollaborationInvite = (userId: string) => {
    setSelectedUserId(userId);
    setIsInviteDialogOpen(true);
  };
  
  // Função para criar um quadro Kanban compartilhado
  const handleCreateSharedBoard = () => {
    if (!newBoardTitle || !selectedUserId) return;
    
    createKanbanBoard(newBoardTitle, [selectedUserId]);
    setIsInviteDialogOpen(false);
    setNewBoardTitle("");
    
    toast({
      title: "Quadro Kanban criado",
      description: "Um novo quadro compartilhado foi criado com sucesso.",
    });
  };
  
  // Função para criar uma tarefa compartilhada
  const handleCreateSharedTask = () => {
    if (!newBoardTitle || !selectedUserId) return;
    
    createSharedTask({
      title: newBoardTitle,
      priority: "medium"
    }, [selectedUserId]);
    
    setIsInviteDialogOpen(false);
    setNewBoardTitle("");
    
    toast({
      title: "Tarefa compartilhada criada",
      description: "Uma nova tarefa compartilhada foi criada com sucesso.",
    });
  };

  // Renderizar o status do usuário
  const renderStatus = (user: User) => {
    const lastActiveText = user.lastActive 
      ? formatDistanceToNow(user.lastActive, { addSuffix: true, locale: ptBR })
      : "";
      
    switch (user.status) {
      case "online":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Online</Badge>;
      case "away":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">{lastActiveText || "Ausente"}</Badge>;
      case "offline":
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">{lastActiveText || "Offline"}</Badge>;
      default:
        return null;
    }
  };
  
  // Renderizar estatísticas de colaboração
  const renderCollaborationStats = (userId: string) => {
    // Contar quadros Kanban compartilhados
    const sharedBoards = kanbanBoards.filter(board =>
      board.collaborators.some(collab => collab.userId === userId)
    ).length;
    
    // Contar tarefas compartilhadas
    const taskCount = sharedTasks.filter(task =>
      task.collaborators.some(collab => collab.userId === userId)
    ).length;
    
    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-1">
          <Kanban className="h-3 w-3" />
          <span>{sharedBoards} quadros</span>
        </div>
        <div className="flex items-center gap-1">
          <ListTodo className="h-3 w-3" />
          <span>{taskCount} tarefas</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status do usuário atual */}
      {currentUser && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  {currentUser.avatar ? (
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  ) : (
                    <AvatarFallback>
                      {currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-medium">{currentUser.name}</h3>
                  {renderStatus(currentUser)}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant={currentUser.status === "online" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => changeUserStatus("online")}
                  className="flex items-center gap-1"
                >
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className={isMobile ? "sr-only" : ""}>Online</span>
                </Button>
                
                <Button 
                  variant={currentUser.status === "away" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => changeUserStatus("away")}
                  className="flex items-center gap-1"
                >
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className={isMobile ? "sr-only" : ""}>Ausente</span>
                </Button>
                
                <Button 
                  variant={currentUser.status === "offline" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => changeUserStatus("offline")}
                  className="flex items-center gap-1"
                >
                  <div className="h-2 w-2 rounded-full bg-gray-500" />
                  <span className={isMobile ? "sr-only" : ""}>Offline</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Barra de pesquisa e botão para adicionar conexão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar conexões..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={addConnection} 
          className="flex items-center gap-2 sm:w-auto w-full"
        >
          <UserPlus className="h-4 w-4" />
          <span>Adicionar Conexão</span>
        </Button>
      </div>

      {/* Lista de conexões */}
      {filteredUsers.length === 0 ? (
        <div className="text-center p-6 border rounded-lg">
          <p className="text-muted-foreground">Nenhuma conexão encontrada para "{search}"</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback>
                        {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    {renderStatus(user)}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeConnection(user.id)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent>
                {/* Habilidades e Tags */}
                <div className="space-y-2">
                  {user.skills && user.skills.length > 0 && (
                    <div>
                      <h4 className="text-xs text-muted-foreground mb-1">Habilidades</h4>
                      <div className="flex flex-wrap gap-1">
                        {user.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {user.tags && user.tags.length > 0 && (
                    <div>
                      <h4 className="text-xs text-muted-foreground mb-1">Áreas</h4>
                      <div className="flex flex-wrap gap-1">
                        {user.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Estatísticas de colaboração */}
                  {renderCollaborationStats(user.id)}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => startConversation(user.name)}
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className={isMobile ? "sr-only" : ""}>Conversar</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => sendCollaborationInvite(user.id)}
                  className="flex items-center gap-1"
                >
                  <Kanban className="h-3.5 w-3.5" />
                  <span className={isMobile ? "sr-only" : ""}>Colaborar</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Dialog para adicionar conexão */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Conexão</DialogTitle>
            <DialogDescription>
              Pesquise por usuários para adicionar às suas conexões.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar usuários..."
                className="pl-10"
              />
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {/* Lista de usuários mockados que podem ser adicionados */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Usuário {i}</p>
                      <p className="text-xs text-muted-foreground">usuário{i}@exemplo.com</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleSendRequest(`mock-user-${i}`)}
                  >
                    Adicionar
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para convidar para colaboração */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar para Colaboração</DialogTitle>
            <DialogDescription>
              Escolha como deseja colaborar com este usuário.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="kanban" onValueChange={(value) => setInviteType(value as "kanban" | "task")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kanban">
                <Kanban className="h-4 w-4 mr-2" /> 
                Quadro Kanban
              </TabsTrigger>
              <TabsTrigger value="task">
                <ListTodo className="h-4 w-4 mr-2" /> 
                Tarefa
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="kanban" className="space-y-4 py-4">
              <Input
                placeholder="Digite o título do quadro..."
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
              />
              
              <p className="text-sm text-muted-foreground">
                Isso criará um novo quadro Kanban compartilhado onde vocês poderão colaborar em tarefas.
              </p>
            </TabsContent>
            
            <TabsContent value="task" className="space-y-4 py-4">
              <Input
                placeholder="Digite o título da tarefa..."
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
              />
              
              <p className="text-sm text-muted-foreground">
                Isso criará uma nova tarefa compartilhada que vocês poderão editar juntos.
              </p>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={inviteType === "kanban" ? handleCreateSharedBoard : handleCreateSharedTask}
              disabled={!newBoardTitle}
            >
              Criar e Convidar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
