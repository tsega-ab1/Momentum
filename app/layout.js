import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: {
    default: "Momentum: color systems studio",
    template: "%s · Momentum",
  },
  description: "Build a color system once. Use it everywhere.",
};

// Runs before the page paints, so a dark-theme visitor never sees a white flash.
// It sets data-theme from the saved choice, else from the system preference.
const themeScript = `(function(){try{var t=localStorage.getItem("momentum-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})();`;

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: the script above sets data-theme before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="shell">
          <Sidebar />
          <main id="main" className="main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
