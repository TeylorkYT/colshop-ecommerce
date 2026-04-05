import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, FileText, Gavel } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <Helmet>
        <title>Términos y Condiciones - Colshop</title>
        <meta name="description" content="Términos legales, garantías y condiciones de uso de Colshop" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/90 rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Términos y <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Condiciones</span>
            </h1>
            <p className="text-gray-400">Última actualización: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-10 text-gray-300 leading-relaxed text-sm md:text-base">
            
            {/* Sección 1: Introducción */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="text-purple-500" /> 1. Naturaleza del Servicio
              </h2>
              <p>
                COL-SHOP opera como una plataforma intermediaria para la adquisición de bienes digitales, monedas virtuales y cuentas de servicios. 
                Al realizar una compra, usted reconoce que está adquiriendo un <strong>producto digital intangible</strong>. 
                Una vez entregadas las credenciales, códigos o realizada la recarga, el servicio se considera "consumido" y no está sujeto al derecho de retracto tradicional.
              </p>
            </section>

            {/* Sección 2: Deslinde de Responsabilidad (CRÍTICO PARA GREY MARKET) */}
            <section className="bg-purple-500/5 p-6 rounded-xl border border-purple-500/10">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="text-purple-500" /> 2. Deslinde de Responsabilidad (Disclaimer)
              </h2>
              <p className="mb-4 font-medium text-white">
                COL-SHOP es un comercio independiente y NO está afiliado, asociado, autorizado, respaldado ni conectado oficialmente de ninguna manera con:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5 text-gray-400 mb-4">
                <li>Roblox Corporation</li>
                <li>Supercell (Clash Royale, Clash of Clans)</li>
                <li>Epic Games, Inc. (Fortnite)</li>
                <li>Mojang Studios / Microsoft (Minecraft)</li>
                <li>Netflix, Disney, Spotify u otras plataformas de streaming.</li>
              </ul>
              <p className="text-xs text-gray-500">
                Todos los nombres de productos, logotipos y marcas comerciales son propiedad de sus respectivos dueños. El uso de estos nombres en este sitio web es únicamente con fines de identificación y descripción de los productos a la venta.
              </p>
            </section>

            {/* Sección 3: Reglas por Tipo de Producto */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">3. Reglas Específicas por Producto</h2>
              
              <div className="space-y-6">
                {/* 3.1 Recargas */}
                <div className="border-l-4 border-green-500 pl-4 py-1">
                  <h3 className="text-lg font-bold text-white mb-1">3.1 Recargas Directas (Robux, Pases de Batalla)</h3>
                  <p>
                    Estas transacciones se aplican directamente a su cuenta. Es <strong>responsabilidad exclusiva del cliente</strong> proporcionar el ID de Jugador (Player Tag) o usuario correcto. COL-SHOP no se hace responsable ni realizará reembolsos si el cliente proporciona un ID incorrecto y la recarga se envía a otro usuario.
                  </p>
                </div>

                {/* 3.2 Cuentas de Juegos */}
                <div className="border-l-4 border-orange-500 pl-4 py-1">
                  <h3 className="text-lg font-bold text-white mb-1">3.2 Cuentas de Juegos (Fortnite, Minecraft)</h3>
                  <p className="mb-2">
                    Se entregan credenciales de acceso. El cliente entiende que la compra, venta y uso compartido de cuentas puede contravenir los Términos de Servicio (ToS) de los desarrolladores originales (Epic Games, Mojang).
                  </p>
                  <p className="text-orange-300 text-sm bg-orange-500/10 p-2 rounded">
                    <strong>Riesgo de Ban:</strong> COL-SHOP garantiza que la cuenta es funcional al momento de la entrega. Sin embargo, no nos hacemos responsables por suspensiones o baneos futuros derivados de las acciones del usuario o de las políticas de "Account Sharing" de las plataformas.
                  </p>
                </div>

                {/* 3.3 Streaming */}
                <div className="border-l-4 border-blue-500 pl-4 py-1">
                  <h3 className="text-lg font-bold text-white mb-1">3.3 Servicios de Streaming</h3>
                  <p>
                    Las cuentas entregadas son para uso personal. Está estrictamente prohibido revender, compartir públicamente o alterar la configuración de la cuenta.
                  </p>
                </div>
              </div>
            </section>

            {/* Sección 4: LA REGLA DE ORO (Garantía) */}
            <section className="bg-red-500/10 p-6 rounded-xl border border-red-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Gavel className="w-24 h-24 text-red-500" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-500" /> 4. Anulación de Garantía (Regla de Oro)
              </h2>
              <p className="font-bold text-white mb-4 text-lg">
                APLICA PARA: CUENTAS DE MINECRAFT, FORTNITE Y STREAMING
              </p>
              <p className="mb-4">
                La garantía de reposición o soporte se anula <strong>AUTOMÁTICAMENTE</strong> e <strong>IRREVOCABLEMENTE</strong> si el cliente realiza cualquiera de las siguientes acciones en la cuenta entregada:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 font-medium">
                <li><span className="text-red-400">Cambiar el correo electrónico</span> asociado a la cuenta.</li>
                <li><span className="text-red-400">Cambiar la contraseña</span> de acceso.</li>
                <li>Modificar, eliminar o crear perfiles (en servicios como Netflix/Disney+).</li>
                <li>Intentar cambiar preguntas de seguridad o PINs de control parental.</li>
              </ul>
              <p className="mt-4 text-sm text-red-300 bg-red-900/20 p-3 rounded border border-red-500/30">
                <strong>¿Por qué?</strong> Al alterar las credenciales, perdemos el acceso administrativo para verificar fallos o realizar reposiciones. Si cambias la clave, la cuenta es tuya y la garantía finaliza.
              </p>
            </section>

            {/* Sección 5: Política de Reembolsos */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">5. Política de Garantía y Reembolsos</h2>
              <div className="space-y-4">
                <p>
                  <strong>No hay reembolsos por "arrepentimiento":</strong> Una vez enviadas las credenciales o códigos, el producto no puede ser devuelto.
                </p>
                <p>
                  <strong>Garantía de Streaming:</strong> Cubrimos la funcionalidad de la cuenta durante el periodo contratado (ej. 1 mes). Si la cuenta cae, se repondrá en un plazo máximo de 24-48 horas.
                </p>
                <p>
                  <strong>Excepciones:</strong> Solo se emitirá reembolso total si COL-SHOP no puede entregar el producto por falta de stock o problemas técnicos de nuestra plataforma en un plazo de 72 horas.
                </p>
              </div>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsAndConditions;