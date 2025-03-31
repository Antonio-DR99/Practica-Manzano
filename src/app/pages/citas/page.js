'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configurar moment en español
moment.locale('es');
const localizer = momentLocalizer(moment);

export default function CitasPage() {
  const [currentMonth, setCurrentMonth] = useState(moment().format('MMMM YYYY'));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const modalRef = useRef(null);

  // Datos de ejemplo para citas
  const sampleAppointments = [
    {
      id: 1,
      title: 'Revisión ocular',
      clientName: 'John Doe',
      start: new Date(2023, 5, 15, 14, 0),
      end: new Date(2023, 5, 15, 15, 0),
      notes: 'Primera revisión'
    },
    {
      id: 2,
      title: 'Prueba de lentes',
      clientName: 'Jane Smith',
      start: new Date(2023, 5, 16, 10, 0),
      end: new Date(2023, 5, 16, 11, 0),
      notes: 'Lentes progresivos'
    }
  ];

  useEffect(() => {
    // Aquí se cargarían las citas desde la API
    // Por ahora usamos datos de ejemplo
    setAppointments(sampleAppointments);
  }, []);

  useEffect(() => {
    // Filtrar citas para la fecha seleccionada
    filterAppointmentsByDate(selectedDate);
  }, [selectedDate, appointments]);

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filterAppointmentsByDate = (date) => {
    const filtered = appointments.filter(appointment => 
      moment(appointment.start).isSame(date, 'day')
    );
    setFilteredAppointments(filtered);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentMonth(moment(date).format('MMMM YYYY'));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddClick = () => {
    setFormData({
      title: '',
      clientName: '',
      date: moment(selectedDate).format('YYYY-MM-DD'),
      time: '09:00',
      duration: 60,
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleEditClick = (appointment) => {
    setCurrentAppointment(appointment);
    setFormData({
      title: appointment.title,
      clientName: appointment.clientName,
      date: moment(appointment.start).format('YYYY-MM-DD'),
      time: moment(appointment.start).format('HH:mm'),
      duration: moment(appointment.end).diff(moment(appointment.start), 'minutes'),
      notes: appointment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (appointment) => {
    setCurrentAppointment(appointment);
    setShowDeleteModal(true);
  };

  const handleAddAppointment = () => {
    const startDateTime = moment(`${formData.date} ${formData.time}`).toDate();
    const endDateTime = moment(startDateTime).add(formData.duration, 'minutes').toDate();
    
    const newAppointment = {
      id: Date.now(), // Generamos un ID temporal
      title: formData.title,
      clientName: formData.clientName,
      start: startDateTime,
      end: endDateTime,
      notes: formData.notes
    };
    
    // Aquí se enviaría a la API
    // Por ahora solo actualizamos el estado local
    setAppointments([...appointments, newAppointment]);
    setShowAddModal(false);
    showNotification('Cita añadida correctamente', 'success');
  };

  const handleSaveEdit = () => {
    const startDateTime = moment(`${formData.date} ${formData.time}`).toDate();
    const endDateTime = moment(startDateTime).add(formData.duration, 'minutes').toDate();
    
    const updatedAppointment = {
      ...currentAppointment,
      title: formData.title,
      clientName: formData.clientName,
      start: startDateTime,
      end: endDateTime,
      notes: formData.notes
    };
    
    // Aquí se enviaría a la API
    // Por ahora solo actualizamos el estado local
    const updatedAppointments = appointments.map(appointment => 
      appointment.id === currentAppointment.id ? updatedAppointment : appointment
    );
    
    setAppointments(updatedAppointments);
    setShowEditModal(false);
    showNotification('Cita actualizada correctamente', 'success');
  };

  const handleConfirmDelete = () => {
    // Aquí se enviaría a la API
    // Por ahora solo actualizamos el estado local
    const updatedAppointments = appointments.filter(
      appointment => appointment.id !== currentAppointment.id
    );
    
    setAppointments(updatedAppointments);
    setShowDeleteModal(false);
    showNotification('Cita eliminada correctamente', 'success');
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Formatear hora
  const formatTime = (date) => {
    return moment(date).format('HH:mm');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Gestión de Citas</h1>
        <p className="text-gray-600">Administra las citas de tus clientes</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Total Citas</h3>
            <span className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold">{appointments.length}</p>
            <p className="text-green-500 text-sm">+3 esta semana</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Citas Hoy</h3>
            <span className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold">
              {appointments.filter(appointment => 
                moment(appointment.start).isSame(moment(), 'day')
              ).length}
            </p>
            <p className="text-gray-500 text-sm">Pendientes hoy</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Próxima Cita</h3>
            <span className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="mt-2">
            {appointments.length > 0 ? (
              <>
                <p className="text-lg font-semibold">
                  {appointments.sort((a, b) => a.start - b.start)[0]?.title}
                </p>
                <p className="text-gray-500 text-sm">
                  {moment(appointments.sort((a, b) => a.start - b.start)[0]?.start).format('DD MMM, HH:mm')}
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">No hay citas programadas</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm font-medium">Disponibilidad</h3>
            <span className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold">85%</p>
            <p className="text-green-500 text-sm">Horarios disponibles</p>
          </div>
        </div>
      </div>

      {/* Calendario y Citas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">{currentMonth}</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleDateChange(moment(selectedDate).subtract(1, 'month').toDate())}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDateChange(new Date())}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm font-medium"
                  >
                    Hoy
                  </button>
                  <button 
                    onClick={() => handleDateChange(moment(selectedDate).add(1, 'month').toDate())}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex mt-4 space-x-1">
                <button 
                  onClick={() => handleDateChange(selectedDate)}
                  className="flex-1 px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Día
                </button>
                <button 
                  className="flex-1 px-2 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Semana
                </button>
                <button 
                  className="flex-1 px-2 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Mes
                </button>
              </div>
            </div>
            <div className="p-4">
              <Calendar
                localizer={localizer}
                events={appointments}
                startAccessor="start"
                endAccessor="end"
                views={['week']}
                defaultView="week"
                step={60}
                showMultiDayTimes
                style={{ height: 500 }}
                onNavigate={handleDateChange}
                onSelectEvent={handleEditClick}
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: '#3B82F6',
                    borderRadius: '4px',
                    color: 'white',
                    border: 'none',
                    display: 'block'
                  }
                })}
                formats={{
                  dayFormat: 'dddd',
                  timeGutterFormat: (date, culture, localizer) =>
                    localizer.format(date, 'HH:mm', culture),
                }}
              />
            </div>
          </div>
        </div>

        {/* Lista de Citas del Día */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md h-full">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700">
                Citas: {moment(selectedDate).format('DD MMM, YYYY')}
              </h2>
              <button 
                onClick={handleAddClick}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments
                    .sort((a, b) => a.start - b.start)
                    .map((appointment) => (
                      <div key={appointment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">{appointment.title}</h3>
                            <p className="text-gray-600 text-sm">{appointment.clientName}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditClick(appointment)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(appointment)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {formatTime(appointment.start)} - {formatTime(appointment.end)}
                        </div>
                        {appointment.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p className="italic">Notas: {appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No hay citas para este día</p>
                  <button 
                    onClick={handleAddClick}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Añadir Cita
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Añadir Cita */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Añadir Nueva Cita</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Revisión ocular"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora 30 minutos</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Añade notas adicionales..."
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAppointment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Cita */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Editar Cita</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora 30 minutos</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Cita */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Eliminar Cita</h2>
            <p className="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación */}
      {notification.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white transition-opacity duration-300`}>
          {notification.message}
        </div>
      )}