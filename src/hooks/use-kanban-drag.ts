import { useState } from "react";
import { 
  DragStartEvent, 
  DragEndEvent, 
  DragOverEvent 
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanCardType, KanbanColumnType } from "@/components/kanban/types";

interface UseKanbanDragProps {
  columns: KanbanColumnType[];
  setColumns: (columns: KanbanColumnType[]) => void;
  onCardMove?: (cardId: string, sourceColumn: string, targetColumn: string) => void;
}

interface UseKanbanDragResult {
  activeCard: KanbanCardType | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
}

export function useKanbanDrag({ 
  columns, 
  setColumns,
  onCardMove 
}: UseKanbanDragProps): UseKanbanDragResult {
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);

  // Helper function to update the order property based on array index
  const updateCardOrder = (cards: KanbanCardType[]): KanbanCardType[] => {
    return cards.map((card, index) => ({
      ...card,
      order: index,
    }));
  };

  // Função para lidar com o início do arrasto
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const cardId = active.id as string;
    
    // Encontrar o cartão arrastado
    for (const column of columns) {
      const card = column.cards.find(card => card.id === cardId);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  };

  // Função para lidar com o fim do arrasto
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Resetar o cartão ativo
    setActiveCard(null);
    
    // Se não há destino, não fazemos nada
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Se estamos largando sobre o mesmo elemento, não fazemos nada
    if (activeId === overId) return;
    
    // Verificar se estamos arrastando para uma coluna ou para outro cartão
    const isOverColumn = overId.startsWith('column-');
    
    if (isOverColumn) {
      // Estamos arrastando para uma coluna diretamente
      const targetColumnId = overId.replace('column-', '');
      
      // Encontrar a coluna e o cartão de origem
      let sourceColumnIndex = -1;
      let sourceCardIndex = -1;
      let sourceCard: KanbanCardType | null = null;
      
      for (let i = 0; i < columns.length; i++) {
        const cardIndex = columns[i].cards.findIndex(card => card.id === activeId);
        if (cardIndex >= 0) {
          sourceColumnIndex = i;
          sourceCardIndex = cardIndex;
          sourceCard = columns[i].cards[cardIndex];
          break;
        }
      }
      
      // Se não encontramos o cartão, não fazemos nada
      if (sourceColumnIndex === -1 || !sourceCard) return;
      
      // Encontrar a coluna de destino
      const targetColumnIndex = columns.findIndex(column => column.id === targetColumnId);
      if (targetColumnIndex === -1) return;
      
      // Atualizar o estado movendo o cartão
      const updatedColumns = [...columns];
      const updatedCard = { ...sourceCard, columnId: targetColumnId };
      
      // Remover o cartão da coluna de origem
      updatedColumns[sourceColumnIndex].cards.splice(sourceCardIndex, 1);
      updatedColumns[sourceColumnIndex].cards = updateCardOrder(updatedColumns[sourceColumnIndex].cards);
      
      // Adicionar o cartão à coluna de destino
      updatedColumns[targetColumnIndex].cards.push(updatedCard);
      updatedColumns[targetColumnIndex].cards = updateCardOrder(updatedColumns[targetColumnIndex].cards);
      
      // Atualizar o estado
      setColumns(updatedColumns);
      
      // Chamar o callback se existir
      if (onCardMove) {
        onCardMove(sourceCard.id, sourceCard.columnId, targetColumnId);
      }
      
      return;
    }
    
    // Estamos arrastando para outro cartão
    let sourceColumnIndex = -1;
    let sourceCardIndex = -1;
    let targetColumnIndex = -1;
    let targetCardIndex = -1;
    
    // Encontrar as colunas e os índices dos cartões
    columns.forEach((column, columnIndex) => {
      column.cards.forEach((card, cardIndex) => {
        if (card.id === activeId) {
          sourceColumnIndex = columnIndex;
          sourceCardIndex = cardIndex;
        }
        if (card.id === overId) {
          targetColumnIndex = columnIndex;
          targetCardIndex = cardIndex;
        }
      });
    });
    
    // Se não encontramos os cartões, não fazemos nada
    if (sourceColumnIndex === -1 || targetColumnIndex === -1) return;
    
    const updatedColumns = [...columns];
    
    // Verificar se estamos movendo dentro da mesma coluna
    if (sourceColumnIndex === targetColumnIndex) {
      // Reordenar os cartões na mesma coluna
      const movedCards = arrayMove(
        updatedColumns[sourceColumnIndex].cards,
        sourceCardIndex,
        targetCardIndex
      );
      
      // Atualizar os índices de ordem
      updatedColumns[sourceColumnIndex].cards = updateCardOrder(movedCards);
    } else {
      // Mover o cartão para outra coluna
      const [movedCard] = updatedColumns[sourceColumnIndex].cards.splice(sourceCardIndex, 1);
      const targetColumnId = updatedColumns[targetColumnIndex].id;
      
      // Atualizar o columnId do cartão movido
      const updatedCard = { ...movedCard, columnId: targetColumnId };
      
      // Inserir o cartão na posição correta
      updatedColumns[targetColumnIndex].cards.splice(targetCardIndex, 0, updatedCard);
      
      // Atualizar os índices de ordem
      updatedColumns[sourceColumnIndex].cards = updateCardOrder(updatedColumns[sourceColumnIndex].cards);
      updatedColumns[targetColumnIndex].cards = updateCardOrder(updatedColumns[targetColumnIndex].cards);
      
      // Chamar o callback se existir
      if (onCardMove) {
        onCardMove(movedCard.id, movedCard.columnId, targetColumnId);
      }
    }
    
    // Atualizar o estado
    setColumns(updatedColumns);
  };

  // Função para lidar com o arrasto sobre um elemento
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    // Se não há destino, não fazemos nada
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Se estamos arrastando sobre o mesmo elemento, não fazemos nada
    if (activeId === overId) return;
    
    // Verificar se estamos arrastando sobre uma coluna
    const isOverColumn = overId.startsWith('column-');
    
    // Se não estamos sobre uma coluna, não precisamos fazer nada aqui
    if (isOverColumn) return;
    
    // Encontrar as colunas e os índices dos cartões
    let sourceColumnIndex = -1;
    let sourceCardIndex = -1;
    let targetColumnIndex = -1;
    let targetCardIndex = -1;
    
    columns.forEach((column, columnIndex) => {
      column.cards.forEach((card, cardIndex) => {
        if (card.id === activeId) {
          sourceColumnIndex = columnIndex;
          sourceCardIndex = cardIndex;
        }
        if (card.id === overId) {
          targetColumnIndex = columnIndex;
          targetCardIndex = cardIndex;
        }
      });
    });
    
    // Se estão na mesma coluna ou não encontramos os cartões, não fazemos nada
    if (sourceColumnIndex === targetColumnIndex || sourceColumnIndex === -1 || targetColumnIndex === -1) return;
    
    // Mover o cartão para a nova coluna
    const updatedColumns = [...columns];
    const [movedCard] = updatedColumns[sourceColumnIndex].cards.splice(sourceCardIndex, 1);
    
    // Atualizar o columnId do cartão movido
    const updatedCard = { 
      ...movedCard, 
      columnId: updatedColumns[targetColumnIndex].id 
    };
    
    // Inserir o cartão na posição correta
    updatedColumns[targetColumnIndex].cards.splice(targetCardIndex, 0, updatedCard);
    
    // Atualizar os índices de ordem
    updatedColumns[sourceColumnIndex].cards = updateCardOrder(updatedColumns[sourceColumnIndex].cards);
    updatedColumns[targetColumnIndex].cards = updateCardOrder(updatedColumns[targetColumnIndex].cards);
    
    // Atualizar o estado
    setColumns(updatedColumns);
  };

  return {
    activeCard,
    handleDragStart,
    handleDragEnd,
    handleDragOver
  };
}
