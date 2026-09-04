'use client';

import React, { useState, useRef } from 'react';
import { Upload, Copy, CheckCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase, getCurrentStoreId } from '@/lib/supabase-api';
import imageCompression from 'browser-image-compression';
import { useToast } from '@/components/ui/ToastProvider';

interface UploadedFile {
  id: string;
  url: string;
  name: string;
}

export default function AdminFotosPage() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await uploadFiles(Array.from(files));
    
    // Reset input so the same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    const storeId = await getCurrentStoreId();
    if (!storeId) {
      toast({ title: 'Error: No se encontró la tienda activa', type: 'error' });
      setIsUploading(false);
      return;
    }

    const newUploaded: UploadedFile[] = [];

    for (const file of files) {
      // 5MB frontend validation
      if (file.size > 5242880) {
        toast({ title: `El archivo ${file.name} supera los 5MB`, type: 'error' });
        errorCount++;
        continue;
      }

      let fileToUpload = file;
      let fileExtension = file.name.split('.').pop() || 'jpg';
      try {
        fileToUpload = await imageCompression(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          fileType: 'image/webp',
        });
        fileExtension = 'webp';
      } catch (compressionError) {
        console.error('Error comprimiendo imagen, se sube el original:', compressionError);
        // Si la compresión falla por cualquier razón, seguir con el archivo original
        // en vez de bloquear la subida.
      }

      const uuid = crypto.randomUUID();
      const fileName = `${uuid}.${fileExtension}`;
      const filePath = `${storeId}/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          errorCount++;
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newUploaded.push({
          id: uuid,
          url: publicUrlData.publicUrl,
          name: file.name
        });
        successCount++;
      } catch (err) {
        console.error('Exception uploading file:', err);
        errorCount++;
      }
    }

    setUploadedFiles(prev => [...newUploaded, ...prev]);
    setIsUploading(false);

    if (successCount > 0) {
      toast({ title: `Se subieron ${successCount} imágenes exitosamente.`, type: 'success' });
    }
    if (errorCount > 0) {
      toast({ title: `Hubo error al subir ${errorCount} imágenes.`, type: 'error' });
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'URL copiada al portapapeles', type: 'success' });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6 pb-12 text-left">
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col shadow-xs">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-green-600" />
          <span>Gestor de Fotos</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Sube imágenes para tus productos. Luego copia la URL pública para usarla en tu catálogo.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-3xl border border-dashed border-green-300 p-8 shadow-xs text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-2">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Sube tus fotos aquí</h3>
        <p className="text-xs text-slate-500 max-w-md">
          Formatos soportados: JPG, PNG, WEBP. Tamaño máximo: 5MB.
          Puedes seleccionar múltiples archivos a la vez.
        </p>
        
        <input 
          type="file" 
          multiple 
          accept="image/jpeg,image/png,image/webp" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Subiendo fotos...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Seleccionar Archivos</span>
            </>
          )}
        </button>
      </div>

      {/* Uploaded Files Gallery */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <span>Fotos subidas recientemente</span>
            <span className="bg-green-100 text-green-700 py-0.5 px-2 rounded-full text-[10px]">{uploadedFiles.length}</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs group">
                <div className="aspect-square bg-slate-100 border-b border-slate-200/60 relative">
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-slate-500 truncate mb-2 font-mono" title={file.name}>{file.name}</p>
                  <button
                    onClick={() => handleCopyUrl(file.id, file.url)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === file.id ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
