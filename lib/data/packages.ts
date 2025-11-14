export interface TravelPackage {
  id: string
  slug: string
  name: string
  country: string
  continent: string
  type: 'adventure' | 'relax' | 'cultural' | 'family' | 'luxury'
  duration: number
  groupSize: string
  price: number
  currency: string
  rating: number
  image: string
  highlights: string[]
  popular?: boolean
  description: string
  included: string[]
  notIncluded: string[]
  itinerary: {
    day: number
    title: string
    description: string
    activities: string[]
  }[]
  gallery: string[]
}

export const packages: TravelPackage[] = [
  {
    id: '1',
    slug: 'europa-clasica',
    name: 'Europa Clásica',
    country: 'Europa',
    continent: 'Europe',
    type: 'cultural',
    duration: 15,
    groupSize: '15-25',
    price: 2500,
    currency: 'USD',
    rating: 4.9,
    image: '🏰',
    highlights: ['París', 'Roma', 'Barcelona', 'Ámsterdam'],
    popular: true,
    description: 'Recorre las ciudades más icónicas de Europa en un viaje inolvidable. Descubre la Torre Eiffel, el Coliseo, la Sagrada Familia y los canales de Ámsterdam. Arte, historia y cultura en estado puro.',
    included: [
      'Vuelos internacionales y traslados',
      'Alojamiento en hoteles 4 estrellas',
      'Desayuno diario incluido',
      'Guías turísticos profesionales en español',
      'Entradas a museos y atracciones principales',
      'Seguro de viaje completo',
    ],
    notIncluded: [
      'Almuerzos y cenas',
      'Propinas',
      'Gastos personales',
      'Actividades opcionales no mencionadas',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Llegada a París',
        description: 'Llegada al aeropuerto Charles de Gaulle, traslado al hotel y tiempo libre para explorar el barrio.',
        activities: ['Check-in en el hotel', 'Cena de bienvenida', 'Paseo por Montmartre'],
      },
      {
        day: 2,
        title: 'París - Torre Eiffel y Louvre',
        description: 'Día completo visitando los iconos de París.',
        activities: ['Torre Eiffel', 'Museo del Louvre', 'Crucero por el Sena'],
      },
      {
        day: 3,
        title: 'París - Versalles',
        description: 'Excursión al Palacio de Versalles y sus jardines.',
        activities: ['Palacio de Versalles', 'Jardines de Versalles', 'Tarde libre en París'],
      },
      {
        day: 4,
        title: 'París - Barcelona',
        description: 'Vuelo a Barcelona y recorrido por Las Ramblas.',
        activities: ['Vuelo a Barcelona', 'Las Ramblas', 'Barrio Gótico'],
      },
      {
        day: 5,
        title: 'Barcelona - Sagrada Familia',
        description: 'Visita a la obra maestra de Gaudí y el Parque Güell.',
        activities: ['Sagrada Familia', 'Parque Güell', 'Casa Batlló'],
      },
    ],
    gallery: ['🏰', '🗼', '🎨', '⛪', '🌉', '🏛️'],
  },
  {
    id: '2',
    slug: 'caribe-paradisiaco',
    name: 'Caribe Paradisíaco',
    country: 'Caribe',
    continent: 'Americas',
    type: 'relax',
    duration: 7,
    groupSize: '10-20',
    price: 1800,
    currency: 'USD',
    rating: 4.8,
    image: '🏖️',
    highlights: ['Cancún', 'Punta Cana', 'Playas privadas', 'All inclusive'],
    popular: true,
    description: 'Relájate en las mejores playas del Caribe con todo incluido. Arena blanca, aguas turquesas y resort 5 estrellas con comida y bebida ilimitada. El paraíso te espera.',
    included: [
      'Vuelos ida y vuelta',
      'Resort 5 estrellas todo incluido',
      'Todas las comidas y bebidas',
      'Actividades acuáticas no motorizadas',
      'Entretenimiento nocturno',
      'Traslados aeropuerto-hotel',
    ],
    notIncluded: [
      'Excursiones opcionales',
      'Spa y tratamientos',
      'Deportes acuáticos motorizados',
      'Propinas',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Cancún',
        description: 'Llegada y traslado al resort todo incluido.',
        activities: ['Check-in en resort', 'Bienvenida con cóctel', 'Cena buffet'],
      },
      {
        day: 2,
        title: 'Día de Playa',
        description: 'Relájate en la playa privada del resort.',
        activities: ['Playa y piscina', 'Snorkel', 'Show nocturno'],
      },
      {
        day: 3,
        title: 'Excursión a Isla Mujeres',
        description: 'Día completo en la paradisíaca Isla Mujeres.',
        activities: ['Ferry a Isla Mujeres', 'Snorkel en arrecifes', 'Almuerzo en la playa'],
      },
    ],
    gallery: ['🏖️', '🌴', '🐠', '🌊', '🍹', '⛱️'],
  },
  {
    id: '3',
    slug: 'aventura-patagonia',
    name: 'Aventura en Patagonia',
    country: 'Argentina',
    continent: 'Americas',
    type: 'adventure',
    duration: 10,
    groupSize: '8-15',
    price: 2200,
    currency: 'USD',
    rating: 4.9,
    image: '🏔️',
    highlights: ['Glaciar Perito Moreno', 'El Calafate', 'Ushuaia', 'Trekking'],
    description: 'Explora la Patagonia argentina en una aventura única. Glaciares milenarios, montañas imponentes y naturaleza salvaje. Perfecto para los amantes del trekking y la aventura.',
    included: [
      'Vuelos domésticos Buenos Aires-Calafate-Ushuaia',
      'Alojamiento en lodges y hoteles',
      'Desayunos y algunas cenas',
      'Excursiones con guías especializados',
      'Entradas a parques nacionales',
      'Equipo de trekking básico',
    ],
    notIncluded: [
      'Vuelo internacional a Buenos Aires',
      'Almuerzos',
      'Equipo técnico de montaña',
      'Seguro de aventura (recomendado)',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Llegada a El Calafate',
        description: 'Arribo a la capital nacional de los glaciares.',
        activities: ['Traslado al hotel', 'Orientación del viaje', 'Cena en parrilla argentina'],
      },
      {
        day: 2,
        title: 'Glaciar Perito Moreno',
        description: 'Día completo en el impresionante glaciar.',
        activities: ['Pasarelas del glaciar', 'Mini-trekking sobre hielo', 'Navegación'],
      },
    ],
    gallery: ['🏔️', '❄️', '🥾', '🏕️', '🦅', '🌄'],
  },
  {
    id: '4',
    slug: 'japon-tradicional',
    name: 'Japón Tradicional',
    country: 'Japón',
    continent: 'Asia',
    type: 'cultural',
    duration: 12,
    groupSize: '12-18',
    price: 3200,
    currency: 'USD',
    rating: 5.0,
    image: '🗾',
    highlights: ['Tokio', 'Kioto', 'Monte Fuji', 'Templos'],
    popular: true,
    description: 'Sumérgete en la cultura japonesa más auténtica. Desde la modernidad de Tokio hasta los templos ancestrales de Kioto. Ceremonia del té, geishas y el majestuoso Monte Fuji.',
    included: [
      'Vuelos internacionales',
      'JR Pass (tren bala) 7 días',
      'Hoteles y ryokans tradicionales',
      'Desayunos diarios',
      'Guía en español',
      'Ceremonia del té',
      'Seguro de viaje',
    ],
    notIncluded: [
      'Almuerzos y cenas',
      'Entradas a templos opcionales',
      'Transporte local adicional',
      'Gastos personales',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Llegada a Tokio',
        description: 'Bienvenida a la capital japonesa.',
        activities: ['Check-in hotel', 'Shibuya Crossing', 'Cena en izakaya'],
      },
      {
        day: 2,
        title: 'Tokio Moderno',
        description: 'Explora la cara futurista de Tokio.',
        activities: ['Barrio de Akihabara', 'Torre de Tokio', 'Harajuku'],
      },
    ],
    gallery: ['🗾', '⛩️', '🏯', '🍣', '🌸', '🗻'],
  },
  // Resto de paquetes con estructura similar...
]

export function getPackageBySlug(slug: string): TravelPackage | undefined {
  return packages.find((pkg) => pkg.slug === slug)
}

export function getPackageById(id: string): TravelPackage | undefined {
  return packages.find((pkg) => pkg.id === id)
}
