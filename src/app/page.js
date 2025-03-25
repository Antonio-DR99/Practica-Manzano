'use client';
import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // Actualizar los pedidos cada minuto
    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen p-4">
        <div className="header">
          <h1>Cargando pedidos...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="header">
        <h1>Pedidos de WhatsApp</h1>
      </div>
      
      <div className="orders-grid">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500">No hay pedidos todavía</p>
        ) : (
          orders.map((order) => (
            <div key={order.idorder} className="order-card">
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-semibold">{order.user_name}</h2>
                <span className="text-sm text-gray-500">
                  {formatDate(order.orderdate)}
                </span>
              </div>
              
              <div className="mb-2">
                <span className="text-gray-700">Producto: </span>
                <span className="font-medium">{order.product_name}</span>
              </div>
              
              <div className="mb-2">
                <span className="text-gray-700">Cantidad: </span>
                <span className="font-medium">{order.amount}</span>
              </div>
              
              <div className="mb-2">
                <span className="text-gray-700">Total: </span>
                <span className="font-medium">{order.amount * order.price}€</span>
              </div>
              
              <div className="text-sm text-gray-500">
                <span>Teléfono: </span>
                <span>{order.phone}</span>
              </div>
              
              {order.message && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  "{order.message}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
