import { createClient } from '@/lib/supabase/client';

export const supabase = createClient();

// ==========================================
// INTERFACES (Idénticas a db.ts)
// ==========================================
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
  store_id?: string;
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
  store_id?: string;
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
  store_id?: string;
}

export interface Message {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  messageText: string;
  createdAt: string;
  store_id?: string;
}

export interface SalesMetrics {
  totalSales: number;
  totalOrders: number;
  activeClients: number;
  lowStockCount: number;
  categorySales: { category: string; amount: number }[];
  monthlySales: { month: string; amount: number }[];
}

// ==========================================
// MAPPERS (camelCase a snake_case y viceversa)
// ==========================================
function productToDb(product: Product, storeId: string) {
  return {
    id: product.id,
    store_id: storeId,
    name: product.name,
    name_en: product.nameEn,
    category: product.category,
    price: product.price,
    old_price: product.oldPrice,
    stock: product.stock,
    image: product.image,
    description: product.description,
    description_en: product.descriptionEn,
    active: product.active,
    unit: product.unit,
    unit_en: product.unitEn,
  };
}

function productFromDb(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    category: row.category,
    price: row.price,
    oldPrice: row.old_price,
    stock: row.stock,
    image: row.image,
    description: row.description,
    descriptionEn: row.description_en,
    active: row.active,
    unit: row.unit,
    unitEn: row.unit_en,
    store_id: row.store_id,
  };
}

function orderToDb(order: Order, storeId: string) {
  return {
    id: order.id,
    store_id: storeId,
    customer_name: order.customerName,
    phone: order.phone,
    address: order.address,
    notes: order.notes,
    payment_method: order.paymentMethod,
    payment_details: order.paymentDetails,
    items: order.items,
    subtotal: order.subtotal,
    shipping_fee: order.shippingFee,
    total: order.total,
    status: order.status,
    delivery_type: order.deliveryType,
    created_at: order.createdAt,
  };
}

function orderFromDb(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    notes: row.notes,
    paymentMethod: row.payment_method,
    paymentDetails: row.payment_details,
    items: row.items,
    subtotal: row.subtotal,
    shippingFee: row.shipping_fee,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    deliveryType: row.delivery_type,
    store_id: row.store_id,
  };
}

// ==========================================
// FUNCIONES API DE SUPABASE
// ==========================================

// --- AUTENTICACIÓN E INQUILINATO ---
export async function getCurrentStoreId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (error || !data) {
    console.error('Error fetching store ID for owner:', error);
    return null;
  }
  return data.id;
}

// --- PRODUCTOS ---
export async function getProducts(storeId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data.map(productFromDb);
}

export async function saveProduct(product: Product, storeId: string): Promise<void> {
  const productToSave = productToDb(product, storeId);
  
  const { error } = await supabase
    .from('products')
    .upsert(productToSave, { onConflict: 'id' });

  if (error) {
    console.error('Error saving product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string, storeId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('store_id', storeId);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// --- PEDIDOS ---
export async function getOrders(storeId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  return data.map(orderFromDb);
}

export async function saveOrder(order: Order, storeId: string): Promise<void> {
  const orderToSave = orderToDb(order, storeId);

  const { error } = await supabase
    .from('orders')
    .insert(orderToSave);

  if (error) {
    console.error('Error saving order:', error);
    throw error;
  }
  // Stock decrement is handled by the DB trigger handle_new_order_stock (SECURITY DEFINER)
}


export async function updateOrder(order: Order, storeId: string): Promise<void> {
  const orderToSave = orderToDb(order, storeId);

  const { error } = await supabase
    .from('orders')
    .update(orderToSave)
    .eq('id', order.id)
    .eq('store_id', storeId);

  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

// --- CLIENTES (Mismo comportamiento de db.ts pero consultando orders) ---
export async function getClients(storeId: string): Promise<Client[]> {
  const orders = await getOrders(storeId);
  const clientsMap: Record<string, Client> = {};

  orders.forEach((o) => {
    if (!clientsMap[o.customerName]) {
      clientsMap[o.customerName] = {
        id: `c_${o.customerName.replace(/\s/g, '').toLowerCase()}`,
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

// --- MÉTRICAS DE VENTAS (Cálculo interno igual pero asíncrono) ---
export async function getSalesMetrics(storeId: string): Promise<SalesMetrics> {
  const products = await getProducts(storeId);
  const orders = await getOrders(storeId);
  const clients = await getClients(storeId);

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

// --- CALIFICACIONES (RATINGS) ---
export async function getRatings(storeId: string): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data.map((row: any) => ({
    id: row.id,
    orderId: row.order_id,
    customerName: row.customer_name,
    productRating: row.product_rating,
    serviceRating: row.service_rating,
    deliveryRating: row.delivery_rating,
    comment: row.comment,
    createdAt: row.created_at,
    store_id: row.store_id
  }));
}

export async function saveRating(rating: Rating, storeId: string): Promise<void> {
  const ratingToSave = {
    id: rating.id,
    order_id: rating.orderId,
    customer_name: rating.customerName,
    product_rating: rating.productRating,
    service_rating: rating.serviceRating,
    delivery_rating: rating.deliveryRating,
    comment: rating.comment,
    created_at: rating.createdAt,
    store_id: storeId
  };
  await supabase.from('ratings').insert(ratingToSave);
}

// --- MENSAJES (MESSAGES) ---
export async function getMessages(storeId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data.map((row: any) => ({
    id: row.id,
    orderId: row.order_id,
    customerName: row.customer_name,
    phone: row.phone,
    messageText: row.message_text,
    createdAt: row.created_at,
    store_id: row.store_id
  }));
}

export async function saveMessage(msg: Message, storeId: string): Promise<void> {
  const msgToSave = {
    id: msg.id,
    order_id: msg.orderId,
    customer_name: msg.customerName,
    phone: msg.phone,
    message_text: msg.messageText,
    created_at: msg.createdAt,
    store_id: storeId
  };
  await supabase.from('messages').insert(msgToSave);
}
