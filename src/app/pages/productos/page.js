'use client';
import { useState, useEffect } from "react";

const App = () => {
  const defaultProducts = [
    { 
      id: 1, 
      name: "Lentillas diarias para 1 mes", 
      description: "(2 cajas de 30 und/caja)", 
      image: "https://placehold.co/300x200/eee/31304D/png?text=Lentillas+Diarias+1M",
      selected: false, 
      isNew: false 
    },
    { 
      id: 2, 
      name: "Lentillas diarias para 3 meses", 
      description: "(2 cajas de 90 und/caja)", 
      image: "https://placehold.co/300x200/eee/31304D/png?text=Lentillas+Diarias+3M",
      selected: false, 
      isNew: false 
    },
    { 
      id: 3, 
      name: "Lentillas quincenales para 3 meses", 
      description: "(2 cajas de 6 und/caja + 1 líquido incluido)", 
      image: "https://placehold.co/300x200/eee/31304D/png?text=Lentillas+Quincenales+3M",
      selected: false, 
      isNew: false 
    },
    { 
      id: 4, 
      name: "Lentillas quincenales para 6 meses", 
      description: "(2 cajas de 12 und/caja + líquidos incluidos)", 
      image: "https://placehold.co/300x200/eee/31304D/png?text=Lentillas+Quincenales+6M",
      selected: false, 
      isNew: false 
    },
    { 
      id: 5, 
      name: "Lentillas mensuales para 3 meses", 
      description: "(2 cajas de 3 und/caja + líquido incluido)", 
      image: "https://placehold.co/300x200/eee/31304D/png?text=Lentillas+Mensuales+3M",
      selected: false, 
      isNew: false 
    },
    { 
      id: 6, 
      name: "Lentillas mensuales para 6 meses", 
      description: "(2 cajas de 6 und/caja + líquidos incluidos)", 
      image: "https://placehold.co/300x200/eee/31304D/png?text=Lentillas+Mensuales+6M",
      selected: false, 
      isNew: false 
    },
  ];

  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8); // Número de productos por página

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
    // Busca el id más alto actual
    const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
    const newProduct = {
      id: maxId + 1,
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

  // Añadido para la paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl shadow-md flex flex-col border ${product.isNew ? "border-blue-500" : "border-transparent"}`}
            >
              {/* Contenedor de imagen */}
              <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
                <img
                  src={product.image || `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#31304D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="15" r="4"/>
      <circle cx="18" cy="15" r="4"/>
      <path d="M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/>
      <path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2"/>
      <path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2"/>
    </svg>
  `)}`}
                  alt={product.name}
                  className="w-full h-full object-contain p-8 bg-gray-50"
                />
                {product.isNew && (
                  <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Nuevo
                  </span>
                )}
              </div>

              {/* Contenido del producto */}
              <div className="p-4 flex-1 flex flex-col justify-between">
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
                    <div className="flex flex-row gap-2 mt-4 justify-end">
                      <button 
                        onClick={() => startEdit(product)} 
                        className="p-2 hover:bg-blue-100 rounded-full transition-colors cursor-pointer" // Añadido cursor-pointer
                        aria-label="Editar producto"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-gray-900" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)} 
                        className="p-2 hover:bg-red-100 rounded-full transition-colors cursor-pointer" // Añadido cursor-pointer
                        aria-label="Eliminar producto"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-gray-900" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Paginación */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <span className="text-gray-700 mb-2">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            {/* Botón Anterior */}
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              &larr;
            </button>

            {/* Números de página */}
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 rounded-md font-semibold transition-all flex items-center justify-center ${
                  currentPage === i + 1
                    ? "bg-gray-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}

            {/* Botón Siguiente */}
            <button
              onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              &rarr;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
