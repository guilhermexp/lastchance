import { lazy, Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentProps {
  fallback?: React.ReactNode;
}

/**
 * Componente de carregamento lazy com Suspense integrado
 * 
 * @param importFn - Função que importa o componente
 * @param fallback - Componente de fallback opcional (usa Skeleton por padrão)
 * @returns Componente com carregamento lazy
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentProps = {}
) {
  const LazyComponent = lazy(importFn);
  
  // Componente wrapper que inclui o Suspense
  return function LazyComponentWrapper(props: React.ComponentProps<T>) {
    const { fallback = <DefaultFallback /> } = options;
    
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Componente de fallback padrão
function DefaultFallback() {
  return (
    <div className="w-full space-y-2 animate-pulse">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-8 w-3/4" />
    </div>
  );
}