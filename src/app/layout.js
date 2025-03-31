'use client';

import { Geist, Geist_Mono } from "next/font/google";
import Navbar from './components/Navbar';
import "../app/globals.css";
import { useState, createContext } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Creamos un contexto para compartir el estado del navbar
export const NavbarContext = createContext();

// Metadata debe estar en un archivo separado cuando usamos 'use client'
const metadata = {
  title: "Opticas Manzano",
  description: "Sistema de gestión para Opticas Manzano",
};

export default function RootLayout({ children }) {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NavbarContext.Provider value={{ isOpen: isNavbarOpen, setIsOpen: setIsNavbarOpen }}>
          <Navbar />
          <main className={`w-full transition-all duration-300 ease-in-out ${isNavbarOpen ? 'md:pl-60' : 'pl-16'}`}>
            <div className="p-4 md:p-8">
              {children}
            </div>
          </main>
        </NavbarContext.Provider>
      </body>
    </html>
  );
}

