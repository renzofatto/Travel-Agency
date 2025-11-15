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
  coverImage: string  // Main hero image URL
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
  gallery: string[]  // Array of image URLs
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
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',  // Paris cityscape
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
    gallery: [
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',  // Eiffel Tower
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',  // Rome Colosseum
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',  // Sagrada Familia
      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80',  // Amsterdam canals
      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&q=80',  // Louvre
      'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800&q=80',  // Versailles
    ],
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
    coverImage: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200&q=80',  // Caribbean beach
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
    gallery: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',  // Beach resort
      'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800&q=80',  // Tropical beach
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',  // Underwater snorkeling
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',  // Pool & ocean view
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',  // Tropical drinks
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',  // Beach sunset
    ],
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
    coverImage: 'https://images.unsplash.com/photo-1569619743448-4c2576b3e753?w=1200&q=80',  // Perito Moreno Glacier
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
    gallery: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',  // Patagonia mountains
      'https://images.unsplash.com/photo-1616464742257-aa0b46b8f71c?w=800&q=80',  // Glacier trekking
      'https://images.unsplash.com/photo-1562447165-8ec2d16c2bbb?w=800&q=80',  // Mountain landscape
      'https://images.unsplash.com/photo-1581110319045-22969ad02aa3?w=800&q=80',  // Ushuaia
      'https://images.unsplash.com/photo-1580628493585-b08a455412de?w=800&q=80',  // Mountain lake
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',  // Camping in nature
    ],
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
    coverImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80',  // Tokyo skyline
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
    gallery: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80',  // Kyoto temple
      'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80',  // Torii gates
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',  // Shibuya crossing
      'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&q=80',  // Mount Fuji
      'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=800&q=80',  // Cherry blossoms
      'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800&q=80',  // Japanese garden
    ],
  },
]

export function getPackageBySlug(slug: string): TravelPackage | undefined {
  return packages.find((pkg) => pkg.slug === slug)
}

export function getPackageById(id: string): TravelPackage | undefined {
  return packages.find((pkg) => pkg.id === id)
}
