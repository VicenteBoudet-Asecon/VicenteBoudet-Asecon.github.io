// Resuelve el estado de cada canal de contacto: "vivo" cuando el dato real
// existe, "maqueta" cuando falta pero se pidió previsualizarlo con
// PUBLIC_PREVIEW_CHANNELS=1 (nunca en un build de producción), o "ausente"
// cuando no hay ni dato ni preview. Ningún componente vuelve a leer
// company.whatsapp / company.bookingUrl / company.leadMagnetFile ni las
// variables de entorno de activación directamente: todos preguntan acá, así
// que el patrón "construido pero sin activar" vive en un solo lugar.
import { company } from './content';

const truthy = (v) => typeof v === 'string' && v.trim().length > 0;

/** Solo true en un build que pidió previsualizar canales sin activar (nunca en producción). */
export const previewChannels = import.meta.env.PUBLIC_PREVIEW_CHANNELS === '1';

export const channels = {
  form: {
    ready: truthy(import.meta.env.PUBLIC_WEB3FORMS_KEY),
  },
  whatsapp: {
    ready: truthy(company.whatsapp),
    href(text) {
      const base = `https://wa.me/${company.whatsapp}`;
      return text ? `${base}?text=${encodeURIComponent(text)}` : base;
    },
  },
  booking: {
    ready: truthy(company.bookingUrl),
    href: company.bookingUrl,
  },
  leadMagnet: {
    ready: truthy(company.leadMagnetFile),
    href: company.leadMagnetFile,
  },
};
