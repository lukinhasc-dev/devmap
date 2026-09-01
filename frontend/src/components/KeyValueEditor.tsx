export type KeyValuePair = { key: string; value: string };

export function parsePairs(json?: string | null): KeyValuePair[] {
    if (!json) return [];
    try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
            return parsed
                .filter((p) => p && typeof p === "object")
                .map((p) => ({ key: String(p.key ?? ""), value: String(p.value ?? "") }));
        }
        if (parsed && typeof parsed === "object") {
            return Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
        }
    } catch {
        return [];
    }
    return [];
}

export function stringifyPairs(pairs: KeyValuePair[]): string | null {
    const clean = pairs.filter((p) => p.key.trim() !== "");
    if (clean.length === 0) return null;
    return JSON.stringify(clean);
}

export function appendQuery(url: string, pairs: KeyValuePair[]): string {
    const clean = pairs.filter((p) => p.key.trim() !== "");
    if (clean.length === 0) return url;
    const qs = clean
        .map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value ?? "")}`)
        .join("&");
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}${qs}`;
}

type Props = {
    pairs: KeyValuePair[];
    onChange: (pairs: KeyValuePair[]) => void;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
};

function IconX() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function IconPlus() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

export default function KeyValueEditor({
    pairs,
    onChange,
    keyPlaceholder = "chave",
    valuePlaceholder = "valor",
}: Props) {
    function update(index: number, field: keyof KeyValuePair, value: string) {
        onChange(pairs.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
    }

    function remove(index: number) {
        onChange(pairs.filter((_, i) => i !== index));
    }

    function add() {
        onChange([...pairs, { key: "", value: "" }]);
    }

    return (
        <div className="kv-editor">
            {pairs.map((pair, i) => (
                <div className="kv-editor__row" key={i}>
                    <input
                        className="ep-form__input ep-form__mono"
                        type="text"
                        placeholder={keyPlaceholder}
                        value={pair.key}
                        onChange={(e) => update(i, "key", e.target.value)}
                    />
                    <input
                        className="ep-form__input ep-form__mono"
                        type="text"
                        placeholder={valuePlaceholder}
                        value={pair.value}
                        onChange={(e) => update(i, "value", e.target.value)}
                    />
                    <button
                        type="button"
                        className="kv-editor__remove"
                        title="Remover"
                        onClick={() => remove(i)}
                    >
                        <IconX />
                    </button>
                </div>
            ))}

            <button type="button" className="kv-editor__add" onClick={add}>
                <IconPlus />
                Adicionar parâmetro
            </button>
        </div>
    );
}
