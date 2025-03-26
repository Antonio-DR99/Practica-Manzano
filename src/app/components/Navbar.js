import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-7">
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
      </div>
    </nav>
  );
}