// ============================================================
// theme.tsx — Production-Ready React Native Theme System
// ============================================================

import React, { createContext, useContext, useMemo, useState } from "react";
import { Platform, useColorScheme } from "react-native";

// ─── TYPES ───────────────────────────────────────────────────
type ThemeMode = "light" | "dark";
type ShadowLevel = "sm" | "md" | "lg";

type SemanticTokens = ReturnType<typeof createTokens>;
export type Theme = ReturnType<typeof buildTheme>;

export type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

// ─── SPACING SCALE ───────────────────────────────────────────
const spacing = { xs: 4, sm: 8, md: 16, lg: 32, xl: 64 } as const;

// ─── BORDER RADIUS ───────────────────────────────────────────
const borderRadius = { sm: 4, md: 8, lg: 16 } as const;

// ─── OPACITY ─────────────────────────────────────────────────
const opacity = { low: 0.1, md: 0.5, high: 0.9 } as const;

// ─── COLOR PALETTE ───────────────────────────────────────────
const palette = {
    black: "#000000",
    white: "#ffffff",
    gray: {
        100: "#f8fafc",
        300: "#e2e8f0",
        500: "#94a3b8",
        700: "#475569",
        800: "#1e293b",
        900: "#0f172a",
    },
    indigo: {
        200: "#c7d2fe",
        400: "#818cf8",
        600: "#4f46e5",
        800: "#3730a3",
    },
    green: { 500: "#22c55e" },
    red: { 500: "#ef4444" },
    yellow: { 500: "#eab308" },
} as const;

// ─── TYPOGRAPHY BASE ─────────────────────────────────────────
const fontSizes = {
    h1: 48,
    h2: 36,
    h3: 28,
    h4: 22,
    body: 16,
    sm: 14,
    xs: 12,
} as const;


const fontFamilies = {
    heading: "Inter",
    body: "Roboto",
} as const;

const fontWeights = {
    regular: "400" as const,
    bold: "700" as const,
};

const lineHeights = {
    h1: 54,
    h2: 42,
    h3: 34,
    h4: 28,
    body: 22,
    sm: 20,
    xs: 16,
} as const;

const letterSpacing = {
    tight: -1.2,
    normal: 0,
} as const;

// ─── TYPOGRAPHY SYSTEM ───────────────────────────────────────
const typography = {
    h1: {
        fontFamily: fontFamilies.heading,
        fontSize: fontSizes.h1,
        fontWeight: fontWeights.bold,
        lineHeight: lineHeights.h1,
        letterSpacing: letterSpacing.tight,
    },
    h2: {
        fontFamily: fontFamilies.heading,
        fontSize: fontSizes.h2,
        fontWeight: fontWeights.bold,
        lineHeight: lineHeights.h2,
        letterSpacing: letterSpacing.tight,
    },
    h3: {
        fontFamily: fontFamilies.heading,
        fontSize: fontSizes.h3,
        fontWeight: fontWeights.bold,
        lineHeight: lineHeights.h3,
        letterSpacing: letterSpacing.tight,
    },
    h4: {
        fontFamily: fontFamilies.heading,
        fontSize: fontSizes.h4,
        fontWeight: fontWeights.bold,
        lineHeight: lineHeights.h4,
        letterSpacing: letterSpacing.tight,
    },
    body: {
        fontFamily: fontFamilies.body,
        fontSize: fontSizes.body,
        fontWeight: fontWeights.regular,
        lineHeight: lineHeights.body,
        letterSpacing: letterSpacing.normal,
    },
    bodySmall: {
        fontFamily: fontFamilies.body,
        fontSize: fontSizes.sm,
        fontWeight: fontWeights.regular,
        lineHeight: lineHeights.sm,
        letterSpacing: letterSpacing.normal,
    },
    caption: {
        fontFamily: fontFamilies.body,
        fontSize: fontSizes.xs,
        fontWeight: fontWeights.regular,
        lineHeight: lineHeights.xs,
        letterSpacing: letterSpacing.normal,
    },
} as const;

// ─── SHADOW SYSTEM ───────────────────────────────────────────
const buildShadow = (level: ShadowLevel = "md", color: string = "#000") => {
    const map = {
        sm: { h: 2, r: 3, e: 2 },
        md: { h: 4, r: 6, e: 5 },
        lg: { h: 8, r: 10, e: 8 },
    };

    const s = map[level] ?? map.md;

    return Platform.select({
        ios: {
            shadowColor: color,
            shadowOffset: { width: 0, height: s.h },
            shadowOpacity: 0.15,
            shadowRadius: s.r,
        },
        android: {
            elevation: s.e,
            shadowColor: color,
        },
        default: {
            shadowColor: color,
            shadowOffset: { width: 0, height: s.h },
            shadowOpacity: 0.15,
            shadowRadius: s.r,
        },
    }) ?? {};
};

// ─── SEMANTIC TOKENS ─────────────────────────────────────────
const createTokens = (mode: ThemeMode) => {
    const isDark = mode === "dark";

    return {
        bg: {
            default: isDark ? palette.gray[900] : palette.white,
            muted: isDark ? palette.gray[800] : palette.gray[100],
        },
        fg: {
            default: isDark ? palette.white : palette.black,
            muted: palette.gray[500],
        },
        accent: {
            default: isDark ? palette.indigo[600] : palette.indigo[400],
            onAccent: palette.white,
        },
        status: {
            success: palette.green[500],
            error: palette.red[500],
            warning: palette.yellow[500],
        },
        shadowColor: palette.black,
    };
};

// ─── COMPONENT TOKENS ────────────────────────────────────────
const createComponents = (tokens: SemanticTokens) => ({
    button: {
        base: {
            borderRadius: borderRadius.md,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderWidth: 1,
        },
        primary: {
            backgroundColor: tokens.accent.default,
            color: tokens.accent.onAccent,
        },
    },
    card: {
        base: {
            borderRadius: borderRadius.md,
            padding: spacing.md,
            backgroundColor: tokens.bg.default,
            ...buildShadow("sm", tokens.shadowColor),
        },
    },
});

// ─── THEME BUILDER ───────────────────────────────────────────
const buildTheme = (mode: ThemeMode) => {
    const tokens = createTokens(mode);

    return {
        mode,
        spacing,
        borderRadius,
        opacity,
        typography,
        colors: tokens,
        shadow: buildShadow,
        components: createComponents(tokens),
    };
};

// ─── THEMES ──────────────────────────────────────────────────
export const lightTheme = buildTheme("light");
export const darkTheme = buildTheme("dark");

// ─── THEME CONTEXT ───────────────────────────────────────────
const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    toggleTheme: () => { },
});

// ─── PROVIDER ────────────────────────────────────────────────
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const system = useColorScheme();
    const [override, setOverride] = useState<ThemeMode | null>(null);

    const mode: ThemeMode = override ?? (system as ThemeMode) ?? "light";

    const toggleTheme = () => {
        setOverride((prev) => {
            const current = prev ?? (system as ThemeMode) ?? "light";
            return current === "light" ? "dark" : "light";
        });
    };

    const theme = useMemo(
        () => (mode === "light" ? lightTheme : darkTheme),
        [mode]
    );

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// ─── HOOK ────────────────────────────────────────────────────
export const useTheme = () => useContext(ThemeContext);

// ─── DEFAULT EXPORT ──────────────────────────────────────────
export default { light: lightTheme, dark: darkTheme };
