import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <header className={cn("p-6 pb-0", className)}>
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">{title}</h1>
                {description && <p className="text-muted-foreground mt-1">{description}</p>}
            </div>
            {action}
        </div>
        <Separator className="mt-4" />
    </header>
  );
}
