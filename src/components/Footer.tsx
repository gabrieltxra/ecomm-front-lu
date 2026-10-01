import React from 'react';
import { Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#27231f] text-[#d7cdc4]">
      <div className="mx-auto max-w-[1380px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-[1.15fr_0.7fr_1fr]">
          <div>
            <Link to="/ecommerce" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#b45f5a] font-script text-xl font-bold text-white">L</span>
              <span className="leading-none">
                <span className="block font-elegant text-xl text-[#fffaf3]">Ateliê Lu</span>
                <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.3em] text-[#a99a90]">Feito com afeto</span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#b9aca2]">
              Peças, materiais e achados escolhidos com carinho para deixar a rotina mais bonita e criativa.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d99790]">Navegue</p>
            <div className="mt-5 grid gap-3 text-sm">
              <Link to="/ecommerce" className="transition hover:text-white">Loja</Link>
              <Link to="/produtos" className="transition hover:text-white">Todos os produtos</Link>
              <Link to="/" className="transition hover:text-white">Conheça o ateliê</Link>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d99790]">Fale com a gente</p>
            <div className="mt-5 grid gap-4 text-sm">
              <a href="https://wa.me/5519991893513" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 transition hover:text-white">
                <Phone className="h-4 w-4 text-[#d99790]" />
                +55 19 99189-3513
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-[#8f8279] sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Ateliê Lu. Todos os direitos reservados.</p>
          <p>Desenvolvido por T2</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
