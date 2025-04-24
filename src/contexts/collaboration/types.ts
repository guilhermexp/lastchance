import { Task, TaskPriority } from "../tasks/types";

// Tipos para usuários e conexões sociais
export type UserStatus = "online" | "offline" | "away";

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  status: UserStatus;
  lastActive?: Date;
  tags?: string[];
  skills?: string[];
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

export interface Invitation {
  id: string;
  type: "connection" | "task" | "kanban";
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  targetId?: string;  // ID da tarefa ou do quadro Kanban
  targetTitle?: string;
  message?: string;
  createdAt: Date;
}

// Tipos para colaboração em tarefas e Kanban
export interface Collaborator {
  userId: string;
  name: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: Date;
}

export interface SharedTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: Date;
  tags?: string[];
  columnId?: string;
  collaborators: Collaborator[];
  isPublic: boolean;
  lastActivity?: Date;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanCollaborator {
  userId: string;
  name: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  joinedAt: Date;
  color?: string; // Cor para identificar visualmente o usuário no quadro
}

export interface KanbanBoard {
  id: string;
  title: string;
  description?: string;
  collaborators: KanbanCollaborator[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  columns?: string[]; // IDs das colunas
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  attachments?: string[];
}

// Tipos para o contexto de colaboração
export interface CollaborationContextType {
  // Usuários e conexões
  currentUser: User | null;
  connections: Connection[];
  pendingInvitations: Invitation[];
  
  // Ações de usuário e conexões
  updateUserStatus: (status: UserStatus) => void;
  sendConnectionRequest: (userId: string) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  
  // Tarefas compartilhadas
  sharedTasks: SharedTask[];
  createSharedTask: (task: Partial<Task>, collaboratorIds: string[]) => Promise<void>;
  updateSharedTask: (taskId: string, updates: Partial<SharedTask>) => Promise<void>;
  addTaskCollaborator: (taskId: string, userId: string, role?: "owner" | "editor" | "viewer") => Promise<void>;
  removeTaskCollaborator: (taskId: string, userId: string) => Promise<void>;
  
  // Kanban compartilhado
  kanbanBoards: KanbanBoard[];
  createKanbanBoard: (title: string, collaboratorIds?: string[]) => Promise<void>;
  updateKanbanBoard: (boardId: string, updates: Partial<KanbanBoard>) => Promise<void>;
  addKanbanCollaborator: (boardId: string, userId: string, role?: "owner" | "editor" | "viewer") => Promise<void>;
  removeKanbanCollaborator: (boardId: string, userId: string) => Promise<void>;
  
  // Comentários
  addComment: (taskId: string, content: string, attachments?: string[]) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;
  
  // Usuários sugeridos para colaboração (baseado em habilidades, histórico, etc.)
  getSuggestedCollaborators: (taskId?: string) => User[];
}
