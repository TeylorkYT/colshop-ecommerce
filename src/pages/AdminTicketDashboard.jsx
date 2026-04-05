import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, Filter, CheckCircle, Clock } from 'lucide-react';

const AdminTicketDashboard = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open'); // 'all', 'open', 'closed'

  useEffect(() => {
    fetchTickets();
  }, [currentUser]);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`/api/get_all_tickets.php?userId=${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 pt-24 text-white text-center">Cargando tickets...</div>;

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4">
      <Helmet>
        <title>Admin Tickets - Colshop</title>
      </Helmet>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Gestión de Tickets de Soporte</h1>
          
          {/* Filtros de Estado */}
          <div className="flex bg-gray-800 p-1 rounded-lg border border-purple-500/20">
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filter === 'open' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <Clock className="w-4 h-4" /> Abiertos
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filter === 'closed' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <CheckCircle className="w-4 h-4" /> Cerrados
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${filter === 'all' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <Filter className="w-4 h-4" /> Todos
            </button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {filteredTickets.length === 0 ? (
            <div className="text-gray-400 text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No hay tickets {filter === 'all' ? '' : (filter === 'open' ? 'abiertos' : 'cerrados')} en este momento.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              // Parsear items para obtener el nombre del primer producto
              let productName = "Producto desconocido";
              try {
                const items = JSON.parse(ticket.items);
                if (items && items.length > 0) productName = items[0].name + (items.length > 1 ? ` (+${items.length - 1} más)` : '');
              } catch (e) {}

              return (
              <div key={ticket.id} className="bg-gray-800/50 p-6 rounded-xl border border-purple-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="w-full sm:w-auto">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{productName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${String(ticket.status).trim().toLowerCase() === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {String(ticket.status).trim().toLowerCase() === 'open' ? 'Abierto' : 'Cerrado'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{ticket.email}</p>
                  <p className="text-gray-500 text-xs">Fecha: {new Date(ticket.created_at).toLocaleString()}</p>
                </div>
                
                <Link to={`/ticket/${ticket.orderId || ticket.id}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                    <MessageSquare className="w-4 h-4 mr-2" /> Ver Chat
                  </Button>
                </Link>
              </div>
            )})
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTicketDashboard;