'use client';

import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function CustomWeekView({ date, events, localizer, onNavigate }) {
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

  return (
    <div className="custom-week-view p-4">
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const label = localizer.format(day, 'ddd');
          const dateNumber = day.getDate();
          const count = ordersCountByDay[day.toLocaleDateString()] || 0;
          return (
            <div
              key={day.toISOString()}
              className="border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:bg-gray-100"
              onClick={() => onNavigate(day)}
            >
              <div className="font-bold text-sm text-gray-700">{label}</div>
              <div className="mt-1 text-md font-medium text-gray-800">{dateNumber}</div>
              {count > 0 ? (
                <div className="mt-1 bg-gray-200 px-2 py-0.5 rounded-full text-xs">
                  {count} pedidos
                </div>
              ) : (
                <div className="mt-1 text-gray-400 text-xs">—</div>
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

CustomWeekView.title = (date, { localizer }) => {
  const range = CustomWeekView.range(date);
  const start = range[0];
  const end = range[range.length - 1];
  return `${localizer.format(start, 'MMM DD')} - ${localizer.format(end, 'MMM DD')}`;
};

export default function PedidosPage() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [pedidosDelDia, setPedidosDelDia] = useState([]);

  // Lista de pedidos con campo de dinero agregado
  const pedidos = [
    { id: 1, cliente: 'Juan Pérez', producto: 'Laptop', estado: 'Enviado', fecha: '2025-03-31', dinero: 1200 },
    { id: 2, cliente: 'Ana Gómez', producto: 'Teléfono', estado: 'Pendiente', fecha: '2025-04-02', dinero: 800 },
    { id: 3, cliente: 'Carlos Ruiz', producto: 'Auriculares', estado: 'Entregado', fecha: '2025-04-03', dinero: 150 },
  ];

  const obtenerPedidosDelDia = (fecha) => {
    const pedidosFiltrados = pedidos.filter(
      (pedido) => new Date(pedido.fecha).toLocaleDateString() === fecha.toLocaleDateString()
    );
    setPedidosDelDia(pedidosFiltrados);
    setFechaSeleccionada(fecha);
  };

  // Resumen de pedidos
  const totalPedidos = pedidos.length;
  const pedidosPendientes = pedidos.filter(pedido => pedido.estado === 'Pendiente').length;
  const pedidosEnProceso = pedidos.filter(pedido => pedido.estado === 'Enviado').length;
  const pedidosCompletados = pedidos.filter(pedido => pedido.estado === 'Entregado').length;

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Gestión de Pedidos con fondo y sombra */}
        <div className="p-8 rounded-xl shadow-lg mb-6 bg-white">
          <h2 className="text-4xl font-semibold text-gray-700 mb-4 text-left">Gestión de Pedidos</h2>

          {/* Resumen de pedidos */}
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

        {/* Calendario de Pedidos con fondo y sombra */}
        <div className="p-8 rounded-xl shadow-lg mb-6 bg-white">
          <h2 className="text-4xl font-semibold text-gray-700 mb-4 text-left">Calendario de Pedidos</h2>
          <Calendar
            localizer={localizer}
            events={pedidos}
            views={{ customWeek: CustomWeekView }}
            view="customWeek"
            toolbar={false}
            eventPropGetter={() => ({ style: { display: 'none' } })}
            onNavigate={(newDate) => obtenerPedidosDelDia(newDate)}
          />
        </div>
      </div>

      {/* HISTORIAL DE PEDIDOS con fondo y sombra */}
      <div className="mt-8">
        <div className="p-8 rounded-xl shadow-lg mb-6 bg-white">
          <h2 className="text-3xl font-semibold text-gray-700 mb-4 text-left">Historial de Pedidos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">ID Pedido</th>
                  <th className="py-3 px-6 text-left">Cliente</th>
                  <th className="py-3 px-6 text-left">Estado</th>
                  <th className="py-3 px-6 text-left">Fecha</th>
                  <th className="py-3 px-6 text-left">Dinero</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {pedidos.map((pedido) => (
                  <tr key={pedido.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6">{pedido.id}</td>
                    <td className="py-3 px-6">{pedido.cliente}</td>
                    <td className="py-3 px-6">{pedido.estado}</td>
                    <td className="py-3 px-6">{pedido.fecha}</td>
                    <td className="py-3 px-6">${pedido.dinero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
