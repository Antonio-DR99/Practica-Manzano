'use client';
import { useState } from "react";

const App = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Lentillas diarias para 1 mes",
      image: "https://via.placeholder.com/150",
      description: "2 cajas de 30 und/caja"
    },
    {
      id: 2,
      name: "Lentillas diarias para 3 meses",
      image: "https://via.placeholder.com/150",
      description: "2 cajas de 90 und/caja"
    },
    {
      id: 3,
      name: "Lentillas quincenales para 3 meses",
      image: "https://via.placeholder.com/150",
      description: "2 cajas de 6 und/caja + 1 líquido incluido"
    },
    {
      id: 4,
      name: "Lentillas quincenales para 6 meses",
      image: "https://via.placeholder.com/150",
      description: "2 cajas de 12 und/caja + líquidos incluidos"
    },
    {
      id: 5,
      name: "Lentillas mensuales para 3 meses",
      image: "https://via.placeholder.com/150",
      description: "2 cajas de 3 und/caja + líquido incluido"
    },
    {
      id: 6,
      name: "Lentillas mensuales para 6 meses",
      image: "https://via.placeholder.com/150",
      description: "2 cajas de 6 und/caja + líquidos incluidos"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: ""
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.image) return;
    setProducts([...products, { ...newProduct, id: Date.now() }]);
    setNewProduct({ name: "", price: "", image: "" });
    setImagePreview(null);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-bold text-center">Productos</h2>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Productos</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowModal(true)}
          >
            + Añadir producto
          </button>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  {product.description && <p className="text-gray-600 text-sm mt-1">{product.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="mt-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal para añadir producto */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h2 className="text-2xl font-bold mb-4">Añadir nuevo producto</h2>
              <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
                <input
                  name="name"
                  placeholder="Nombre"
                  value={newProduct.name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded px-3 py-2 text-black"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="border border-gray-300 rounded px-3 py-2"
                />
                {imagePreview && <img src={imagePreview} alt="Vista previa" className="h-32 object-contain" />}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setImagePreview(null); }}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
