import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { Button } from '@/components/ui/button';
import { Send, Lock, CheckCircle, Shield, Unlock, Trash2, Mail, Package, Fingerprint, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const TicketPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { formatCurrency } = useDatabase();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchTicketData = async () => {
    try {
      const response = await fetch(`/api/get_ticket.php?orderId=${orderId}&userId=${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.ticket) {
          setTicket(data.ticket);
          setMessages(data.messages);
        }
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTicketData();
      const interval = setInterval(fetchTicketData, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser, orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket || isSending) return;

    setIsSending(true);
    try {
      await fetch('/api/send_message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          userId: currentUser.id,
          message: newMessage,
          type: 'text'
        })
      });
      setNewMessage('');
      fetchTicketData();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    const confirmMsg = newStatus === 'closed' ? (t.ticket.closeConfirm || '¿Cerrar ticket?') : '¿Estás seguro de REABRIR este ticket?';
    if (!window.confirm(confirmMsg)) return;
    await fetch('/api/update_ticket_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: ticket.id, status: newStatus, userId: currentUser.id })
    });
    fetchTicketData();
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm("⚠️ PELIGRO: ¿Estás seguro de ELIMINAR permanentemente este ticket y todo su historial de chat? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch('/api/delete_ticket.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.id, userId: currentUser.id })
      });
      const data = await res.json();
      if(data.success) {
         navigate('/admin/tickets');
      }
    } catch(e) {}
  };

  if (loading) return <div className="min-h-screen bg-gray-900 pt-24 text-white text-center">Loading...</div>;
  if (!ticket) return <div className="min-h-screen bg-gray-900 pt-24 text-white text-center">Ticket not found.</div>;

  const isAdmin = currentUser?.role === 'admin';

  let ticketTitle = t.ticket.title.replace('{id}', orderId);
  let parsedItems = [];
  if (ticket && ticket.items) {
    try {
      parsedItems = typeof ticket.items === 'string' ? JSON.parse(ticket.items) : ticket.items;
      if (Array.isArray(parsedItems) && parsedItems.length > 0) ticketTitle = parsedItems[0].name;
    } catch(e) {}
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. Main Chat Area */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Header Chat */}
            <div className="bg-gray-800/80 backdrop-blur-md p-6 rounded-t-2xl border border-white/10 flex justify-between items-center shadow-lg">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-3">
                  Ticket #{String(ticket.id).padStart(4, '0')}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ticket.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {ticket.status === 'open' ? (t.ticket.status?.open || 'Abierto') : (t.ticket.status?.closed || 'Cerrado')}
                  </span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">{ticketTitle}</p>
              </div>
            </div>

            {/* Messages Box */}
            <div className="bg-gray-900/80 border-x border-white/10 h-[500px] overflow-y-auto p-6 space-y-5">
              {messages.length === 0 && <div className="text-center text-gray-500 py-10 mt-10 bg-gray-800/30 rounded-xl border border-dashed border-gray-700 mx-auto max-w-md">{t.ticket.welcome}</div>}
          {messages.map((msg) => {
            const isMe = msg.userId == currentUser.id;
            const isAdminOrHelper = msg.userRole === 'admin' || msg.userRole === 'ayudante';
            return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${isMe ? 'bg-purple-600 text-white rounded-br-none' : isAdminOrHelper ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-bl-none shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-white/5'}`}>
                  <div className="flex items-center gap-2 mb-1.5"><span className="text-xs font-bold opacity-70 flex items-center gap-1">{isAdminOrHelper && !isMe && <Shield className="w-3 h-3 text-blue-400" />}{isMe ? t.ticket.you : (isAdminOrHelper ? (t.ticket.support || 'Soporte') : msg.userEmail)}</span><span className="text-[10px] opacity-50">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
            
            {/* Input Form */}
            <div className="bg-gray-800/80 backdrop-blur-md p-5 rounded-b-2xl border border-white/10 shadow-lg">
              {ticket.status === 'open' ? (
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={t.ticket.placeholder || 'Escribe tu mensaje...'} disabled={isSending} className="flex-1 bg-gray-900/50 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50 transition-all" />
                  <Button type="submit" disabled={isSending || !newMessage.trim()} className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-6 h-auto disabled:opacity-50 shadow-lg shadow-purple-900/20">
                    <Send className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
                  </Button>
                </form>
              ) : (
                <div className="text-center text-gray-400 flex items-center justify-center gap-2 py-2"><CheckCircle className="w-5 h-5 text-emerald-500" />{t.ticket.closedMessage || 'Este ticket ha sido cerrado y completado.'}</div>
              )}
            </div>
          </div>

          {/* 2. Side Panel (Order Details & Admin) */}
          <div className="space-y-6">
            {/* Detalles del Pedido */}
            <div className="bg-gray-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-purple-400" />
                Detalles del Pedido
              </h3>
              
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Cliente</p>
                  <div className="flex items-center gap-3 text-gray-300 bg-gray-900/50 p-3 rounded-xl border border-white/5">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm font-medium truncate">{ticket.email || 'Cargando...'}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">ID de Transacción</p>
                  <div className="flex items-center gap-3 text-gray-300 bg-gray-900/50 p-3 rounded-xl border border-white/5">
                    <Package className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-mono text-xs truncate" title={ticket.orderId}>{ticket.orderId}</span>
                  </div>
                </div>

                {ticket.total !== undefined && (
                  <div>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">Total Pagado</p>
                    <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 shadow-inner">
                      <DollarSign className="w-4 h-4 shrink-0" />
                      <span className="text-lg font-bold tracking-tight">{formatCurrency(ticket.total)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-3">Artículos del Pedido</p>
                  <div className="space-y-2.5">
                    {parsedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-900/50 p-2.5 rounded-xl border border-white/5 transition-colors hover:bg-gray-900/80">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 border border-white/5 overflow-hidden flex-shrink-0 relative">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover"/> : <Package className="w-5 h-5 absolute inset-0 m-auto text-gray-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-200 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Cant: <span className="text-gray-300 font-medium">{item.quantity || 1}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Panel de Administración (Solo Admins) */}
            {isAdmin && (
              <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2 relative z-10">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Acciones de Staff
                </h3>
                
                <div className="space-y-3 relative z-10">
                  {ticket.status === 'open' ? (
                    <Button onClick={() => handleUpdateStatus('closed')} className="w-full bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/40 h-11 rounded-xl transition-all">
                      <Lock className="w-4 h-4 mr-2" /> Marcar como Completado
                    </Button>
                  ) : (
                    <Button onClick={() => handleUpdateStatus('open')} className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 h-11 rounded-xl transition-all">
                      <Unlock className="w-4 h-4 mr-2" /> Reabrir Ticket
                    </Button>
                  )}

                  <div className="h-px w-full bg-white/5 my-2"></div>

                  <Button onClick={handleDeleteTicket} className="w-full bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 h-11 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar Permanentemente
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
export default TicketPage;