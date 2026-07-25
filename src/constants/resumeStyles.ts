/**
 * Shared styling constants for the Resume Preview and PDF Export.
 * These ensure identical visual presentation across the web interface and generated documents.
 */

export const RESUME_CONFIG = {
  // Page Dimensions (A4 Ratio-ish for web)
  WIDTH: 800,
  MIN_HEIGHT: 1120,
  PDF_PAGE_WIDTH: 210, // A4 width in mm
  PDF_PAGE_HEIGHT: 297, // A4 height in mm
  SCALE: 2, // Export quality scale
};

export const RESUME_STYLES = {
  // Main Container
  container: "text-[#1a1a1a] font-serif leading-relaxed bg-white mx-auto print:p-0",
  pagePadding: "p-10 sm:p-16",
  
  // Typography Colors
  colors: {
    primary: "#000000",
    secondary: "#374151",
    muted: "#4b5563",
    link: "#2563eb",
    background: "#ffffff",
  },

  // Common Layout
  sectionMargin: "mb-8",
  pageBreakAvoid: "page-break-avoid break-inside-avoid",

  // Header Section
  header: {
    wrapper: "text-center space-y-2 border-b-2 border-[#000000] pb-6 mb-8 page-break-avoid",
    name: "text-3xl font-bold uppercase tracking-tight text-[#000000]",
    title: "text-xl font-medium text-[#374151]",
    contactRow: "flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-[#4b5563] font-sans",
    linksRow: "flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-[#4b5563] font-sans font-medium",
    link: "text-[#2563eb] hover:underline",
    languageTag: "text-xs italic text-[#6b7280]"
  },

  // Generic Section
  section: {
    title: "text-lg font-bold uppercase border-b border-[#000000] mb-3 text-[#000000]",
    paragraph: "text-sm text-justify text-[#1a1a1a]"
  },

  // Experience Section
  experience: {
    item: "space-y-1 page-break-avoid break-inside-avoid",
    roleRow: "flex justify-between font-bold text-sm text-[#000000]",
    companyRow: "flex justify-between italic text-sm text-[#374151] mb-2",
    bullets: "space-y-1.5",
    bulletItem: "flex gap-2 text-sm text-[#1a1a1a]",
    bulletDot: "shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#374151]"
  },

  // Skills Section
  skills: {
    container: "grid grid-cols-1 gap-y-3",
    item: "text-sm text-[#1a1a1a]",
    category: "font-bold text-[#000000]"
  },

  // Projects Section
  projects: {
    item: "space-y-1 page-break-avoid break-inside-avoid",
    nameRow: "flex justify-between font-bold text-sm text-[#000000]",
    link: "text-[10px] font-normal font-sans italic text-[#4b5563]",
    role: "text-sm italic text-[#374151]",
    description: "text-sm text-[#1a1a1a]",
    stack: "text-[11px] font-sans text-[#4b5563]",
    stackLabel: "font-bold text-[#374151]"
  },

  // Education Section
  education: {
    item: "flex justify-between text-sm text-[#1a1a1a]",
    school: "font-bold text-[#000000]",
    separator: "mx-2 text-[#4b5563]",
    degree: "italic text-[#374151]",
    period: "font-bold text-[#000000]"
  },

  // Footer Diagnostics
  footer: "mt-12 pt-4 border-t border-[#f3f4f6] text-[8px] text-[#9ca3af] font-sans text-center print:hidden"
};

/**
 * Explicit CSS injection for PDF rendering to ensure identical styling
 */
export const RESUME_CSS_INJECTION = `
  .page-break-avoid {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  #resume-content {
    font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
    color: #1a1a1a;
    line-height: 1.625;
  }
  #resume-content h1, #resume-content h2 {
    color: #000000;
  }
  #resume-content .font-sans {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  }
`;
