import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeProviderProps {
    children: ReactNode;
    attribute?: "class" | "data-theme"; // mimic next-themes API
    value?: { light?: string; dark?: string }; // CSS class names
    defaultTheme?: Theme;
    enableSystem?: boolean;
}

interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    attribute = "class",
    value = { light: "light", dark: "dark" },
    defaultTheme = "light",
    enableSystem = false,
}) => {
    const getSystemTheme = (): Theme => {
        if (!enableSystem) return defaultTheme;
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    };

    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        return stored || getSystemTheme() || defaultTheme;
    });

    type ThemeUpdater = Theme | ((prev: Theme) => Theme);

    const setTheme = (value: ThemeUpdater) => {
        const nextTheme = typeof value === "function" ? value(theme) : value;
        setThemeState(nextTheme);
        localStorage.setItem("theme", nextTheme);
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    useEffect(() => {
        const element = document.documentElement;
        const lightClass = value.light ?? "light";
        const darkClass = value.dark ?? "dark";

        if (attribute === "class") {
            element.classList.remove(lightClass, darkClass);
            element.classList.add(theme === "light" ? lightClass : darkClass);
        } else if (attribute === "data-theme") {
            element.setAttribute("data-theme", theme);
        }
    }, [theme, attribute, value.light, value.dark]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
}