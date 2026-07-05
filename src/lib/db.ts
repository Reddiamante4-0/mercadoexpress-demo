export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  image: string;
  description: string;
  descriptionEn?: string;
  active: boolean;
  unit?: string;
  unitEn?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  paymentMethod: 'card' | 'pse' | 'wallet';
  paymentDetails: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'Recibido' | 'En preparación' | 'En camino' | 'Entregado' | 'Cancelado';
  createdAt: string;
  deliveryType?: 'daily' | 'weekly';
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  ordersCount: number;
  totalSpent: number;
}

export interface Rating {
  id: string;
  orderId: string;
  customerName: string;
  productRating: number;
  serviceRating: number;
  deliveryRating: number;
  comment?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  messageText: string;
  createdAt: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Lomo de Res Premium',
    nameEn: 'Premium Beef Tenderloin',
    category: 'Carnes',
    price: 45000,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
    description: 'Corte de lomo de res seleccionado de primera calidad, tierno y jugoso. Ideal para asar o plancha.',
    descriptionEn: 'Premium quality beef tenderloin cut, tender and juicy. Ideal for grilling or griddle.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p2',
    name: 'Costillas de Cerdo BBQ',
    nameEn: 'BBQ Pork Ribs',
    category: 'Carnes',
    price: 32000,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=60',
    description: 'Costillas de cerdo frescas listas para adobar y hornear o preparar al barril.',
    descriptionEn: 'Fresh pork ribs ready to marinate and bake or cook in a barrel.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p3',
    name: 'Pechuga de Pollo Fresca',
    nameEn: 'Fresh Chicken Breast',
    category: 'Pollo',
    price: 18000,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=60',
    description: 'Pechuga de pollo deshuesada y sin piel, baja en grasa y alta en proteínas.',
    descriptionEn: 'Boneless and skinless chicken breast, low in fat and high in protein.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p4',
    name: 'Alitas de Pollo',
    nameEn: 'Chicken Wings',
    category: 'Pollo',
    price: 14500,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=60',
    description: 'Alitas de pollo ideales para compartir, perfectas para freidora de aire o al horno.',
    descriptionEn: 'Chicken wings ideal for sharing, perfect for air fryer or oven.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p5',
    name: 'Filete de Salmón Chileno',
    nameEn: 'Chilean Salmon Fillet',
    category: 'Pescado',
    price: 55000,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=60',
    description: 'Salmón premium rico en omega-3, sellado al vacío para máxima frescura.',
    descriptionEn: 'Premium salmon rich in omega-3, vacuum sealed for maximum freshness.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p6',
    name: 'Filete de Tilapia Fresco',
    nameEn: 'Fresh Tilapia Fillet',
    category: 'Pescado',
    price: 19000,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600&auto=format&fit=crop&q=60',
    description: 'Filetes de tilapia blanca fresca y suave, ideal para preparaciones rápidas.',
    descriptionEn: 'Fresh and soft white tilapia fillets, ideal for quick preparations.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p7',
    name: 'Tomate Chonto Orgánico',
    nameEn: 'Organic Chonto Tomato',
    category: 'Verduras',
    price: 4500,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop&q=60',
    description: 'Tomates chonto frescos cosechados localmente, perfectos para ensaladas y guisos.',
    descriptionEn: 'Fresh chonto tomatoes harvested locally, perfect for salads and stews.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p8',
    name: 'Cebolla Cabezona Blanca',
    nameEn: 'White Bulb Onion',
    category: 'Verduras',
    price: 3800,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1580149375544-246599efccb8?w=600&auto=format&fit=crop&q=60',
    description: 'Cebollas frescas y crocantes, ingrediente básico para todas tus comidas.',
    descriptionEn: 'Fresh and crispy onions, basic ingredient for all your meals.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p9',
    name: 'Lechuga Crespa Fresca',
    nameEn: 'Fresh Curly Lettuce',
    category: 'Verduras',
    price: 3200,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1556801712-76c8eb07db6c?w=600&auto=format&fit=crop&q=60',
    description: 'Lechuga crespa limpia e higienizada, lista para consumir.',
    descriptionEn: 'Clean and sanitized curly lettuce, ready to eat.',
    active: true,
    unit: 'unidad',
    unitEn: 'unit'
  },
  {
    id: 'p10',
    name: 'Aguacate Hass Maduro',
    nameEn: 'Ripe Hass Avocado',
    category: 'Frutas',
    price: 8900,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=60',
    description: 'Aguacates Hass en su punto ideal de maduración, de textura cremosa perfecta.',
    descriptionEn: 'Hass avocados at their ideal ripening point, with a perfect creamy texture.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p11',
    name: 'Banano Urabá',
    nameEn: 'Banana Urabá',
    category: 'Frutas',
    price: 3500,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=60',
    description: 'Bananos dulces y llenos de potasio de la región de Urabá.',
    descriptionEn: 'Sweet and potassium-filled bananas from the Urabá region.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p12',
    name: 'Fresas Dulces',
    nameEn: 'Sweet Strawberries',
    category: 'Frutas',
    price: 7500,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=60',
    description: 'Fresa seleccionada roja y dulce. Ideal para jugos, postres o comer fresca.',
    descriptionEn: 'Selected red and sweet strawberry. Ideal for juices, desserts or eating fresh.',
    active: true,
    unit: 'lb',
    unitEn: 'lb'
  },
  {
    id: 'p13',
    name: 'Arroz Integral Diana',
    nameEn: 'Diana Brown Rice',
    category: 'Abarrotes',
    price: 4800,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=60',
    description: 'Arroz integral rico en fibra, ideal para una alimentación saludable.',
    descriptionEn: 'Brown rice rich in fiber, ideal for a healthy diet.',
    active: true,
    unit: 'unidad',
    unitEn: 'unit'
  },
  {
    id: 'p14',
    name: 'Aceite de Oliva Extra Virgen',
    nameEn: 'Extra Virgin Olive Oil',
    category: 'Abarrotes',
    price: 28000,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=60',
    description: 'Aceite de oliva extra virgen prensado en frío, excelente para aderezar ensaladas.',
    descriptionEn: 'Cold-pressed extra virgin olive oil, excellent for dressing salads.',
    active: true,
    unit: 'unidad',
    unitEn: 'unit'
  },
  {
    id: 'p15',
    name: 'Coca-Cola Original 1.5L',
    nameEn: 'Coca-Cola Original 1.5L',
    category: 'Bebidas',
    price: 5200,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=60',
    description: 'Refrescante bebida gaseosa Coca-Cola sabor original de 1.5 litros.',
    descriptionEn: 'Refreshing original flavor Coca-Cola soda, 1.5 liters.',
    active: true,
    unit: 'unidad',
    unitEn: 'unit'
  },
  {
    id: 'p16',
    name: 'Jugo de Naranja Cosecha',
    nameEn: 'Harvest Orange Juice',
    category: 'Bebidas',
    price: 6500,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&auto=format&fit=crop&q=60',
    description: 'Jugo de naranja pasteurizado 100% natural, sin azúcar añadida.',
    descriptionEn: '100% natural pasteurized orange juice, no sugar added.',
    active: true,
    unit: 'unidad',
    unitEn: 'unit'
  },
  {
    id: 'p17',
    name: 'Detergente Líquido Ariel 3L',
    nameEn: 'Ariel Liquid Detergent 3L',
    category: 'Aseo',
    price: 38900,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=60',
    description: 'Detergente líquido concentrado para ropa blanca y de color. Rinde hasta 60 lavadas.',
    descriptionEn: 'Concentrated liquid laundry detergent for whites and colors. Yields up to 60 washes.',
    active: true,
    unit: 'unidad',
    unitEn: 'unit'
  },
  {
    id: 'p18',
    name: 'Jabón Líquido Protex',
    nameEn: 'Protex Liquid Soap',
    category: 'Aseo',
    price: 12500,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=60',
    description: 'Jabón líquido antibacteriano para manos, protege tu piel eliminando gérmenes.',
    descriptionEn: 'Antibacterial hand liquid soap, protects your skin by removing germs.',
    active: true,
    unit: 'unidad',
    unitEn: 'unit'
  },
  {
    id: 'p19',
    name: 'Papas Prefritas McCain',
    nameEn: 'McCain Pre-Fried Potatoes',
    category: 'Congelados',
    price: 14900,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=60',
    description: 'Papas cortadas estilo francés listas para freír u hornear.',
    descriptionEn: 'French cut potatoes ready to fry or bake.',
    active: true,
    unit: 'unidad',
    unitEn: 'unit'
  },
  {
    id: 'p20',
    name: 'Helado Popsy Vainilla 1L',
    nameEn: 'Popsy Vanilla Ice Cream 1L',
    category: 'Congelados',
    price: 21900,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60',
    description: 'Cremoso helado sabor a vainilla gourmet, ideal para acompañar postres.',
    descriptionEn: 'Creamy gourmet vanilla ice cream, ideal to accompany desserts.',
    active: true,
    unit: 'unidad',
    unitEn: 'unit'
  },
  {
    id: 'p21',
    name: 'Combo Asado Familiar',
    nameEn: 'Family BBQ Combo',
    category: 'Ofertas',
    price: 68000,
    oldPrice: 85000,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
    description: 'Incluye 1kg de lomo de res, 1kg de costilla de cerdo y 1 paquete de chorizos.',
    descriptionEn: 'Includes 1kg beef loin, 1kg pork ribs and 1 pack of chorizos.',
    active: true,
    unit: 'combo',
    unitEn: 'combo'
  },
  {
    id: 'p22',
    name: 'Canasta de Frutas Especial',
    nameEn: 'Special Fruit Basket',
    category: 'Ofertas',
    price: 22000,
    oldPrice: 30000,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=60',
    description: 'Selección especial de temporada: banano, fresas, aguacate hass y mangos.',
    descriptionEn: 'Special seasonal fruit selection: banana, strawberries, hass avocado and mangoes.',
    active: true,
    unit: 'combo',
    unitEn: 'combo'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9824',
    customerName: 'Carlos Gómez',
    phone: '3124567890',
    address: 'Calle 100 # 15-22, Apt 402, Bogotá',
    notes: 'Entregar en portería por favor.',
    paymentMethod: 'card',
    paymentDetails: 'Tarjeta de Crédito (Visa ***4242)',
    items: [
      { productId: 'p1', name: 'Lomo de Res Premium', price: 45000, quantity: 2 },
      { productId: 'p7', name: 'Tomate Chonto Orgánico', price: 4500, quantity: 1 }
    ],
    subtotal: 94500,
    shippingFee: 5000,
    total: 99500,
    status: 'Entregado',
    createdAt: '2026-07-01T15:30:00Z'
  },
  {
    id: 'ORD-9825',
    customerName: 'María Rodríguez',
    phone: '3157891234',
    address: 'Carrera 7 # 72-80, Apto 901, Bogotá',
    paymentMethod: 'pse',
    paymentDetails: 'PSE (Bancolombia)',
    items: [
      { productId: 'p5', name: 'Filete de Salmón Chileno', price: 55000, quantity: 1 },
      { productId: 'p10', name: 'Aguacate Hass Maduro', price: 8900, quantity: 2 },
      { productId: 'p16', name: 'Jugo de Naranja Cosecha', price: 6500, quantity: 1 }
    ],
    subtotal: 79300,
    shippingFee: 5000,
    total: 84300,
    status: 'Recibido',
    createdAt: '2026-07-02T19:45:00Z'
  },
  {
    id: 'ORD-9826',
    customerName: 'Andrés Felipe Castro',
    phone: '3009876543',
    address: 'Avenida Chile # 12-45, Bogotá',
    notes: 'Llamar al llegar.',
    paymentMethod: 'wallet',
    paymentDetails: 'Billetera Digital (Nequi - 300***6543)',
    items: [
      { productId: 'p21', name: 'Combo Asado Familiar', price: 68000, quantity: 1 },
      { productId: 'p15', name: 'Coca-Cola Original 1.5L', price: 5200, quantity: 2 }
    ],
    subtotal: 78400,
    shippingFee: 5000,
    total: 83400,
    status: 'En preparación',
    createdAt: '2026-07-02T21:10:00Z'
  }
];

function getSafeStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setSafeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export function getProducts(): Product[] {
  return getSafeStorage<Product[]>('me_products', INITIAL_PRODUCTS);
}

export function saveProduct(product: Product): Product[] {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  setSafeStorage('me_products', products);
  return products;
}

export function deleteProduct(id: string): Product[] {
  const products = getProducts().filter((p) => p.id !== id);
  setSafeStorage('me_products', products);
  return products;
}

export function getOrders(): Order[] {
  return getSafeStorage<Order[]>('me_orders', INITIAL_ORDERS);
}

export function saveOrder(order: Order): Order[] {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
    
    // Deduct stock
    const products = getProducts();
    order.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        saveProduct(prod);
      }
    });
  }
  setSafeStorage('me_orders', orders);
  return orders;
}

export function getClients(): Client[] {
  const orders = getOrders();
  const clientsMap: Record<string, Client> = {};
  
  clientsMap['Carlos Gómez'] = {
    id: 'c1',
    name: 'Carlos Gómez',
    phone: '3124567890',
    address: 'Calle 100 # 15-22, Apt 402, Bogotá',
    ordersCount: 1,
    totalSpent: 99500
  };

  orders.forEach((o) => {
    if (!clientsMap[o.customerName]) {
      clientsMap[o.customerName] = {
        id: `c_${Math.random().toString(36).substr(2, 9)}`,
        name: o.customerName,
        phone: o.phone,
        address: o.address,
        ordersCount: 0,
        totalSpent: 0
      };
    }
    const c = clientsMap[o.customerName];
    if (o.status !== 'Cancelado') {
      c.ordersCount += 1;
      c.totalSpent += o.total;
    }
  });

  return Object.values(clientsMap);
}

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  activeClients: number;
  lowStockCount: number;
  categorySales: { category: string; amount: number }[];
  monthlySales: { month: string; amount: number }[];
}

