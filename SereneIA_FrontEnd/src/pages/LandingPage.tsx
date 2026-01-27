import { useState, useEffect } from 'react';
import { Heart, Sparkles, Shield, Users, ArrowRight, Brain, Moon, Sun } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-amber-50 via-rose-50 to-purple-100">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-pink-300/30 to-rose-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-amber-300/30 to-orange-400/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-purple-300/30 to-indigo-400/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <header className={`flex justify-between items-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Heart className="w-10 h-10 text-rose-500 fill-rose-500 animate-breathe" />
              <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600 bg-clip-text text-transparent">
              SereneIA
            </span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 text-sm font-medium text-amber-700 hover:text-amber-900 transition-colors duration-300"
          >
            Iniciar Sesión
          </button>
        </header>

        {/* Hero Section */}
        <div className={`max-w-6xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-700">Tu compañero de bienestar emocional</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-rose-600 via-amber-500 to-purple-600 bg-clip-text text-transparent">
                Cuida tu mente,
              </span>
              <br />
              <span className="text-gray-800">
                transforma tu vida
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              SereneIA es tu espacio seguro impulsado por IA para encontrar paz mental, 
              gestionar emociones y construir hábitos saludables que perduran.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600 text-white text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Comenzar ahora</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="px-8 py-4 bg-white/70 backdrop-blur-sm text-gray-700 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Ver cómo funciona
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className={`grid md:grid-cols-3 gap-6 mt-20 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Feature 1 */}
            <div className="group bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/40">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Asistente IA Empático</h3>
              <p className="text-gray-600 leading-relaxed">
                Conversaciones naturales con una IA entrenada en salud mental que comprende tus emociones y te guía con empatía.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/40">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Espacio Seguro 24/7</h3>
              <p className="text-gray-600 leading-relaxed">
                Tu información es completamente privada. Disponible cuando lo necesites, sin juicios, solo apoyo constante.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/40">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Crecimiento Personal</h3>
              <p className="text-gray-600 leading-relaxed">
                Seguimiento de tu progreso emocional, ejercicios personalizados y herramientas para tu bienestar diario.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`mt-20 bg-white/50 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-white/40 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <p className="text-gray-600 font-medium">Disponibilidad completa</p>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                  100%
                </div>
                <p className="text-gray-600 font-medium">Privado y seguro</p>
              </div>
              <div>
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2">
                  ∞
                </div>
                <p className="text-gray-600 font-medium">Conversaciones ilimitadas</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className={`mt-20 text-center transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-md rounded-3xl p-10 shadow-xl border border-white/40">
              <Users className="w-12 h-12 text-amber-500 mx-auto mb-6" />
              <p className="text-2xl text-gray-700 italic mb-6 leading-relaxed">
                "SereneIA me ha ayudado a entender mis emociones y a encontrar paz en momentos difíciles. 
                Es como tener un amigo que siempre está ahí para escucharte."
              </p>
              <p className="text-gray-600 font-semibold">María G. - Usuario satisfecho</p>
            </div>
          </div>

          {/* CTA Final */}
          <div className={`mt-20 text-center transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              ¿Listo para comenzar tu viaje?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Únete a miles de personas que ya están transformando su bienestar emocional
            </p>
            <button
              onClick={onGetStarted}
              className="group px-10 py-5 bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto"
            >
              <span>Iniciar gratis</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className={`mt-24 text-center text-gray-500 transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-center space-x-6 mb-4">
            <Moon className="w-5 h-5" />
            <Heart className="w-5 h-5 fill-current" />
            <Sun className="w-5 h-5" />
          </div>
          <p className="text-sm">
            © 2026 SereneIA. Cuidando tu bienestar emocional con tecnología e inteligencia artificial.
          </p>
        </footer>
      </div>
    </div>
  );
};
