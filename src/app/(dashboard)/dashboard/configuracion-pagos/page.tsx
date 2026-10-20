import { getStorePaymentSettings } from './actions';
import PaymentSettingsForm from './PaymentSettingsForm';
import { getTransferSettings } from './transferActions';
import TransferSettingsForm from './TransferSettingsForm';

export default async function ConfiguracionPagosPage() {
  const data = await getStorePaymentSettings();
  
  if (!data) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-slate-800">
        <h1 className="text-3xl font-bold mb-6">Configuración de Pagos</h1>
        <p>No se pudo cargar la información de la tienda. Asegúrate de estar autenticado y ser el dueño de la tienda.</p>
      </div>
    );
  }

  if (data.planTipo === 'vendedor') {
    return (
      <div className="p-6 max-w-4xl mx-auto text-slate-800">
        <h1 className="text-3xl font-bold mb-2">Configuración de Pagos</h1>
        <p className="text-slate-500">
          Esta sección no aplica para tu tipo de tienda. Las tiendas Crisalap Impulsa no procesan pagos propios: tus comisiones por referidos se generan automáticamente y las gestiona Crisalap.
        </p>
      </div>
    );
  }

  const transfer = await getTransferSettings();

  return (
    <div className="p-6 max-w-4xl mx-auto text-slate-800">
      <h1 className="text-3xl font-bold mb-2">Configuración de Pagos</h1>
      <h2 className="text-xl font-semibold mb-2 mt-6">Pagos en línea con Wompi</h2>
      <p className="text-slate-500 mb-8">
        Ingresa las llaves de tu cuenta de Wompi para habilitar los pagos en tu tienda. 
        Tus llaves se guardan de forma segura y encriptada en el sistema.
      </p>

      <div className="bg-[#1C1C1E] text-white p-6 rounded-xl border border-white/10 shadow-lg">
        <PaymentSettingsForm initialData={data.settings} />
      </div>

      <h2 className="text-xl font-semibold mb-2 mt-10">Transferencias (Nequi y Bre-B)</h2>
      <p className="text-slate-500 mb-8">
        Si tus clientes pagan por transferencia, escribe aquí tus datos para que los vean al pagar. Después de transferir, te envían el comprobante por WhatsApp y tú confirmas el pedido.
      </p>

      <div className="bg-[#1C1C1E] text-white p-6 rounded-xl border border-white/10 shadow-lg">
        <TransferSettingsForm
          initialNequi={transfer?.nequiNumber ?? ''}
          initialBreB={transfer?.llaveBreB ?? ''}
        />
      </div>
    </div>
  );
}
