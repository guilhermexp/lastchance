import { createContext, useContext, useState, ReactNode } from "react";
import {
  User,
  Connection,
  Invitation,
  SharedTask,
  KanbanBoard,
  UserStatus,
  CollaborationContextType
} from "./types";
import { Task } from "../tasks/types";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

// Dados mockados para desenvolvimento
const mockCurrentUser: User = {
  id: "user-current",
  name: "Você",
  status: "online",
  tags: ["desenvolvimento", "frontend", "react"],
  skills: ["typescript", "react", "tailwind", "nextjs"]
};

const mockConnections: Connection[] = [
  {
    id: "connection-1",
    userId: "user-current",
    connectedUserId: "user-1",
    status: "accepted",
    createdAt: new Date(2025, 3, 15)
  },
  {
    id: "connection-2",
    userId: "user-current",
    connectedUserId: "user-2",
    status: "accepted",
    createdAt: new Date(2025, 3, 10)
  }
];

const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Ana Silva",
    avatar: "/avatars/ana.png",
    status: "online",
    tags: ["design", "projetos"],
    skills: ["figma", "ux", "prototyping"]
  },
  {
    id: "user-2",
    name: "Carlos Mendes",
    status: "offline",
    lastActive: new Date(2025, 4, 1, 15, 30),
    tags: ["desenvolvimento", "frontend"],
    skills: ["javascript", "react", "css"]
  },
  {
    id: "user-3",
    name: "Mariana Costa",
    avatar: "/avatars/mariana.png",
    status: "away",
    lastActive: new Date(2025, 4, 1, 18, 0),
    tags: ["marketing", "análise"],
    skills: ["analytics", "seo", "content"]
  }
];

const mockInvitations: Invitation[] = [
  {
    id: "invitation-1",
    type: "connection",
    senderId: "user-3",
    senderName: "Mariana Costa",
    senderAvatar: "/avatars/mariana.png",
    message: "Olá! Gostaria de conectar para discutir o projeto de marketing.",
    createdAt: new Date(2025, 4, 1)
  },
  {
    id: "invitation-2",
    type: "task",
    senderId: "user-1",
    senderName: "Ana Silva",
    senderAvatar: "/avatars/ana.png",
    targetId: "task-1",
    targetTitle: "Revisão de wireframes",
    message: "Pode me ajudar na revisão destes wireframes?",
    createdAt: new Date(2025, 4, 2)
  }
];

// Valores padrão para o contexto
const defaultContextValue: CollaborationContextType = {
  currentUser: null,
  connections: [],
  pendingInvitations: [],
  updateUserStatus: () => {},
  sendConnectionRequest: async () => {},
  acceptInvitation: async () => {},
  rejectInvitation: async () => {},
  sharedTasks: [],
  createSharedTask: async () => {},
  updateSharedTask: async () => {},
  addTaskCollaborator: async () => {},
  removeTaskCollaborator: async () => {},
  kanbanBoards: [],
  createKanbanBoard: async () => {},
  updateKanbanBoard: async () => {},
  addKanbanCollaborator: async () => {},
  removeKanbanCollaborator: async () => {},
  addComment: async () => {},
  deleteComment: async () => {},
  getSuggestedCollaborators: () => []
};

// Criar o contexto
const CollaborationContext = createContext<CollaborationContextType>(defaultContextValue);

// Hook personalizado para usar o contexto
export const useCollaboration = () => useContext(CollaborationContext);

interface CollaborationProviderProps {
  children: ReactNode;
}

