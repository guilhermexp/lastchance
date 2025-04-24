import { useMemo } from "react";
import { KanbanCardType, KanbanColumnType, GroupByOption } from "@/components/kanban/types";

interface UseKanbanGroupingProps {
  columns: KanbanColumnType[];
  cards: KanbanCardType[];
  groupBy: GroupByOption;
  searchTerm?: string;
  priorityFilter?: "all" | "high" | "medium" | "low";
  categoryFilter?: "all" | "frontend" | "ux" | "ui" | "research";
  statusFilter?: "all" | "todo" | "inProgress" | "review" | "completed";
}

type GroupedColumnsType = Record<string, KanbanColumnType[]>;

interface UseKanbanGroupingResult {
  groupedColumns: GroupedColumnsType;
  getGroupTitle: (group: string) => string;
}

export function useKanbanGrouping({
  columns,
  cards,
  groupBy,
  searchTerm = "",
  priorityFilter = "all",
  categoryFilter = "all",
  statusFilter = "all"
}: UseKanbanGroupingProps): UseKanbanGroupingResult {
  
  // Filtrar cards baseado nos critérios
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // Filtrar por termo de busca
      const matchesSearch = !searchTerm || 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtrar por prioridade
      const matchesPriority = priorityFilter === "all" || card.priority === priorityFilter;
      
      // Filtrar por categoria (usando labels)
      const matchesCategory = categoryFilter === "all" || 
        card.labels.some(label => {
          if (categoryFilter === "frontend") return label.toLowerCase().includes("frontend") || label.toLowerCase().includes("desenvolvimento");
          if (categoryFilter === "ux") return label.toLowerCase().includes("ux") || label.toLowerCase().includes("experiência");
          if (categoryFilter === "ui") return label.toLowerCase().includes("ui") || label.toLowerCase().includes("interface");
          if (categoryFilter === "research") return label.toLowerCase().includes("pesquisa") || label.toLowerCase().includes("research");
          return false;
        });
      
      // Filtrar por status
      const matchesStatus = statusFilter === "all" || card.columnId === statusFilter;
      
      return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
    });
  }, [cards, searchTerm, priorityFilter, categoryFilter, statusFilter]);
  
  // Agrupar colunas e cards baseado na opção de agrupamento
  const groupedColumns = useMemo(() => {
    // Criar uma estrutura para armazenar as colunas agrupadas
    const groupedData: GroupedColumnsType = {};
    
    // Se não há agrupamento, apenas retornar todas as colunas sob a chave "none"
    if (groupBy === "none") {
      // Criar cópias das colunas com os cards filtrados
      const columnsWithFilteredCards = columns.map(column => ({
        ...column,
        cards: filteredCards.filter(card => card.columnId === column.id)
      }));
      
      return { "none": columnsWithFilteredCards };
    }
    
    // Para outros tipos de agrupamento, precisamos agrupar os cards filtrados
    if (groupBy === "priority") {
      // Inicializar grupos para todas as prioridades
      groupedData["high"] = [];
      groupedData["medium"] = [];
      groupedData["low"] = [];
      
      // Para cada prioridade, criar cópias das colunas
      ["high", "medium", "low"].forEach(priority => {
        const priorityCards = filteredCards.filter(card => card.priority === priority);
        
        // Criar cópias das colunas para este grupo
        groupedData[priority] = columns.map(column => ({
          ...column,
          cards: priorityCards.filter(card => card.columnId === column.id)
        }));
      });
    } else if (groupBy === "assignee") {
      // Encontrar todos os assignees únicos
      const assignees = Array.from(
        new Set(filteredCards.flatMap(card => 
          card.assignees.length > 0 ? card.assignees : ["Sem Responsável"]
        ))
      );
      
      // Para cada assignee, criar cópias das colunas
      assignees.forEach(assignee => {
        const assigneeCards = filteredCards.filter(card => 
          card.assignees.includes(assignee) || 
          (assignee === "Sem Responsável" && card.assignees.length === 0)
        );
        
        // Criar cópias das colunas para este grupo
        groupedData[assignee] = columns.map(column => ({
          ...column,
          cards: assigneeCards.filter(card => card.columnId === column.id)
        }));
      });
    } else if (groupBy === "label") {
      // Encontrar todas as labels únicas
      const labels = Array.from(
        new Set(filteredCards.flatMap(card => 
          card.labels.length > 0 ? card.labels : ["Sem etiqueta"]
        ))
      );
      
      // Para cada label, criar cópias das colunas
      labels.forEach(label => {
        const labelCards = filteredCards.filter(card => 
          card.labels.includes(label) || 
          (label === "Sem etiqueta" && card.labels.length === 0)
        );
        
        // Criar cópias das colunas para este grupo
        groupedData[label] = columns.map(column => ({
          ...column,
          cards: labelCards.filter(card => card.columnId === column.id)
        }));
      });
    }
    
    return groupedData;
  }, [columns, filteredCards, groupBy]);
  
  // Função para traduzir os nomes dos grupos
  const getGroupTitle = (group: string): string => {
    if (group === "none") {
      return "";
    }
    
    if (groupBy === "priority") {
      const priorityMap: Record<string, string> = {
        "high": "Prioridade Alta",
        "medium": "Prioridade Média",
        "low": "Prioridade Baixa"
      };
      return priorityMap[group] || group;
    }
    
    if (groupBy === "assignee") {
      return group === "Sem Responsável" ? group : `Responsável: ${group}`;
    }
    
    if (groupBy === "label") {
      return group === "Sem etiqueta" ? group : `Etiqueta: ${group}`;
    }
    
    return group;
  };
  
  return {
    groupedColumns,
    getGroupTitle
  };
}
