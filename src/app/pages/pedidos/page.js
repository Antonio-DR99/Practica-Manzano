'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer, Navigate } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function CustomWeekView({ date, localizer, events, onNavigate }) {
  const startOfWeek = moment(date).startOf('week');
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(moment(startOfWeek).add(i, 'days').toDate());
  }

  const ordersCountByDay = events.reduce((acc, event) => {
    const eventDate = new Date(event.fecha);
    const key = eventDate.toLocaleDateString();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const handlePrevWeek = () => {
    const prevWeek = moment(date).subtract(1, 'week').toDate();
    onNavigate(Navigate.PREVIOUS, prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = moment(date).add(1, 'week').toDate();
    onNavigate(Navigate.NEXT, nextWeek);
  };

  return (
    <div className="custom-week-view p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-3xl font-semibold text-gray-800">Calendario Pedidos</h3>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Previous week"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Next week"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const label = localizer.format(day, 'ddd');
          const dateNumber = day.getDate();
          const count = ordersCountByDay[day.toLocaleDateString()] || 0;
          const isToday = moment(day).isSame(new Date(), 'day');
          return (
            <div
              key={day.toISOString()}
              className={`border border-gray-200 rounded-lg p-4 flex flex-col items-center cursor-pointer hover:bg-gray-100 ${
                isToday ? 'bg-gray-100' : ''
              }`}
              onClick={() => onNavigate(day)}
            >
              <div className="text-sm text-gray-500">{label}</div>
              <div className="mt-1 text-lg font-medium text-gray-800">{dateNumber}</div>
              {count > 0 ? (
                <div className="mt-2 bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-700">
                  {count} orders
                </div>
              ) : (
                <div className="mt-2 text-gray-400 text-xs">—</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

CustomWeekView.range = (date) => {
  const startOfWeek = moment(date).startOf('week');
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(moment(startOfWeek).add(i, 'days').toDate());
  }
  return days;
};

CustomWeekView.navigate = (date, action) => {
  switch (action) {
    case Navigate.PREVIOUS:
      return moment(date).subtract(1, 'week').toDate();
    case Navigate.NEXT:
      return moment(date).add(1, 'week').toDate();
    case Navigate.TODAY:
      return new Date();
    default:
      return date;
  }
};

CustomWeekView.title = (date, { localizer }) => {
  const range = CustomWeekView.range(date);
  const start = range[0];
  const end = range[range.length - 1];
  return `${localizer.format(start, 'MMM DD')} - ${localizer.format(end, 'MMM DD')}`;
};

export default function PedidosPage() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pedidosDelDia, setPedidosDelDia] = useState([]);
  const [pedidos, setPedidos] = useState([
    { id: 1, cliente: 'Juan Pérez', producto: 'Laptop', estado: 'Enviado', fecha: '2025-03-31', dinero: 1200 },
    { id: 2, cliente: 'Ana Gómez', producto: 'Teléfono', estado: 'Pendiente', fecha: '2025-04-02', dinero: 800 },
    { id: 3, cliente: 'Carlos Ruiz', producto: 'Auriculares', estado: 'Entregado', fecha: '2025-04-03', dinero: 150 },
  ]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPedido, setCurrentPedido] = useState(null);
  const [formData, setFormData] = useState({
    cliente: '',
    producto: '',
    estado: 'Pendiente',
    fecha: '',
    dinero: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const modalRef = useRef(null);

  const obtenerPedidosDelDia = (fecha) => {
    const pedidosFiltrados = pedidos.filter(
      (pedido) => new Date(pedido.fecha).toLocaleDateString() === fecha.toLocaleDateString()
    );
    setPedidosDelDia(pedidosFiltrados);
    setFechaSeleccionada(fecha);
  };

  const handleNavigate = (action, newDate) => {
    let updatedDate;
    switch (action) {
      case Navigate.PREVIOUS:
        updatedDate = moment(currentDate).subtract(1, 'week').toDate();
        break;
      case Navigate.NEXT:
        updatedDate = moment(currentDate).add(1, 'week').toDate();
        break;
      case Navigate.TODAY:
        updatedDate = new Date();
        break;
      default:
        updatedDate = newDate || currentDate;
    }
    setCurrentDate(updatedDate);
    obtenerPedidosDelDia(updatedDate);
  };

  const totalPedidos = pedidos.length;
  const pedidosPendientes = pedidos.filter(pedido => pedido.estado === 'Pendiente').length;
  const pedidosEnProceso = pedidos.filter(pedido => pedido.estado === 'Enviado').length;
  const pedidosCompletados = pedidos.filter(pedido => pedido.estado === 'Entregado').length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEditModal(false);
        setShowDeleteModal(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditClick = (pedido) => {
    setCurrentPedido(pedido);
    setFormData({
      cliente: pedido.cliente,
      producto: pedido.producto,
      estado: pedido.estado,
      fecha: pedido.fecha,
      dinero: pedido.dinero.toString()
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (pedido) => {
    setCurrentPedido(pedido);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = () => {
    const updatedPedidos = pedidos.map(p => 
      p.id === currentPedido.id ? { ...p, ...formData, dinero: parseFloat(formData.dinero) } : p
    );
    setPedidos(updatedPedidos);
    setShowEditModal(false);
    showNotification('Pedido actualizado correctamente', 'success');
    obtenerPedidosDelDia(fechaSeleccionada);
  };

  const handleConfirmDelete = () => {
    const updatedPedidos = pedidos.filter(p => p.id !== currentPedido.id);
    setPedidos(updatedPedidos);
    setShowDeleteModal(false);
    showNotification('Pedido eliminado correctamente', 'success');
    obtenerPedidosDelDia(fechaSeleccionada);
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="p-8 rounded-xl shadow-lg mb-6 bg-white">
          <h2 className="text-4xl font-semibold text-gray-700 mb-4 text-left">Gestión de Pedidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-medium">Total Pedidos</h3>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold">{totalPedidos}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-medium">Pendientes</h3>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold">{pedidosPendientes}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-medium">En Proceso</h3>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold">{pedidosEnProceso}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 text-sm font-medium">Completados</h3>
              </div>
              <div className="mt-2">
                <p className="text-3xl font-bold">{pedidosCompletados}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 rounded-xl shadow-lg mb-6 bg-white">
          <Calendar
            localizer={localizer}
            events={pedidos}
            views={{ customWeek: CustomWeekView }}
            view="customWeek"
            date={currentDate}
            onNavigate={handleNavigate}
            toolbar={false}
            eventPropGetter={() => ({ style: { display: 'none' } })}
          />
        </div>
      </div>
      <div className="mt-8">
        <div className="p-8 rounded-xl shadow-lg mb-6 bg-white">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4 text-left">Historial de Pedidos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
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
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            {pedido.cliente.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{pedido.cliente}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{pedido.producto}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pedido.estado === 'Pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : pedido.estado === 'Enviado'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">€{pedido.dinero}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(pedido)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          aria-label="Editar pedido"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pedido)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Eliminar pedido"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                      No se encontraron pedidos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Editar Pedido</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <input
                  type="text"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                <input
                  type="text"
                  name="producto"
                  value={formData.producto}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dinero (€)</label>
                <input
                  type="number"
                  name="dinero"
                  value={formData.dinero}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Confirmar Eliminación</h3>
            <p className="mb-6">
              ¿Estás seguro de que deseas eliminar el pedido de{' '}
              <span className="font-semibold">{currentPedido?.cliente}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {notification.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-md ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}