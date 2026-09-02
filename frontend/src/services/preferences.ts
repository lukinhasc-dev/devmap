export type KanbanPrefs = {
    showPriority: boolean;
    showLabels: boolean;
};

const DEFAULTS: KanbanPrefs = {
    showPriority: true,
    showLabels: true,
};

function storageKey(projectId: number): string {
    return `devmap:kanbanPrefs:${projectId}`;
}

export function getKanbanPrefs(projectId: number): KanbanPrefs {
    try {
        const raw = localStorage.getItem(storageKey(projectId));
        if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
        return { ...DEFAULTS };
    }
    return { ...DEFAULTS };
}

export function setKanbanPrefs(projectId: number, prefs: KanbanPrefs) {
    try {
        localStorage.setItem(storageKey(projectId), JSON.stringify(prefs));
    } catch {
        return;
    }
}
