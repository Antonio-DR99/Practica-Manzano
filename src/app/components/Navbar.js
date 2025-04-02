"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCallback, useContext } from "react";
import { NavbarContext } from "../layout";

export default function Navbar() {
  const { isOpen, setIsOpen } = useContext(NavbarContext);
  const pathname = usePathname();

  const toggleMenu = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  // Efecto para cerrar el navbar en pantallas pequeñas por defecto
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    // Ejecutar al montar
    handleResize();

    // Agregar listener para cambios de tamaño
    window.addEventListener("resize", handleResize);

    // Limpiar listener al desmontar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Función para determinar si un enlace está activo
  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <>
      {/* Botón de toggle para todas las pantallas */}
      <button
        onClick={toggleMenu}
        type="button"
        className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md"
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

      <nav
        className={`fixed left-0 top-0 h-full ${
          isOpen ? "w-60" : "w-0"
        } bg-white shadow-lg flex flex-col justify-between z-40 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="flex flex-col">
          {/* Logo/Dashboard */}
          <div className="p-4 border-b">
            <Link
              href="/"
              className="flex items-center space-x-3 text-gray-700 font-semibold"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span>Opticas Manzano</span>
            </Link>
          </div>

          {/* Enlaces de navegación */}
          <div className="py-4 flex flex-col">
            <Link
              href="/"
              className={`flex items-center space-x-3 px-4 py-3 ${
                isActive("/") ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-gray-700">Panel de Control</span>
            </Link>

            <Link
              href="/pages/pedidos"
              className={`flex items-center space-x-3 px-4 py-3 ${
                isActive("/pages/pedidos") ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span className="text-gray-700">Pedidos</span>
            </Link>

            <Link
              href="/pages/productos"
              className={`flex items-center space-x-3 px-4 py-3 ${
                isActive("/pages/productos")
                  ? "bg-gray-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span className="text-gray-700">Productos</span>
            </Link>

            <Link
              href="/pages/usuarios"
              className={`flex items-center space-x-3 px-4 py-3 ${
                isActive("/pages/usuarios") ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="text-gray-700">Clientes</span>
            </Link>

            <Link
              href="/pages/citas"
              className={`flex items-center space-x-3 px-4 py-3 ${
                isActive("/pages/citas") ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-gray-700">Citas</span>
            </Link>
            <Link
              href="/pages/login"
              className={`flex items-center space-x-3 px-4 py-3 ${
                isActive("/pages/citas") ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-gray-700">Log-in</span>
            </Link>
          </div>
        </div>

        {/* Botón de Logout */}
        <div className="mt-auto p-4">
          <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-md transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Cerrar sesion</span>
          </button>
        </div>
      </nav>
    </>
  );
}
