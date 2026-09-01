type Props = {
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
};

export default function Switch({ checked, onChange, disabled }: Props) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            className={`switch${checked ? " switch--on" : ""}`}
            onClick={() => onChange(!checked)}
        >
            <span className="switch__thumb" />
        </button>
    );
}
