import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-lg border-b border-brand-lightBlue/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="group">
            <div className="bg-white rounded-lg px-2 py-2 shadow-md">
              {/* Gandhi Fellowship Logo */}
              <img 
                src="/gandhi-fellowship-logo.png" 
                alt="Gandhi Fellowship Logo" 
                className="w-10 h-10 group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/admin/login" 
              className="flex items-center space-x-1 text-brand-primary hover:text-brand-secondary transition-colors duration-200"
            >
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
