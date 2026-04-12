import type {
  FileManagerPlace,
  FileManagerPlaceItem,
  FolderDefinition,
  PortfolioFileProfile,
  TerminalColorPreset,
} from "./types";

export const FOLDERS: readonly FolderDefinition[] = [
  {
    id: "dumps",
    name: "about me",
    tone: "charcoal",
    position: "folder-1",
    surfacePosition: "window-1",
    files: ["bio.md", "portrait.jpg", "quick-facts.txt"],
  },
  {
    id: "wishlist",
    name: "projects",
    tone: "silver",
    position: "folder-2",
    surfacePosition: "window-2",
    files: [
      "portfolio-redesign.pdf",
      "ecommerce-case-study.md",
      "dashboard-ui.png",
      "github-links.txt",
    ],
  },
  {
    id: "content",
    name: "experience",
    tone: "steel",
    position: "folder-3",
    surfacePosition: "window-3",
    files: ["resume-2026.pdf", "work-history.doc", "certificates.zip"],
  },
  {
    id: "favorites",
    name: "contact",
    tone: "ink",
    position: "folder-4",
    surfacePosition: "window-4",
    files: ["contact-info.txt", "social-links.md", "book-a-call.pdf"],
  },
] as const;

export const FILE_TIMESTAMPS = [
  "Today, 07:12 PM",
  "Today, 06:47 PM",
  "Yesterday, 11:32 PM",
  "Yesterday, 08:04 PM",
  "Apr 10, 09:18 PM",
] as const;

export const FILE_MANAGER_PLACES: FileManagerPlaceItem[] = [
  { id: "home", label: "home", glyph: "◉" },
  { id: "desktop", label: "desktop", glyph: "◎" },
  { id: "documents", label: "documents", glyph: "◎" },
  { id: "downloads", label: "downloads", glyph: "◎" },
  { id: "favorites", label: "favorites", glyph: "◎" },
];

export const FILE_MANAGER_PLACE_ORDER: FileManagerPlace[] = [
  "home",
  "desktop",
  "documents",
  "downloads",
  "favorites",
];

export const FILE_MANAGER_PLACE_LABEL: Record<FileManagerPlace, string> = {
  home: "home",
  desktop: "desktop",
  documents: "documents",
  downloads: "downloads",
  favorites: "favorites",
};

export const PORTFOLIO_FILE_PROFILES: Record<string, PortfolioFileProfile> = {
  "bio.md": {
    title: "About Jay",
    summary: "Short story and core strengths.",
    realFilePath: "./files/about/bio.md",
  },
  "portrait.jpg": {
    title: "Profile Portrait",
    summary: "Primary profile photo used across the portfolio.",
    realFilePath: "./files/about/portrait.png",
  },
  "quick-facts.txt": {
    title: "Quick Facts",
    summary: "Fast personal and professional highlights.",
    realFilePath: "./files/about/quick-facts.txt",
  },
  "portfolio-redesign.pdf": {
    title: "Portfolio Redesign",
    summary: "Complete visual and interaction overhaul project.",
    realFilePath: "./files/projects/portfolio-redesign.html",
  },
  "ecommerce-case-study.md": {
    title: "Ecommerce Case Study",
    summary: "Conversion-focused storefront redesign summary.",
    realFilePath: "./files/projects/ecommerce-case-study.md",
  },
  "dashboard-ui.png": {
    title: "Dashboard UI",
    summary: "Admin dashboard interface concept and implementation notes.",
    realFilePath: "./files/projects/dashboard-ui.png",
  },
  "github-links.txt": {
    title: "Repository Links",
    summary: "Selected repositories and code samples.",
    realFilePath: "./files/projects/github-links.txt",
  },
  "resume-2026.pdf": {
    title: "Resume 2026",
    summary: "Current resume with updated project history.",
    realFilePath: "./files/experience/resume-2026.html",
  },
  "work-history.doc": {
    title: "Work History",
    summary: "Detailed timeline of recent roles.",
    realFilePath: "./files/experience/work-history.txt",
  },
  "certificates.zip": {
    title: "Certificates",
    summary: "Bundled credential files.",
    realFilePath: "./files/experience/certificates.txt",
  },
  "contact-info.txt": {
    title: "Contact Info",
    summary: "Best channels for project inquiries.",
    realFilePath: "./files/contact/contact-info.txt",
  },
  "social-links.md": {
    title: "Social Links",
    summary: "Portfolio and social profile links.",
    realFilePath: "./files/contact/social-links.md",
  },
  "book-a-call.pdf": {
    title: "Book A Call",
    summary: "Simple booking instructions for discovery calls.",
    realFilePath: "./files/contact/book-a-call.txt",
  },
};

export const IMAGE_FILE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];
export const TEXT_FILE_EXTENSIONS = ["txt", "md", "log", "json", "doc"];
export const HTML_FILE_EXTENSIONS = ["html", "htm"];

export const MIN_WINDOW_WIDTH = 236;
export const MIN_WINDOW_HEIGHT = 170;
export const DEFAULT_FOLDER_WIDTH = 610;
export const DEFAULT_FOLDER_HEIGHT = 360;
export const TERMINAL_MIN_WIDTH = 360;
export const TERMINAL_MIN_HEIGHT = 220;
export const VIEWER_MIN_WIDTH = 420;
export const VIEWER_MIN_HEIGHT = 260;
export const VIM_MIN_WIDTH = 420;
export const VIM_MIN_HEIGHT = 280;
export const DEFAULT_VIM_WIDTH = 700;
export const DEFAULT_VIM_HEIGHT = 460;
export const DOCK_CLEARANCE = 18;
export const TOP_PANEL_CLEARANCE = 36;
export const SIDE_DOCK_CLEARANCE = 68;
export const TERMINAL_PROMPT = "linuxiac@arch:~$";

