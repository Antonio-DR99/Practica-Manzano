'use client'; // Directiva para marcar el componente como cliente

import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function PedidosPage() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [pedidosDelDia, setPedidosDelDia] = useState([]);

  // Lista de pedidos (simulada, reemplázala con tus datos reales)
  const pedidos = [
    { id: 1, cliente: 'Juan Pérez', producto: 'Laptop', estado: 'Enviado', fecha: '2025-03-31' },
    { id: 2, cliente: 'Ana Gómez', producto: 'Teléfono', estado: 'Pendiente', fecha: '2025-04-02' },
    { id: 3, cliente: 'Carlos Ruiz', producto: 'Auriculares', estado: 'Entregado', fecha: '2025-04-03' },
  ];

  // Agrupar pedidos por fecha para mostrarlos en el header
  const ordersCountByDay = pedidos.reduce((acc, pedido) => {
    const key = new Date(pedido.fecha).toLocaleDateString();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Filtra los pedidos para el día seleccionado
  const obtenerPedidosDelDia = (fecha) => {
    const pedidosFiltrados = pedidos.filter(
      (pedido) => new Date(pedido.fecha).toLocaleDateString() === fecha.toLocaleDateString()
    );
    setPedidosDelDia(pedidosFiltrados);
  };

  // Maneja el cambio de fecha al hacer clic en un día
  const handleDateChange = (date) => {
    setFechaSeleccionada(date);
    obtenerPedidosDelDia(date); // Filtra los pedidos para la fecha seleccionada
  };

  // Componente custom para renderizar el encabezado de cada día en la vista semanal
  const CustomDateHeader = ({ label, date }) => {
    const dateKey = new Date(date).toLocaleDateString();
    const count = ordersCountByDay[dateKey] || 0;
    return (
      <div className="flex flex-col items-center justify-center py-2">
        <span className="font-bold text-sm text-gray-700">{label}</span>
        {count > 0 ? (
          <span className="mt-1 bg-gray-200 px-2 py-0.5 rounded-full text-xs">
            {count} pedidos
          </span>
        ) : (
          <span className="mt-1 text-gray-400 text-xs">—</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="p-8 rounded-xl shadow-lg">

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Semana de Pedidos</h2>

            {/* Calendario de semana horizontal */}
            <div className="min-h-screen bg-white text-black p-6">
              <Calendar
                localizer={localizer}
                events={[]} // No hay eventos para mostrar en la grilla principal
                startAccessor="start"
                endAccessor="end"
                views={['week']} // Vista de semana
                step={60}
                view="week" // Vista de semana activa
                formats={{
                  // Los formatos se pueden ajustar, pero usaremos el componente custom para el header
                }}
                onNavigate={handleDateChange}
                // Ocultar eventos (si no los necesitas en la grilla)
                eventPropGetter={() => ({
                  style: {
                    display: 'none',
                  },
                })}
                // Aquí inyectamos nuestro componente custom para el encabezado de cada día
                components={{
                  week: {
                    header: CustomDateHeader,
                  },
                }}
              />
            </div>
          </div>
          
          {/* Pedidos para la fecha seleccionada */}
          <div className="p-6 rounded-xl shadow-md mt-6 bg-white text-black">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Pedidos para {fechaSeleccionada.toLocaleDateString()}
            </h3>

            {/* Lista de pedidos */}
            <div className="space-y-4">
              {pedidosDelDia.length > 0 ? (
                pedidosDelDia.map((pedido) => (
                  <div key={pedido.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                    <p className="font-medium text-gray-700">Cliente: {pedido.cliente}</p>
                    <p className="text-gray-600">Producto: {pedido.producto}</p>
                    <p className="text-gray-500">Estado: {pedido.estado}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay pedidos para este día.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
