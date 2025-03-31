import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Mi App
            </Link>
          </div>
          
          {/* Botón de hamburguesa para móviles */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                {isOpen ? (
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                  />
                )}
              </svg>
            </button>
          </div>
          
          {/* Menú de navegación para escritorio - alineado a la derecha */}
          <div className="hidden md:flex md:items-center md:justify-end md:flex-1">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-800 hover:text-blue-600">
                Inicio
              </Link>
              <Link href="/pages/productos" className="text-gray-800 hover:text-blue-600">
                Productos
              </Link>
              <Link href="/pages/pedidos" className="text-gray-800 hover:text-blue-600">
                Pedidos
              </Link>
              <Link href="/pages/usuarios" className="text-gray-800 hover:text-blue-600">
                Usuarios
              </Link>
            </div>
          </div>
        </div>
        
        {/* Menú móvil desplegable */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden transition-all duration-300 ease-in-out`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-end">
            <Link href="/" className="text-gray-800 hover:text-blue-600 block py-2">
              Inicio
            </Link>
            <Link href="/pages/productos" className="text-gray-800 hover:text-blue-600 block py-2">
              Productos
            </Link>
            <Link href="/pages/pedidos" className="text-gray-800 hover:text-blue-600 block py-2">
              Pedidos
            </Link>
            <Link href="/pages/usuarios" className="text-gray-800 hover:text-blue-600 block py-2">
              Usuarios
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}