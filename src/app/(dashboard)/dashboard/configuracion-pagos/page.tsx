import { getStorePaymentSettings } from './actions';
import PaymentSettingsForm from './PaymentSettingsForm';

export default async function ConfiguracionPagosPage() {
  const data = await getStorePaymentSettings();
  
  if (!data) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-6">Configuración de Pagos</h1>
        <p>No se pudo cargar la información de la tienda. Asegúrate de estar autenticado y ser el dueño de la tienda.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-2">Configuración de Pagos Wompi</h1>
      <p className="text-gray-400 mb-8">
        Ingresa las llaves de tu cuenta de Wompi para habilitar los pagos en tu tienda. 
        Tus llaves se guardan de forma segura y encriptada en el sistema.
      </p>

      <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg">
        <PaymentSettingsForm initialData={data.settings} />
      </div>
    </div>
  );
}
