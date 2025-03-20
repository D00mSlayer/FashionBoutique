import { useState } from "react";
import { Link } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Logo = () => (
  <svg width="120" height="40" viewBox="0 0 120 40">
    <text x="10" y="30" fill="currentColor" fontSize="24" fontWeight="bold">
      Viba Chic
    </text>
  </svg>
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
    <header className="border-b">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/">
          <span className="flex flex-col items-start cursor-pointer">
            <Logo />
            <span className="text-sm text-muted-foreground ml-2 -mt-1">Women's Korean & Western Wear</span>
          </span>
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