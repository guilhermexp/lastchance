import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Save, Upload, CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCardType } from "./types";
import { TaskPriority, Task } from "@/contexts/tasks/types"; // Garante que TaskPriority está importado
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTasks } from "@/contexts/TasksContext";
import { useToast } from "@/hooks/use-toast";

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardData: KanbanCardType | null; // Dados do cartão a ser editado
  onCardUpdate?: (data: Partial<KanbanCardType>) => void; // Callback para atualizar o cartão no componente pai
}

// Lista de membros disponíveis (idealmente viria do contexto ou API)
const availableAssignees = [
  { id: "1", name: "John Doe", image: "" },
  { id: "2", name: "Jane Smith", image: "" },
  { id: "3", name: "Robert Fox", image: "" },
  { id: "4", name: "Savannah Nguyen", image: "" },
  { id: "5", name: "Jacob Jones", image: "" },
  { id: "6", name: "Bessie Cooper", image: "" },
];

// Lista de etiquetas disponíveis (idealmente viria do contexto ou API)
const availableLabels = [
  "Desenvolvimento Frontend",
  "Design UX",
  "Design UI",
  "Pesquisa UX",
  "UX Writer",
  "Importante",
  "Urgente",
  "Neutro",
  "Tarefa",
  "Hábito",
  "Reunião",
  "Medicação",
  "Lembrete",
  "Sem etiqueta" // Adicionar opção "Sem etiqueta"
];

