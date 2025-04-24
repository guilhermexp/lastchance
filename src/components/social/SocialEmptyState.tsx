import { Button } from "@/components/ui/button";
import { UsersIcon } from "lucide-react";

interface SocialEmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
  icon?: React.ReactNode;
}

export function SocialEmptyState({
  title,
  description,
  buttonText,
  onAction,
  icon = <UsersIcon className="w-12 h-12 text-muted-foreground/60" />,
}: SocialEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-muted p-4">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        </div>
        <Button onClick={onAction} className="mt-2">
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
