'use client';
import { useEffect, useState } from 'react';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('appointments');
    if (stored) {
      setAppointments(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleAddAppointment = () => {
    if (!newName || !newDate || !newTime) return;
    const newAppointment = {
      id: Date.now(),
      name: newName,
      date: newDate,
      time: newTime,
    };
    setAppointments([...appointments, newAppointment]);
    setNewName('');
    setNewDate('');
    setNewTime('');
  };

  const handleDelete = (id) => {
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <button
          onClick={handleAddAppointment}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Appointment
        </button>
      </div>

      <div className="grid grid-cols-7 bg-white rounded shadow overflow-hidden">
        {weekDates.map((date, i) => (
          <div key={i} className="border p-4 min-h-[150px]">
            <div className="font-semibold mb-2">
              {date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
            {appointments
              .filter((a) => a.date === date.toISOString().split('T')[0])
              .map((a) => (
                <div key={a.id} className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm mb-1">
                  {a.name} @ {a.time}
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-bold">Agregar nueva cita</h2>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del cliente"
          className="w-full border px-4 py-2 rounded text-black"
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          className="w-full border px-4 py-2 rounded text-black"
        />
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="w-full border px-4 py-2 rounded text-black"
        />
        <button
          onClick={handleAddAppointment}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Guardar cita
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Próximas citas</h3>
        <div className="space-y-2">
          {appointments.map((a) => (
            <div key={a.id} className="bg-white rounded shadow px-4 py-2 flex justify-between items-center">
              <span>{a.name} - {a.date} a las {a.time}</span>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
