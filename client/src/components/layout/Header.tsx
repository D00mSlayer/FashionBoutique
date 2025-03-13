import { Link } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Logo = () => (
  <svg width="120" height="40" viewBox="0 0 120 40">
    <text x="10" y="30" fill="currentColor" fontSize="24" fontWeight="bold">
      BOUTIQUE
    </text>
  </svg>
);

const NavLinks = ({ className = "" }) => (
  <nav className={className}>
    <Link href="/">
      <a className="hover:text-primary">Home</a>
    </Link>
    <Link href="/new-collection">
      <a className="hover:text-primary">New Collection</a>
    </Link>
    <Link href="/contact">
      <a className="hover:text-primary">Contact</a>
    </Link>
  </nav>
);

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center">
            <Logo />
          </a>
        </Link>

        {/* Desktop Navigation */}
        <NavLinks className="hidden md:flex space-x-8" />

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <NavLinks className="flex flex-col space-y-4 mt-8" />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
