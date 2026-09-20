interface ToggleProps {
  on?: boolean;
  checked?: boolean;
  onToggle?: () => void;
  onChange?: (val: boolean) => void;
}

export function Toggle({ on, checked, onToggle, onChange }: ToggleProps) {
  const isOn = on ?? checked ?? false;

  const handleClick = () => {
    onToggle?.();
    onChange?.(!isOn);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={handleClick}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
        ${isOn ? 'bg-accent' : 'bg-border'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
          ${isOn ? 'translate-x-[18px]' : 'translate-x-1'}`}
      />
    </button>
  );
}