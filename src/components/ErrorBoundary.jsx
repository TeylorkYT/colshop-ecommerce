import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la UI de repuesto
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Aquí podrías enviar el error a un servicio de logging como Sentry
    console.error("ErrorBoundary atrapó un error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // UI de Fallback Bonita
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="max-w-md w-full bg-gray-800/80 backdrop-blur-md border border-red-500/20 rounded-xl p-8 text-center shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 rounded-full animate-pulse">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              ¡Ups! Algo salió mal
            </h2>
            
            <p className="text-gray-400 mb-8">
              Hubo un problema cargando esta sección. No te preocupes, tus datos están seguros.
            </p>

            <Button 
              onClick={this.handleReload}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-6"
            >
              Recargar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;