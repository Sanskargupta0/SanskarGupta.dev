import PortfolioActions from "~/components/portfolio-actions";
import Logo from "./logo";
import MobileNav from "./mobile-nav";
import NavList from "./nav-list";
import { ThemeToggle } from "~/components/ui/theme-toggle";

const Navbar = () => {
  return (
    <nav className="mb-4 mt-2 flex items-center justify-between gap-2" role="navigation">
      <div className="relative isolate shrink-0 [&>a]:relative [&>a]:z-10 [&>a]:block [&>a]:bg-background" data-pet-home>
        <Logo />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <NavList />
        </div>

        <PortfolioActions />
        <ThemeToggle />

        <div className="block sm:hidden">
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
