import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { UserNav } from '@/components/auth/UserNav';
import { MainNav } from './MainNav';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo className="h-8 w-8" />
          <span className="hidden font-bold sm:inline-block font-headline">
            Game of Proverbs
          </span>
        </Link>
        <div className="hidden md:flex flex-1">
          <MainNav />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <Link href="/" className="mb-6 flex items-center space-x-2">
                  <Logo className="h-8 w-8" />
                  <span className="font-bold font-headline">Game of Proverbs</span>
                </Link>
                <MainNav isMobile />
              </SheetContent>
            </Sheet>
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
