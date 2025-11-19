import { RefObject } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ACTIONS = [
  { id: 'bold', icon: Bold, label: 'Grassetto' },
  { id: 'italic', icon: Italic, label: 'Corsivo' },
  { id: 'underline', icon: Underline, label: 'Sottolineato' },
  { id: 'h1', icon: Heading1, label: 'Heading 1' },
  { id: 'h2', icon: Heading2, label: 'Heading 2' },
  { id: 'h3', icon: Heading3, label: 'Heading 3' },
  { id: 'bullet', icon: List, label: 'Lista' },
  { id: 'numbered', icon: ListOrdered, label: 'Lista numerata' },
  { id: 'quote', icon: Quote, label: 'Citazione' },
  { id: 'code', icon: Code, label: 'Codice' },
  { id: 'link', icon: Link, label: 'Link' },
  { id: 'divider', icon: Minus, label: 'Divider' },
];

interface EditorToolbarProps {
  targetRef: RefObject<HTMLDivElement>;
}

const focusEditor = (element: HTMLDivElement | null) => {
  if (!element) return;
  element.focus();
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
};

const exec = (command: string, value?: string) => document.execCommand(command, false, value);

const insertCodeBlock = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const selectedText = selection.toString() || 'codice';
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.textContent = selectedText;
  pre.appendChild(code);
  range.deleteContents();
  range.insertNode(pre);
  selection.removeAllRanges();
  const newRange = document.createRange();
  newRange.setStartAfter(pre);
  newRange.collapse(true);
  selection.addRange(newRange);
};

const handleDivider = () => {
  exec('insertHorizontalRule');
};

const handlers: Record<string, () => void> = {
  bold: () => exec('bold'),
  italic: () => exec('italic'),
  underline: () => exec('underline'),
  h1: () => exec('formatBlock', 'H1'),
  h2: () => exec('formatBlock', 'H2'),
  h3: () => exec('formatBlock', 'H3'),
  bullet: () => exec('insertUnorderedList'),
  numbered: () => exec('insertOrderedList'),
  quote: () => exec('formatBlock', 'BLOCKQUOTE'),
  code: () => insertCodeBlock(),
  link: () => {
    const url = window.prompt('Inserisci URL');
    if (url) {
      exec('createLink', url);
    }
  },
  divider: () => handleDivider(),
};

export function EditorToolbar({ targetRef }: EditorToolbarProps) {
  const handleAction = (actionId: string) => {
    const element = targetRef.current;
    focusEditor(element);
    const action = handlers[actionId];
    if (action) {
      action();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 rounded-md border border-neutral-200 bg-white p-2 shadow-sm">
      {ACTIONS.map(action => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            type="button"
            size="icon"
            variant="ghost"
            className={cn(
              'h-8 w-8 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900',
              'border border-transparent',
            )}
            aria-label={action.label}
            onClick={() => handleAction(action.id)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}
