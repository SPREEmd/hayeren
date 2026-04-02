import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/alphabet", label: "Alphabet", icon: "Ա" },
  { to: "/quiz", label: "Quiz", icon: "🎯" },
  { to: "/vocabulary", label: "Vocab", icon: "📚" },
  { to: "/translate", label: "Translate", icon: "🔄" },
  { to: "/tutor", label: "Tutor", icon: "🤖" },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] text-xs font-medium transition-colors ${
              isActive ? "text-indigo-600" : "text-gray-500"
            }`
          }
        >
          <span className="text-xl leading-none mb-1">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
