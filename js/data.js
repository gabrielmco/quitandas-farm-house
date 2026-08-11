/* ============================================
   QUITANDAS FARM HOUSE - CATÁLOGO DE PRODUTOS
   Dados reais dos produtos com imagens do Instagram
   ============================================ */

export const STORE_CONFIG = {
  name: 'Quitandas Farm House',
  slogan: 'Despertando Doces Lembranças',
  phone: '5532984185335',
  phoneFormatted: '(32) 98418-5335',
  instagram: '@quitandas_farmhouse',
  city: 'Lima Duarte',
  state: 'MG',
  cep: '36140-000',
  deliveryFee: 7.00,
  minOrderValue: 10.00,
  estimatedTime: '30-50 min',
  logo: '/img/logo.webp',
  banner: '/img/products/vaca-atolada.webp',
  schedule: {
    // Horário padrão de funcionamento (24h format)
    open: 17,  // 17:00
    close: 22, // 22:00
    days: [1, 2, 3, 4, 5] // Segunda a Sexta (0=Dom, 6=Sáb)
  }
};

export const CATEGORIES = [
  { id: 'caldos',    name: 'Caldos do Dia',    icon: 'ph-bowl-food', order: 1 },
  { id: 'batatas',   name: 'Batata no Pote',   icon: 'ph-potato', order: 2 },
  { id: 'doces',     name: 'Doces Artesanais', icon: 'ph-cookie', order: 3 },
  { id: 'quitandas', name: 'Quitandas & Pães', icon: 'ph-bread', order: 4 },
];

