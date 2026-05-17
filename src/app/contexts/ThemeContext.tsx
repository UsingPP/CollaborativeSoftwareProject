import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type AppTheme = {
  name: string;
  label: string;
  btn: string;
  gradientBg: string;
  bgLight: string;
  bgMedium: string;
  hoverBgLight: string;
  hoverBg: string;
  avatarGradient: string;
  textAccent: string;
  textDark: string;
  logoText: string;
  borderAccent: string;
  borderStrong: string;
  focusRing: string;
  ringSelected: string;
  ringLight: string;
  badgeBg: string;
  chipSelected: string;
  navActive: string;
  navActiveIcon: string;
};

export const themes: Record<string, AppTheme> = {
  blue: {
    name: "blue", label: "Blue",
    btn: "bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600",
    gradientBg: "bg-gradient-to-br from-blue-600 to-indigo-500",
    bgLight: "bg-blue-50", bgMedium: "bg-blue-100",
    hoverBgLight: "hover:bg-blue-50", hoverBg: "hover:bg-blue-100",
    avatarGradient: "from-blue-500 to-indigo-500",
    textAccent: "text-blue-600", textDark: "text-blue-700",
    logoText: "from-blue-700 to-indigo-600",
    borderAccent: "border-blue-200", borderStrong: "border-blue-500",
    focusRing: "focus:ring-2 focus:ring-blue-400",
    ringSelected: "ring-2 ring-blue-400 border-blue-200",
    ringLight: "ring-2 ring-blue-300",
    badgeBg: "bg-blue-600",
    chipSelected: "bg-blue-50 text-blue-600 border border-blue-200",
    navActive: "bg-blue-50 text-blue-700 font-semibold border-l-[3px] border-blue-500 pl-[calc(0.75rem-3px)]",
    navActiveIcon: "text-blue-600",
  },
  violet: {
    name: "violet", label: "Violet",
    btn: "bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600",
    gradientBg: "bg-gradient-to-br from-violet-600 to-purple-500",
    bgLight: "bg-violet-50", bgMedium: "bg-violet-100",
    hoverBgLight: "hover:bg-violet-50", hoverBg: "hover:bg-violet-100",
    avatarGradient: "from-violet-500 to-purple-500",
    textAccent: "text-violet-600", textDark: "text-violet-700",
    logoText: "from-violet-700 to-purple-600",
    borderAccent: "border-violet-200", borderStrong: "border-violet-500",
    focusRing: "focus:ring-2 focus:ring-violet-400",
    ringSelected: "ring-2 ring-violet-400 border-violet-200",
    ringLight: "ring-2 ring-violet-300",
    badgeBg: "bg-violet-600",
    chipSelected: "bg-violet-50 text-violet-600 border border-violet-200",
    navActive: "bg-violet-50 text-violet-700 font-semibold border-l-[3px] border-violet-500 pl-[calc(0.75rem-3px)]",
    navActiveIcon: "text-violet-600",
  },
  emerald: {
    name: "emerald", label: "Emerald",
    btn: "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600",
    gradientBg: "bg-gradient-to-br from-emerald-600 to-teal-500",
    bgLight: "bg-emerald-50", bgMedium: "bg-emerald-100",
    hoverBgLight: "hover:bg-emerald-50", hoverBg: "hover:bg-emerald-100",
    avatarGradient: "from-emerald-500 to-teal-500",
    textAccent: "text-emerald-600", textDark: "text-emerald-700",
    logoText: "from-emerald-700 to-teal-600",
    borderAccent: "border-emerald-200", borderStrong: "border-emerald-500",
    focusRing: "focus:ring-2 focus:ring-emerald-400",
    ringSelected: "ring-2 ring-emerald-400 border-emerald-200",
    ringLight: "ring-2 ring-emerald-300",
    badgeBg: "bg-emerald-600",
    chipSelected: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    navActive: "bg-emerald-50 text-emerald-700 font-semibold border-l-[3px] border-emerald-500 pl-[calc(0.75rem-3px)]",
    navActiveIcon: "text-emerald-600",
  },
  rose: {
    name: "rose", label: "Rose",
    btn: "bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600",
    gradientBg: "bg-gradient-to-br from-rose-600 to-pink-500",
    bgLight: "bg-rose-50", bgMedium: "bg-rose-100",
    hoverBgLight: "hover:bg-rose-50", hoverBg: "hover:bg-rose-100",
    avatarGradient: "from-rose-500 to-pink-500",
    textAccent: "text-rose-600", textDark: "text-rose-700",
    logoText: "from-rose-700 to-pink-600",
    borderAccent: "border-rose-200", borderStrong: "border-rose-500",
    focusRing: "focus:ring-2 focus:ring-rose-400",
    ringSelected: "ring-2 ring-rose-400 border-rose-200",
    ringLight: "ring-2 ring-rose-300",
    badgeBg: "bg-rose-600",
    chipSelected: "bg-rose-50 text-rose-600 border border-rose-200",
    navActive: "bg-rose-50 text-rose-700 font-semibold border-l-[3px] border-rose-500 pl-[calc(0.75rem-3px)]",
    navActiveIcon: "text-rose-600",
  },
  dark: {
    name: "dark", label: "Dark",
    btn: "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-800 hover:to-slate-700",
    gradientBg: "bg-gradient-to-br from-slate-700 to-slate-600",
    bgLight: "bg-slate-100", bgMedium: "bg-slate-200",
    hoverBgLight: "hover:bg-slate-100", hoverBg: "hover:bg-slate-200",
    avatarGradient: "from-slate-600 to-slate-500",
    textAccent: "text-slate-700", textDark: "text-slate-800",
    logoText: "from-slate-800 to-slate-600",
    borderAccent: "border-slate-300", borderStrong: "border-slate-600",
    focusRing: "focus:ring-2 focus:ring-slate-400",
    ringSelected: "ring-2 ring-slate-400 border-slate-300",
    ringLight: "ring-2 ring-slate-300",
    badgeBg: "bg-slate-700",
    chipSelected: "bg-slate-100 text-slate-700 border border-slate-300",
    navActive: "bg-slate-100 text-slate-800 font-semibold border-l-[3px] border-slate-600 pl-[calc(0.75rem-3px)]",
    navActiveIcon: "text-slate-700",
  },
};

type ThemeContextType = {
  theme: AppTheme;
  setThemeName: (name: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.blue,
  setThemeName: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState("blue");
  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
