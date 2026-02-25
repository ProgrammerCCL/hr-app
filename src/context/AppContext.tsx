import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import translations, { Lang, langLabels } from '../i18n/translations';

type Theme = 'dark' | 'light';

interface AppContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: typeof translations['th'];
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    langLabels: typeof langLabels;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>(() => {
        const saved = localStorage.getItem('hrms_lang');
        return (saved as Lang) || 'th';
    });

    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('hrms_theme');
        return (saved as Theme) || 'light';
    });

    const setLang = (newLang: Lang) => {
        setLangState(newLang);
        localStorage.setItem('hrms_lang', newLang);
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('hrms_theme', newTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Apply theme class to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        }
    }, [theme]);

    const t = translations[lang];

    return (
        <AppContext.Provider value={{ lang, setLang, t, theme, setTheme, toggleTheme, langLabels }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
