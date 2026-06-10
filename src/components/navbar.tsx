import { NavUser } from "./nav-user";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon] justify-between sidebar-wrapper:h-14 px-4 md:px-6 bg-background/80 backdrop-blur-md border-b">
      <div className="flex items-center gap-2" />
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <NavUser />
      </div>
    </header>
  );
}
