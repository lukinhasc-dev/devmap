// ─── JsonTextarea.tsx ─────────────────────────────────────────────────────────
// Textarea com suporte a Tab (insere 2 espaços em vez de mudar foco)
// e highlight básico de linha ativa.

import type { TextareaHTMLAttributes } from "react";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> & {
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

export default function JsonTextarea({ value, onChange, className = "", ...rest }: Props) {
    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Tab") {
            e.preventDefault(); // impede mudar o foco
            const el = e.currentTarget;
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const newValue = value.substring(0, start) + "  " + value.substring(end);
            onChange(newValue);
            // reposiciona o cursor após os 2 espaços inseridos
            requestAnimationFrame(() => {
                el.selectionStart = start + 2;
                el.selectionEnd = start + 2;
            });
        }
    }

    return (
        <textarea
            className={className}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            {...rest}
        />
    );
}
