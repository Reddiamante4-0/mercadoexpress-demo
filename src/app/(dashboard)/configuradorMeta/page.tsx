'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  ChevronRight,
  ChevronLeft,
  Play,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Globe,
  CreditCard,
  Settings,
  Code,
  Check,
  Sparkles,
  Copy,
  ShieldAlert,
  Loader2,
  UserCheck,
  Layers,
  ListChecks,
  HelpCircle,
  RotateCcw,
  ClipboardList
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import {
  generarIdentidadMarcaAction,
  obtenerDirectricesSeguridadAction,
  obtenerEscudoFinancieroAction,
  explicarPixelAction,
  generarWhatsAppMensajesAction,
  generarEstructuraLandingAction
} from './actions';

interface StepInfo {
  id: number;
  titleEn: string;
  titleEs: string;
  videoUrl: string;
  externalLink: string;
  externalTextEn: string;
  externalTextEs: string;
  descriptionEs: string;
  descriptionEn: string;
  checklistEs: string[];
  checklistEn: string[];
}

const STEPS_INFO: StepInfo[] = [
  {
    id: 1,
    titleEn: '1. Commercial Identity',
    titleEs: '1. Identidad Comercial',
    videoUrl: 'https://www.youtube.com/embed/xaozSvA_fvo?start=16',
    externalLink: 'https://business.facebook.com/',
    externalTextEn: 'Go to Meta Business Suite',
    externalTextEs: 'Ir a Meta Business Suite',
    descriptionEs: 'Define tu propuesta de marca, cliente ideal, tono de voz y genera copys y prompts visuales para tu perfil comercial.',
    descriptionEn: 'Define your brand proposal, ideal customer, tone of voice, and generate copywriting and visual prompts for your business profile.',
    checklistEs: [
      'Definir el nombre comercial del negocio',
      'Redactar la propuesta de valor única',
      'Definir el cliente ideal (buyer persona)',
      'Establecer el tono de comunicación comercial',
      'Generar los copys de biografía comercial con la IA'
    ],
    checklistEn: [
      'Define commercial business name',
      'Draft the unique value proposition',
      'Define ideal customer (buyer persona)',
      'Establish brand communication tone',
      'Generate business bio copywriting with AI'
    ]
  },
  {
    id: 2,
    titleEn: '2. Facebook Page',
    titleEs: '2. Página de Facebook',
    videoUrl: 'https://www.youtube.com/embed/xaozSvA_fvo?start=16',
    externalLink: 'https://www.facebook.com/',
    externalTextEn: 'Open Facebook',
    externalTextEs: 'Abrir Facebook',
    descriptionEs: 'Crea y configura tu página comercial de Facebook. Es el activo público indispensable desde el cual se publicarán tus anuncios.',
    descriptionEn: 'Create and configure your commercial Facebook Page. It is the public asset from which your ads will run.',
    checklistEs: [
      'Crear la página de Facebook con categoría comercial adecuada',
      'Añadir la biografía comercial generada en el paso anterior',
      'Subir foto de perfil comercial elegante (representando el logo)',
      'Subir foto de portada optimizada para móvil y escritorio',
      'Completar información de contacto (correo, teléfono y horario)'
    ],
    checklistEn: [
      'Create Facebook page with appropriate commercial category',
      'Add business bio generated in the previous step',
      'Upload professional profile photo (representing the logo)',
      'Upload cover photo optimized for mobile and desktop',
      'Complete contact information (email, phone, and hours)'
    ]
  },
  {
    id: 3,
    titleEn: '3. Business Manager',
    titleEs: '3. Business Manager',
    videoUrl: 'https://www.youtube.com/embed/GHp2d03xAvo?start=19',
    externalLink: 'https://business.facebook.com/overview',
    externalTextEn: 'Open Business Manager',
    externalTextEs: 'Abrir Business Manager',
    descriptionEs: 'Configura la estructura central de tu negocio publicitario. Habilita medidas de protección y seguridad obligatorias en Meta.',
    descriptionEn: 'Configure the core structure of your advertising business. Enable mandatory security measures in Meta.',
    checklistEs: [
      'Registrarse en el Business Manager con tu correo de negocio o principal',
      'Activar la Autenticación en Dos Pasos (2FA) para todos los administradores',
      'Confirmar la dirección de correo electrónico del Business Manager',
      'Agregar al menos un Administrador de Respaldo de confianza (perfil real)',
      'Completar la información comercial y fiscal de tu negocio'
    ],
    checklistEn: [
      'Register on Business Manager with a business or primary email',
      'Activate Two-Factor Authentication (2FA) for all admins',
      'Confirm the email address of the Business Manager',
      'Add at least one backup administrator (real trusted profile)',
      'Complete the commercial and tax info of your business'
    ]
  },
  {
    id: 4,
    titleEn: '4. Ad Account',
    titleEs: '4. Cuenta Publicitaria',
    videoUrl: 'https://www.youtube.com/embed/GHp2d03xAvo?start=19',
    externalLink: 'https://business.facebook.com/settings/ad-accounts',
    externalTextEn: 'Go to Ad Accounts Settings',
    externalTextEs: 'Configurar Cuenta Publicitaria',
    descriptionEs: 'Crea el contenedor de facturación específico para tus campañas. Configura la zona horaria y moneda local de forma definitiva.',
    descriptionEn: 'Create the specific billing container for your campaigns. Configure the timezone and local currency permanently.',
    checklistEs: [
      'Crear una nueva cuenta publicitaria en el Business Manager',
      'Asignar la zona horaria correcta de tu país o mercado principal',
      'Seleccionar la divisa local o de facturación adecuada',
      'Asignar accesos y permisos de control total a tu perfil comercial',
      'Vincular la cuenta publicitaria con tu página de Facebook'
    ],
    checklistEn: [
      'Create a new advertising account in the Business Manager',
      'Assign the correct timezone matching your location or primary market',
      'Select the appropriate local or billing currency',
      'Assign full control access and permissions to your profile',
      'Link the ad account to your Facebook Page'
    ]
  },
  {
    id: 5,
    titleEn: '5. Payment Method',
    titleEs: '5. Método de Pago',
    videoUrl: 'https://www.youtube.com/embed/W6WdYAnnNSQ?start=239',
    externalLink: 'https://business.facebook.com/settings/payment-methods',
    externalTextEn: 'Configure Payments in Meta',
    externalTextEs: 'Configurar Métodos de Pago',
    descriptionEs: 'Asocia una tarjeta bancaria física con fondos suficientes. Meta valida el método cobrando un pequeño cargo temporal de seguridad.',
    descriptionEn: 'Associate a physical bank card with sufficient funds. Meta validates the method by charging a small temporary security fee.',
    checklistEs: [
      'Conseguir una tarjeta física de crédito o débito a nombre del titular',
      'Asegurar fondos mínimos de verificación ($1 USD / moneda local equivalente)',
      'Agregar el método de pago en el panel de facturación de la cuenta publicitaria',
      'Establecer un límite de gasto inicial en la cuenta como control preventivo',
      'Confirmar que el banco local permita cargos automáticos de Meta Ads'
    ],
    checklistEn: [
      'Get a physical credit or debit card matching the account owner name',
      'Ensure minimum verification funds are available ($1 USD equivalent)',
      'Add the payment method in the ad account billing panel',
      'Set an initial account spending limit as a preventative control',
      'Confirm that the local bank allows automatic charges from Meta Ads'
    ]
  },
  {
    id: 6,
    titleEn: '6. WhatsApp Business',
    titleEs: '6. WhatsApp Business',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    externalLink: 'https://business.facebook.com/settings/whatsapp-business-accounts',
    externalTextEn: 'WhatsApp Business Configuration',
    externalTextEs: 'Vincular WhatsApp en Meta',
    descriptionEs: 'Instala WhatsApp Business y vincúlalo con tu cuenta comercial para recibir conversaciones directas y leads desde los anuncios.',
    descriptionEn: 'Install WhatsApp Business and link it with your commercial account to receive direct chat leads from ads.',
    checklistEs: [
      'Descargar la aplicación oficial de WhatsApp Business en tu celular',
      'Configurar perfil de empresa completo (horarios, catálogo, dirección)',
      'Vincular el número telefónico a tu página comercial en Facebook',
      'Ingresar el código de confirmación recibido en el celular',
      'Diseñar y guardar una plantilla para mensajes rápidos de bienvenida con la IA'
    ],
    checklistEn: [
      'Download the official WhatsApp Business application on your mobile',
      'Setup complete business profile (hours, catalog, address)',
      'Link the phone number to your Facebook Business Page',
      'Enter the confirmation code received on the mobile phone',
      'Design and save a template for quick welcome messages with AI'
    ]
  },
  {
    id: 7,
    titleEn: '7. Landing Page or Group',
    titleEs: '7. Landing Page o Grupo',
    videoUrl: 'https://www.youtube.com/embed/F0_k84p6g1I?start=12',
    externalLink: '/landings',
    externalTextEn: 'Go to Landing Builder',
    externalTextEs: 'Ir a Creador de Landings',
    descriptionEs: 'Prepara el destino de conversión para tus anuncios: sea una landing page optimizada para registro o un grupo cerrado en WhatsApp/Telegram.',
    descriptionEn: 'Prepare the conversion destination for your ads: either a registration landing page or a closed group in WhatsApp/Telegram.',
    checklistEs: [
      'Definir si enviarás al público a una Landing Page o a un Grupo de Prospección',
      'Estructurar una oferta de gancho atractiva (recurso gratuito o clase especial)',
      'Diseñar la landing con titular claro, beneficios y llamado de acción (CTA)',
      'Configurar los botones para redirigir al siguiente paso de tu embudo',
      'Verificar la velocidad de carga de la landing page en dispositivos móviles'
    ],
    checklistEn: [
      'Determine if you will send traffic to a Landing Page or a Prospecting Group',
      'Structure an attractive hook offer (free resource or special class)',
      'Design the landing with clear headline, benefits, and call to action (CTA)',
      'Configure redirect buttons for the next funnel step',
      'Verify the loading speed of the landing page on mobile devices'
    ]
  },
  {
    id: 8,
    titleEn: '8. Meta Pixel & Tracking',
    titleEs: '8. Píxel y Seguimiento',
    videoUrl: 'https://www.youtube.com/embed/F0_k84p6g1I?start=12',
    externalLink: 'https://business.facebook.com/settings/pixels',
    externalTextEn: 'Go to Data Sources Settings',
    externalTextEs: 'Ir a Configuración de Orígenes de Datos',
    descriptionEs: 'Instala la pieza de código de seguimiento oficial en tu embudo para registrar leads, optimizar costos y recopilar datos de conversión.',
    descriptionEn: 'Install the official tracking code piece in your funnel to register leads, optimize costs, and collect conversion data.',
    checklistEs: [
      'Crear un Píxel de Meta (Conjunto de Datos) en el Business Manager',
      'Copiar el identificador numérico o código base del Píxel',
      'Instalar el Píxel en la cabecera (head) de tu landing page o sitio web',
      'Configurar los eventos estándar esenciales (Registro, Pago Iniciado)',
      'Comprobar el correcto funcionamiento con la extensión Meta Pixel Helper'
    ],
    checklistEn: [
      'Create a Meta Pixel (Data Set) inside Business Manager',
      'Copy the numeric identifier or pixel base code',
      'Install the Pixel inside the head tag of your landing page or website',
      'Configure essential standard events (Lead, Initiate Checkout)',
      'Verify correct tracking using the Meta Pixel Helper extension'
    ]
  },
  {
    id: 9,
    titleEn: '9. Final Audit',
    titleEs: '9. Auditoría y Checklist Final',
    videoUrl: 'https://www.youtube.com/embed/W6WdYAnnNSQ?start=239',
    externalLink: 'https://business.facebook.com/',
    externalTextEn: 'Go to Ads Manager',
    externalTextEs: 'Ir al Administrador de Anuncios',
    descriptionEs: 'Revisión general de seguridad, cumplimiento publicitario y enlaces antes de encender tus campañas. ¡Asegura una configuración óptima!',
    descriptionEn: 'General review of security, advertising policy compliance, and links before launching campaigns. Ensure an optimal setup!',
    checklistEs: [
      'Confirmar que todos los activos del ecosistema estén correctamente vinculados entre sí',
      'Verificar que tu cuenta publicitaria tenga activa y configurada la tarjeta bancaria',
      'Hacer una prueba real de flujo completo enviándote un registro de prueba',
      'Verificar que el embudo de ventas cuente con el enlace visible a Políticas de Privacidad',
      'Auditar los textos de tus copys para asegurar cumplimiento absoluto de políticas de Meta'
    ],
    checklistEn: [
      'Confirm that all ecosystem assets are properly linked and assigned',
      'Verify that your ad account has a validated payment method',
      'Perform a real full-flow test submission on your landing or group',
      'Verify that the sales funnel footer contains a link to Privacy Policies',
      'Audit your ad copywriting to ensure absolute Meta advertising policies compliance'
    ]
  }
];

