import { useApp } from '../context/AppContext';
import type { Lang } from '../i18n/translations';

export function SettingsToolbar() {
    const { lang, setLang, theme, toggleTheme, langLabels } = useApp();
    const langs: Lang[] = ['th', 'en', 'ja'];
    const langDisplayMap: Record<Lang, string> = {
        th: 'TH',
        en: 'EN',
        ja: 'JP'
    };

    return (
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            {langs.map(l => (
                <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 select-none cursor-pointer rounded-lg text-xs font-medium transition-all duration-200 outline-none
                        ${lang === l
                            ? 'bg-white text-indigo-600 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-400 dark:shadow-none'
                            : 'text-slate-500 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-slate-700/50 dark:hover:text-gray-200'}`}
                >
                    {langDisplayMap[l]}
                </button>
            ))}
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-slate-700/50 transition-all outline-none"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
                {theme === 'dark' ? '🌙' : '☀️'}
            </button>
        </div>
    );
}
