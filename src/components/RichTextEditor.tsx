import { ForwardedRef, forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const assignRef = <T,>(ref: ForwardedRef<T>, node: T | null) => {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref) {
    // eslint-disable-next-line no-param-reassign
    ref.current = node;
  }
};

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, placeholder = 'Scrivi qui...' }, forwardedRef) => {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [focused, setFocused] = useState(false);

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        assignRef(forwardedRef, node);
      },
      [forwardedRef],
    );

    useEffect(() => {
      const element = innerRef.current;
      if (!element) return;
      const sanitizedValue = value || '';
      if (element.innerHTML !== sanitizedValue) {
        element.innerHTML = sanitizedValue;
      }
    }, [value]);

    const emitChange = () => {
      const html = innerRef.current?.innerHTML || '';
      if (html === '<br>') {
        onChange('');
        return;
      }
      onChange(html);
    };

    return (
      <div className="relative">
        <div
          ref={setRef}
          className={cn(
            'rich-text-content min-h-[250px] w-full rounded-xl border border-neutral-200 bg-white p-4 text-sm leading-relaxed shadow-sm outline-none transition focus-within:ring-2 focus-within:ring-black/10',
          )}
          contentEditable
          role="textbox"
          aria-multiline="true"
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
          data-placeholder={placeholder}
        />
        {!focused && !value && (
          <div className="pointer-events-none absolute left-5 top-4 text-sm text-muted-foreground">{placeholder}</div>
        )}
      </div>
    );
  },
);

RichTextEditor.displayName = 'RichTextEditor';
