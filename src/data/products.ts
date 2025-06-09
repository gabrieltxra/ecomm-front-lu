
import { Product } from '../contexts/CartContext';

export const products: Product[] = [
  {
    id: 1,
    name: "Cortina Blackout Elegance",
    price: 289.90,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Cortina blackout de alta qualidade em tecido premium, ideal para quartos e salas que necessitam de escurecimento total.",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564540574859-0dfb63985953?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    category: "Blackout"
  },
  {
    id: 2,
    name: "Cortina Voil Romantic",
    price: 159.90,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Delicada cortina em voil com bordados florais, perfeita para criar um ambiente romântico e aconchegante.",
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564540574859-0dfb63985953?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    category: "Voil"
  },
  {
    id: 3,
    name: "Persiana Horizontal Premium",
    price: 199.90,
    image: "https://images.unsplash.com/photo-1564540574859-0dfb63985953?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Persiana horizontal em alumínio de alta durabilidade, com controle de luminosidade preciso.",
    images: [
      "https://images.unsplash.com/photo-1564540574859-0dfb63985953?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    category: "Persianas"
  },
  {
    id: 4,
    name: "Cortina Linho Natural",
    price: 249.90,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Cortina em linho 100% natural, textura única que traz sofisticação e elegância para qualquer ambiente.",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564540574859-0dfb63985953?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    category: "Linho"
  },
  {
    id: 5,
    name: "Bandô Decorativo Royal",
    price: 179.90,
    image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Bandô decorativo com detalhes em dourado, ideal para complementar cortinas e dar acabamento refinado.",
    images: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564540574859-0dfb63985953?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    category: "Acessórios"
  },
  {
    id: 6,
    name: "Cortina Dupla Camada",
    price: 349.90,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Sistema de cortina dupla com blackout e voil, oferecendo versatilidade total no controle de luz.",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    category: "Premium"
  }
];

export const banners = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    title: "Nova Coleção Primavera",
    subtitle: "Descubra nossas cortinas exclusivas"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    title: "Elegância & Sofisticação",
    subtitle: "Transforme seu lar com nossos produtos"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1564540574859-0dfb63985953?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    title: "Qualidade Premium",
    subtitle: "Materiais selecionados para você"
  }
];
