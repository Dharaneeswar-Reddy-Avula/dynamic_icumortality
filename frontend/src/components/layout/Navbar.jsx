import { Link, useLocation } from "react-router-dom";
import { Activity } from "lucide-react";

export function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Predict Risk", path: "/predict" },
    { name: "Performance", path: "/performance" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md shadow-sm fixed top-0 w-full z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600/10 p-2 rounded-xl group-hover:bg-blue-600/20 transition-colors">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              ICU<span className="text-blue-600">Predict</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-white text-blue-700 shadow-sm border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Layout Placeholder (to align desktop properly) */}
          <div className="md:hidden flex items-center">
            {/* Can add a hamburger menu here in future if needed */}
            <span className="text-xs font-semibold text-slate-400">Menu</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
