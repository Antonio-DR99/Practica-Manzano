'use client';
import { useState, useEffect } from "react";

const App = () => {
  const defaultProducts = [
    { id: 1, name: "Lentillas diarias para 1 mes", description: "(2 cajas de 30 und/caja)", selected: false, isNew: false },
    { id: 2, name: "Lentillas diarias para 3 meses", description: "(2 cajas de 90 und/caja)", selected: false, isNew: false },
    { id: 3, name: "Lentillas quincenales para 3 meses", description: "(2 cajas de 6 und/caja + 1 líquido incluido)", selected: false, isNew: false },
    { id: 4, name: "Lentillas quincenales para 6 meses", description: "(2 cajas de 12 und/caja + líquidos incluidos)", selected: false, isNew: false },
    { id: 5, name: "Lentillas mensuales para 3 meses", description: "(2 cajas de 3 und/caja + líquido incluido)", selected: false, isNew: false },
    { id: 6, name: "Lentillas mensuales para 6 meses", description: "(2 cajas de 6 und/caja + líquidos incluidos)", selected: false, isNew: false },
  ];

  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    setIsClient(true); //  bloquea SSR
    const stored = localStorage.getItem("products");
    setProducts(stored ? JSON.parse(stored) : defaultProducts);
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("products", JSON.stringify(products));
    }
  }, [products, isClient]);

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const toggleSelect = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const handleAddProduct = () => {
    if (!newProductName.trim() || !newProductDescription.trim()) return;
    const newProduct = {
      id: Date.now(),
      name: newProductName,
      description: newProductDescription,
      selected: false,
      isNew: true,
    };
    setProducts([...products, newProduct]);
    setNewProductName("");
    setNewProductDescription("");
    setShowForm(false);
  };

  const handleSearch = () => setSearch(searchQuery);

  const startEdit = (product) => setEditingProduct(product);

  const saveEdit = () => {
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
  };

  if (!isClient) return null; // Evita render hasta que estemos en cliente

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <main className="flex-1 bg-gray-100 p-8 overflow-auto w-full">
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <div className="flex gap-2 flex-col md:flex-row">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-black w-64"
            />
            <button onClick={handleSearch} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">Buscar</button>
            <button onClick={() => setShowForm(!showForm)} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
              {showForm ? "Cancelar" : "Añadir producto"}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 bg-white p-6 rounded-xl shadow-md space-y-4">
            <input
              type="text"
              placeholder="Título del producto"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-black w-full"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={newProductDescription}
              onChange={(e) => setNewProductDescription(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 text-black w-full"
            />
            <button onClick={handleAddProduct} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
              Guardar producto
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl shadow-md flex flex-col border ${product.isNew ? "border-blue-500" : "border-transparent"}`}
            >
              <div className="p-4 flex-1 flex flex-col justify-between relative">
                {product.isNew && (
                  <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Nuevo
                  </span>
                )}
                {editingProduct?.id === product.id ? (
                  <>
                    <input
                      className="border text-black w-full rounded mb-2 px-2 py-1"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                    <input
                      className="border text-black w-full rounded mb-2 px-2 py-1"
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    />
                    <button onClick={saveEdit} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mb-2">Guardar</button>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-black">{product.name}</h3>
                      <p className="text-black mt-1">{product.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <button onClick={() => toggleSelect(product.id)} className={`px-3 py-1 rounded ${product.selected ? "bg-green-600 text-white" : "bg-gray-300 text-black hover:bg-gray-400"}`}>
                        {product.selected ? "Seleccionado" : "Seleccionar"}
                      </button>
                      <button onClick={() => startEdit(product)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
                      <button onClick={() => handleDelete(product.id)} className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800">Eliminar</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
