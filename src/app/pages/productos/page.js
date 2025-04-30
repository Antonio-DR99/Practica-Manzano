'use client';
import { useState } from "react";

const App = () => {
  const defaultProducts = [
    { id: 1, name: "Lentillas diarias para 1 mes", description: "(2 cajas de 30 und/caja)", image: "", price: "", selected: false },
    { id: 2, name: "Lentillas diarias para 3 meses", description: "(2 cajas de 90 und/caja)", image: "", price: "", selected: false },
    { id: 3, name: "Lentillas quincenales para 3 meses", description: "(2 cajas de 6 und/caja + 1 líquido incluido)", image: "", price: "", selected: false },
    { id: 4, name: "Lentillas quincenales para 6 meses", description: "(2 cajas de 12 und/caja + líquidos incluidos)", image: "", price: "", selected: false },
    { id: 5, name: "Lentillas mensuales para 3 meses", description: "(2 cajas de 3 und/caja + líquido incluido)", image: "", price: "", selected: false },
    { id: 6, name: "Lentillas mensuales para 6 meses", description: "(2 cajas de 6 und/caja + líquidos incluidos)", image: "", price: "", selected: false },
  ];

  const [products, setProducts] = useState(defaultProducts);
  const [search, setSearch] = useState("");
  const [newProductName, setNewProductName] = useState("");

  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const toggleSelect = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleAddProduct = () => {
    if (!newProductName.trim()) return;
    const newProduct = {
      id: Date.now(),
      name: newProductName,
      description: "Nuevo producto añadido",
      price: "",
      image: "",
      selected: false
    };
    setProducts([...products, newProduct]);
    setNewProductName("");
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar limpio */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between p-6">
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Panel de Control</h2>
          <nav className="space-y-4">
            <button className="block w-full text-left">Inicio</button>
            <button className="block w-full text-left font-bold">Productos</button>
            <button className="block w-full text-left">Pedidos</button>
          </nav>
        </div>
        <button className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2">
          Cerrar sesión
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded px-4 py-2 text-black w-64"
            />
            <input
              type="text"
              placeholder="Añadir nuevo producto..."
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-black w-64"
            />
            <button
              onClick={handleAddProduct}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Añadir
            </button>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-black">{product.name}</h3>
                  <p className="text-black mt-1">{product.description}</p>
                  {product.price && <p className="text-black font-bold mt-2">${product.price}</p>}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => toggleSelect(product.id)}
                    className={`px-3 py-1 rounded ${product.selected ? "bg-green-600 text-white" : "bg-gray-300 text-black hover:bg-gray-400"}`}
                  >
                    {product.selected ? "Seleccionado" : "Seleccionar"}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
