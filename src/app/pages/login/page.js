'use client';
import { useState, useEffect } from 'react';

export default function LoginPage() {
  // State to manage username, password, and error message
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Set the body background to white on component mount
  useEffect(() => {
    document.body.style.backgroundColor = 'white';
    // Cleanup on component unmount
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulated authentication with hardcoded credentials
    if (username === 'admin' && password === 'password') {
      setError('');
      alert('Login successful!'); // You could replace this with a redirect
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex w-full max-w-4xl">
        {/* Left Section: Login Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <div className="flex items-center justify-center mb-6">
            <span className="text-4xl mr-2"></span>
            <h1 className="text-2xl font-bold text-gray-800">Ópticas Manzano</h1>
          </div>
          <p className="text-center text-gray-500 mb-8">Inicia sesión en tu cuenta</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Field */}
            <div className="relative">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Username
              </label>
              <div className="flex items-center border border-gray-300 rounded-md bg-gray-100">
                <span className="pl-3 text-gray-500"></span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Introduce tu correo"
                  className="w-full px-3 py-2 bg-gray-100 text-black rounded-md focus:outline-none focus:ring-0"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="flex items-center border border-gray-300 rounded-md bg-gray-100">
                <span className="pl-3 text-gray-500"></span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="w-full px-3 py-2 bg-gray-100 text-black rounded-md focus:outline-none focus:ring-0"
                  required
                />
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-gray-600 focus:ring-0 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-500">
                  Recuerda
                </label>
              </div>
              <a href="#" className="text-sm text-gray-500 hover:underline">
                ¿Has olvidado tu contraseña?
              </a>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gray-800 text-white rounded-md hover:bg-gray-900 focus:outline-none cursor-pointer"
            >
              Iniciar Sesión
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-500 mt-4">
              ¿No tienes cuenta?{' '}
              <a href="#" className="text-gray-500 hover:underline">
                Regístrate
              </a>
            </p>
          </form>
        </div>

        {/* Right Section: Welcome Message */}
        <div className="w-1/2 bg-white p-8 flex flex-col justify-center items-center">
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-2">👓</span>
            <h2 className="text-2xl font-bold text-gray-800">ÓPTICAS MANZANO</h2>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Bienvenido a Ópticas Manzano</h3>
          <p className="text-gray-500 text-center">
            Su socio de confianza para gafas de calidad y servicios profesionales de cuidado ocular.
          </p>
        </div>
      </div>
    </div>
  );
}