export const PRODUCTS = [
  // ── Caldos do Dia ──
  {
    id: 'caldo-canjiquinha',
    category: 'caldos',
    name: 'Canjiquinha',
    description: 'Tradicional e cheia de sabor! Feita com milho canjica, carne de porco e temperos especiais da roça.',
    price: 12.00,
    image: '/img/products/caldo-canjiquinha.webp',
    available: true,
    hasSize: true,
    sizes: [
      { id: '300ml', name: '300ml', price: 12.00 },
      { id: '500ml', name: '500ml', price: 16.00 },
    ],
  },
  {
    id: 'caldo-verde',
    category: 'caldos',
    name: 'Caldo Verde',
    description: 'Cremoso, com linguiça artesanal e couve fresquinha picada fininho. Aconchego em cada colherada.',
    price: 12.00,
    image: '/img/products/caldo-verde.webp',
    available: true,
    hasSize: true,
    sizes: [
      { id: '300ml', name: '300ml', price: 12.00 },
      { id: '500ml', name: '500ml', price: 16.00 },
    ],
  },
  {
    id: 'feijao-amigo',
    category: 'caldos',
    name: 'Feijão Amigo',
    description: 'Feijão encorpado com bacon crocante, calabresa defumada e muito tempero caseiro. Sabor que abraça!',
    price: 12.00,
    image: '/img/products/feijao-amigo.webp',
    available: true,
    hasSize: true,
    sizes: [
      { id: '300ml', name: '300ml', price: 12.00 },
      { id: '500ml', name: '500ml', price: 16.00 },
    ],
  },
  {
    id: 'vaca-atolada',
    category: 'caldos',
    name: 'Vaca Atolada',
    description: 'Sabor marcante e irresistível! Costela bovina com mandioca derretendo na boca, receita mineira de verdade.',
    price: 15.00,
    image: '/img/products/vaca-atolada.webp',
    available: true,
    hasSize: true,
    sizes: [
      { id: '300ml', name: '300ml', price: 15.00 },
      { id: '500ml', name: '500ml', price: 20.00 },
    ],
  },
  {
    id: 'caldo-frango',
    category: 'caldos',
    name: 'Caldo de Frango',
    description: 'Leve, nutritivo e aconchegante. Frango desfiado em caldo cremoso com temperos frescos da horta.',
    price: 12.00,
    image: '/img/products/caldo-frango.webp',
    available: true,
    hasSize: true,
    sizes: [
      { id: '300ml', name: '300ml', price: 12.00 },
      { id: '500ml', name: '500ml', price: 16.00 },
    ],
  },
  {
    id: 'caldo-abobora',
    category: 'caldos',
    name: 'Caldo de Abóbora com Frango',
    description: 'Leve, nutritivo e cheio de sabor. Rico em sabor com frango desfiado, cremoso na medida certa. Perfeito para dias frios!',
    price: 12.00,
    image: '/img/products/caldo-abobora.webp',
    available: true,
    hasSize: true,
    sizes: [
      { id: '300ml', name: '300ml', price: 12.00 },
      { id: '500ml', name: '500ml', price: 16.00 },
    ],
  },

  // ── Batata Recheada no Pote ──
  {
    id: 'batata-bolonhesa',
    category: 'batatas',
    name: 'Batata Recheada Bolonhesa',
    description: 'Batata cremosa recheada com molho bolonhesa caseiro, coberta com queijo gratinado e cheiro verde.',
    price: 18.00,
    image: '/img/products/batata-bolonhesa.webp',
    available: true,
  },
  {
    id: 'batata-bacon',
    category: 'batatas',
    name: 'Batata Recheada Bacon',
    description: 'Batata cremosa com bacon crocante, coberta com queijo gratinado e cebolinha. Irresistível!',
    price: 18.00,
    image: '/img/products/batata-bacon.webp',
    available: true,
  },
  {
    id: 'batata-bacon-cheddar',
    category: 'batatas',
    name: 'Batata Recheada Bacon c/ Cheddar',
    description: 'A combinação perfeita! Batata cremosa com bacon crocante e cheddar derretido por cima.',
    price: 20.00,
    image: '/img/products/batata-bacon-cheddar.webp',
    available: true,
  },
  {
    id: 'batata-calabresa',
    category: 'batatas',
    name: 'Batata Recheada Calabresa',
    description: 'Batata cremosa com calabresa defumada acebolada e queijo gratinado. Sabor que conquista!',
    price: 18.00,
    image: '/img/products/batata-calabresa.webp',
    available: true,
  },
  {
    id: 'batata-frango',
    category: 'batatas',
    name: 'Batata Recheada Frango',
    description: 'Batata cremosa recheada com frango desfiado temperado, coberta com queijo gratinado.',
    price: 18.00,
    image: '/img/products/batata-frango.webp',
    available: true,
  },
  {
    id: 'batata-frango-cheddar',
    category: 'batatas',
    name: 'Batata Recheada Frango c/ Cheddar',
    description: 'Frango desfiado com cheddar cremoso derretido sobre batata macia. Combinação dos sonhos!',
    price: 20.00,
    image: '/img/products/batata-frango-cheddar.webp',
    available: true,
  },
  {
    id: 'batata-strogonoff',
    category: 'batatas',
    name: 'Batata Recheada Strogonoff de Frango',
    description: 'Strogonoff de frango cremoso sobre batata recheada. Feito com carinho e ingredientes selecionados!',
    price: 20.00,
    image: '/img/products/batata-strogonoff.webp',
    available: true,
  },

  // ── Doces Artesanais ──
  {
    id: 'doce-abobora-coco',
    category: 'doces',
    name: 'Doce de Abóbora com Coco',
    description: 'O sabor caseiro que abraça o coração e adoça seus melhores momentos. Receita tradicional com coco ralado, feito com amor.',
    price: 12.00,
    image: '/img/products/doce-abobora.webp',
    available: true,
  },
  {
    id: 'doce-leite-cristalizado',
    category: 'doces',
    name: 'Doce de Leite Cristalizado',
    description: 'O sabor tradicional que derrete na boca e conquista o coração! Formato artesanal e delicado, perfeito para presentear ou saborear.',
    price: 15.00,
    image: '/img/products/doce-leite-cristalizado.webp',
    available: true,
  },
  {
    id: 'doce-leite-cremoso',
    category: 'doces',
    name: 'Doce de Leite Cremoso',
    description: 'Doce de leite cremoso artesanal, feito no tacho de cobre com leite fresco da roça. Pura nostalgia mineira!',
    price: 14.00,
    image: '/img/products/doce-leite-cristalizado.webp',
    available: true,
  },

  // ── Quitandas & Pães ──
  {
    id: 'pao-canela',
    category: 'quitandas',
    name: 'Pão de Canela',
    description: 'Quentinho, macio e cheiroso como tem que ser! Massa fofinha, recheio irresistível de canela. Feito fresquinho especialmente para você.',
    price: 10.00,
    image: '/img/products/pao-canela.webp',
    available: true,
  },
];

