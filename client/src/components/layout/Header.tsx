import { useState } from "react";
import { Link } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const Logo = () => (
  <img 
    src="/assets/brand-logo.png" 
    alt="Viba Chic" 
    className="h-20 md:h-28 object-contain"
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
      <span className="hover:text-primary cursor-pointer font-light transition-colors duration-300">HOME</span>
    </Link>
    <Link href="/contact" onClick={onClick}>
      <span className="hover:text-primary cursor-pointer font-light transition-colors duration-300">CONTACT</span>
    </Link>
  </nav>
);

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <header className="py-4 md:py-6 bg-background shadow-sm relative">
      {/* Mobile Navigation Button - Positioned Absolutely */}
      <div className="absolute top-4 right-4 md:hidden z-10">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col items-center mt-12">
              <Logo />
              <div className="mt-3 mb-8 text-center">
                <div className="relative inline-flex flex-col items-center">
                  <span className="text-xs uppercase tracking-[0.25em] font-light block mb-1">
                    Women's
                  </span>
                  <span className="text-sm uppercase tracking-[0.15em] font-medium">
                    Korean & Western Wear
                  </span>
                  <div className="absolute -bottom-3 left-0 right-0 mx-auto w-24 h-[1px] bg-primary/40"></div>
                </div>
              </div>
              <Separator className="mb-8 w-16 bg-primary/20" />
              <NavLinks 
                className="flex flex-col items-center space-y-6 text-xs tracking-widest" 
                onClick={handleClose}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="container mx-auto px-4">
        {/* Logo and Tagline - Centered */}
        <div className="flex flex-col items-center justify-center mb-2 md:mb-4">
          <Link href="/">
            <div className="flex flex-col items-center cursor-pointer">
              <Logo />
              <div className="mt-3 md:mt-4 text-center">
                <div className="relative inline-flex flex-col items-center">
                  <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-light mb-1">
                    Women's
                  </span>
                  <span className="text-sm md:text-base uppercase tracking-[0.15em] font-medium">
                    Korean & Western Wear
                  </span>
                  <div className="absolute -bottom-3 left-0 right-0 mx-auto w-24 h-[1px] bg-primary/40"></div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Separator - Subtle luxury element */}
        <Separator className="mb-2 md:mb-4 bg-primary/10" />
        
        {/* Navigation - Below logo and tagline (Desktop only) */}
        <div className="flex justify-center items-center">
          {/* Desktop Navigation */}
          <NavLinks className="hidden md:flex space-x-12 text-xs tracking-widest" />
        </div>
      </div>
    </header>
  );
}