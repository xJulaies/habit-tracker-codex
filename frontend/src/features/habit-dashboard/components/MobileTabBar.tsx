import { LayoutDashboard, PlusCircle, UserCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MobileDashboardTab } from "../habitDashboard.types";

type MobileTabBarProps = {
  activeTab: MobileDashboardTab;
  onChangeTab: (tab: MobileDashboardTab) => void;
};

const tabs: {
  id: MobileDashboardTab;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "home", label: "Dashboard öffnen", icon: LayoutDashboard },
  { id: "create", label: "Habit erstellen", icon: PlusCircle },
  { id: "profile", label: "Profil öffnen", icon: UserCircle },
];

export function MobileTabBar({ activeTab, onChangeTab }: MobileTabBarProps) {
  return (
    <nav className="mobile-tabbar" aria-label="Dashboard Navigation">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          type="button"
          className="mobile-tab"
          data-active={activeTab === id}
          key={id}
          aria-label={label}
          title={label}
          onClick={() => onChangeTab(id)}
        >
          <Icon size={25} strokeWidth={2.15} />
        </button>
      ))}
    </nav>
  );
}
