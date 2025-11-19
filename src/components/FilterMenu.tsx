import { ContactFilters } from '@/types/filters';
import { STAGES } from '@/constants/stages';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Filter } from 'lucide-react';

interface FilterMenuProps {
  filters: ContactFilters;
  onChange: (filters: ContactFilters) => void;
}

export function FilterMenu({ filters, onChange }: FilterMenuProps) {
  const toggleStage = (stageId: string, checked: boolean | 'indeterminate') => {
    const set = new Set(filters.stages);
    if (checked) {
      set.add(stageId as typeof filters.stages[number]);
    } else {
      set.delete(stageId as typeof filters.stages[number]);
    }
    onChange({ ...filters, stages: Array.from(set) });
  };

  const updateFilter = <K extends keyof ContactFilters>(key: K, value: ContactFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onChange({
      stages: [],
      hasEmail: 'all',
      hasPhone: 'all',
      createdFrom: '',
      createdTo: '',
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Filtra contatti">
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4" align="end">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Filtri</p>
          <button type="button" className="text-xs text-neutral-500 hover:text-neutral-800" onClick={handleReset}>
            Azzera
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Stage</p>
          <div className="space-y-2 rounded-lg border p-3">
            {STAGES.map(stage => (
              <label key={stage.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={filters.stages.includes(stage.id)}
                  onCheckedChange={checked => toggleStage(stage.id, checked)}
                />
                <span>{stage.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-neutral-500">Has email</Label>
            <RadioGroup value={filters.hasEmail} onValueChange={value => updateFilter('hasEmail', value as ContactFilters['hasEmail'])}>
              <Label className="flex items-center gap-2 text-sm font-normal">
                <RadioGroupItem value="all" />
                Tutti
              </Label>
              <Label className="flex items-center gap-2 text-sm font-normal">
                <RadioGroupItem value="yes" />
                Sì
              </Label>
              <Label className="flex items-center gap-2 text-sm font-normal">
                <RadioGroupItem value="no" />
                No
              </Label>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-neutral-500">Has phone</Label>
            <RadioGroup value={filters.hasPhone} onValueChange={value => updateFilter('hasPhone', value as ContactFilters['hasPhone'])}>
              <Label className="flex items-center gap-2 text-sm font-normal">
                <RadioGroupItem value="all" />
                Tutti
              </Label>
              <Label className="flex items-center gap-2 text-sm font-normal">
                <RadioGroupItem value="yes" />
                Sì
              </Label>
              <Label className="flex items-center gap-2 text-sm font-normal">
                <RadioGroupItem value="no" />
                No
              </Label>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-neutral-500">Data creazione</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-xs text-neutral-500">Da</span>
              <Input
                type="date"
                value={filters.createdFrom}
                onChange={event => updateFilter('createdFrom', event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-neutral-500">A</span>
              <Input type="date" value={filters.createdTo} onChange={event => updateFilter('createdTo', event.target.value)} />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
