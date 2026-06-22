import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useBookStore } from '../store/useBookStore';
import { useThemeStore } from '../store/useThemeStore';
import SearchBar from './SearchBar';
import {
  BookOpen,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
  Library,
  Settings,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  LogOut,
} from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const cartItems = useCartStore((state) => state.items);
  const wishlist = useBookStore((state) => state.wishlist);
  
  const location = useLocation();
  const navigate = useNavigate();

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/login');
  };

  const handleNavigationAndClose = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95" id="bookverse-main-navbar">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* LOGO */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group select-none">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Livraria <span className="text-amber-500 font-serif">Mulemba</span>
              </span>
            </Link>
          </div>

          {/* DESKTOP SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md mx-4">
            <SearchBar />
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                isActive('/')
                  ? 'bg-zinc-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400'
                  : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-350 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
              }`}
            >
              Início
            </Link>
            <Link
              to="/catalog"
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                isActive('/catalog')
                  ? 'bg-zinc-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400'
                  : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
              }`}
            >
              Explorar Loja
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/digital-library"
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive('/digital-library')
                      ? 'bg-zinc-50 text-blue-700 dark:bg-zinc-800 dark:text-blue-400'
                      : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                  }`}
                >
                  Biblioteca Digital
                </Link>
                <Link
                  to="/dashboard"
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-zinc-50 text-blue-700 dark:bg-zinc-800 dark:text-blue-400'
                      : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                  }`}
                >
                  Minha Conta
                </Link>
                {(user?.role === 'admin' || user?.role === 'seller') && (
                  <Link
                    to="/admin"
                    className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive('/admin')
                        ? 'bg-zinc-50 text-blue-700 dark:bg-zinc-800 dark:text-blue-400'
                        : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Settings className="h-4 w-4 text-emerald-500" /> {user?.role === 'admin' ? 'Admin' : 'Painel de Vendas'}
                  </Link>
                )}
              </>
            )}
          </div>

          {/* ACTIONS CONTROLS */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2.5 text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Wishlist Icon */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                state={{ defaultTab: 'wishlist' }}
                className="relative rounded-xl p-2.5 text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              >
                <Heart className="h-5 w-5 text-rose-500" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm font-mono">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative rounded-xl p-2.5 text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm font-mono leading-none">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Profile dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-1 rounded-xl p-1 text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors focus:outline-none"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </button>
                {/* PROFILE DROPDOWN PANEL */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 z-50 w-56 origin-top-right rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
                    <div className="px-3.5 py-3 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono">Conta Conectada</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">{user?.name}</p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{user?.email}</p>
                      <div className="mt-2.5 flex items-center gap-1">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase font-mono ${
                          user?.role === 'admin' || user?.role === 'seller'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40'
                            : 'bg-blue-50 text-blue-700 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40'
                        }`}>
                          {user?.role === 'admin' ? <ShieldCheck className="h-2.5 w-2.5" /> : <UserCheck className="h-2.5 w-2.5" />}
                          Modo: {user?.role === 'admin' ? 'Administrador' : user?.role === 'seller' ? 'Vendedor' : 'Leitor'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      <User className="h-4 w-4" /> Painel Geral
                    </Link>

                    <Link
                      to="/digital-library"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm text-zinc-800 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      <Library className="h-4 w-4" /> Minha Biblioteca
                    </Link>

                    {(user?.role === 'admin' || user?.role === 'seller') && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-emerald-600 hover:bg-zinc-50 dark:text-emerald-500 dark:hover:bg-zinc-900"
                      >
                        <Settings className="h-4 w-4" /> {user?.role === 'admin' ? 'Console Administrativa' : 'Meu Painel de Vendas'}
                      </Link>
                    )}

                    <div className="border-t border-zinc-100 dark:border-zinc-800 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Cadastrar
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLER */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl p-2.5 text-zinc-500 hover:bg-zinc-50 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE PANEL MENU SCREEN OVERLAY */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white/95 px-4 py-6 dark:border-zinc-800 dark:bg-zinc-900 h-screen overflow-y-auto">
          <div className="mb-6 block sm:hidden">
            <SearchBar />
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleNavigationAndClose('/')}
              className={`rounded-xl px-4 py-3 text-left text-base font-semibold ${
                isActive('/') ? 'bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => handleNavigationAndClose('/catalog')}
              className={`rounded-xl px-4 py-3 text-left text-base font-semibold ${
                isActive('/catalog') ? 'bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Explorar Loja
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => handleNavigationAndClose('/digital-library')}
                  className={`rounded-xl px-4 py-3 text-left text-base font-semibold ${
                    isActive('/digital-library') ? 'bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400' : 'text-zinc-650 dark:text-zinc-300'
                  }`}
                >
                  Biblioteca Digital
                </button>
                <button
                  onClick={() => handleNavigationAndClose('/dashboard')}
                  className={`rounded-xl px-4 py-3 text-left text-base font-semibold ${
                    isActive('/dashboard') ? 'bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400' : 'text-zinc-650 dark:text-zinc-300'
                  }`}
                >
                  Minha Conta
                </button>
                {(user?.role === 'admin' || user?.role === 'seller') && (
                  <button
                    onClick={() => handleNavigationAndClose('/admin')}
                    className={`rounded-xl px-4 py-3 text-left text-base font-semibold flex items-center gap-2 ${
                      isActive('/admin') ? 'bg-blue-50 text-blue-700 dark:bg-zinc-800' : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Settings className="h-5 w-5 text-emerald-500 animate-spin-slow" /> {user?.role === 'admin' ? 'Console Admin' : 'Painel de Vendas'}
                  </button>
                )}
                <div className="border-t border-zinc-100 dark:border-zinc-800 my-4 pt-4">
                  <div className="flex items-center gap-2 px-4 mb-3">
                    <img src={user?.avatar} alt={user?.name} className="h-10 w-10 rounded-full" />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-50">{user?.name}</p>
                      <p className="text-xs text-zinc-400">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <LogOut className="h-5 w-5 animate-pulse" /> Sair da Conta
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
