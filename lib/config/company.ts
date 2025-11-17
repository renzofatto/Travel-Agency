/**
 * Configuración centralizada de la empresa
 *
 * Acá podés actualizar toda la información de la empresa en un solo lugar
 * y se reflejará automáticamente en toda la aplicación.
 */

export const COMPANY_INFO = {
  // Información básica
  name: 'TravelHub',
  tagline: 'Live The Journey',
  description: 'Plataforma integral para organizar viajes grupales con amigos, familia o desconocidos',

  // Contacto
  contact: {
    email: 'info@travelhub.com',
    phone: '+598 99 123 456',
    phoneRaw: '+59899123456', // Para el href tel:
    address: {
      city: 'Montevideo',
      country: 'Uruguay',
      full: 'Montevideo, Uruguay',
    },
  },

  // Redes sociales (opcional)
  social: {
    facebook: 'https://facebook.com/travelhub',
    instagram: 'https://instagram.com/travelhub',
    twitter: 'https://twitter.com/travelhub',
    linkedin: 'https://linkedin.com/company/travelhub',
  },

  // Horarios de atención
  businessHours: {
    weekdays: 'Lunes a Viernes: 9:00 - 18:00',
    saturday: 'Sábados: 10:00 - 14:00',
    sunday: 'Domingos: Cerrado',
  },

  // Métricas y garantías
  guarantees: {
    responseTime: '<24h',
    customization: '100%',
    support: '24/7',
    priceGuarantee: 'Mejor Precio Garantizado',
  },

  // URLs importantes
  urls: {
    website: 'https://travelhub.com',
    blog: 'https://blog.travelhub.com',
    support: 'https://help.travelhub.com',
    privacyPolicy: '/privacy',
    termsOfService: '/terms',
  },

  // Configuración de formularios
  forms: {
    formspree: {
      contactFormId: 'YOUR_FORM_ID', // Reemplazar con tu ID de Formspree
      endpoint: (formId: string) => `https://formspree.io/f/${formId}`,
    },
  },

  // SEO y metadata
  seo: {
    defaultTitle: 'TravelHub - Organizá tu próximo viaje grupal',
    defaultDescription: 'Plataforma integral para planificar y organizar viajes grupales. Gestión de itinerarios, gastos, documentos y más.',
    keywords: ['viajes grupales', 'organizar viajes', 'planificación de viajes', 'agencia de viajes'],
    ogImage: '/og-image.jpg',
  },

  // Colores de marca (para referencia)
  brand: {
    colors: {
      primary: '#0EA5E9', // Ocean Blue
      secondary: '#8B5CF6', // Royal Purple
      accent: '#EC4899', // Sunset Pink
    },
  },
} as const

// Helper functions para acceder a la info de forma más conveniente

export const getCompanyName = () => COMPANY_INFO.name
export const getCompanyEmail = () => COMPANY_INFO.contact.email
export const getCompanyPhone = () => COMPANY_INFO.contact.phone
export const getCompanyPhoneHref = () => `tel:${COMPANY_INFO.contact.phoneRaw}`
export const getCompanyAddress = () => COMPANY_INFO.contact.address.full
export const getFormspreeEndpoint = () => COMPANY_INFO.forms.formspree.endpoint(COMPANY_INFO.forms.formspree.contactFormId)

// Export individual sections for convenience
export const { contact, social, guarantees, urls, seo } = COMPANY_INFO
