'use client';

import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// Definimos el componente custom para la vista semanal
function CustomWeekView({ date, events, localizer, onNavigate }) {
  // Calcula el inicio de la semana (por defecto, domingo)
  const startOfWeek = moment(date).startOf('week');
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(moment(startOfWeek).add(i, 'days').toDate());
  }

  // Agrupar pedidos por día usando la propiedad "fecha" de cada evento
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
          const label = localizer.format(day, 'ddd'); // Ejemplo: "Sun", "Mon", etc.
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

// Agregamos las propiedades estáticas requeridas por React Big Calendar
CustomWeekView.range = (date, { localizer }) => {
  const startOfWeek = moment(date).startOf('week');
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(moment(startOfWeek).add(i, 'days').toDate());
  }
  return days;
};

CustomWeekView.title = (date, { localizer }) => {
  const range = CustomWeekView.range(date, { localizer });
  const start = range[0];
  const end = range[range.length - 1];
  return `${localizer.format(start, 'MMM DD')} - ${localizer.format(end, 'MMM DD')}`;
};

export default function PedidosPage() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [pedidosDelDia, setPedidosDelDia] = useState([]);

  // Lista de pedidos (simulada; reemplaza con tus datos reales)
  const pedidos = [
    { id: 1, cliente: 'Juan Pérez', producto: 'Laptop', estado: 'Enviado', fecha: '2025-03-31' },
    { id: 2, cliente: 'Ana Gómez', producto: 'Teléfono', estado: 'Pendiente', fecha: '2025-04-02' },
    { id: 3, cliente: 'Carlos Ruiz', producto: 'Auriculares', estado: 'Entregado', fecha: '2025-04-03' },
  ];

  // Filtra los pedidos para la fecha seleccionada
  const obtenerPedidosDelDia = (fecha) => {
    const pedidosFiltrados = pedidos.filter(
      (pedido) => new Date(pedido.fecha).toLocaleDateString() === fecha.toLocaleDateString()
    );
    setPedidosDelDia(pedidosFiltrados);
    setFechaSeleccionada(fecha);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="p-8 rounded-xl shadow-lg">

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Calendario de Pedidos</h2>
            {/* Usamos nuestro custom view a través de react-big-calendar */}
            <Calendar
              localizer={localizer}
              events={pedidos} // Pasamos los pedidos como eventos
              views={{ customWeek: CustomWeekView }}
              view="customWeek" // Indicamos que use la vista custom
              toolbar={false}
              // No necesitamos renderizar los eventos en la grilla (lo maneja nuestro CustomWeekView)
              eventPropGetter={() => ({ style: { display: 'none' } })}
              // Al navegar (por ejemplo, al hacer clic en un día) actualizamos la fecha
              onNavigate={(newDate) => obtenerPedidosDelDia(newDate)}
            />
          </div>

          {/* Sección para mostrar los pedidos del día seleccionado */}
          <div className="p-6 rounded-xl shadow-md mt-6 bg-white text-black">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Pedidos para {fechaSeleccionada.toLocaleDateString()}
            </h3>
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
