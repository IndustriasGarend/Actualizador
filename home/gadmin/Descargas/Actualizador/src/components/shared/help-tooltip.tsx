'use client';
/**
 * @fileoverview
 * Componente reutilizable para mostrar un ícono de ayuda que revela
 * un tooltip con información adicional al pasar el cursor sobre él.
 */
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const HelpTooltip = ({ children }: { children: React.ReactNode }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
                <p className="max-w-xs">{children}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);
