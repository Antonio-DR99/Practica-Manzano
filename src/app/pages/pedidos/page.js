'use client';

import { useState, useEffect, useRef } from 'react';

export default function PedidosPage() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [pedidosDelDia, setPedidosDelDia] = useState([]);
  const [pedidos, setPedidos] = useState([
    { id: 1, cliente: 'Juan Pérez', producto: 'Laptop', estado: 'Enviado', fecha: '2025-03-31', dinero: 1200 },
    { id: 2, cliente: 'Ana Gómez', producto: 'Teléfono', estado: 'Pendiente', fecha: '2025-04-02', dinero: 800 },
    { id: 3, cliente: 'Carlos Ruiz', producto: 'Auriculares', estado: 'Entregado', fecha: '2025-04-03', dinero: 150 },
  ]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPedido, setCurrentPedido] = useState(null);
  const [formData, setFormData] = useState({ cliente: '', producto: '', estado: 'Pendiente', fecha: '', dinero: '' });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const modalRef = useRef(null);

  useEffect(() => {
    document.body.style.backgroundColor = 'white';
    return () => { document.body.style.backgroundColor = ''; };
  }, []);

  useEffect(() => {
    const hoy = new Date();
    setFechaSeleccionada(hoy);
    obtenerPedidosDelDia(hoy);
  }, []);

  const obtenerPedidosDelDia = (fecha) => {
    const pedidosFiltrados = pedidos.filter(
      (p) => new Date(p.fecha).toLocaleDateString() === fecha.toLocaleDateString()
    );
    setPedidosDelDia(pedidosFiltrados);
    setFechaSeleccionada(fecha);
  };

  const totalPedidos = pedidos.length;
  const pedidosPendientes = pedidos.filter((p) => p.estado === 'Pendiente').length;
  const pedidosEnProceso = pedidos.filter((p) => p.estado === 'Enviado').length;
  const pedidosCompletados = pedidos.filter((p) => p.estado === 'Entregado').length;
  const totalDinero = pedidos.reduce((sum, p) => sum + p.dinero, 0);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEditModal(false);
        setShowDeleteModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = (pedido) => {
    setCurrentPedido(pedido);
    setFormData({ ...pedido, dinero: pedido.dinero.toString() });
    setShowEditModal(true);
  };

  const handleDeleteClick = (pedido) => {
    setCurrentPedido(pedido);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = () => {
    setPedidos(
      pedidos.map((p) =>
        p.id === currentPedido.id
          ? { ...p, ...formData, dinero: parseFloat(formData.dinero) }
          : p
      )
    );
    setShowEditModal(false);
    showNotification('Pedido actualizado correctamente', 'success');
    obtenerPedidosDelDia(fechaSeleccionada);
  };

  const handleConfirmDelete = () => {
    setPedidos(pedidos.filter((p) => p.id !== currentPedido.id));
    setShowDeleteModal(false);
    showNotification('Pedido eliminado correctamente', 'success');
    obtenerPedidosDelDia(fechaSeleccionada);
  };

  const showNotification = (msg, type) => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  if (fechaSeleccionada === null) return <div>Cargando...</div>;

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Estadísticas */}
        <div className="p-8 rounded-xl shadow-lg mb-6 bg-white">
          <h2 className="text-4xl font-semibold text-gray-700 mb-4 text-left">Gestión de Pedidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Total Pedidos</h3>
              <p className="text-3xl font-bold">{totalPedidos}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Pendientes</h3>
              <p className="text-3xl font-bold">{pedidosPendientes}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">En Proceso</h3>
              <p className="text-3xl font-bold">{pedidosEnProceso}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Completados</h3>
              <p className="text-3xl font-bold">{pedidosCompletados}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium">Total Dinero</h3>
              <p className="text-3xl font-bold">€{totalDinero}</p>
            </div>
          </div>
        </div>

        {/* Historial de Pedidos */}
        <div className="p-8 rounded-xl shadow-lg mb-6 bg-white">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4 text-left">Historial de Pedidos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dinero</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pedidos.length > 0 ? (
                  pedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">{pedido.cliente.charAt(0).toUpperCase()}</div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{pedido.cliente}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{pedido.producto}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          pedido.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          pedido.estado === 'Enviado' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>{pedido.estado}</span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{new Date(pedido.fecha).toLocaleDateString('es-ES',{ year:'numeric',month:'long',day:'numeric'})}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">€{pedido.dinero}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(pedido)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          aria-label="Editar pedido"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pedido)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Eliminar pedido"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="py-4 px-4 text-center text-gray-500">No se encontraron pedidos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modales */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Editar Pedido</h3>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <input name="cliente" value={formData.cliente} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                <label className="block text-sm font-medium text-gray-700">Producto</label>
                <input name="producto" value={formData.producto} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select name="estado" value={formData.estado} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                  <option value="Pendiente">Pendiente</option><option value="Enviado">Enviado</option><option value="Entregado">Entregado</option>
                </select>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                <label className="block text-sm font-medium text-gray-700">Dinero (€)</label>
                <input type="number" name="dinero" value={formData.dinero} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar</button>
              </div>
            </div>
          </div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Confirmar Eliminación</h3>
              <p>¿Seguro que deseas eliminar el pedido de <span className="font-semibold">{currentPedido?.cliente}</span>?</p>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
                <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Notificación */}
        {notification.show && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-md ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>{notification.message}</div>
        )}
      </div>
    </div>
  );
}
