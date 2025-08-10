import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getCurrentTheme(): "light" | "dark" {
  try {
    return (localStorage.getItem("ace_theme") as "light" | "dark") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch {
    return "light";
  }
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try {
    localStorage.setItem("ace_theme", theme);
  } catch {}
}

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = React.useState<"light" | "dark">(getCurrentTheme());

  const onToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <nav className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold tracking-tight">
            AI Content & Image Explorer
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `hover:underline ${isActive ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-600 dark:text-neutral-300"}`
              }
            >
              Search
            </NavLink>
            <NavLink
              to="/image"
              className={({ isActive }) =>
                `hover:underline ${isActive ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-600 dark:text-neutral-300"}`
              }
            >
              Image
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `hover:underline ${isActive ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-600 dark:text-neutral-300"}`
                }
              >
                Dashboard
              </NavLink>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            aria-label="Toggle theme"
            title="Toggle dark mode"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
