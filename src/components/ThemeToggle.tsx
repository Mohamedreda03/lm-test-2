
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    // default: dark if user prefers, otherwise light
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // On mount, load theme from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) {
        setDark(saved === "dark");
      }
    }
  }, []);

  return (
    <button
      onClick={() => setDark((x) => !x)}
      className={`transition-colors p-2 rounded-full hover:bg-accent ${dark ? "bg-gray-900 text-yellow-400" : "bg-gray-100 text-blue-600"}`}
      aria-label="Toggle dark mode"
      title="تبديل الوضع الليلي"
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;
