import { Task } from "@/contexts/tasks/types";

// Opções de agrupamento para o Kanban
export type GroupByOption = "none" | "priority" | "assignee" | "label";

// Tipos de filtros para o Kanban
export type PriorityFilterType = "all" | "high" | "medium" | "low";
export type CategoryFilterType = "all" | "frontend" | "ux" | "ui" | "research";
export type StatusFilterType = "all" | "todo" | "inProgress" | "review" | "completed";

// Interface para cartões Kanban
export interface KanbanCardType {
  id: string;
  taskId?: string; // ID da tarefa original no contexto global
  title: string;
  columnId: string;
  description?: string;
  priority: "high" | "medium" | "low";
  dueDate?: Date;
  assignees: string[];
  labels: string[];
  order: number;
  completed?: boolean;
  image?: string;
  attachments?: number;
  comments?: number;
}

// Interface para colunas Kanban
export interface KanbanColumnType {
  id: string;
  title: string;
  cards: KanbanCardType[];
  order: number;
  color: string;
}

// Props do componente ModernKanbanBoard
export interface ModernKanbanBoardProps {
  initialTasks: Task[];
  className?: string;
  onCardMove?: (cardId: string, sourceColumn: string, targetColumn: string) => void;
  onCardUpdate?: (cardId: string, updatedData: Partial<KanbanCardType>) => void;
  onCardAdd?: (columnId: string, cardData: Partial<KanbanCardType>) => void;
  onCardDelete?: (cardId: string) => void;
  actionableColumns?: boolean;
  groupBy?: GroupByOption;
  filteredCards?: KanbanCardType[];
  searchTerm?: string;
  priorityFilter?: PriorityFilterType;
  categoryFilter?: CategoryFilterType;
  statusFilter?: StatusFilterType;
}
