import { Button } from 'components/ui/button';
import { ArrowUpToLine } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  disabled?: boolean;
}

export function ExportButton({ onExport, disabled }: ExportButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Esporta contatti"
      onClick={onExport}
      disabled={disabled}
    >
      <ArrowUpToLine className="h-4 w-4" />
    </Button>
  );
}
