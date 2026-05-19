interface SearchHeaderProps {
  search: string;
  placeholder: string;
  onSearch: (s: string) => void;
  className?: string;
}
export function SearchHeader({
  search,
  placeholder,
  onSearch,
  className
}: SearchHeaderProps) {
  return <div className={className ? `sidebar-header ${className}` : "sidebar-header"}>
      <div className="search-wrap">
        <input type="text" className="sidebar-search" placeholder={placeholder} aria-label={placeholder} value={search} onChange={e => onSearch(e.target.value)} />
      </div>
    </div>;
}
