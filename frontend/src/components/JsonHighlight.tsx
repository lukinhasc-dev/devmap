import { type ReactNode } from "react";

type Props = {
    value: unknown;
    raw?: string;
};

const TOKEN_REGEX = /"(?:\\.|[^"\\])*"|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

function toText(value: unknown, raw?: string): string {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return raw ?? "";
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return raw ?? String(value);
    }
}

function highlight(text: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;
    let match: RegExpExecArray | null;

    TOKEN_REGEX.lastIndex = 0;

    while ((match = TOKEN_REGEX.exec(text)) !== null) {
        if (match.index > lastIndex) {
            nodes.push(
                <span key={key++} className="jh-punct">{text.slice(lastIndex, match.index)}</span>
            );
        }

        const token = match[0];
        let className = "jh-number";

        if (token[0] === '"') {
            let j = TOKEN_REGEX.lastIndex;
            while (j < text.length && text[j] === " ") j++;
            className = text[j] === ":" ? "jh-key" : "jh-string";
        } else if (token === "true" || token === "false") {
            className = "jh-boolean";
        } else if (token === "null") {
            className = "jh-null";
        }

        nodes.push(<span key={key++} className={className}>{token}</span>);
        lastIndex = TOKEN_REGEX.lastIndex;
    }

    if (lastIndex < text.length) {
        nodes.push(<span key={key++} className="jh-punct">{text.slice(lastIndex)}</span>);
    }

    return nodes;
}

export default function JsonHighlight({ value, raw }: Props) {
    const text = toText(value, raw);
    const isJson = typeof value === "object" && value !== null;

    return (
        <pre className="jh-pre">
            {isJson ? highlight(text) : <span className="jh-plain">{text}</span>}
        </pre>
    );
}
