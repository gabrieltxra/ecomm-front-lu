import React, { useEffect } from 'react';

interface HeadProps {
  title: string;
}

/**
 * Componente que define o título da aba do navegador.
 *
 * @param title O título a ser exibido na aba.
 */
const Head: React.FC<HeadProps> = ({ title }) => {
  useEffect(() => {
    // Acessa o objeto global do documento e define o título
    document.title = title;
  }, [title]); // Roda sempre que o título mudar

  // O componente não renderiza nada no DOM, apenas manipula o <head>
  return null; 
};

export default Head;