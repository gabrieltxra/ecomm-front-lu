import {
  ArrowRight,
  ArrowUpRight,
  Check,
  HeartHandshake,
  Instagram,
  MessageCircle,
  Ruler,
  Sparkles,
  Store,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const whatsappUrl =
  'https://wa.me/5519991893513?text=Olá!%20Gostaria%20de%20conhecer%20as%20opções%20do%20Ateliê%20Lu.';

const benefits = [
  {
    icon: Ruler,
    number: '01',
    title: 'Feito para o seu espaço',
    description: 'Orientação para escolher medidas, tecidos e acabamentos que conversem com o seu ambiente.',
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'Curadoria com intenção',
    description: 'Peças bonitas, funcionais e selecionadas para deixar a casa mais leve, acolhedora e sua.',
  },
  {
    icon: HeartHandshake,
    number: '03',
    title: 'Atendimento próximo',
    description: 'Do primeiro contato ao pós-venda, você fala com quem realmente entende de cortinas.',
  },
];

const projectFilters = [
  { value: 'todos', label: 'Todos' },
  { value: 'cortinas', label: 'Cortinas' },
  { value: 'persianas', label: 'Persianas' },
  { value: 'quartos', label: 'Quartos' },
  { value: 'salas', label: 'Salas' },
];

const galleryProjects = [
  {
    src: '/landing/instagram/quarto-voil.jpg',
    alt: 'Quarto contemporâneo com cortina de voil branca do teto ao piso',
    title: 'Leveza no quarto',
    detail: 'Voil wave',
    tags: ['cortinas', 'quartos'],
  },
  {
    src: '/landing/instagram/quarto-linho.jpg',
    alt: 'Quarto com cortina de linho bege cobrindo toda a parede',
    title: 'Textura e aconchego',
    detail: 'Linho wave',
    tags: ['cortinas', 'quartos'],
  },
  {
    src: '/landing/instagram/quarto-classico.jpg',
    alt: 'Quarto claro com persiana romana bege',
    title: 'Luz na medida',
    detail: 'Persiana romana',
    tags: ['persianas', 'quartos'],
  },
  {
    src: '/landing/instagram/cortina-canto.jpg',
    alt: 'Sala de televisão com cortina wave em tom neutro',
    title: 'Conforto visual',
    detail: 'Cortina wave',
    tags: ['cortinas', 'salas'],
  },
  {
    src: '/landing/instagram/cortina-porta.jpg',
    alt: 'Sala de pé-direito alto com cortina branca do teto ao piso',
    title: 'Amplitude e movimento',
    detail: 'Voil pé-direito alto',
    tags: ['cortinas', 'salas'],
  },
  {
    src: '/landing/instagram/projeto-fevereiro-09.jpg',
    alt: 'Quarto infantil com cortina branca e iluminação embutida',
    title: 'Delicadeza iluminada',
    detail: 'Voil com iluminação',
    tags: ['cortinas', 'quartos'],
  },
  {
    src: '/landing/instagram/projeto-fevereiro-08.jpg',
    alt: 'Janela alta com cortina branca e caimento leve',
    title: 'Caimento impecável',
    detail: 'Voil sob medida',
    tags: ['cortinas', 'quartos'],
  },
  {
    src: '/landing/instagram/projeto-janeiro-31.jpg',
    alt: 'Sala clara com cortina branca, sofá e mesa de centro',
    title: 'Sala leve e acolhedora',
    detail: 'Cortina wave',
    tags: ['cortinas', 'salas'],
  },
  {
    src: '/landing/instagram/projeto-janeiro-14.jpg',
    alt: 'Sala aconchegante com cortina branca e iluminação quente',
    title: 'Aconchego ao entardecer',
    detail: 'Voil com forro',
    tags: ['cortinas', 'salas'],
  },
  {
    src: '/landing/instagram/projeto-janeiro-19.jpg',
    alt: 'Ambiente de pé-direito alto com cortina cinza longa',
    title: 'Elegância vertical',
    detail: 'Cortina pé-direito alto',
    tags: ['cortinas', 'salas'],
  },
  {
    src: '/landing/instagram/projeto-janeiro-15.jpg',
    alt: 'Quarto clássico em branco e vinho com cortina clara',
    title: 'Composição clássica',
    detail: 'Cortina com forro',
    tags: ['cortinas', 'quartos'],
  },
];

const Landing = () => {
  const [projectFilter, setProjectFilter] = useState('todos');

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -7% 0px' }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
  <div className="landing-page min-h-screen overflow-hidden bg-[#f8f4ed] text-[#2e2925] selection:bg-[#c96b65] selection:text-white">
    <Helmet>
      <title>Ateliê Lu Cortinas | Ambientes que acolhem</title>
      <meta
        name="description"
        content="Cortinas, persianas e detalhes escolhidos para transformar a luz e o jeito de viver a sua casa. Conheça o Ateliê Lu."
      />
    </Helmet>

    <header className="absolute inset-x-0 top-0 z-40 border-b border-[#3f3730]/10 bg-[#f8f4ed]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1380px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <a href="#inicio" className="group flex items-center gap-3" aria-label="Ateliê Lu Cortinas — início">
          <span className="grid h-10 w-10 shrink-0 aspect-square place-items-center rounded-full border border-[#b45f5a]/30 bg-[#b45f5a] font-script text-xl font-bold text-white shadow-[0_8px_28px_rgba(109,56,51,0.18)] transition-transform group-hover:-rotate-6">
            L
          </span>
          <span className="leading-none">
            <span className="block font-elegant text-lg font-semibold tracking-[0.03em]">Ateliê Lu</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.32em] text-[#8a7770]">Cortinas</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#645b54] md:flex" aria-label="Navegação da apresentação">
          <a href="#atelie" className="transition-colors hover:text-[#a64f4a]">O ateliê</a>
          <a href="#projetos" className="transition-colors hover:text-[#a64f4a]">Projetos</a>
          <a href="#diferenciais" className="transition-colors hover:text-[#a64f4a]">Diferenciais</a>
          <a href="#processo" className="transition-colors hover:text-[#a64f4a]">Como funciona</a>
        </nav>

        <Link
          to="/ecommerce"
          className="group inline-flex items-center gap-2 rounded-full bg-[#322c28] px-4 py-2.5 text-sm font-semibold text-[#fffaf3] transition hover:bg-[#a64f4a] sm:px-5"
        >
          <span className="hidden sm:inline">Visitar a loja</span>
          <span className="sm:hidden">Loja</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </header>

    <main>
      <section id="inicio" className="relative min-h-[760px] pt-20 lg:min-h-screen">
        <div className="pointer-events-none absolute -left-32 top-28 h-72 w-72 rounded-full bg-[#e7c8b5]/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-4 h-96 w-96 rounded-full bg-[#cf8b84]/15 blur-3xl" />

        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1380px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-12 lg:py-20">
          <div className="relative z-10 max-w-3xl" data-reveal="left">
            <div className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-[#a64f4a]">
              <span className="h-px w-10 bg-[#a64f4a]" />
              Design que veste a casa
            </div>

            <h1 className="font-elegant text-[clamp(3.25rem,7vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.045em] text-[#2e2925]">
              A luz entra.
              <span className="mt-2 block font-script font-normal italic text-[#b45f5a]">O aconchego fica.</span>
            </h1>

            <div className="mt-9 flex max-w-2xl flex-col gap-8 border-l border-[#b9a89b] pl-6 sm:flex-row sm:items-end sm:justify-between sm:pl-8">
              <p className="max-w-md text-base leading-7 text-[#665d56] sm:text-lg">
                Cortinas, persianas e detalhes escolhidos para transformar a luz — e o jeito de viver — cada ambiente.
              </p>
              <span className="shrink-0 font-elegant text-sm italic text-[#8a7770]">Desde 2014</span>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/ecommerce"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#b45f5a] px-7 text-sm font-bold text-white shadow-[0_14px_34px_rgba(117,58,53,0.22)] transition hover:-translate-y-0.5 hover:bg-[#9f4e49]"
              >
                Conhecer a coleção
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#514841]/20 bg-[#fffaf3]/60 px-7 text-sm font-bold text-[#4d443e] transition hover:-translate-y-0.5 hover:border-[#b45f5a]/40 hover:bg-[#fffaf3]"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com a Lu
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[590px] lg:ml-auto" data-reveal="image">
            <div className="absolute -left-7 top-12 z-20 rounded-full border border-[#fffaf3]/60 bg-[#fffaf3]/90 px-4 py-2 text-xs font-semibold text-[#645b54] shadow-lg backdrop-blur-md sm:-left-12 sm:px-5 sm:py-3">
              Sob medida, como a sua casa
            </div>

            <figure className="relative aspect-[4/5] overflow-hidden rounded-t-[12rem] bg-[#d7c8ba] shadow-[0_35px_80px_rgba(58,45,37,0.2)] sm:rounded-t-[16rem]">
              <img
                src="/landing/hero-quarto.webp"
                alt="Quarto decorado com cortina branca do teto ao piso, projeto realizado pelo Ateliê Lu"
                width={1440}
                height={1440}
                loading="eager"
                className="h-full w-full object-cover object-center transition duration-700 hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#241d18]/55 via-transparent to-white/5" />
              <figcaption className="absolute bottom-7 left-7 text-[#fffaf3] sm:bottom-9 sm:left-9">
                <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">Projeto real</span>
                <span className="mt-2 block font-elegant text-xl">Leveza em cada detalhe</span>
              </figcaption>
            </figure>

            <div className="absolute -bottom-5 -right-2 z-20 grid h-24 w-24 place-items-center rounded-full bg-[#e6bf92] text-center text-[10px] font-bold uppercase leading-4 tracking-[0.18em] text-[#584332] shadow-lg sm:-right-8 sm:h-28 sm:w-28">
              Feito com
              <br />
              cuidado
            </div>
          </div>
        </div>
      </section>

      <section id="atelie" className="border-y border-[#463b33]/10 bg-[#302b27] py-20 text-[#f8f1e8] sm:py-28">
        <div className="mx-auto grid max-w-[1380px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-12">
          <div data-reveal="left">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d99790]">Mais que decoração</p>
            <div className="mt-8 h-px w-16 bg-[#d99790]" />
          </div>
          <div data-reveal="up">
            <h2 className="max-w-4xl font-elegant text-4xl leading-[1.08] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
              A casa conta quem você é. A gente ajuda a contar essa história com{' '}
              <span className="font-script italic text-[#d99790]">textura, luz e delicadeza.</span>
            </h2>
            <div className="mt-12 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2">
              <p className="max-w-md leading-7 text-[#d3c9bf]">
                Cada escolha começa ouvindo você. Entendemos o ambiente, a rotina e a sensação que você quer criar antes de indicar qualquer peça.
              </p>
              <p className="max-w-md leading-7 text-[#d3c9bf]">
                O resultado é uma solução que equilibra beleza e função — sem excessos, sem fórmulas prontas e com atenção aos detalhes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="projetos" className="bg-[#f1e9e0] py-20 sm:py-28">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" data-reveal="up">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a64f4a]">Feitos pelo Ateliê Lu</p>
              <h2 className="mt-4 max-w-2xl font-elegant text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">
                Ambientes reais, transformações reais.
              </h2>
            </div>
            <a
              href="https://www.instagram.com/lucortinas_atelie"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-bold text-[#9f4e49]"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
              Ver mais no Instagram
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          <div className="mb-9 flex flex-wrap gap-2" role="group" aria-label="Filtrar projetos">
            {projectFilters.map((filter) => {
              const active = projectFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setProjectFilter(filter.value)}
                  className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'border-[#302b27] bg-[#302b27] text-white shadow-sm'
                      : 'border-[#473d35]/15 bg-[#fffaf3]/70 text-[#655b54] hover:border-[#b45f5a]/40 hover:text-[#9f4e49]'
                  }`}
                  aria-pressed={active}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {galleryProjects.map((project, index) => {
              const visible = projectFilter === 'todos' || project.tags.includes(projectFilter);
              return (
                <figure
                  key={project.src}
                  data-reveal="image"
                  className={`group relative overflow-hidden rounded-[1.35rem] bg-[#d9cec4] shadow-[0_12px_35px_rgba(60,44,35,0.08)] ${visible ? '' : 'hidden'}`}
                  style={{ transitionDelay: `${(index % 3) * 70}ms` }}
                >
                  <img
                    src={project.src}
                    alt={project.alt}
                    width={1080}
                    height={1080}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241d18]/80 via-[#241d18]/5 to-transparent" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">{project.detail}</span>
                    <h3 className="mt-2 font-elegant text-2xl">{project.title}</h3>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      <section id="diferenciais" className="bg-[#f8f4ed] py-20 sm:py-28">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
          <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" data-reveal="up">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a64f4a]">Nosso jeito de fazer</p>
              <h2 className="mt-4 max-w-2xl font-elegant text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">Detalhes que mudam tudo.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#746860]">Da primeira conversa à instalação, cada etapa é pensada para tornar sua escolha simples e segura.</p>
          </div>

          <div className="grid border-y border-[#463b33]/15 md:grid-cols-3">
            {benefits.map(({ icon: Icon, number, title, description }, index) => (
              <article
                key={title}
                data-reveal="up"
                className={`group relative py-9 md:px-8 md:py-12 lg:px-10 ${index > 0 ? 'border-t border-[#463b33]/15 md:border-l md:border-t-0' : ''}`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#ead9cd] text-[#a64f4a] transition group-hover:-rotate-6 group-hover:bg-[#b45f5a] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-elegant text-2xl italic text-[#b7a79b]">{number}</span>
                </div>
                <h3 className="mt-9 font-elegant text-2xl font-semibold">{title}</h3>
                <p className="mt-4 max-w-sm leading-7 text-[#746860]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="processo" className="bg-[#eadfd4] py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1380px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div data-reveal="left">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a64f4a]">Como funciona</p>
            <h2 className="mt-5 max-w-xl font-elegant text-4xl leading-tight tracking-[-0.025em] sm:text-5xl">
              Da ideia à janela, sem complicação.
            </h2>
            <p className="mt-6 max-w-lg leading-7 text-[#6c6058]">
              Você pode começar pela nossa loja ou conversar diretamente com a gente. Seguimos no seu ritmo.
            </p>
            <Link to="/ecommerce" className="group mt-9 inline-flex items-center gap-3 font-bold text-[#9f4e49]">
              Explorar produtos
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[#9f4e49]/30 transition group-hover:translate-x-1 group-hover:bg-[#9f4e49] group-hover:text-white">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          <ol className="space-y-3" data-reveal="right">
            {[
              ['Conte o que você imagina', 'Envie referências, medidas ou apenas a sua ideia pelo WhatsApp.'],
              ['Escolha com orientação', 'Ajudamos a combinar modelo, tecido, cor e acabamento.'],
              ['Receba e transforme', 'Cuidamos dos detalhes para que a peça chegue pronta para mudar o ambiente.'],
            ].map(([title, description], index) => (
              <li key={title} className="flex gap-5 rounded-2xl border border-[#5b4b40]/10 bg-[#f8f4ed]/70 p-5 sm:items-center sm:gap-7 sm:p-7">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#302b27] font-elegant text-lg text-white">{index + 1}</span>
                <div>
                  <h3 className="font-elegant text-xl font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[#746860]">{description}</p>
                </div>
                <Check className="ml-auto hidden h-5 w-5 shrink-0 text-[#a64f4a] sm:block" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#b45f5a] px-5 py-20 text-white sm:px-8 sm:py-24">
        <div className="mx-auto max-w-5xl text-center" data-reveal="up">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f2cec8]">Seu ambiente começa aqui</p>
          <h2 className="mt-6 font-elegant text-4xl leading-tight tracking-[-0.025em] sm:text-6xl">Vamos encontrar a cortina certa para a sua história?</h2>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/ecommerce" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#fffaf3] px-7 text-sm font-bold text-[#8f4541] transition hover:-translate-y-0.5 hover:bg-white">
              <Store className="h-4 w-4" />
              Ir para a loja
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/35 px-7 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/10">
              <MessageCircle className="h-4 w-4" />
              Conversar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer className="bg-[#27231f] px-5 py-10 text-[#d7cdc4] sm:px-8">
      <div className="mx-auto flex max-w-[1380px] flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 aspect-square place-items-center rounded-full bg-[#b45f5a] font-script text-lg font-bold text-white">L</span>
          <span className="font-elegant text-lg text-[#fffaf3]">Ateliê Lu Cortinas</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm">
          <a href="https://www.instagram.com/lucortinas_atelie" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition hover:text-white">
            <Instagram className="h-4 w-4" /> @lucortinas_atelie
          </a>
        </div>
        <p className="text-xs text-[#9f9187]">© {new Date().getFullYear()} Ateliê Lu</p>
      </div>
    </footer>
  </div>
  );
};

export default Landing;