export function EditCardDialog({
  open,
  onOpenChange,
  cardData,
  onCardUpdate
}: EditCardDialogProps) {
  const { updateTask, deleteTask } = useTasks();
  const { toast } = useToast();

  // Estados do formulário
  const [title, setTitle] = useState(cardData ? cardData.title : "");
  const [description, setDescription] = useState(cardData ? cardData.description || "" : "");
  const [priority, setPriority] = useState<TaskPriority>(cardData ? cardData.priority : 'low'); // Remove 'none', default 'low'
  const [selectedLabels, setSelectedLabels] = useState<string[]>(cardData ? cardData.labels : []);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(cardData ? cardData.assignees.map(name => {
    const assignee = availableAssignees.find(a => a.name === name);
    return assignee ? assignee.id : undefined;
  }).filter(Boolean) as string[] : []);
  const [image, setImage] = useState<string | null>(cardData ? cardData.image || null : null);
  const [dueDate, setDueDate] = useState<Date | undefined>(cardData ? cardData.dueDate : undefined); // Recebe Date diretamente

  // Efeito para preencher o formulário quando cardData mudar
  useEffect(() => {
    if (cardData) {
      setTitle(cardData.title);
      setDescription(cardData.description || "");
      setPriority(cardData.priority || 'low'); // Remove 'none', default 'low'
      setSelectedLabels(cardData.labels || []);
      const assigneeIds = cardData.assignees.map(name => {
        const assignee = availableAssignees.find(a => a.name === name);
        return assignee ? assignee.id : undefined;
      }).filter(Boolean) as string[];
      setSelectedAssignees(assigneeIds);
      setImage(cardData.image || null);
      setDueDate(cardData.dueDate); // Define Date diretamente
    } else {
      // Resetar formulário se não houver cardData (pode não ser necessário dependendo do fluxo)
      setTitle("");
      setDescription("");
      setPriority('low'); // Remove 'none', default 'low'
      setSelectedLabels([]);
      setSelectedAssignees([]);
      setImage(null);
      setDueDate(undefined);
    }
  }, [cardData, open]); // Re-executar quando cardData ou open mudar

  // Função para alternar a seleção de uma etiqueta
  const toggleLabel = (label: string) => {
    setSelectedLabels(prev => {
      let newLabels;
      if (prev.includes(label)) {
        newLabels = prev.filter(l => l !== label);
      } else {
        newLabels = [...prev.filter(l => l !== "Sem etiqueta"), label]; // Remove "Sem etiqueta" ao adicionar outra
      }
      // Se vazio, adicionar "Sem etiqueta"
      return newLabels.length === 0 ? ["Sem etiqueta"] : newLabels;
    });
  };

  // Função para alternar a seleção de um membro
  const toggleAssignee = (assigneeId: string) => {
    setSelectedAssignees(prev =>
      prev.includes(assigneeId)
        ? prev.filter(id => id !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  // Função para salvar as alterações
  const handleSaveChanges = async () => {
    if (!cardData || !cardData.taskId || !title.trim()) return;

    // Mapear IDs de membros para nomes
    const assigneeNames = selectedAssignees.map(id => {
      const assignee = availableAssignees.find(a => a.id === id);
      return assignee ? assignee.name : "";
    }).filter(Boolean);
    try {
      // Criar objeto com os campos atualizados para o KanbanCard
      const updatedCardFields: Partial<KanbanCardType> = {
        title,
        description,
        priority,
        dueDate,
        labels: selectedLabels.filter(label => label !== "Sem etiqueta"), // Remove "Sem etiqueta" ao salvar
        assignees: selectedAssignees.map(id => {
          const assignee = availableAssignees.find(a => a.id === id);
          return assignee ? assignee.name : "";
        }).filter(Boolean),
        image: image || undefined
      };
      
      // Usar o callback de atualização se estiver disponível
      if (onCardUpdate) {
        onCardUpdate(updatedCardFields);
      }
      // Caso contrário, usar o updateTask diretamente se houver taskId
      else if (cardData.taskId) {
        // Convertendo para formato de Task para o contexto
        const updatedFields: Partial<Task> = {
          title,
          description,
          priority,
          dueDate,
          tags: selectedLabels.filter(label => label !== "Sem etiqueta")
        };
        updateTask(cardData.taskId, updatedFields);
      }
      
      // Fechar o diálogo
      onOpenChange(false);
      
      // Notificação de sucesso
      toast({
        title: "Cartão atualizado",
        description: "As alterações foram salvas com sucesso!",
        variant: "default",
      });
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Função para excluir o cartão
  const handleDelete = async () => {
    if (!cardData || !cardData.taskId) return;

    // TODO: Adicionar um diálogo de confirmação antes de excluir

    try {
      await deleteTask(cardData.taskId);
      toast({ title: "Cartão Excluído", description: `"${cardData.title}" foi excluído.` });
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao excluir cartão:", error);
      toast({ 
        title: "Erro ao Excluir", 
        description: "Não foi possível excluir o cartão. Tente novamente.",
        variant: "destructive" 
      });
    }
  };

  // Função para simular o upload de imagem (manter consistência, mas pode precisar de lógica real)
  const handleImageUpload = () => {
    // Lógica de upload real aqui, atualizando o estado 'image'
    setImage("/placeholder.svg"); // Placeholder
  };

  if (!cardData) return null; // Não renderizar se não houver dados

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Cartão</DialogTitle>
          <DialogDescription>
            Faça alterações no cartão. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Campos do formulário pré-preenchidos */}
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição detalhada..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Prioridade</Label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as TaskPriority[]).map(p => (
                <Button
                  key={p}
                  type="button"
                  variant={priority === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriority(p)}
                  className="capitalize"
                >
                  {p === 'high' ? 'Alta' : p === 'medium' ? 'Média' : 'Baixa'}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Data de Vencimento (Opcional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {availableLabels.map(label => (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-xs h-7",
                    selectedLabels.includes(label) && "border-primary bg-primary/5"
                  )}
                  onClick={() => toggleLabel(label)}
                >
                  {selectedLabels.includes(label) && <Check className="h-3 w-3 mr-1" />}
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Atribuir a</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableAssignees.map(assignee => (
                <Button
                  key={assignee.id}
                  type="button"
                  variant="outline"
                  className={cn(
                    "justify-start",
                    selectedAssignees.includes(assignee.id) && "border-primary bg-primary/5"
                  )}
                  onClick={() => toggleAssignee(assignee.id)}
                >
                  <Avatar className="h-6 w-6 mr-2">
                    {assignee.image ? (
                      <AvatarImage src={assignee.image} alt={assignee.name} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {assignee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="truncate">{assignee.name}</span>
                  {selectedAssignees.includes(assignee.id) && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Anexar Imagem</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleImageUpload}
              >
                <Upload className="h-4 w-4" />
                Carregar Imagem
              </Button>
              {image && (
                <div className="border rounded p-1 w-16 h-16 flex items-center justify-center overflow-hidden">
                  <img src={image} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button 
            variant="destructive"
            onClick={handleDelete}
            className="sm:mr-auto"
           >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Cartão
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveChanges}
              disabled={!title.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