export function getSalesMetrics(): SalesMetrics {
  const products = getProducts();
  const orders = getOrders();
  const clients = getClients();

  const completedOrders = orders.filter((o) => o.status !== 'Cancelado');
  const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5 && p.active).length;

  const categorySalesMap: Record<string, number> = {};
  completedOrders.forEach((o) => {
    o.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const cat = prod ? prod.category : 'Otros';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.price * item.quantity);
    });
  });

  const categorySales = Object.entries(categorySalesMap).map(([category, amount]) => ({
    category,
    amount
  })).sort((a, b) => b.amount - a.amount);

  const monthlySales = [
    { month: 'Mayo', amount: totalSales * 0.7 },
    { month: 'Junio', amount: totalSales * 0.95 },
    { month: 'Julio', amount: totalSales }
  ];

  return {
    totalSales,
    totalOrders: orders.length,
    activeClients: clients.length,
    lowStockCount,
    categorySales,
    monthlySales
  };
}

export function getRatings(): Rating[] {
  return getSafeStorage<Rating[]>('me_ratings', []);
}

export function saveRating(rating: Rating): Rating[] {
  const ratings = getRatings();
  ratings.unshift(rating);
  setSafeStorage('me_ratings', ratings);
  return ratings;
}

export function getMessages(): Message[] {
  return getSafeStorage<Message[]>('me_messages', []);
}

export function saveMessage(msg: Message): Message[] {
  const messages = getMessages();
  messages.unshift(msg);
  setSafeStorage('me_messages', messages);
  return messages;
}

