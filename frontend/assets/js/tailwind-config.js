// Bassira Hall — shared Tailwind design tokens
// Canonical source: index.html's original token set (matches the steel-blue /
// teal / sand-gold visual identity). Other pages had drifted slightly
// (e.g. primary was #002452 on some pages vs #1B3A6B here) — unified here
// so every page renders with the same palette.
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#f2efff",
        "surface-container-high": "#e8e5ff",
        "surface-bright": "#fcf8ff",
        "inverse-surface": "#2f2e43",
        "on-background": "#1a1a2e",
        "on-primary-fixed": "#001a40",
        "secondary-container": "#8cf5e4",
        "primary-fixed": "#d7e2ff",
        "on-tertiary-container": "#bfa066",
        "tertiary-container": "#4c3706",
        "primary-fixed-dim": "#acc7ff",
        "tertiary-fixed": "#ffdea3",
        "surface-tint": "#425e91",
        "secondary-fixed-dim": "#6fd8c8",
        "surface-variant": "#e2e0fc",
        "on-tertiary-fixed-variant": "#594312",
        "on-error-container": "#93000a",
        "on-primary": "#ffffff",
        "on-primary-container": "#89a5dd",
        "surface-container-highest": "#e2e0fc",
        "on-tertiary-fixed": "#261900",
        "on-primary-fixed-variant": "#294678",
        "surface": "#F7F8FC",
        "inverse-primary": "#acc7ff",
        "on-surface": "#1a1a2e",
        "tertiary": "#322200",
        "on-secondary-fixed": "#00201c",
        "on-secondary-fixed-variant": "#005048",
        "surface-container-low": "#f5f2ff",
        "surface-container-lowest": "#ffffff",
        "error-container": "#ffdad6",
        "secondary": "#006a60",
        "outline": "#747780",
        "on-secondary": "#ffffff",
        "surface-container": "#efecff",
        "on-error": "#ffffff",
        "on-surface-variant": "#44474f",
        "outline-variant": "#c4c6d0",
        "error": "#ba1a1a",
        "background": "#F7F8FC",
        "on-secondary-container": "#007166",
        "secondary-fixed": "#8cf5e4",
        "on-tertiary": "#ffffff",
        "primary": "#1B3A6B",
        "surface-dim": "#dad7f3",
        "primary-container": "#1B3A6B",
        "tertiary-fixed-dim": "#e3c285"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        "container-max": "1280px",
        "margin-mobile": "16px",
        "touch-target": "48px",
        unit: "8px",
        gutter: "24px",
        "margin-desktop": "64px"
      },
      fontFamily: {
        "display-lg-mobile": ["Poppins"],
        "headline-md": ["Poppins"],
        "body-lg": ["Inter"],
        "body-md": ["Inter"],
        "display-lg": ["Poppins"],
        "label-md": ["Inter"],
        "headline-sm": ["Poppins"],
        "arabic-body": ["Cairo"],
        "arabic-h1": ["Cairo"]
      },
      fontSize: {
        "display-lg-mobile": ["36px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-md": ["32px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["20px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "display-lg": ["48px", { lineHeight: "1.2", fontWeight: "700" }],
        "label-md": ["16px", { lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "600" }],
        "headline-sm": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "arabic-body": ["20px", { lineHeight: "1.8", fontWeight: "400" }],
        "arabic-h1": ["36px", { lineHeight: "1.4", fontWeight: "700" }]
      }
    }
  }
};
