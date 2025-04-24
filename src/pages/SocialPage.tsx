import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTitle } from "@/components/layout/PageTitle";
import { SocialConnections } from "@/components/social/SocialConnections";
import { SocialInvites } from "@/components/social/SocialInvites";
import { SocialTasks } from "@/components/social/SocialTasks";
import { SocialEmptyState } from "@/components/social/SocialEmptyState";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<string>("connections");
  const [hasConnections, setHasConnections] = useState<boolean>(false); // Estado para controlar se o usuário tem conexões
  const isMobile = useIsMobile();

  // Função para simular a adição de uma conexão (para demonstração)
  const handleAddConnection = () => {
    setHasConnections(true);
  };

  return (
    <div className="container py-6 space-y-6">
      <PageTitle
        title="Social"
        description="Conecte-se com outros usuários e colabore em tarefas"
      />

      <Tabs
        defaultValue="connections"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className={`grid ${isMobile ? "grid-cols-3" : "w-[400px] grid-cols-3"} mb-6`}>
          <TabsTrigger value="connections">Conexões</TabsTrigger>
          <TabsTrigger value="invites">Convites</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas Compartilhadas</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {hasConnections ? (
            <SocialConnections />
          ) : (
            <SocialEmptyState
              title="Nenhuma conexão encontrada"
              description="Comece adicionando pessoas à sua rede para colaborar em tarefas."
              buttonText="Adicionar Conexão"
              onAction={handleAddConnection}
            />
          )}
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          <SocialInvites />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <SocialTasks />
        </TabsContent>
      </Tabs>
    </div>
  );
}