const DEFAULT_CHECKLIST: Record<number, boolean[]> = {
  1: [false, false, false, false, false],
  2: [false, false, false, false, false],
  3: [false, false, false, false, false],
  4: [false, false, false, false, false],
  5: [false, false, false, false, false],
  6: [false, false, false, false, false],
  7: [false, false, false, false, false],
  8: [false, false, false, false, false],
  9: [false, false, false, false, false],
};

const DEFAULT_DIAGNOSIS = {
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
  7: false,
  8: false
};

export default function ConfiguradorMetaPage() {
  const { language } = useTranslation();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [diagnosisCompleted, setDiagnosisCompleted] = useState(false);
  const [diagnosisAnswers, setDiagnosisAnswers] = useState<Record<number, boolean>>(DEFAULT_DIAGNOSIS);
  const [currentStep, setCurrentStep] = useState(0);
  const [checklistState, setChecklistState] = useState<Record<number, boolean[]>>(DEFAULT_CHECKLIST);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // STEP 1 STATES (Brand Identity)
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('');
  const [clienteIdeal, setClienteIdeal] = useState('');
  const [tonoVoz, setTonoVoz] = useState('profesional');
  const [loadingBrand, setLoadingBrand] = useState(false);
  interface BrandResultData {
    nombres: string[];
    bio: string;
    descripcion: string;
    promptPortada: string;
    promptPerfil: string;
  }
  const [brandResult, setBrandResult] = useState<BrandResultData | null>(null);

  // STEP 3 STATES (Business Manager Security)
  const [paisManager, setPaisManager] = useState('');
  const [loadingManager, setLoadingManager] = useState(false);
  const [managerResult, setManagerResult] = useState<{ zonaHoraria: string; moneda: string; directrices: string[] } | null>(null);

  // STEP 5 STATES (Ad Account Payments)
  const [paisPago, setPaisPago] = useState('');
  const [loadingPago, setLoadingPago] = useState(false);
  const [pagoResult, setPagoResult] = useState<{ tarjetasAceptadas: string; tarjetasRechazadas: string; fondoMinimo: string; recomendaciones: string[] } | null>(null);

  // STEP 6 STATES (WhatsApp Connection)
  const [whatsappNum, setWhatsappNum] = useState('');
  const [negocioWhatsapp, setNegocioWhatsapp] = useState('');
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false);
  const [whatsappResult, setWhatsappResult] = useState<{ mensajes: string[] } | null>(null);

  // STEP 7 STATES (Landing / Group Assistant)
  const [landingNegocio, setLandingNegocio] = useState('');
  const [landingProducto, setLandingProducto] = useState('');
  const [loadingLanding, setLoadingLanding] = useState(false);
  const [landingResult, setLandingResult] = useState<{ titular: string; subtitular: string; problema: string; beneficios: string[]; cta: string } | null>(null);

  // STEP 8 STATES (Pixel)
  const [pixelId, setPixelId] = useState('');
  const [loadingPixel, setLoadingPixel] = useState(false);
  const [pixelResult, setPixelResult] = useState<{ explicacion: string } | null>(null);
  const [pixelStatus, setPixelStatus] = useState<'idle' | 'injected'>('idle');

  // Load state on mount
  useEffect(() => {
    setIsMounted(true);
    const savedDiagnosis = localStorage.getItem('meta_ecosistema_diagnosis_completed');
    if (savedDiagnosis) {
      setDiagnosisCompleted(JSON.parse(savedDiagnosis));
    }
    const savedAnswers = localStorage.getItem('meta_ecosistema_diagnosis_answers');
    if (savedAnswers) {
      setDiagnosisAnswers(JSON.parse(savedAnswers));
    }
    const savedChecks = localStorage.getItem('meta_ecosistema_checklist_state');
    if (savedChecks) {
      setChecklistState(JSON.parse(savedChecks));
    }
  }, []);

  const saveChecklistState = (newState: Record<number, boolean[]>) => {
    setChecklistState(newState);
    localStorage.setItem('meta_ecosistema_checklist_state', JSON.stringify(newState));
  };

  const saveDiagnosisState = (completed: boolean, answers: Record<number, boolean>) => {
    setDiagnosisCompleted(completed);
    setDiagnosisAnswers(answers);
    localStorage.setItem('meta_ecosistema_diagnosis_completed', JSON.stringify(completed));
    localStorage.setItem('meta_ecosistema_diagnosis_answers', JSON.stringify(answers));
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(id);
      toast({
        title: language === 'en' ? 'Copied!' : '¡Copiado!',
        type: 'success'
      });
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      toast({
        title: language === 'en' ? 'Error copying text.' : 'Error al copiar texto.',
        type: 'error'
      });
    }
  };

  // Toggle checklist checkbox
  const handleToggleCheck = (stepId: number, itemIndex: number) => {
    const currentChecks = checklistState[stepId] ? [...checklistState[stepId]] : [false, false, false, false, false];
    currentChecks[itemIndex] = !currentChecks[itemIndex];
    const newChecks = {
      ...checklistState,
      [stepId]: currentChecks
    };
    saveChecklistState(newChecks);
  };

  // Complete entire step
  const handleCompleteStep = (stepId: number) => {
    const newChecks = {
      ...checklistState,
      [stepId]: [true, true, true, true, true]
    };
    saveChecklistState(newChecks);
    toast({
      title: language === 'en' ? 'Step marked as completed!' : '¡Paso marcado como completado!',
      type: 'success'
    });
    
    // Auto advance
    if (currentStep < STEPS_INFO.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsPlayingVideo(false);
    }
  };

  // ── STEP 1 PROCESS (Brand) ──
  const handleProcessBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingBrand(true);
    setBrandResult(null);
    try {
      const res = await generarIdentidadMarcaAction(nombreNegocio, tipoNegocio, clienteIdeal, tonoVoz);
      if (res.success && res.data) {
        setBrandResult(res.data as BrandResultData);
        toast({
          title: language === 'en' ? 'Brand identity generated!' : '¡Identidad comercial generada!',
          type: 'success'
        });
      } else {
        const friendlyError = res.error || (language === 'en' ? 'Failed to generate identity.' : 'Error al generar la identidad.');
        toast({ title: friendlyError, type: 'error' });
      }
    } catch {
      toast({ title: language === 'en' ? 'Error processing identity' : 'Error al procesar la identidad', type: 'error' });
    } finally {
      setLoadingBrand(false);
    }
  };

  // ── STEP 3 PROCESS (BM Guidelines) ──
  const handleProcessManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingManager(true);
    try {
      const res = await obtenerDirectricesSeguridadAction(paisManager);
      if (res.success && res.data) {
        setManagerResult(res.data);
        toast({
          title: language === 'en' ? 'Security guidelines loaded!' : '¡Directrices de seguridad cargadas!',
          type: 'success'
        });
      } else {
        const friendlyError = res.error || (language === 'en' ? 'Failed to load safety guidelines.' : 'Error al cargar las directrices de seguridad.');
        toast({ title: friendlyError, type: 'error' });
      }
    } catch {
      toast({ title: language === 'en' ? 'Error processing guidelines' : 'Error al procesar las directrices', type: 'error' });
    } finally {
      setLoadingManager(false);
    }
  };

  // ── STEP 5 PROCESS (Payments) ──
  const handleProcessPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPago(true);
    try {
      const res = await obtenerEscudoFinancieroAction(paisPago);
      if (res.success && res.data) {
        setPagoResult(res.data);
        toast({
          title: language === 'en' ? 'Validation guidelines activated!' : '¡Recomendaciones de validación cargadas!',
          type: 'success'
        });
      } else {
        const friendlyError = res.error || (language === 'en' ? 'Failed to fetch recommendations.' : 'Error al obtener las recomendaciones.');
        toast({ title: friendlyError, type: 'error' });
      }
    } catch {
      toast({ title: language === 'en' ? 'Error getting payment validation guidelines' : 'Error al obtener directrices de pago', type: 'error' });
    } finally {
      setLoadingPago(false);
    }
  };

  // ── STEP 6 PROCESS (WhatsApp) ──
  const handleProcessWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingWhatsapp(true);
    try {
      const res = await generarWhatsAppMensajesAction(whatsappNum, negocioWhatsapp);
      if (res.success && res.data) {
        setWhatsappResult(res.data);
        toast({
          title: language === 'en' ? 'WhatsApp options generated!' : '¡Enlace y mensajes generados con éxito!',
          type: 'success'
        });
      } else {
        const friendlyError = res.error || (language === 'en' ? 'Failed to generate messages.' : 'Error al generar los mensajes.');
        toast({ title: friendlyError, type: 'error' });
      }
    } catch {
      toast({ title: language === 'en' ? 'Error generating messages' : 'Error al generar mensajes', type: 'error' });
    } finally {
      setLoadingWhatsapp(false);
    }
  };

  // ── STEP 7 PROCESS (Landing Layout) ──
  const handleProcessLanding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLanding(true);
    try {
      const res = await generarEstructuraLandingAction(landingNegocio, landingProducto);
      if (res.success && res.data) {
        setLandingResult(res.data);
        toast({
          title: language === 'en' ? 'Landing copy generated!' : '¡Copia estructural generada con éxito!',
          type: 'success'
        });
      } else {
        const friendlyError = res.error || (language === 'en' ? 'Failed to generate copy.' : 'Error al generar la estructura.');
        toast({ title: friendlyError, type: 'error' });
      }
    } catch {
      toast({ title: language === 'en' ? 'Error generating landing copy' : 'Error al generar estructura de la landing', type: 'error' });
    } finally {
      setLoadingLanding(false);
    }
  };

  // ── STEP 8 PROCESS (Pixel) ──
  const handleProcessPixel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPixel(true);
    try {
      const res = await explicarPixelAction(pixelId);
      if (res.success && res.data) {
        setPixelResult(res.data);
        setPixelStatus('injected');
        toast({
          title: language === 'en' ? 'Meta Pixel explanation loaded!' : '¡Explicación de Píxel cargada y registrada!',
          type: 'success'
        });
      } else {
        const friendlyError = res.error || (language === 'en' ? 'Failed to process pixel.' : 'Error al procesar el píxel.');
        toast({ title: friendlyError, type: 'error' });
      }
    } catch {
      toast({ title: language === 'en' ? 'Error explaining pixel' : 'Error al explicar el píxel', type: 'error' });
    } finally {
      setLoadingPixel(false);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < STEPS_INFO.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsPlayingVideo(false);
    } else {
      toast({
        title: language === 'en' ? 'Ecosystem configuration finalized!' : '¡Ecosistema verificado y listo!',
        type: 'success'
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setIsPlayingVideo(false);
    }
  };

  // Diagnostic completion
  const handleCompleteDiagnosis = () => {
    const newChecklist = { ...DEFAULT_CHECKLIST };
    
    // For each checked diagnosis option, mark the corresponding step's checklist items as completed
    for (let stepId = 1; stepId <= 8; stepId++) {
      if (diagnosisAnswers[stepId]) {
        newChecklist[stepId] = [true, true, true, true, true];
      }
    }
    
    saveChecklistState(newChecklist);
    saveDiagnosisState(true, diagnosisAnswers);
    
    toast({
      title: language === 'en' ? 'Ecosystem path calculated!' : '¡Ruta de ecosistema configurada!',
      type: 'success'
    });
  };

  const handleResetDiagnosis = () => {
    if (confirm(language === 'en' ? 'Are you sure you want to reset your setup progress and diagnosis?' : '¿Estás seguro de que deseas reiniciar tu progreso y el diagnóstico?')) {
      saveChecklistState(DEFAULT_CHECKLIST);
      saveDiagnosisState(false, DEFAULT_DIAGNOSIS);
      setCurrentStep(0);
      setBrandResult(null);
      setManagerResult(null);
      setPagoResult(null);
      setWhatsappResult(null);
      setLandingResult(null);
      setPixelResult(null);
      setPixelStatus('idle');
      toast({
        title: language === 'en' ? 'Progress reset successfully' : 'Progreso reiniciado con éxito',
        type: 'success'
      });
    }
  };

  // Progress Calculations
  const totalItems = STEPS_INFO.reduce((acc, step) => acc + (step.checklistEs.length), 0);
  const completedItems = STEPS_INFO.reduce((acc, step) => {
    const stepChecks = checklistState[step.id] || [];
    return acc + stepChecks.filter(Boolean).length;
  }, 0);
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const activeStepInfo = STEPS_INFO[currentStep];

  // Render Step Icon dynamically helper
  const renderStepIcon = (stepId: number, className = "w-5 h-5") => {
    switch (stepId) {
      case 1: return <Sparkles className={className} />;
      case 2: return <Globe className={className} />;
      case 3: return <Settings className={className} />;
      case 4: return <Target className={className} />;
      case 5: return <CreditCard className={className} />;
      case 6: return <MessageSquare className={className} />;
      case 7: return <Layers className={className} />;
      case 8: return <Code className={className} />;
      case 9: return <CheckCircle2 className={className} />;
      default: return <Settings className={className} />;
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 select-none">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">
              Red Diamante 4.0
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm leading-tight">
            {language === 'en' ? 'Meta Ads Ecosystem Guide' : 'Ruta: Ecosistema Meta Ads'}
          </h1>
          <p className="text-sm text-white/50 mt-1.5 font-medium leading-relaxed max-w-2xl">
            {language === 'en'
              ? 'Navigate step-by-step to secure your digital assets, establish safety guidelines, and verify your assets before running advertising campaigns.'
              : 'Navega paso a paso para proteger tus activos digitales, configurar directrices de seguridad y validar tu infraestructura antes de lanzar campañas.'}
          </p>
        </div>

        {/* Global Progress Gauge */}
        {diagnosisCompleted && (
          <div className="flex items-center gap-4 bg-white/3 border border-white/5 px-5 py-3.5 rounded-2xl shrink-0">
            <div className="relative w-14 h-14 flex items-center justify-center bg-black/20 rounded-full border border-white/5">
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/5"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary transition-all duration-500 ease-out"
                  strokeWidth="2.5"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="text-xs font-extrabold text-white">{progressPercent}%</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Progreso General</span>
              <span className="text-xs font-semibold text-white/80">
                {completedItems} / {totalItems} {language === 'en' ? 'tasks done' : 'tareas listas'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── VIEW 1: WELCOME & DIAGNOSIS ── */}
      {!diagnosisCompleted ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          
          <GlassCard className="p-8 text-center space-y-6 max-w-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-pink/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
            
            <div className="w-16 h-16 bg-linear-to-tr from-primary to-accent-pink rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2 max-w-2xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {language === 'en' ? 'Digital Setup & Safety Diagnosis' : 'Diagnóstico de Ecosistema Comercial'}
              </h2>
              <p className="text-sm text-white/60 leading-relaxed font-sans">
                {language === 'en'
                  ? 'Before generating your customized guidance, let us know which assets you have already created or configured. This allows Gemini to optimize your implementation schedule.'
                  : 'Antes de generar tu ruta guiada de configuración, indícanos qué elementos de tu ecosistema de Meta Ads ya tienes creados o validados. Así configuraremos tu porcentaje inicial de avance.'}
              </p>
            </div>

            <div className="border-t border-white/5 pt-6 max-w-2xl mx-auto text-left space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider pl-1">
                {language === 'en' ? 'Mark everything you have already setup:' : 'Selecciona los elementos que ya posees activos:'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 1, labelEs: '1. Identidad comercial y propuesta de marca definida.', labelEn: '1. Commercial identity & brand proposal defined.' },
                  { id: 2, labelEs: '2. Página comercial de Facebook (FanPage) activa.', labelEn: '2. Active Facebook FanPage page.' },
                  { id: 3, labelEs: '3. Business Manager configurado con 2FA activo.', labelEn: '3. Business Manager set up with 2FA active.' },
                  { id: 4, labelEs: '4. Cuenta publicitaria lista para lanzar pauta.', labelEn: '4. Active Ad Account configured for campaigns.' },
                  { id: 5, labelEs: '5. Tarjeta bancaria de pago vinculada y validada.', labelEn: '5. Bank payment card linked and validated.' },
                  { id: 6, labelEs: '6. WhatsApp Business configurado y conectado.', labelEn: '6. WhatsApp Business configured and linked.' },
                  { id: 7, labelEs: '7. Landing Page o grupo de destino creado.', labelEn: '7. Landing page or destination group created.' },
                  { id: 8, labelEs: '8. Píxel de Meta instalado en tu sitio / embudo.', labelEn: '8. Meta Pixel code installed on your funnel.' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setDiagnosisAnswers(prev => ({
                        ...prev,
                        [item.id]: !prev[item.id]
                      }));
                    }}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left group cursor-pointer ${
                      diagnosisAnswers[item.id]
                        ? 'bg-primary/10 border-primary text-white shadow-[0_0_10px_rgba(124,58,237,0.15)]'
                        : 'bg-white/2 border-white/5 hover:border-white/10 text-white/60'
                    }`}
                  >
                    <div className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                      diagnosisAnswers[item.id]
                        ? 'bg-primary border-primary text-white'
                        : 'border-white/25 group-hover:border-white/40'
                    }`}>
                      {diagnosisAnswers[item.id] && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-semibold select-none leading-relaxed">
                      {language === 'en' ? item.labelEn : item.labelEs}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 max-w-2xl mx-auto">
              <GlowButton
                onClick={handleCompleteDiagnosis}
                className="w-full py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'en' ? 'Generate Guided Route' : 'Comenzar Diagnóstico de Ruta'}</span>
              </GlowButton>
            </div>
          </GlassCard>

        </div>
      ) : (
        /* ── VIEW 2: ECOSYSTEM GUIDED PATH SCREEN ── */
        <div className="space-y-8 animate-fadeIn">
          
          {/* Steps Timeline Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
            {STEPS_INFO.map((stepItem, index) => {
              const isActive = index === currentStep;
              const isStepCompleted = (checklistState[stepItem.id] || []).every(Boolean);
              const isSomeCompleted = (checklistState[stepItem.id] || []).some(Boolean);

              return (
                <button
                  key={stepItem.id}
                  onClick={() => {
                    setCurrentStep(index);
                    setIsPlayingVideo(false);
                  }}
                  className={`flex flex-col items-center justify-between p-3.5 rounded-xl border transition-all text-center group cursor-pointer h-24 ${
                    isActive
                      ? 'bg-linear-to-tr from-primary/25 to-accent-pink/10 border-primary text-white shadow-[0_0_12px_rgba(124,58,237,0.2)]'
                      : isStepCompleted
                      ? 'bg-green-500/5 border-green-500/20 text-green-400'
                      : isSomeCompleted
                      ? 'bg-primary/5 border-primary/20 text-primary/80'
                      : 'bg-white/2 border-white/5 hover:bg-white/4 hover:border-white/10 text-white/40 hover:text-white/70'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold text-xs ${
                    isActive
                      ? 'bg-primary text-white border-transparent'
                      : isStepCompleted
                      ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : 'bg-white/5 border-white/10 text-white/50 group-hover:text-white'
                  }`}>
                    {isStepCompleted ? <Check className="w-4 h-4 text-white" /> : renderStepIcon(stepItem.id, "w-4.5 h-4.5")}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold block uppercase tracking-wider">
                      {language === 'en' ? `Step ${stepItem.id}` : `Paso ${stepItem.id}`}
                    </span>
                    <span className="text-[9px] font-medium text-white/50 group-hover:text-white/80 block max-w-[90px] truncate">
                      {language === 'en' ? stepItem.titleEn.split('. ')[1] : stepItem.titleEs.split('. ')[1]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Details Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Guide description, Video, Action CTA, and AI Assistant (Col span 7) */}
            <div className="lg:col-span-7 space-y-6">
              
              <GlassCard className="p-6 text-left space-y-5 max-w-none">
                
                {/* Step Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      {renderStepIcon(activeStepInfo.id, "w-5 h-5")}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded-full">
                        {language === 'en' ? `Ecosystem Stage ${activeStepInfo.id}` : `Fase de Ecosistema ${activeStepInfo.id}`}
                      </span>
                      <h2 className="text-base font-bold text-white mt-1">
                        {language === 'en' ? activeStepInfo.titleEn : activeStepInfo.titleEs}
                      </h2>
                    </div>
                  </div>

                  {/* Primary Link CTA to Meta Settings */}
                  <a
                    href={activeStepInfo.externalLink}
                    target={activeStepInfo.externalLink.startsWith('http') ? "_blank" : undefined}
                    rel={activeStepInfo.externalLink.startsWith('http') ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-white cursor-pointer"
                  >
                    <span>{language === 'en' ? activeStepInfo.externalTextEn : activeStepInfo.externalTextEs}</span>
                    {activeStepInfo.externalLink.startsWith('http') ? (
                      <ExternalLink className="w-3.5 h-3.5 text-accent-blue" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-primary" />
                    )}
                  </a>
                </div>

                {/* Step Description */}
                <p className="text-xs text-white/70 leading-relaxed font-sans font-medium">
                  {language === 'en' ? activeStepInfo.descriptionEn : activeStepInfo.descriptionEs}
                </p>

                {activeStepInfo.id === 2 && (
                  <div className="p-4 bg-white/3 border border-white/5 rounded-xl space-y-2 text-xs text-white/70 leading-relaxed">
                    <p className="font-bold text-accent-blue flex flex-wrap items-center gap-1.5">
                      <span>{language === 'en' ? 'Manual Route:' : 'Ruta manual:'}</span>
                      <span className="text-white font-semibold font-mono">Facebook → Menú → Páginas → Crear nueva página</span>
                    </p>
                    <p className="text-[11px] text-white/45 font-medium italic">
                      {language === 'en'
                        ? '“If the direct button does not open the page creation, follow the manual route inside Facebook.”'
                        : '“Si el botón directo no abre la creación de página, sigue la ruta manual dentro de Facebook.”'}
                    </p>
                  </div>
                )}

                {activeStepInfo.id === 3 && (
                  <div className="p-4 bg-white/3 border border-white/5 rounded-xl text-xs text-white/70 leading-relaxed font-semibold">
                    <p>
                      {language === 'en'
                        ? '“From there click on Create account or Configure your business manager, depending on what Meta shows you.”'
                        : '“Desde allí haz clic en Crear cuenta o Configurar tu administrador comercial, según lo que Meta te muestre.”'}
                    </p>
                  </div>
                )}

                {/* Video Tutorial Slot */}
                {isPlayingVideo ? (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black relative">
                    <iframe
                      src={activeStepInfo.videoUrl.includes('?') ? `${activeStepInfo.videoUrl}&autoplay=1` : `${activeStepInfo.videoUrl}?autoplay=1`}
                      title={language === 'en' ? activeStepInfo.titleEn : activeStepInfo.titleEs}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video max-h-[200px] rounded-2xl overflow-hidden border border-white/5 bg-white/2 group flex flex-col items-center justify-center p-6 text-center">
                    <div className="absolute w-20 h-20 rounded-full bg-linear-to-tr from-primary to-accent-pink opacity-10 blur-xl group-hover:opacity-20 transition-opacity" />
                    <button
                      onClick={() => setIsPlayingVideo(true)}
                      className="relative w-12 h-12 rounded-full bg-linear-to-tr from-primary to-accent-pink flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-all cursor-pointer"
                    >
                      <Play className="w-4.5 h-4.5 fill-white pl-0.5" />
                    </button>
                    <span className="relative text-[10px] font-semibold text-white/50 mt-3 group-hover:text-white/80 transition-colors">
                      {language === 'en' ? 'Click to Play Setup Video Guide' : 'Ver video tutorial de configuración'}
                    </span>
                  </div>
                )}

                <p className="text-[11px] text-white/45 italic text-center font-semibold mt-2">
                  {language === 'en'
                    ? 'Watch the video, complete the action, and then check the checklist.'
                    : 'Mira el video, completa la acción y luego marca el checklist.'}
                </p>

              </GlassCard>

              {/* Dynamic AI Assistant Card (If Step supports AI action) */}
              
              {/* ── AI: Step 1 (Brand) ── */}
              {activeStepInfo.id === 1 && (
                <GlassCard className="p-6 text-left space-y-5 max-w-none">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                    <Sparkles className="w-4.5 h-4.5 text-accent-blue" />
                    {language === 'en' ? 'AI to Create Your Commercial Identity' : 'IA para crear tu identidad comercial'}
                  </h4>

                  <form onSubmit={handleProcessBrand} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                          {language === 'en' ? 'Suggested Base Name' : 'Nombre Propuesto'}
                        </label>
                        <Input
                          type="text"
                          value={nombreNegocio}
                          onChange={(e) => setNombreNegocio(e.target.value)}
                          placeholder="Ej. Bienestar y negocios digitales"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                          {language === 'en' ? 'Niche / Business Type' : 'Nicho / Tipo de Negocio'}
                        </label>
                        <Input
                          type="text"
                          value={tipoNegocio}
                          onChange={(e) => setTipoNegocio(e.target.value)}
                          placeholder="Ej. Comunidad de emprendimiento digital"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                          {language === 'en' ? 'Ideal Buyer' : 'Cliente Ideal'}
                        </label>
                        <Input
                          type="text"
                          value={clienteIdeal}
                          onChange={(e) => setClienteIdeal(e.target.value)}
                          placeholder="Ej. Personas que buscan ingresos desde casa"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                          {language === 'en' ? 'Communication Tone' : 'Tono de Comunicación'}
                        </label>
                        <select
                          value={tonoVoz}
                          onChange={(e) => setTonoVoz(e.target.value)}
                          className="w-full bg-base-200/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-hidden focus:border-primary/50 transition-all font-semibold"
                        >
                          <option value="disruptivo">Disruptivo / Comercial</option>
                          <option value="profesional">Profesional / Educativo</option>
                          <option value="cercano">Cercano / Divertido</option>
                          <option value="vendedor">Persuasivo / Vendedor</option>
                        </select>
                      </div>
                    </div>

                    <GlowButton type="submit" disabled={loadingBrand} className="w-full">
                      {loadingBrand ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === 'en' ? 'Generating brand options...' : 'Generando propuesta de marca...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{language === 'en' ? 'Generate Identity with AI' : 'Generar Identidad con IA'}</span>
                        </>
                      )}
                    </GlowButton>
                  </form>

                  {brandResult && (
                    <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                      <div className="space-y-2">
                        <h5 className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                          {language === 'en' ? 'Suggested Commercial Names:' : 'Nombres comerciales propuestos:'}
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {brandResult.nombres.map((n, i) => (
                            <div key={i} className="bg-white/3 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                              <span className="text-xs font-bold text-white">{n}</span>
                              <button
                                onClick={() => handleCopy(n, `name-${i}`)}
                                className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                              >
                                {copiedText === `name-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h5 className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                            {language === 'en' ? 'Facebook Bio (Under 255 chars limit):' : 'Biografía de FanPage (Máximo 255 caracteres):'}
                          </h5>
                          <span className="text-[9px] text-white/30 font-semibold">{brandResult.bio.length} / 255</span>
                        </div>
                        <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 flex justify-between items-start gap-4">
                          <p className="text-xs text-white/75 leading-relaxed font-sans select-text">{brandResult.bio}</p>
                          <button
                            onClick={() => handleCopy(brandResult.bio, 'bio-result')}
                            className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer shrink-0"
                          >
                            {copiedText === 'bio-result' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                          {language === 'en' ? 'Profile General Description:' : 'Descripción General de Perfil:'}
                        </h5>
                        <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 flex justify-between items-start gap-4">
                          <p className="text-xs text-white/75 leading-relaxed font-sans select-text">{brandResult.descripcion}</p>
                          <button
                            onClick={() => handleCopy(brandResult.descripcion, 'desc-result')}
                            className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer shrink-0"
                          >
                            {copiedText === 'desc-result' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                            {language === 'en' ? 'Cover Banner Image Prompt (Bing/Midjourney):' : 'Prompt de Imagen de Portada:'}
                          </h5>
                          <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col justify-between gap-3 min-h-[140px]">
                            <p className="text-[11px] text-white/60 font-mono leading-relaxed select-text flex-1">{brandResult.promptPortada}</p>
                            <button
                              onClick={() => handleCopy(brandResult.promptPortada, 'prompt-cover')}
                              className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/80 text-[10px] font-bold border border-white/5 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {copiedText === 'prompt-cover' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{language === 'en' ? 'Copy Banner Prompt' : 'Copiar Prompt Portada'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                            {language === 'en' ? 'Logo/Profile Image Prompt (Bing/Midjourney):' : 'Prompt de Imagen de Perfil/Logo:'}
                          </h5>
                          <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col justify-between gap-3 min-h-[140px]">
                            <p className="text-[11px] text-white/60 font-mono leading-relaxed select-text flex-1">{brandResult.promptPerfil}</p>
                            <button
                              onClick={() => handleCopy(brandResult.promptPerfil, 'prompt-profile')}
                              className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/80 text-[10px] font-bold border border-white/5 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {copiedText === 'prompt-profile' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{language === 'en' ? 'Copy Logo Prompt' : 'Copiar Prompt Perfil'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* ── Step 2 Instruction Link Section ── */}
              {activeStepInfo.id === 2 && (
                <GlassCard className="p-6 text-left space-y-4 max-w-none">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                    <Globe className="w-4.5 h-4.5 text-accent-pink" />
                    {language === 'en' ? 'Linked Assets Reference' : 'Activos en Uso'}
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">
                    {language === 'en'
                      ? 'Create your FanPage on Facebook using the values generated in Step 1. Copy the bio and profile prompts to accelerate this process.'
                      : 'Utiliza el nombre e identidad de marca generados en el Paso 1 para crear tu FanPage comercial en Facebook. Puedes regresar para copiar los textos y prompts en cualquier momento.'}
                  </p>
                  {brandResult ? (
                    <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-bold text-white">{language === 'en' ? 'Commercial Name Suggestion:' : 'Propuesta comercial:'} <span className="text-primary">{brandResult.nombres[0]}</span></p>
                      <p className="text-xs text-white/70 italic leading-relaxed">"{brandResult.bio}"</p>
                    </div>
                  ) : (
                    <div className="bg-white/2 border border-white/5 rounded-xl p-4 text-center">
                      <p className="text-xs text-white/40 font-medium">
                        {language === 'en' ? 'Run the Step 1 AI Assistant to generate brand copy' : 'Genera tu identidad en el Paso 1 para previsualizar los textos aquí.'}
                      </p>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* ── AI: Step 3 (Business Manager Security) ── */}
              {activeStepInfo.id === 3 && (
                <GlassCard className="p-6 text-left space-y-5 max-w-none">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                    <UserCheck className="w-4.5 h-4.5 text-primary" />
                    {language === 'en' ? 'AI Business Manager Security Copilot' : 'IA Asistente: Configuración Segura'}
                  </h4>

                  <form onSubmit={handleProcessManager} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                        {language === 'en' ? 'Commercial Country' : 'País del Negocio / Facturación'}
                      </label>
                      <Input
                        type="text"
                        value={paisManager}
                        onChange={(e) => setPaisManager(e.target.value)}
                        placeholder="Ej. Colombia, México, España"
                        required
                      />
                    </div>

                    <GlowButton type="submit" disabled={loadingManager} className="w-full">
                      {loadingManager ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === 'en' ? 'Analyzing local guidelines...' : 'Cargando directrices locales...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{language === 'en' ? 'Get Safe Setup Guidelines' : 'Obtener Guías de Configuración Segura'}</span>
                        </>
                      )}
                    </GlowButton>
                  </form>

                  {managerResult && (
                    <div className="space-y-4 pt-3 border-t border-white/5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/3 border border-white/5 rounded-xl p-3.5">
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Zona Horaria Recomendada</span>
                          <p className="text-xs font-bold text-white mt-0.5">{managerResult.zonaHoraria}</p>
                        </div>
                        <div className="bg-white/3 border border-white/5 rounded-xl p-3.5">
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Divisa Sugerida</span>
                          <p className="text-xs font-bold text-white mt-0.5">{managerResult.moneda}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                          {language === 'en' ? 'Country Protection Guidelines:' : 'Directrices de protección y buenas prácticas:'}
                        </h5>
                        <ul className="space-y-2">
                          {managerResult.directrices.map((d, i) => (
                            <li key={i} className="flex gap-3 items-start p-3 bg-white/3 border border-white/5 rounded-xl">
                              <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
                                {i+1}
                              </span>
                              <span className="text-xs text-white/70 leading-relaxed font-semibold">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* ── Step 4 References ── */}
              {activeStepInfo.id === 4 && (
                <GlassCard className="p-6 text-left space-y-4 max-w-none">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                    <Target className="w-4.5 h-4.5 text-accent-warm" />
                    {language === 'en' ? 'Setup Reference Parameters' : 'Parámetros Recomendados'}
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">
                    {language === 'en'
                      ? 'Ensure you set your ad account timezone and currency matching the parameters identified in Step 3.'
                      : 'Al crear tu cuenta publicitaria, asegúrate de utilizar exactamente la divisa y zona horaria sugeridas por la IA en el Paso 3 para evitar problemas de facturación o desfases de reportes.'}
                  </p>
                  {managerResult ? (
                    <div className="bg-white/3 border border-white/5 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-bold text-white/40 block">ZONA HORARIA</span>
                        <span className="text-xs font-bold text-white">{managerResult.zonaHoraria}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-white/40 block">DIVISA FACTURACIÓN</span>
                        <span className="text-xs font-bold text-white">{managerResult.moneda}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/2 border border-white/5 rounded-xl p-4 text-center">
                      <p className="text-xs text-white/40 font-medium">
                        {language === 'en' ? 'Run the Step 3 AI assistant to define localized suggestions' : 'Completa la consulta de país en el Paso 3 para visualizar parámetros recomendados aquí.'}
                      </p>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* ── AI: Step 5 (Payment Shield) ── */}
              {activeStepInfo.id === 5 && (
                <GlassCard className="p-6 text-left space-y-5 max-w-none">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                    <CreditCard className="w-4.5 h-4.5 text-accent-warm" />
                    {language === 'en' ? 'AI Billing Validation Assistant' : 'IA Asistente: Validación de Pago Seguro'}
                  </h4>

                  <form onSubmit={handleProcessPago} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                        {language === 'en' ? 'Billing Country' : 'País de Tarjetas / Bancos'}
                      </label>
                      <Input
                        type="text"
                        value={paisPago}
                        onChange={(e) => setPaisPago(e.target.value)}
                        placeholder="Ej. Colombia, México, Chile"
                        required
                      />
                    </div>

                    <GlowButton type="submit" disabled={loadingPago} className="w-full">
                      {loadingPago ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === 'en' ? 'Analyzing payment networks...' : 'Consultando redes bancarias...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{language === 'en' ? 'Check Safe Bank Connections' : 'Consultar Bancos Aceptados'}</span>
                        </>
                      )}
                    </GlowButton>
                  </form>

                  {pagoResult && (
                    <div className="space-y-4 pt-3 border-t border-white/5 text-left">
                      <div className="space-y-3">
                        <div className="p-3.5 bg-green-500/5 border border-green-500/15 rounded-xl">
                          <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider block">Tarjetas y Bancos Recomendados</span>
                          <p className="text-xs text-white/85 leading-relaxed font-semibold mt-1">{pagoResult.tarjetasAceptadas}</p>
                        </div>
                        
                        <div className="p-3.5 bg-red-500/5 border border-red-500/15 rounded-xl">
                          <span className="text-[9px] font-bold text-accent-pink uppercase tracking-wider block">Entidades Bancarias con Incidencias</span>
                          <p className="text-xs text-white/85 leading-relaxed font-semibold mt-1">{pagoResult.tarjetasRechazadas}</p>
                        </div>

                        <div className="p-3.5 bg-accent-blue/5 border border-accent-blue/15 rounded-xl">
                          <span className="text-[9px] font-bold text-accent-blue uppercase tracking-wider block">Saldo Mínimo de Validación Temporal</span>
                          <p className="text-xs text-white/85 leading-relaxed font-semibold mt-1">{pagoResult.fondoMinimo}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                          {language === 'en' ? 'Expert Billing Safeguards:' : 'Buenas prácticas de facturación y cobro:'}
                        </h5>
                        <ul className="space-y-2">
                          {pagoResult.recomendaciones.map((r, i) => (
                            <li key={i} className="flex gap-3 items-start p-3 bg-white/3 border border-white/5 rounded-xl">
                              <span className="w-5 h-5 rounded-full bg-accent-warm/10 border border-accent-warm/20 flex items-center justify-center text-[10px] font-bold text-accent-warm shrink-0 mt-0.5">
                                {i+1}
                              </span>
                              <span className="text-xs text-white/70 leading-relaxed font-semibold">{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* ── AI: Step 6 (WhatsApp link) ── */}
              {activeStepInfo.id === 6 && (
                <GlassCard className="p-6 text-left space-y-5 max-w-none">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                    <MessageSquare className="w-4.5 h-4.5 text-green-400" />
                    {language === 'en' ? 'AI WhatsApp Conversation Link Generator' : 'IA Asistente: Enlace de Conversación WhatsApp'}
                  </h4>

                  <form onSubmit={handleProcessWhatsapp} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                          {language === 'en' ? 'WhatsApp Number (with country code)' : 'Número de WhatsApp (con código de país)'}
                        </label>
                        <Input
                          type="text"
                          value={whatsappNum}
                          onChange={(e) => setWhatsappNum(e.target.value)}
                          placeholder="Ej. +573123456789"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                          {language === 'en' ? 'Offer / Business name' : 'Nombre de la Oferta o Negocio'}
                        </label>
                        <Input
                          type="text"
                          value={negocioWhatsapp}
                          onChange={(e) => setNegocioWhatsapp(e.target.value)}
                          placeholder={language === 'en' ? 'e.g. LiveGood Wellness Membership' : 'Ej. Membresía de Bienestar LiveGood'}
                          required
                        />
                      </div>
                    </div>

                    <GlowButton type="submit" disabled={loadingWhatsapp} className="w-full">
                      {loadingWhatsapp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === 'en' ? 'Generating welcome copies...' : 'Generando mensajes y enlaces...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{language === 'en' ? 'Generate WhatsApp Link' : 'Generar Enlace y Mensaje'}</span>
                        </>
                      )}
                    </GlowButton>
                  </form>

                  {whatsappResult && (
                    <div className="space-y-4 pt-3 border-t border-white/5 text-left">
                      <h5 className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                        {language === 'en' ? 'Suggested Messages & Link Configurations:' : 'Plantillas de mensajes y enlaces de entrada:'}
                      </h5>

                      <div className="space-y-3">
                        {whatsappResult.mensajes.map((m, i) => {
                          const cleanNum = whatsappNum.replace(/\+/g, '').replace(/\s/g, '');
                          const waLink = `https://wa.me/${cleanNum}?text=${encodeURIComponent(m)}`;
                          return (
                            <div key={i} className="p-3.5 bg-white/3 border border-white/5 rounded-xl space-y-3">
                              <div>
                                <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Opción {i+1}</span>
                                <p className="text-xs text-white/85 mt-1 select-text leading-relaxed font-sans font-medium">{m}</p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pt-2.5 border-t border-white/5">
                                <span className="text-[10px] text-white/40 truncate max-w-[280px] font-mono">{waLink}</span>
                                <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                                  <button
                                    onClick={() => handleCopy(m, `wa-msg-${i}`)}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-white/5"
                                  >
                                    {copiedText === `wa-msg-${i}` ? <Check className="w-3 text-green-400" /> : <Copy className="w-3" />}
                                    <span>{language === 'en' ? 'Copy Text' : 'Copiar Texto'}</span>
                                  </button>
                                  <button
                                    onClick={() => handleCopy(waLink, `wa-link-${i}`)}
                                    className="px-2.5 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-primary/30"
                                  >
                                    {copiedText === `wa-link-${i}` ? <Check className="w-3 text-green-400" /> : <Copy className="w-3" />}
                                    <span>{language === 'en' ? 'Copy Link' : 'Copiar wa.link'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* ── AI: Step 7 (Landing Layout Copy assistant) ── */}
              {activeStepInfo.id === 7 && (
                <GlassCard className="p-6 text-left space-y-5 max-w-none">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                    <Layers className="w-4.5 h-4.5 text-accent-blue" />
                    {language === 'en' ? 'AI Landing Copy Planner' : 'IA Asistente: Estructura de Landing / Grupo'}
                  </h4>

                  <form onSubmit={handleProcessLanding} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                          {language === 'en' ? 'Business Name' : 'Nombre de tu Marca'}
                        </label>
                        <Input
                          type="text"
                          value={landingNegocio}
                          onChange={(e) => setLandingNegocio(e.target.value)}
                          placeholder={language === 'en' ? 'e.g. Wellness Diamonds Community' : 'Ej. Comunidad Diamantes del Bienestar'}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                          {language === 'en' ? 'Main Offer / Lead Magnet' : 'Oferta Principal o Recurso Gancho'}
                        </label>
                        <Input
                          type="text"
                          value={landingProducto}
                          onChange={(e) => setLandingProducto(e.target.value)}
                          placeholder={language === 'en' ? 'e.g. Practical Guide to Home Income with LiveGood' : 'Ej. Guía práctica para generar ingresos desde casa con LiveGood'}
                          required
                        />
                      </div>
                    </div>

                    <GlowButton type="submit" disabled={loadingLanding} className="w-full">
                      {loadingLanding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === 'en' ? 'Creating conversion layout...' : 'Estructurando contenidos...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{language === 'en' ? 'Generate Copy Blueprint' : 'Diseñar Estructura de Conversión'}</span>
                        </>
                      )}
                    </GlowButton>
                  </form>

                  {landingResult && (
                    <div className="space-y-4 pt-3 border-t border-white/5 text-left font-sans">
                      
                      <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3 relative">
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleCopy(`${landingResult.titular}\n\n${landingResult.subtitular}\n\nProblema: ${landingResult.problema}\n\nBeneficios:\n- ${landingResult.beneficios.join('\n- ')}\n\nCTA: ${landingResult.cta}`, 'landing-all')}
                            className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer"
                            title="Copiar todo el esquema"
                          >
                            {copiedText === 'landing-all' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">1. Titular Principal (Gancho)</span>
                          <p className="text-sm font-extrabold text-white leading-snug">{landingResult.titular}</p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">2. Subtitular Explicativo</span>
                          <p className="text-xs text-white/80 leading-relaxed font-semibold">{landingResult.subtitular}</p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <span className="text-[9px] font-bold text-accent-pink uppercase tracking-wider block">3. Dolor del Cliente (Problema)</span>
                          <p className="text-xs text-white/70 leading-relaxed italic">"{landingResult.problema}"</p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider block">4. Beneficios Clave (Solución)</span>
                          <ul className="list-disc list-inside space-y-1 text-xs text-white/70 leading-relaxed pl-1 font-semibold">
                            {landingResult.beneficios.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <span className="text-[9px] font-bold text-accent-warm uppercase tracking-wider block">5. Llamado a la Acción (CTA)</span>
                          <p className="text-xs text-primary font-bold">{landingResult.cta}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* ── AI: Step 8 (Pixel explain) ── */}
              {activeStepInfo.id === 8 && (
                <GlassCard className="p-6 text-left space-y-5 max-w-none">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                    <Code className="w-4.5 h-4.5 text-accent-pink" />
                    {language === 'en' ? 'AI Pixel Setup Integrator' : 'IA Asistente: Explicación de Píxel Personalizado'}
                  </h4>

                  <form onSubmit={handleProcessPixel} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider pl-1">
                        {language === 'en' ? 'Meta Pixel ID' : 'ID del Píxel de Meta'}
                      </label>
                      <Input
                        type="text"
                        value={pixelId}
                        onChange={(e) => setPixelId(e.target.value)}
                        placeholder="Ej. 738491029384812"
                        required
                      />
                    </div>

                    <GlowButton type="submit" disabled={loadingPixel} className="w-full">
                      {loadingPixel ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === 'en' ? 'Explaining tracking rules...' : 'Procesando píxel con IA...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{language === 'en' ? 'Generate Pixel Explanation' : 'Analizar e Inyectar Píxel'}</span>
                        </>
                      )}
                    </GlowButton>
                  </form>

                  {pixelResult && (
                    <div className="space-y-4 pt-3 border-t border-white/5 text-left">
                      <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-green-400">
                            {language === 'en' ? 'Simulated Status: Active' : 'Estado de Simulación: Inyectado'}
                          </p>
                          <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
                            {language === 'en' ? `Pixel code with ID ${pixelId} successfully registered in local template.` : `El identificador de píxel ${pixelId} ha sido guardado localmente en tu embudo.`}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-1.5">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Propósito del Píxel:</span>
                        <p className="text-xs text-white/80 leading-relaxed font-sans font-medium">{pixelResult.explicacion}</p>
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* ── Step 9: Final Auditor Card ── */}
              {activeStepInfo.id === 9 && (
                <GlassCard className="p-6 text-left space-y-5 max-w-none">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-green-400" />
                    {language === 'en' ? 'Ecosystem Launch Audit' : 'Auditoría de Lanzamiento del Ecosistema'}
                  </h4>

                  {progressPercent === 100 ? (
                    <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl text-center space-y-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-radial-to-t from-green-500/5 to-transparent pointer-events-none" />
                      <div className="w-12 h-12 rounded-full bg-green-500/20 mx-auto flex items-center justify-center text-green-400 shadow-md">
                        <Check className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5">
                        <h5 className="text-sm font-bold text-white">¡Ecosistema Completado y Seguro!</h5>
                        <p className="text-xs text-white/60 leading-relaxed max-w-md mx-auto">
                          Has completado y validado todas las etapas de configuración de tu ecosistema Meta Ads. Tus activos están resguardados bajo buenas prácticas y directrices seguras.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white/70">Revisión de Etapas Previas:</span>
                          <span className="text-[10px] font-bold text-primary">{progressPercent}% completado</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {STEPS_INFO.slice(0, 8).map((stepItem) => {
                          const isCompleted = (checklistState[stepItem.id] || []).every(Boolean);
                          return (
                            <button
                              key={stepItem.id}
                              onClick={() => {
                                setCurrentStep(stepItem.id - 1);
                                setIsPlayingVideo(false);
                              }}
                              className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-all ${
                                isCompleted
                                  ? 'bg-green-500/5 border-green-500/10 text-green-400 hover:bg-green-500/10'
                                  : 'bg-white/2 border-white/5 hover:border-white/10 text-white/60'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="shrink-0">{renderStepIcon(stepItem.id, "w-4 h-4")}</span>
                                <span className="text-xs font-semibold truncate">
                                  {language === 'en' ? stepItem.titleEn.split('. ')[1] : stepItem.titleEs.split('. ')[1]}
                                </span>
                              </div>
                              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider">
                                {isCompleted ? 'OK' : 'Pendiente'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

            </div>

            {/* Right side: Step Checklist and Local controls (Col span 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Checklist Card */}
              <GlassCard className="p-6 text-left space-y-5 max-w-none">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-primary" />
                    {language === 'en' ? 'Step Checklist' : 'Checklist del Paso'}
                  </h4>
                  <span className="text-[10px] font-bold bg-white/5 border border-white/8 px-2 py-0.5 rounded-full text-white/70">
                    {(checklistState[activeStepInfo.id] || []).filter(Boolean).length} / 5
                  </span>
                </div>

                <div className="space-y-3">
                  {(language === 'en' ? activeStepInfo.checklistEn : activeStepInfo.checklistEs).map((taskText, idx) => {
                    const isChecked = checklistState[activeStepInfo.id] ? checklistState[activeStepInfo.id][idx] : false;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleCheck(activeStepInfo.id, idx)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all group cursor-pointer ${
                          isChecked
                            ? 'bg-primary/5 border-primary/20 text-white'
                            : 'bg-white/2 border-white/5 hover:border-white/8 text-white/60'
                        }`}
                      >
                        <div className={`mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-primary border-primary text-white'
                            : 'border-white/20 group-hover:border-white/30'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs font-semibold leading-relaxed select-none">
                          {taskText}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <GlowButton
                  onClick={() => handleCompleteStep(activeStepInfo.id)}
                  variant="ghost"
                  className="w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5 border border-white/10 hover:border-primary/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'en' ? 'Mark Step as Completed' : 'Marcar Paso como Completado'}</span>
                </GlowButton>
              </GlassCard>

              {/* Safe Setup Guidelines Card */}
              <GlassCard className="p-6 text-left space-y-4 max-w-none">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-accent-warm" />
                  {language === 'en' ? 'Setup Directives' : 'Directrices de Protección'}
                </h4>
                
                <div className="space-y-3 font-sans text-xs text-white/60 leading-relaxed font-medium">
                  {activeStepInfo.id === 1 && (
                    <p>Asegura que tu nombre de marca sea fácil de recordar. Las imágenes del logo y portada no deben contener promesas comerciales engañosas.</p>
                  )}
                  {activeStepInfo.id === 2 && (
                    <p>Meta audita los perfiles nuevos. Publica al menos 3 publicaciones de valor antes de vincular tu página a campañas de anuncios activas.</p>
                  )}
                  {activeStepInfo.id === 3 && (
                    <p>La verificación de dos pasos (2FA) previene accesos no autorizados y bloqueos de seguridad. Es el escudo básico de tu administrador comercial.</p>
                  )}
                  {activeStepInfo.id === 4 && (
                    <p>Tus datos de facturación (país y moneda) deben coincidir con la divisa de tu tarjeta bancaria para evitar alertas de actividad sospechosa.</p>
                  )}
                  {activeStepInfo.id === 5 && (
                    <p>Evita el uso de tarjetas virtuales rotativas o prepago sin nombre impreso, ya que Meta las rechaza para prevenir fraudes de facturación.</p>
                  )}
                  {activeStepInfo.id === 6 && (
                    <p>La vinculación con WhatsApp Business te otorga acceso a campañas optimizadas de mensajes y a herramientas nativas de automatización.</p>
                  )}
                  {activeStepInfo.id === 7 && (
                    <p>Tu landing page o grupo de bienvenida debe ser transparente sobre lo que ofrece. Evita promesas excesivas y fraudes publicitarios.</p>
                  )}
                  {activeStepInfo.id === 8 && (
                    <p>El píxel te permite crear públicos personalizados y optimizar tu presupuesto registrando eventos reales de tus prospectos.</p>
                  )}
                  {activeStepInfo.id === 9 && (
                    <p>Antes de lanzar, verifica siempre que los enlaces funcionan y que el copy de tus campañas no infringe las políticas comunitarias de Meta.</p>
                  )}
                </div>
              </GlassCard>

              {/* Bottom Step Control indicators */}
              <div className="flex justify-between items-center w-full pt-4">
                <GlowButton
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="px-4 py-2.5 gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{language === 'en' ? 'Back' : 'Anterior'}</span>
                </GlowButton>

                <GlowButton
                  onClick={handleNext}
                  className="px-6 py-2.5 gap-1.5"
                  disabled={currentStep === STEPS_INFO.length - 1}
                >
                  <span>{language === 'en' ? 'Next Step' : 'Siguiente Paso'}</span>
                  <ChevronRight className="w-4 h-4" />
                </GlowButton>
              </div>

              {/* Reset/Retake Diagnosis */}
              <div className="pt-2">
                <button
                  onClick={handleResetDiagnosis}
                  className="w-full py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 text-[10px] text-white/40 hover:text-white/70 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Reset Setup & Retake Diagnosis' : 'Reiniciar Progreso y Diagnóstico'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
