import { useState } from "react";
import { Link } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Logo = () => (
  <img 
    src="/assets/brand-logo.png" 
    alt="Viba Chic" 
    className="h-12 md:h-14 object-contain"
    width="auto"
    height="auto"
  />
);

interface NavLinksProps {
  className?: string;
  onClick?: () => void;
}

const NavLinks = ({ className = "", onClick }: NavLinksProps) => (
  <nav className={className}>
    <Link href="/" onClick={onClick}>
      <span className="hover:text-primary cursor-pointer">Home</span>
    </Link>
    <Link href="/contact" onClick={onClick}>
      <span className="hover:text-primary cursor-pointer">Contact</span>
    </Link>
  </nav>
);

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <header className="border-b py-3">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex flex-col items-center md:items-start cursor-pointer">
            <div className="flex items-center justify-center">
              <Logo />
            </div>
            <span className="text-sm font-medium tracking-wide text-muted-foreground mt-1">
              Women's Korean & Western Wear
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <NavLinks className="hidden md:flex space-x-8" />

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <NavLinks 
              className="flex flex-col space-y-4 mt-8" 
              onClick={handleClose}
            />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}