export const ADDONS = [
  { id: 'torresmo', name: 'Torresmo Crocante da Roça', price: 4.00, categories: ['caldos'] },
  { id: 'queijo-parmesao', name: 'Queijo Parmesão Ralado', price: 3.00, categories: ['caldos', 'batatas'] },
  { id: 'bacon-extra', name: 'Bacon Crocante Extra', price: 4.00, categories: ['caldos', 'batatas'] },
  { id: 'cheiro-verde', name: 'Cheiro Verde Fresquinho', price: 0.00, categories: ['caldos', 'batatas'] },
  { id: 'pimenta-casa', name: 'Pimenta da Casa', price: 0.00, categories: ['caldos', 'batatas'] },
];

export const PAYMENT_METHODS = [
  { id: 'pix-entrega',   label: 'Pix na Entrega',            icon: 'ph-device-mobile' },
  { id: 'cartao',        label: 'Cartão (Maquininha)',        icon: 'ph-credit-card' },
  { id: 'dinheiro',      label: 'Dinheiro',                  icon: 'ph-money' },
  { id: 'pix-copia',     label: 'Pix Copia e Cola',          icon: 'ph-copy' },
];

export const NEIGHBORHOODS = [
  { id: 'centro', name: 'Centro', fee: 7.00 },
  { id: 'barreira', name: 'Barreira', fee: 7.00 },
  { id: 'tres-vias', name: 'Três Vias', fee: 7.00 },
  { id: 'cruzeiro', name: 'Cruzeiro', fee: 7.00 },
  { id: 'batatal', name: 'Batatal', fee: 7.00 },
  { id: 'orencio', name: 'Orêncio Rodrigues', fee: 7.00 },
  { id: 'vargem-grande', name: 'Vargem Grande', fee: 7.00 },
  { id: 'manejo', name: 'Manejo', fee: 7.00 },
  { id: 'monte-verde', name: 'Monte Verde', fee: 7.00 },
];

export const COUPONS = [
  { code: 'QUITANDAS10', type: 'percent', value: 10, label: '10% de desconto' },
  { code: 'PRIMEIRO', type: 'fixed', value: 5.00, label: 'R$ 5,00 de desconto' },
];

export const PIX_KEY = {
  type: 'Telefone',
  key: '32984185335',
  formatted: '(32) 98418-5335',
  name: 'Elis Alves / Quitandas Farm House',
};

export const ORDER_STATUSES = [
  { id: 'received',   label: 'Pedido Recebido',      icon: 'ph-clipboard-text', adminLabel: 'Novos' },
  { id: 'preparing',  label: 'Em Preparo na Cozinha', icon: 'ph-chef-hat', adminLabel: 'Em Preparo' },
  { id: 'delivery',   label: 'Saiu para Entrega',     icon: 'ph-moped', adminLabel: 'Saiu p/ Entrega' },
  { id: 'done',       label: 'Entregue com Sucesso',  icon: 'ph-check-circle', adminLabel: 'Entregue' },
];
