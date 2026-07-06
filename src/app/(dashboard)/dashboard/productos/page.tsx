'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  CheckCircle,
  X,
  PlusCircle,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { getProducts, saveProduct, deleteProduct, Product } from '@/lib/db';
import { useToast } from '@/components/ui/ToastProvider';
import { useTranslation } from '@/hooks/useTranslation';
import { translations } from '@/config/translations';

const CATEGORIES = [
  'Carnes',
  'Pollo',
  'Pescado',
  'Verduras',
  'Frutas',
  'Abarrotes',
  'Bebidas',
  'Aseo',
  'Congelados',
  'Ofertas'
];

const categoryTranslations: Record<string, Record<string, string>> = {
  es: {
    'Todas': 'Todas',
    'Carnes': 'Carnes',
    'Pollo': 'Pollo',
    'Pescado': 'Pescado',
    'Verduras': 'Verduras',
    'Frutas': 'Frutas',
    'Abarrotes': 'Abarrotes',
    'Bebidas': 'Bebidas',
    'Aseo': 'Aseo',
    'Congelados': 'Congelados',
    'Ofertas': 'Ofertas'
  },
  en: {
    'Todas': 'All',
    'Carnes': 'Meats',
    'Pollo': 'Chicken',
    'Pescado': 'Fish',
    'Verduras': 'Vegetables',
    'Frutas': 'Fruits',
    'Abarrotes': 'Groceries',
    'Bebidas': 'Drinks',
    'Aseo': 'Cleaning',
    'Congelados': 'Frozen',
    'Ofertas': 'Offers'
  }
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60';

// Preset Unsplash images to choose from to make it easy to select beautiful stock photos
const STOCK_PHOTOS = [
  { label: 'Carnes', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60' },
  { label: 'Costillas', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&auto=format&fit=crop&q=60' },
  { label: 'Pollo', url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=60' },
  { label: 'Pescado', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=60' },
  { label: 'Tomates', url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop&q=60' },
  { label: 'Cebollas', url: 'https://images.unsplash.com/photo-1580149375544-246599efccb8?w=600&auto=format&fit=crop&q=60' },
  { label: 'Frutas', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=60' },
  { label: 'Bebidas', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=60' }
];

export default function AdminProductsPage() {
  const { toast } = useToast();
  const { language } = useTranslation();
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Inline Editing State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<number>(0);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);

  // Form fields
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState(0);
  const [oldPrice, setOldPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState(10);
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [unit, setUnit] = useState('lb');
  const [unitEn, setUnitEn] = useState('lb');
  const [image, setImage] = useState(STOCK_PHOTOS[0].url);
  const [active, setActive] = useState(true);

  // Helper functions for inline editing
  const saveInlinePrice = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (prod) {
      if (Number(tempPriceValue) <= 0) {
        toast({
          title: language === 'en' ? 'Price must be greater than zero.' : 'El precio debe ser mayor a cero.',
          type: 'error'
        });
        return;
      }
      const updatedProd = { ...prod, price: Number(tempPriceValue) };
      const updatedList = saveProduct(updatedProd);
      setProducts(updatedList);
      toast({
        title: language === 'en' ? 'Price updated.' : 'Precio actualizado.',
        type: 'success'
      });
    }
    setEditingPriceId(null);
  };

  const saveInlineStock = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (prod) {
      if (Number(tempStockValue) < 0) {
        toast({
          title: language === 'en' ? 'Stock cannot be negative.' : 'El stock no puede ser negativo.',
          type: 'error'
        });
        return;
      }
      const updatedProd = { ...prod, stock: Number(tempStockValue) };
      const updatedList = saveProduct(updatedProd);
      setProducts(updatedList);
      toast({
        title: language === 'en' ? 'Stock updated.' : 'Inventario actualizado.',
        type: 'success'
      });
    }
    setEditingStockId(null);
  };

  const handleQuickStock = (prod: Product, change: number) => {
    const newStock = Math.max(0, prod.stock + change);
    const updatedProd = { ...prod, stock: newStock };
    const updatedList = saveProduct(updatedProd);
    setProducts(updatedList);
    toast({
      title: language === 'en' ? 'Stock updated.' : 'Inventario actualizado.',
      type: 'success'
    });
  };

  // Load products on mount
  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const openNewProductModal = () => {
    setEditingProduct(null);
    setName('');
    setNameEn('');
    setCategory(CATEGORIES[0]);
    setPrice(1000);
    setOldPrice(undefined);
    setStock(10);
    setDescription('');
    setDescriptionEn('');
    setUnit('lb');
    setUnitEn('lb');
    setImage(STOCK_PHOTOS[0].url);
    setActive(true);
    setModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setNameEn(product.nameEn || '');
    setCategory(product.category);
    setPrice(product.price);
    setOldPrice(product.oldPrice);
    setStock(product.stock);
    setDescription(product.description);
    setDescriptionEn(product.descriptionEn || '');
    setUnit(product.unit || 'lb');
    setUnitEn(product.unitEn || 'lb');
    setImage(product.image);
    setActive(product.active);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'en' ? 'Are you sure you want to delete this product?' : '¿Estás seguro de que quieres eliminar este producto?')) {
      const updated = deleteProduct(id);
      setProducts(updated);
      toast({
        title: t.admin.productsToastDeleted,
        type: 'success'
      });
    }
  };

  const toggleActive = (product: Product) => {
    const updatedProd = { ...product, active: !product.active };
    const updatedList = saveProduct(updatedProd);
    setProducts(updatedList);
    toast({
      title: updatedProd.active 
        ? (language === 'en' ? 'Product activated.' : 'Producto activado.')
        : (language === 'en' ? 'Product deactivated.' : 'Producto desactivado.'),
      type: 'success'
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || price <= 0 || stock < 0) {
      toast({
        title: language === 'en' ? 'Please fill out all fields correctly.' : 'Por favor, completa todos los campos correctamente.',
        type: 'error'
      });
      return;
    }

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `p-${Math.random().toString(36).substr(2, 9)}`,
      name,
      nameEn: nameEn.trim() || undefined,
      category,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      stock: Number(stock),
      image: image.trim() || DEFAULT_IMAGE,
      description,
      descriptionEn: descriptionEn.trim() || undefined,
      unit: unit.trim() || 'lb',
      unitEn: unitEn.trim() || undefined,
      active
    };

    const updated = saveProduct(newProduct);
    setProducts(updated);
    setModalOpen(false);

    toast({
      title: editingProduct ? t.admin.productsToastUpdated : t.admin.productsToastCreated,
      type: 'success'
    });
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Filters
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-12 text-left">
      
      {/* Title section */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-green-600 animate-bounce" />
            <span>{t.admin.productsTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.admin.productsSubtitle}
          </p>
        </div>
        <button
          onClick={openNewProductModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>{t.admin.addProductBtn}</span>
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        {/* Search */}
        <div className="md:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={t.admin.productsSearch}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
          />
        </div>

        {/* Category filter */}
        <div className="md:col-span-2 flex items-center gap-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            {t.admin.productsCategoryLabel}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-bold"
          >
            <option value="Todas">{t.admin.productsCategoryAll}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {categoryTranslations[language][cat] || cat}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                <th className="px-5 py-3">{language === 'en' ? 'Image' : 'Imagen'}</th>
                <th className="py-3">{language === 'en' ? 'Name' : 'Nombre'}</th>
                <th className="py-3">{language === 'en' ? 'Category' : 'Categoría'}</th>
                <th className="py-3">{language === 'en' ? 'Price' : 'Precio'}</th>
                <th className="py-3">Stock</th>
                <th className="py-3">{language === 'en' ? 'Status' : 'Estado'}</th>
                <th className="px-5 py-3 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    {language === 'en' ? 'No products found.' : 'No se encontraron productos en el inventario.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    
                    {/* Image */}
                    <td className="px-5 py-3 shrink-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        <img 
                          src={prod.image || DEFAULT_IMAGE} 
                          alt={prod.name} 
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                          className="object-cover w-full h-full" 
                        />
                      </div>
                    </td>

                    {/* Name & desc */}
                    <td className="py-3">
                      <p className="font-bold text-slate-800 line-clamp-1">
                        {language === 'en' && prod.nameEn ? prod.nameEn : prod.name}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 max-w-xs">
                        {language === 'en' && prod.descriptionEn ? prod.descriptionEn : prod.description}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3 font-semibold text-slate-600">
                      {categoryTranslations[language][prod.category] || prod.category}
                    </td>

                    {/* Price */}
                    <td className="py-3 font-black text-slate-800">
                      {editingPriceId === prod.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">$</span>
                          <input
                            type="number"
                            value={tempPriceValue}
                            onChange={(e) => setTempPriceValue(Number(e.target.value))}
                            className="w-20 px-1.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-green-600 font-bold"
                            autoFocus
                          />
                          <button 
                            type="button"
                            onClick={() => saveInlinePrice(prod.id)} 
                            className="text-green-600 hover:text-green-800 p-0.5 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setEditingPriceId(null)} 
                            className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group">
                          <div>
                            {formatPrice(prod.price)}
                            {prod.oldPrice && (
                              <span className="text-[10px] text-orange-500 line-through block mt-0.5 font-bold">
                                {formatPrice(prod.oldPrice)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setEditingPriceId(prod.id);
                              setTempPriceValue(prod.price);
                              setEditingStockId(null);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-green-600 transition-opacity p-0.5 cursor-pointer"
                            title={language === 'en' ? 'Change price' : 'Cambiar precio'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3">
                      {editingStockId === prod.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempStockValue}
                            onChange={(e) => setTempStockValue(Number(e.target.value))}
                            className="w-16 px-1.5 py-1 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:border-green-600 font-bold"
                            autoFocus
                          />
                          <button 
                            type="button"
                            onClick={() => saveInlineStock(prod.id)} 
                            className="text-green-600 hover:text-green-800 p-0.5 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setEditingStockId(null)} 
                            className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group">
                          <button
                            onClick={() => handleQuickStock(prod, -1)}
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer select-none active:scale-95"
                            title={language === 'en' ? 'Decrease stock' : 'Disminuir stock'}
                          >
                            -
                          </button>
                          <span className={`font-black px-2 py-0.5 rounded-md text-[10px] ${
                            prod.stock === 0 
                              ? 'bg-red-100 text-red-700' 
                              : prod.stock <= 5 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {prod.stock === 0 
                              ? (language === 'en' ? 'Out of Stock' : 'Sin Stock') 
                              : `${prod.stock} ${language === 'en' ? (prod.unitEn || prod.unit || 'unit') : (prod.unit || 'und')}`}
                          </span>
                          <button
                            onClick={() => handleQuickStock(prod, 1)}
                            className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer select-none active:scale-95"
                            title={language === 'en' ? 'Increase stock' : 'Aumentar stock'}
                          >
                            +
                          </button>
                          <button
                            onClick={() => {
                              setEditingStockId(prod.id);
                              setTempStockValue(prod.stock);
                              setEditingPriceId(null);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-green-600 transition-opacity p-0.5 cursor-pointer"
                            title={language === 'en' ? 'Change stock' : 'Cambiar stock'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Active */}
                    <td className="py-3">
                      <button
                        onClick={() => toggleActive(prod)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          prod.active 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                        }`}
                        title={prod.active ? (language === 'en' ? 'Click to deactivate' : 'Haga clic para desactivar') : (language === 'en' ? 'Click to activate' : 'Haga clic para activar')}
                      >
                        {prod.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-right">
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        <button
                          onClick={() => openEditProductModal(prod)}
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-700 hover:text-green-700 hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{language === 'en' ? 'Edit' : 'Editar'}</span>
                        </button>

                        <button
                          onClick={() => toggleActive(prod)}
                          className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                            prod.active 
                              ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' 
                              : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {prod.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{prod.active ? (language === 'en' ? 'Deactivate' : 'Desactivar') : (language === 'en' ? 'Activate' : 'Activar')}</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingStockId(prod.id);
                            setTempStockValue(prod.stock);
                            setEditingPriceId(null);
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-700 hover:text-green-700 hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Package className="w-3 h-3" />
                          <span>{language === 'en' ? 'Stock' : 'Stock'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingPriceId(prod.id);
                            setTempPriceValue(prod.price);
                            setEditingStockId(null);
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-700 hover:text-green-700 hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>$</span>
                          <span>{language === 'en' ? 'Price' : 'Precio'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer inline-flex items-center"
                          title={t.common.delete}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE / EDIT PRODUCT MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl my-auto text-left max-h-[90vh] overflow-y-auto animate-float">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-1.5">
              {editingProduct ? <Edit2 className="w-4 h-4 text-green-600" /> : <PlusCircle className="w-4 h-4 text-green-600" />}
              <span>{editingProduct ? t.admin.productsEditModalTitle : t.admin.productsAddModalTitle}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.admin.productsFieldName} (ES)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lomo de Res"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.admin.productsFieldNameEn} (EN)</label>
                  <input
                    type="text"
                    placeholder="e.g. Beef Loin (Optional)"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.admin.productsFieldCategory}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {categoryTranslations[language][cat] || cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.admin.productsFieldUnitEs}</label>
                    <input
                      type="text"
                      required
                      placeholder="lb / unidad"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.admin.productsFieldUnitEn}</label>
                    <input
                      type="text"
                      placeholder="lb / unit (Optional)"
                      value={unitEn}
                      onChange={(e) => setUnitEn(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.admin.productsFieldPrice}</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{language === 'en' ? 'Old Price' : 'Precio Anterior'}</label>
                  <input
                    type="number"
                    min={100}
                    placeholder={language === 'en' ? 'Optional' : 'Opcional'}
                    value={oldPrice || ''}
                    onChange={(e) => setOldPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.admin.productsFieldStock}</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.admin.productsFieldDesc} (ES)</label>
                <textarea
                  required
                  placeholder="Detalles del producto fresco en español..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">{t.admin.productsFieldDescEn} (EN)</label>
                <textarea
                  placeholder="Fresh product details in English (Optional)..."
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600 resize-none"
                />
              </div>

              {/* Photo selection preset */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1 block">{t.admin.productsFieldPhoto}</label>
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/50">
                  {STOCK_PHOTOS.map((ph, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(ph.url)}
                      className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer ${
                        image === ph.url ? 'border-green-600 ring-2 ring-green-600/30' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={ph.url} alt={ph.label} className="object-cover w-full h-full" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white font-bold py-0.5 text-center truncate">
                        {ph.label}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <input
                    type="url"
                    placeholder="URL de la imagen..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-[10px] text-slate-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 block">{language === 'en' ? 'Or upload image file' : 'O subir archivo de imagen'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full text-[10px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="active-toggle"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <label htmlFor="active-toggle" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  {t.admin.productsFieldStatusActive}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{editingProduct ? t.common.save : t.admin.addProductBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
