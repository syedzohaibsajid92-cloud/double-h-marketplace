import React from "react";
import { Store, LayoutDashboard, ShieldCheck, LogOut, Sparkles } from "lucide-react";
import { hasVendorAccess } from "../data/users";

export default function ModuleSwitcher({ activeModule, onSwitch, user, onLogout, onBecomeVendor, onLoginClick }) {
  if (!user) {
    return (
      <div className="module-switcher">
        <div className="module-tabs">
          <span className="module-tab active">
            <Store size={14} />
            <span className="module-tab-label">Storefront</span>
          </span>
        </div>
        <div className="session-info">
          <button className="session-logout" onClick={onLoginClick}>
            Login / Sign Up
          </button>
        </div>
      </div>
    );
  }

  const modules = [{ key: "store", label: "Storefront", icon: Store }];
  if (hasVendorAccess(user)) {
    modules.push({ key: "vendor", label: "Vendor Dashboard", icon: LayoutDashboard });
  }
  if (user.role === "admin") {
    modules.push({ key: "admin", label: "Admin Panel", icon: ShieldCheck });
  }

  return (
    <div className="module-switcher">
      <div className="module-tabs">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              className={`module-tab ${activeModule === m.key ? "active" : ""}`}
              onClick={() => onSwitch(m.key)}
            >
              <Icon size={14} />
              <span className="module-tab-label">{m.label}</span>
            </button>
          );
        })}

        {user.role === "customer" && !hasVendorAccess(user) && (
          <button className="module-tab become-vendor-tab" onClick={onBecomeVendor}>
            <Sparkles size={14} />
            <span className="module-tab-label">Become a Vendor</span>
          </button>
        )}
      </div>

      <div className="session-info">
        <span className="session-greeting">
          Hi, {user.first_name}{" "}
          <em className="session-role">
            ({user.role}
            {hasVendorAccess(user) && user.role !== "vendor" ? " + vendor" : ""})
          </em>
        </span>
        <button className="session-logout" onClick={onLogout}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}
