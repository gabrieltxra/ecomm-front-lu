import React from 'react';
import { Instagram, Phone, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 text-slate-800 dark:text-white border-t border-slate-300 dark:border-slate-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e Descrição */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div className="w-12 h-12 rounded-full bg-atelie-gradient flex items-center justify-center shadow-lg">
                <span className="text-white font-script text-xl font-bold">L</span>
              </div>
              <div>
                <span className="text-gradient font-elegant text-2xl font-semibold">Ateliê</span>
                <span className="text-gradient font-script text-2xl ml-1">Lu</span>
                <span className="text-gradient font-elegant text-lg block text-xs">Cortinas</span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-xs">
              Transformando lares com elegância e personalidade há mais de 10 anos. 
              Cortinas e persianas sob medida para criar ambientes únicos.
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-rose-500 dark:text-rose-400">Links Rápidos</h3>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300">
              <li><a href="/" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium">Home</a></li>
              <li><a href="/produtos" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium">Produtos</a></li>
              {/* <li><a href="/cortinas" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium">Cortinas</a></li>
              <li><a href="/persianas" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium">Persianas</a></li>
              <li><a href="/sob-medida" className="hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium">Sob Medida</a></li> */}
            </ul>
          </div>

          {/* Contato */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-4 text-rose-500 dark:text-rose-400">Contato</h3>
            <div className="space-y-4">
              <a 
                href="https://www.instagram.com/lucortinas_atelie" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-end space-x-3 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium group"
                aria-label="Siga-nos no Instagram"
              >
                <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>@lucortinas_atelie</span>
              </a>
              <a 
                href="https://wa.me/5519991893513" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-end space-x-3 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium group"
                aria-label="Entre em contato via WhatsApp"
              >
                <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>+55 19 99189-3513</span>
              </a>
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-slate-300 dark:border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Direitos autorais */}
            <div className="text-center md:text-left">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                © {currentYear} Ateliê Lu Cortinas. Todos os direitos reservados.
              </p>
            </div>

            {/* Desenvolvido por T2 */}
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-sm">
              <span>Desenvolvido com</span>
              <Heart className="h-4 w-4 text-rose-500 dark:text-rose-400 fill-current animate-pulse" />
              <span>por</span>
              <span className="font-bold text-rose-500 dark:text-rose-400 hover:scale-105 transition-transform cursor-pointer">T2</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 