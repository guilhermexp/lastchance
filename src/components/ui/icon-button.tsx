import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * Componente de botão de ícone com acessibilidade melhorada
 */
export function IconButton({
  icon,
  label,
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      aria-label={label}
      {...props}
    >
      {React.cloneElement(icon as React.ReactElement, {
        'aria-hidden': true,
        className: cn('h-4 w-4', (icon as React.ReactElement)?.props?.className)
      })}
      <span className="sr-only">{label}</span>
    </Button>
  );
}