import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialEmptyState } from "./SocialEmptyState";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, Mail, SendHorizontal, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";

// Tipos para os convites
interface Invite {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: "connection" | "task";
  taskId?: string;
  taskTitle?: string;
  status: "pending" | "accepted" | "rejected";
  date: Date;
}

// Dados mockados
const mockReceivedInvites: Invite[] = [
  {
    id: "inv1",
    userId: "user1",
    userName: "Pedro Almeida",
    type: "connection",
    status: "pending",
    date: new Date(2025, 3, 20)
  },
  {
    id: "inv2",
    userId: "user2",
    userName: "Juliana Mendes",
    userAvatar: "/avatars/juliana.png",
    type: "task",
    taskId: "task123",
    taskTitle: "Preparação da apresentação de marketing",
    status: "pending",
    date: new Date(2025, 3, 22)
  }
];

const mockSentInvites: Invite[] = [
  {
    id: "inv3",
    userId: "user3",
    userName: "Rafael Torres",
    type: "connection",
    status: "pending",
    date: new Date(2025, 3, 21)
  },
  {
    id: "inv4",
    userId: "user4",
    userName: "Carla Santos",
    type: "task",
    taskId: "task456",
    taskTitle: "Revisão de wireframes",
    status: "accepted",
    date: new Date(2025, 3, 19)
  }
];

export function SocialInvites() {
  const [receivedInvites, setReceivedInvites] = useState<Invite[]>(mockReceivedInvites);
  const [sentInvites, setSentInvites] = useState<Invite[]>(mockSentInvites);
  const [activeTab, setActiveTab] = useState("received");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Aceitar um convite recebido
  const acceptInvite = (id: string) => {
    setReceivedInvites(prev => 
      prev.map(invite => 
        invite.id === id ? { ...invite, status: "accepted" } : invite
      )
    );
    
    const invite = receivedInvites.find(inv => inv.id === id);
    
    toast({
      title: "Convite aceito",
      description: invite?.type === "connection" 
        ? `Você aceitou o convite de conexão de ${invite.userName}`
        : `Você aceitou participar da tarefa "${invite?.taskTitle}"`,
    });
  };

  // Rejeitar um convite recebido
  const rejectInvite = (id: string) => {
    setReceivedInvites(prev => 
      prev.map(invite => 
        invite.id === id ? { ...invite, status: "rejected" } : invite
      )
    );
    
    toast({
      title: "Convite rejeitado",
      description: "O convite foi rejeitado.",
    });
  };

  // Cancelar um convite enviado
  const cancelInvite = (id: string) => {
    setSentInvites(prev => prev.filter(invite => invite.id !== id));
    
    toast({
      title: "Convite cancelado",
      description: "O convite foi cancelado com sucesso.",
    });
  };

  // Reenviar um convite
  const resendInvite = (id: string) => {
    toast({
      title: "Convite reenviado",
      description: "O convite foi reenviado com sucesso.",
    });
  };

  // Filtrar convites pendentes
  const pendingReceivedInvites = receivedInvites.filter(invite => invite.status === "pending");
  const pendingSentInvites = sentInvites.filter(invite => invite.status === "pending");

  // Renderização dos itens de convite
  const renderInviteItem = (invite: Invite, isSent: boolean = false) => {
    return (
      <Card key={invite.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar>
                {invite.userAvatar ? (
                  <AvatarImage src={invite.userAvatar} alt={invite.userName} />
                ) : (
                  <AvatarFallback>
                    {invite.userName.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-base">{invite.userName}</CardTitle>
                <CardDescription className="text-xs">
                  {format(invite.date, "d 'de' MMMM, yyyy", { locale: ptBR })}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center">
              {invite.status === "accepted" && (
                <div className="flex items-center text-green-600 text-xs gap-1">
                  <Check className="h-3 w-3" />
                  <span>Aceito</span>
                </div>
              )}
              {invite.status === "rejected" && (
                <div className="flex items-center text-red-600 text-xs gap-1">
                  <X className="h-3 w-3" />
                  <span>Rejeitado</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="border rounded p-3 bg-muted/30">
              <div className="flex items-center gap-2 text-sm mb-1">
                {invite.type === "connection" ? (
                  <><Mail className="h-4 w-4" /> Convite de conexão</>
                ) : (
                  <><Clock className="h-4 w-4" /> Convite para tarefa: <span className="font-medium">{invite.taskTitle}</span></>
                )}
              </div>
            </div>
            
            {!isSent && invite.status === "pending" ? (
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => rejectInvite(invite.id)}
                  className="flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Rejeitar</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => acceptInvite(invite.id)}
                  className="flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Aceitar</span>
                </Button>
              </div>
            ) : isSent && invite.status === "pending" ? (
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => cancelInvite(invite.id)}
                  className="flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancelar</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => resendInvite(invite.id)}
                  className="flex items-center gap-1"
                >
                  <SendHorizontal className="h-3.5 w-3.5" />
                  <span>Reenviar</span>
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="received"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className={`grid grid-cols-2 ${isMobile ? "w-full" : "w-[300px]"} mb-4`}>
          <TabsTrigger value="received">Recebidos</TabsTrigger>
          <TabsTrigger value="sent">Enviados</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {pendingReceivedInvites.length === 0 ? (
            <SocialEmptyState
              title="Nenhum convite recebido"
              description="Você não tem convites pendentes no momento."
              buttonText="Atualizar"
              onAction={() => {
                toast({
                  title: "Atualizado",
                  description: "Buscando novos convites...",
                });
              }}
              icon={<Mail className="w-12 h-12 text-muted-foreground/60" />}
            />
          ) : (
            <div>
              <h3 className="text-lg font-medium mb-4">Convites Pendentes ({pendingReceivedInvites.length})</h3>
              {pendingReceivedInvites.map(invite => renderInviteItem(invite))}
              
              {receivedInvites.some(invite => invite.status !== "pending") && (
                <>
                  <h3 className="text-lg font-medium mb-4 mt-8">Histórico de Convites</h3>
                  {receivedInvites
                    .filter(invite => invite.status !== "pending")
                    .map(invite => renderInviteItem(invite))}
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentInvites.length === 0 ? (
            <SocialEmptyState
              title="Nenhum convite enviado"
              description="Você não enviou convites para outros usuários."
              buttonText="Enviar Convite"
              onAction={() => {
                toast({
                  title: "Nova conexão",
                  description: "Busque por usuários para enviar convites.",
                });
              }}
              icon={<SendHorizontal className="w-12 h-12 text-muted-foreground/60" />}
            />
          ) : (
            <div>
              <h3 className="text-lg font-medium mb-4">Convites Enviados ({sentInvites.length})</h3>
              {sentInvites.map(invite => renderInviteItem(invite, true))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
