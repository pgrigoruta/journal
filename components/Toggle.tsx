'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`block w-14 h-8 rounded-full transition-colors duration-200 ${
            checked ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <div
            className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ${
              checked ? 'transform translate-x-6' : ''
            }`}
          />
        </div>
      </div>
      {label && (
        <span className="ml-3 text-gray-300 text-sm font-medium">
          {checked ? 'Yes' : 'No'}
        </span>
      )}
    </label>
  );
}

