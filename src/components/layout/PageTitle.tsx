import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTitleProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageTitle({ 
  title, 
  description, 
  actions,
  className
}: PageTitleProps) {
  return (
    <div className={cn("mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex gap-2 items-center">
          {actions}
        </div>
      )}
    </div>
  );
}
