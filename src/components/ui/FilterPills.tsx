"use client";

interface FilterPillsProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function FilterPills({ options, selected, onChange }: FilterPillsProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => toggle(option)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
              isSelected
                ? "bg-violet-100 text-violet-700 border border-violet-300"
                : "bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200"
            }`}
          >
            {option}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
