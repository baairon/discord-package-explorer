import { BarChartIcon, DmIcon, GroupIcon, ServerIcon } from "./icons";
export type MobileNavTab = "dms" | "groups" | "servers" | "stats";
interface MobileNavProps {
  active: MobileNavTab;
  onSelect: (tab: MobileNavTab) => void;
}
export function MobileNav({
  active,
  onSelect
}: MobileNavProps) {
  return <nav className="mobile-nav" role="tablist" aria-label="Primary">
      <NavButton tab="dms" label="DMs" active={active === "dms"} onSelect={onSelect}>
        <DmIcon />
      </NavButton>
      <NavButton tab="groups" label="Groups" active={active === "groups"} onSelect={onSelect}>
        <GroupIcon />
      </NavButton>
      <NavButton tab="servers" label="Servers" active={active === "servers"} onSelect={onSelect}>
        <ServerIcon />
      </NavButton>
      <NavButton tab="stats" label="Stats" active={active === "stats"} onSelect={onSelect}>
        <BarChartIcon />
      </NavButton>
    </nav>;
}
function NavButton({
  tab,
  label,
  active,
  onSelect,
  children
}: {
  tab: MobileNavTab;
  label: string;
  active: boolean;
  onSelect: (tab: MobileNavTab) => void;
  children: React.ReactNode;
}) {
  return <button type="button" role="tab" aria-selected={active} className={`mobile-nav-btn${active ? " active" : ""}`} onClick={() => onSelect(tab)}>
      <span className="mobile-nav-icon">{children}</span>
      <span className="mobile-nav-label">{label}</span>
    </button>;
}
