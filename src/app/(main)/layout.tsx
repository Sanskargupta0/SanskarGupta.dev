import { ReactNode } from "react";
import Footer from "~/components/layout/footer";
import Navbar from "~/components/layout/nav";
import SkipContent from "~/components/ui/skip-content";
import PageActions from "~/components/page-actions";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="container relative flex min-h-dvh flex-col space-y-4 py-2">
      <div className="!mb-6 space-y-4">
        <SkipContent />
        <Navbar />
        {children}
      </div>
      <Footer />
      <PageActions />
    </div>
  );
};

export default Layout;