export function CollaborationProvider({ children }: CollaborationProviderProps) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(mockCurrentUser);
  const [users] = useState<User[]>(mockUsers);
  const [connections, setConnections] = useState<Connection[]>(mockConnections);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>(mockInvitations);
  const [sharedTasks, setSharedTasks] = useState<SharedTask[]>([]);
  const [kanbanBoards, setKanbanBoards] = useState<KanbanBoard[]>([]);

  // Atualizar status do usuário
  const updateUserStatus = (status: UserStatus) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        status,
        lastActive: status !== "online" ? new Date() : undefined
      });
      
      toast({
        title: "Status atualizado",
        description: `Seu status foi alterado para ${
          status === "online" ? "Online" : 
          status === "away" ? "Ausente" : "Offline"
        }`,
      });
    }
  };

  // Enviar solicitação de conexão
  const sendConnectionRequest = async (userId: string) => {
    // Simulação de requisição
    const targetUser = users.find(user => user.id === userId);
    
    if (!targetUser || !currentUser) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se já existe uma conexão
    const existingConnection = connections.find(
      conn => 
        (conn.userId === currentUser.id && conn.connectedUserId === userId) ||
        (conn.userId === userId && conn.connectedUserId === currentUser.id)
    );
    
    if (existingConnection) {
      toast({
        title: "Conexão existente",
        description: `Você já possui uma conexão com ${targetUser.name}`,
      });
      return;
    }
    
    // Criar nova solicitação
    const newInvitation: Invitation = {
      id: uuidv4(),
      type: "connection",
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      message: `Olá ${targetUser.name}, gostaria de conectar!`,
      createdAt: new Date()
    };
    
    // Em um cenário real, enviaria para a API
    // Mas aqui simulamos que já foi aceito automaticamente
    const newConnection: Connection = {
      id: uuidv4(),
      userId: currentUser.id,
      connectedUserId: userId,
      status: "accepted",
      createdAt: new Date()
    };
    
    setConnections([...connections, newConnection]);
    
    toast({
      title: "Solicitação enviada",
      description: `Solicitação enviada para ${targetUser.name}`,
    });
  };

  // Aceitar convite
  const acceptInvitation = async (invitationId: string) => {
    const invitation = pendingInvitations.find(inv => inv.id === invitationId);
    
    if (!invitation || !currentUser) {
      toast({
        title: "Erro",
        description: "Convite não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    if (invitation.type === "connection") {
      // Criar nova conexão
      const newConnection: Connection = {
        id: uuidv4(),
        userId: currentUser.id,
        connectedUserId: invitation.senderId,
        status: "accepted",
        createdAt: new Date()
      };
      
      setConnections([...connections, newConnection]);
    }
    
    // Remover o convite
    setPendingInvitations(pendingInvitations.filter(inv => inv.id !== invitationId));
    
    toast({
      title: "Convite aceito",
      description: `Você aceitou o convite de ${invitation.senderName}`,
    });
  };

  // Rejeitar convite
  const rejectInvitation = async (invitationId: string) => {
    const invitation = pendingInvitations.find(inv => inv.id === invitationId);
    
    if (!invitation) {
      toast({
        title: "Erro",
        description: "Convite não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    // Remover o convite
    setPendingInvitations(pendingInvitations.filter(inv => inv.id !== invitationId));
    
    toast({
      title: "Convite rejeitado",
      description: `Você rejeitou o convite de ${invitation.senderName}`,
    });
  };

  // Criar tarefa compartilhada
  const createSharedTask = async (taskData: Partial<Task>, collaboratorIds: string[]) => {
    if (!currentUser) return;
    
    // Buscar informações dos colaboradores
    const taskCollaborators = collaboratorIds
      .map(id => {
        const user = users.find(u => u.id === id);
        if (!user) return null;
        
        return {
          userId: user.id,
          name: user.name,
          avatar: user.avatar,
          role: "editor" as "owner" | "editor" | "viewer",
          joinedAt: new Date()
        };
      })
      .filter(Boolean) as Array<{
        userId: string;
        name: string;
        avatar?: string;
        role: "owner" | "editor" | "viewer";
        joinedAt: Date;
      }>;
    
    // Adicionar o usuário atual como proprietário
    taskCollaborators.unshift({
      userId: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      role: "owner" as "owner" | "editor" | "viewer",
      joinedAt: new Date()
    });
    
    const newSharedTask: SharedTask = {
      id: uuidv4(),
      title: taskData.title || "Nova tarefa",
      description: taskData.description || "",
      completed: false,
      priority: taskData.priority || "medium",
      dueDate: taskData.dueDate,
      tags: taskData.tags || [],
      collaborators: taskCollaborators,
      isPublic: true,
      commentsCount: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setSharedTasks([...sharedTasks, newSharedTask]);
    
    toast({
      title: "Tarefa criada",
      description: "A tarefa compartilhada foi criada com sucesso",
    });
  };

  // Atualizar tarefa compartilhada
  const updateSharedTask = async (taskId: string, updates: Partial<SharedTask>) => {
    setSharedTasks(
      sharedTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date() } 
          : task
      )
    );
    
    toast({
      title: "Tarefa atualizada",
      description: "A tarefa compartilhada foi atualizada com sucesso",
    });
  };

  // Adicionar colaborador à tarefa
  const addTaskCollaborator = async (taskId: string, userId: string, role: "editor" | "viewer" = "editor") => {
    const targetUser = users.find(user => user.id === userId);
    const targetTask = sharedTasks.find(task => task.id === taskId);
    
    if (!targetUser || !targetTask) {
      toast({
        title: "Erro",
        description: "Usuário ou tarefa não encontrados",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se já é um colaborador
    if (targetTask.collaborators.some(collab => collab.userId === userId)) {
      toast({
        title: "Colaborador existente",
        description: `${targetUser.name} já é um colaborador desta tarefa`,
      });
      return;
    }
    
    // Adicionar colaborador
    const updatedTask = {
      ...targetTask,
      collaborators: [
        ...targetTask.collaborators,
        {
          userId: targetUser.id,
          name: targetUser.name,
          avatar: targetUser.avatar,
          role,
          joinedAt: new Date()
        }
      ],
      updatedAt: new Date()
    };
    
    setSharedTasks(
      sharedTasks.map(task => 
        task.id === taskId ? updatedTask : task
      )
    );
    
    toast({
      title: "Colaborador adicionado",
      description: `${targetUser.name} foi adicionado à tarefa`,
    });
  };

  // Remover colaborador da tarefa
  const removeTaskCollaborator = async (taskId: string, userId: string) => {
    const targetTask = sharedTasks.find(task => task.id === taskId);
    
    if (!targetTask) {
      toast({
        title: "Erro",
        description: "Tarefa não encontrada",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se é o proprietário
    const isOwner = targetTask.collaborators.some(
      collab => collab.userId === userId && collab.role === "owner"
    );
    
    if (isOwner) {
      toast({
        title: "Operação não permitida",
        description: "Não é possível remover o proprietário da tarefa",
        variant: "destructive"
      });
      return;
    }
    
    // Remover colaborador
    const updatedTask = {
      ...targetTask,
      collaborators: targetTask.collaborators.filter(
        collab => collab.userId !== userId
      ),
      updatedAt: new Date()
    };
    
    setSharedTasks(
      sharedTasks.map(task => 
        task.id === taskId ? updatedTask : task
      )
    );
    
    const removedUser = users.find(user => user.id === userId);
    
    toast({
      title: "Colaborador removido",
      description: `${removedUser?.name || "Usuário"} foi removido da tarefa`,
    });
  };

  // Criar quadro Kanban
  const createKanbanBoard = async (title: string, collaboratorIds: string[] = []) => {
    if (!currentUser) return;
    
    // Buscar informações dos colaboradores
    const boardCollaborators = collaboratorIds
      .map(id => {
        const user = users.find(u => u.id === id);
        if (!user) return null;
        
        return {
          userId: user.id,
          name: user.name,
          avatar: user.avatar,
          role: "editor" as "owner" | "editor" | "viewer",
          joinedAt: new Date(),
          color: getRandomColor()
        };
      })
      .filter(Boolean) as Array<{
        userId: string;
        name: string;
        avatar?: string;
        role: "owner" | "editor" | "viewer";
        joinedAt: Date;
        color?: string;
      }>;
    
    // Adicionar o usuário atual como proprietário
    boardCollaborators.unshift({
      userId: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      role: "owner" as "owner" | "editor" | "viewer",
      joinedAt: new Date(),
      color: "#4f46e5" // Cor padrão para o proprietário
    });
    
    const newBoard: KanbanBoard = {
      id: uuidv4(),
      title,
      collaborators: boardCollaborators,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      columns: ["todo", "inProgress", "review", "completed"]
    };
    
    setKanbanBoards([...kanbanBoards, newBoard]);
    
    toast({
      title: "Quadro criado",
      description: "O quadro Kanban foi criado com sucesso",
    });
  };

  // Função auxiliar para gerar cores aleatórias para colaboradores
  const getRandomColor = () => {
    const colors = [
      "#4f46e5", // indigo
      "#2563eb", // blue
      "#7c3aed", // violet
      "#c026d3", // fuchsia
      "#db2777", // pink
      "#e11d48", // rose
      "#ea580c", // orange
      "#65a30d", // lime
      "#059669", // emerald
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Atualizar quadro Kanban
  const updateKanbanBoard = async (boardId: string, updates: Partial<KanbanBoard>) => {
    setKanbanBoards(
      kanbanBoards.map(board => 
        board.id === boardId 
          ? { ...board, ...updates, updatedAt: new Date() } 
          : board
      )
    );
    
    toast({
      title: "Quadro atualizado",
      description: "O quadro Kanban foi atualizado com sucesso",
    });
  };

  // Adicionar colaborador ao quadro Kanban
  const addKanbanCollaborator = async (boardId: string, userId: string, role: "editor" | "viewer" = "editor") => {
    const targetUser = users.find(user => user.id === userId);
    const targetBoard = kanbanBoards.find(board => board.id === boardId);
    
    if (!targetUser || !targetBoard) {
      toast({
        title: "Erro",
        description: "Usuário ou quadro não encontrados",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se já é um colaborador
    if (targetBoard.collaborators.some(collab => collab.userId === userId)) {
      toast({
        title: "Colaborador existente",
        description: `${targetUser.name} já é um colaborador deste quadro`,
      });
      return;
    }
    
    // Adicionar colaborador
    const updatedBoard = {
      ...targetBoard,
      collaborators: [
        ...targetBoard.collaborators,
        {
          userId: targetUser.id,
          name: targetUser.name,
          avatar: targetUser.avatar,
          role,
          joinedAt: new Date(),
          color: getRandomColor()
        }
      ],
      updatedAt: new Date()
    };
    
    setKanbanBoards(
      kanbanBoards.map(board => 
        board.id === boardId ? updatedBoard : board
      )
    );
    
    toast({
      title: "Colaborador adicionado",
      description: `${targetUser.name} foi adicionado ao quadro`,
    });
  };

  // Remover colaborador do quadro Kanban
  const removeKanbanCollaborator = async (boardId: string, userId: string) => {
    const targetBoard = kanbanBoards.find(board => board.id === boardId);
    
    if (!targetBoard) {
      toast({
        title: "Erro",
        description: "Quadro não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se é o proprietário
    const isOwner = targetBoard.collaborators.some(
      collab => collab.userId === userId && collab.role === "owner"
    );
    
    if (isOwner) {
      toast({
        title: "Operação não permitida",
        description: "Não é possível remover o proprietário do quadro",
        variant: "destructive"
      });
      return;
    }
    
    // Remover colaborador
    const updatedBoard = {
      ...targetBoard,
      collaborators: targetBoard.collaborators.filter(
        collab => collab.userId !== userId
      ),
      updatedAt: new Date()
    };
    
    setKanbanBoards(
      kanbanBoards.map(board => 
        board.id === boardId ? updatedBoard : board
      )
    );
    
    const removedUser = users.find(user => user.id === userId);
    
    toast({
      title: "Colaborador removido",
      description: `${removedUser?.name || "Usuário"} foi removido do quadro`,
    });
  };

  // Adicionar comentário
  const addComment = async (taskId: string, content: string, attachments: string[] = []) => {
    if (!currentUser) return;
    
    const targetTask = sharedTasks.find(task => task.id === taskId);
    
    if (!targetTask) {
      toast({
        title: "Erro",
        description: "Tarefa não encontrada",
        variant: "destructive"
      });
      return;
    }
    
    // Incrementar contador de comentários
    const updatedTask = {
      ...targetTask,
      commentsCount: (targetTask.commentsCount || 0) + 1,
      lastActivity: new Date(),
      updatedAt: new Date()
    };
    
    setSharedTasks(
      sharedTasks.map(task => 
        task.id === taskId ? updatedTask : task
      )
    );
    
    toast({
      title: "Comentário adicionado",
      description: "Seu comentário foi adicionado com sucesso",
    });
  };

  // Excluir comentário
  const deleteComment = async (taskId: string, commentId: string) => {
    const targetTask = sharedTasks.find(task => task.id === taskId);
    
    if (!targetTask || targetTask.commentsCount <= 0) {
      toast({
        title: "Erro",
        description: "Tarefa ou comentário não encontrados",
        variant: "destructive"
      });
      return;
    }
    
    // Decrementar contador de comentários
    const updatedTask = {
      ...targetTask,
      commentsCount: targetTask.commentsCount - 1,
      updatedAt: new Date()
    };
    
    setSharedTasks(
      sharedTasks.map(task => 
        task.id === taskId ? updatedTask : task
      )
    );
    
    toast({
      title: "Comentário removido",
      description: "O comentário foi removido com sucesso",
    });
  };

  // Obter colaboradores sugeridos com base em habilidades, histórico, etc.
  const getSuggestedCollaborators = (taskId?: string): User[] => {
    // Em uma implementação real, analisaríamos o conteúdo da tarefa,
    // histórico de colaborações, habilidades, etc.
    // Para simplicidade, retornaremos uma lista filtrada de usuários
    
    // Filtrar usuários conectados que não são o usuário atual
    return users.filter(user => 
      user.id !== currentUser?.id &&
      connections.some(conn => 
        (conn.userId === currentUser?.id && conn.connectedUserId === user.id) ||
        (conn.userId === user.id && conn.connectedUserId === currentUser?.id)
      )
    );
  };

  // Valor do contexto
  const contextValue: CollaborationContextType = {
    currentUser,
    connections,
    pendingInvitations,
    updateUserStatus,
    sendConnectionRequest,
    acceptInvitation,
    rejectInvitation,
    sharedTasks,
    createSharedTask,
    updateSharedTask,
    addTaskCollaborator,
    removeTaskCollaborator,
    kanbanBoards,
    createKanbanBoard,
    updateKanbanBoard,
    addKanbanCollaborator,
    removeKanbanCollaborator,
    addComment,
    deleteComment,
    getSuggestedCollaborators
  };

  return (
    <CollaborationContext.Provider value={contextValue}>
      {children}
    </CollaborationContext.Provider>
  );
}
