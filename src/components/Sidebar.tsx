
import {
  Activity,
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Users,
  Workflow,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Projects", icon: Workflow },
  { label: "Tasks", icon: ClipboardList },
  { label: "Team", icon: Users },
  { label: "Inventory", icon: Boxes },
  { label: "Incidents", icon: ShieldAlert },
  { label: "Reports", icon: BarChart3 },
];

export default function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Activity size={23} />
        </div>

        <div>
          <h2>NexusOps</h2>
          <span>OPERATIONS HUB</span>
        </div>
      </div>

      <div className="workspace-label">WORKSPACE</div>

      <nav className="navigation">
        {navigation.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${
              activePage === label ? "active" : ""
            }`}
            onClick={() => onNavigate(label)}
          >
            <Icon size={19} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`nav-item ${
            activePage === "Settings" ? "active" : ""
          }`}
          onClick={() => onNavigate("Settings")}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="sidebar-profile">
          <div className="avatar avatar-purple">SK</div>
          <div className="profile-info">
            <strong>Workspace Admin</strong>
            <span>Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
