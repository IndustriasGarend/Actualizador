
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Package, PackageCheck, X } from 'lucide-react';
import type { Package as PackageType } from '@/lib/types';
import { useState } from 'react';

interface PackageSelectorProps {
  packages: PackageType[];
  onPackageSelect: (pkg: PackageType | null) => void;
}

export function PackageSelector({ packages, onPackageSelect }: PackageSelectorProps) {
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);

  const handleSelect = (pkg: PackageType) => {
    setSelectedPackage(pkg);
    onPackageSelect(pkg);
  };
  
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPackage(null);
    onPackageSelect(null);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <PackageCheck className="mr-2 h-4 w-4" />
          {selectedPackage ? (
             <>
                <span className="truncate max-w-48">{selectedPackage.name}</span>
                 {selectedPackage.version && <span className="ml-2 text-xs text-muted-foreground">({selectedPackage.version})</span>}
                <X className="ml-2 h-4 w-4" onClick={handleClear} />
             </>
          ) : "Resaltar Version de Paquete..."}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Seleccione un paquete</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {packages.filter(p => p.version).map((pkg) => (
            <DropdownMenuItem key={pkg.id} onSelect={() => handleSelect(pkg)}>
              <Package className="mr-2 h-4 w-4" />
              <span>{pkg.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
