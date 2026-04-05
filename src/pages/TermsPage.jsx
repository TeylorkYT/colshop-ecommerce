import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShieldAlert, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const TermsPage = () => {
  // Configuración de animación en cascada para fluidez extrema
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      // OPTIMIZACIÓN: Reducir los tiempos de espera para que se sienta más rápido y responsivo
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    // OPTIMIZACIÓN: Cambiar física de resorte por una transición suave y estática (consume menos CPU)
    visible: { opacity: 1, y: 0, transition: { type: "tween", ease: "easeOut", duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4">
      <Helmet>
        <title>Términos y Condiciones - Colshop</title>
        <meta name="description" content="Términos, condiciones y políticas de uso de Colshop." />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          // OPTIMIZACIÓN: Reducir blur de 'xl' a 'md' e incrementar opacidad del fondo. Mejora radical de FPS.
          className="bg-gray-800/80 backdrop-blur-md rounded-3xl border border-white/10 p-8 md:p-12 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/30">
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Términos y Condiciones</h1>
              <p className="text-gray-400 mt-1">Última actualización: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2 text-gray-300 leading-relaxed text-sm md:text-base"
          >
            
            <motion.section variants={itemVariants} className="group hover:bg-white/[0.02] p-4 md:p-6 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/5">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                1. Naturaleza de los Servicios
              </h2>
              <p>
                Colshop actúa como un intermediario y proveedor de bienes digitales, monedas virtuales (ej. Robux), pases de batalla y suscripciones de streaming. Al realizar una compra, el usuario reconoce que está adquiriendo <strong>bienes intangibles y digitales</strong>, los cuales no tienen envío físico. La entrega se realiza exclusivamente a través de nuestra plataforma mediante el sistema de "Tickets".
              </p>
            </motion.section>

            <motion.section variants={itemVariants} className="group hover:bg-white/[0.02] p-4 md:p-6 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/5">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                2. Política de Reembolsos y Entregas Digitales
              </h2>
              <p>
                Debido a la naturaleza de los bienes digitales, <strong>todas las ventas son finales y no reembolsables</strong> una vez que el producto ha sido entregado o activado. 
                Se emitirán reembolsos única y exclusivamente bajo las siguientes condiciones:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-400">
                <li>Si Colshop no puede entregar el producto adquirido en un plazo razonable tras la confirmación del pago.</li>
                <li>Si el producto entregado es defectuoso desde el momento de la entrega y el equipo de soporte no puede ofrecer un reemplazo.</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants} className="bg-blue-500/5 border border-blue-500/20 p-4 md:p-6 rounded-2xl hover:bg-blue-500/10 transition-colors duration-300">
              <h2 className="text-xl font-bold text-white mb-3 text-blue-400">
                3. Cláusula de Servicios de Streaming
              </h2>
              <p className="mb-2">
                Para los productos clasificados como "Streaming" (ej. Netflix, Spotify, etc.), aplican reglas estrictas para mantener la garantía:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li><strong>Prohibición de modificación:</strong> Queda estrictamente prohibido cambiar el <strong>correo electrónico</strong>, la <strong>contraseña</strong> o la información de facturación de la cuenta proporcionada.</li>
                <li>El incumplimiento de esta regla resultará en la <strong>anulación automática e inmediata de la garantía</strong>, sin derecho a reemplazo o reembolso.</li>
                <li>Las pantallas/perfiles asignados deben respetarse. El uso en más dispositivos de los permitidos anula la garantía.</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants} className="bg-orange-500/5 border border-orange-500/20 p-4 md:p-6 rounded-2xl hover:bg-orange-500/10 transition-colors duration-300">
              <h2 className="text-xl font-bold text-white mb-3 text-orange-400">
                4. Cuentas de Juegos y Monedas Virtuales (Robux, V-Bucks)
              </h2>
              <p className="mb-2">
                Al adquirir cuentas, rangos o monedas virtuales vinculadas a juegos de terceros (Roblox, Fortnite, Minecraft, etc.), el usuario acepta que:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Colshop no está afiliado ni respaldado por los desarrolladores de dichos juegos (ej. Epic Games, Roblox Corporation).</li>
                <li>La compra y transferencia de estos activos se realiza bajo el propio riesgo del comprador. El usuario asume toda responsabilidad sobre posibles acciones disciplinarias (suspensiones, baneos o retiros de saldo) que la empresa desarrolladora del juego pueda tomar por violar sus propios Términos de Servicio (TOS).</li>
                <li>Colshop no se hace responsable por la pérdida de la cuenta o el contenido posterior a la entrega exitosa del producto.</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants} className="group hover:bg-white/[0.02] p-4 md:p-6 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/5">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                5. Prevención de Fraude y Contracargos
              </h2>
              <p>
                Registramos direcciones IP, información del dispositivo y el momento exacto en que se aceptan estos términos para propósitos de auditoría legal.
                Cualquier intento de fraude, uso de tarjetas robadas o inicio de un <strong>contracargo malicioso (chargeback)</strong> tras haber recibido el producto digital resultará en:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-400">
                <li>El baneo permanente de su cuenta en Colshop y sistemas asociados.</li>
                <li>La revocación inmediata de las licencias, cuentas o rangos adquiridos.</li>
                <li>La entrega de toda la evidencia digital recopilada a la pasarela de pagos (Mercado Pago) para la disputa del caso.</li>
              </ul>
            </motion.section>

            <motion.section variants={itemVariants} className="group hover:bg-white/[0.02] p-4 md:p-6 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/5">
              <h2 className="text-xl font-bold text-white mb-3">
                6. Aceptación del Contrato
              </h2>
              <p>
                Al realizar una compra en nuestro sitio web, usted marca de forma explícita la casilla de aceptación en el formulario de pago, lo que constituye una firma electrónica vinculante de este contrato. Si no está de acuerdo con alguna de las cláusulas aquí expuestas, absténgase de utilizar nuestros servicios.
              </p>
            </motion.section>

          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mt-6 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              Para dudas legales o disputas, por favor abra un Ticket de Soporte o contacte a nuestro equipo administrativo.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;