export const VIM_INITIAL_CONTENT = [
  "# notes.md",
  "",
  "- portfolio polish plan",
  "- improve interaction consistency",
  "- review responsive spacing",
  "",
  "Tip: press i for insert mode, Esc for normal mode, and :wq to save and close.",
].join("\n");

export const TERMINAL_COLOR_PRESETS: TerminalColorPreset[] = [
  {
    accent: "#6dd7ff",
    prompt: "#62d3ff",
    text: "#dde5f2",
    system: "#87d9ff",
    error: "#ff8f8f",
    glow: "rgba(56, 124, 186, 0.16)",
    neofetchGlow: "rgba(31, 150, 223, 0.18)",
  },
  {
    accent: "#8cf29d",
    prompt: "#7ee98f",
    text: "#dff7e4",
    system: "#9df2aa",
    error: "#ff9b9b",
    glow: "rgba(69, 148, 88, 0.16)",
    neofetchGlow: "rgba(69, 178, 100, 0.18)",
  },
  {
    accent: "#ffd27a",
    prompt: "#ffcb66",
    text: "#f8eedc",
    system: "#ffd88d",
    error: "#ffb0a6",
    glow: "rgba(180, 133, 48, 0.15)",
    neofetchGlow: "rgba(208, 154, 58, 0.18)",
  },
  {
    accent: "#c5b3ff",
    prompt: "#bca7ff",
    text: "#eee9ff",
    system: "#d2c4ff",
    error: "#ff9ec5",
    glow: "rgba(108, 88, 172, 0.16)",
    neofetchGlow: "rgba(133, 111, 208, 0.2)",
  },
  {
    accent: "#ffae80",
    prompt: "#ff9d6f",
    text: "#ffe9df",
    system: "#ffbb96",
    error: "#ff8b8b",
    glow: "rgba(172, 97, 61, 0.16)",
    neofetchGlow: "rgba(219, 130, 83, 0.2)",
  },
  {
    accent: "#89b4fa",
    prompt: "#78abfb",
    text: "#e5edff",
    system: "#9bc0ff",
    error: "#ff9ca8",
    glow: "rgba(69, 101, 164, 0.16)",
    neofetchGlow: "rgba(94, 132, 219, 0.2)",
  },
  {
    accent: "#8be9d3",
    prompt: "#7ee0ca",
    text: "#dcf8f1",
    system: "#9ef5df",
    error: "#ff9f9f",
    glow: "rgba(60, 140, 126, 0.16)",
    neofetchGlow: "rgba(79, 191, 169, 0.2)",
  },
  {
    accent: "#f2f2f2",
    prompt: "#e4e9f2",
    text: "#f4f7ff",
    system: "#e7eefb",
    error: "#ff9ca6",
    glow: "rgba(143, 154, 172, 0.14)",
    neofetchGlow: "rgba(176, 188, 210, 0.2)",
  },
];

const ARCH_ASCII_LOGO = [
  "                   -`",
  "                  .o+`",
  "                 `ooo/",
  "                `+oooo:",
  "               `+oooooo:",
  "               -+oooooo+:",
  "             `/:-:++oooo+:",
  "            `/++++/+++++++:",
  "           `/++++++++++++++:",
  "          `/+++ooooooooooooo/`",
  "         ./ooosssso++osssssso+`",
  "        .oossssso-````/ossssss+`",
  "       -osssssso.      :ssssssso.",
  "      :osssssss/        osssso+++.",
  "     /ossssssss/        +ssssooo/-",
  "   `/ossssso+/:-        -:/+osssso+-",
  "  `+sso+:-`                 `.-/+oso:",
  " `++:.                           `-/+/",
  " .`                                 `/",
] as const;

const ARCH_INFO_LINES = [
  "linuxiac@arch",
  "------------",
  "OS: Arch Linux x86_64",
  "Host: Linux Desktop Portfolio",
  "Kernel: 6.12.0-arch1-1",
  "Uptime: online",
  "Packages: 934 (pacman)",
  "Shell: bash 5.2.37",
  "Resolution: responsive",
  "DE: GNOME",
  "WM: Mutter",
  "Theme: adwaita-dark",
  "Icons: papirus",
  "Terminal: jay-terminal",
  "CPU: Intel Core i7",
  "GPU: NVIDIA GeForce",
  "Memory: 16GiB / 32GiB",
] as const;

const buildArchNeofetchText = () => {
  const logoWidth = ARCH_ASCII_LOGO.reduce((maxWidth, line) => Math.max(maxWidth, line.length), 0) + 3;
  const rowCount = Math.max(ARCH_ASCII_LOGO.length, ARCH_INFO_LINES.length);

  const rows = Array.from({ length: rowCount }, (_, index) => {
    const logo = ARCH_ASCII_LOGO[index] ?? "";
    const info = ARCH_INFO_LINES[index] ?? "";

    return `${logo.padEnd(logoWidth, " ")}${info}`;
  });

  return rows.join("\n");
};

export const ARCH_NEOFETCH_TEXT = buildArchNeofetchText();
