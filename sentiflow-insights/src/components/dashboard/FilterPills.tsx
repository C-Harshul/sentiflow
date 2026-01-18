interface FilterPillsProps {
  options: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FilterPills = ({ options, activeFilter, onFilterChange }: FilterPillsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onFilterChange(option)}
          className={`filter-pill ${
            activeFilter === option ? 'filter-pill-active' : 'filter-pill-inactive'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default FilterPills;
