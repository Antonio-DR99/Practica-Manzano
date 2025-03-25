"use client"; // Asegúrate de que esta línea esté en la parte superior

import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");

  // Función para manejar el submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Aquí puedes agregar tu lógica de autenticación con tu backend o API
    const email = e.target.email.value;
    const password = e.target.password.value;

    // Para fines visuales, solo muestra un error si el campo está vacío
    if (!email || !password) {
      setError("Por favor ingresa ambos campos.");
    } else {
      // Lógica de autenticación aquí (si se implementa más adelante)
      console.log("Autenticando...", { email, password });
      setError(""); // Limpiar el error si todo está bien
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center text-black" >Iniciar Sesión</h1>
        
        {error && <p className="text-red-500 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Formulario adaptado de tu HTML original */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-black"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-black"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 cursor-pointer">
            Ingresar
          </button>
        </form>

        {/* Aquí podrías incluir otros enlaces si los necesitas */}
        <div className="mt-4">
          <p className="text-center text-sm text-gray-500">
            <a href="/forgot-password" className="text-blue-500 hover:underline">¿Olvidaste tu contraseña?</a>
          </p>
          <p className="text-center text-sm text-gray-500">
            <a href="/signup" className="text-blue-500 hover:underline">¿No tienes una cuenta? Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  );
}
