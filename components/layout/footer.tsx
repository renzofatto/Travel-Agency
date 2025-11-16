import { Plane } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Plane className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TravelHub
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Tu agencia de viajes digital. Organizamos experiencias inolvidables.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900">Servicios</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Paquetes Personalizados</li>
              <li>Viajes Grupales</li>
              <li>Reservas & Hoteles</li>
              <li>Asistencia 24/7</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900">Plataforma</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Gestión de Grupos</li>
              <li>Itinerarios</li>
              <li>Control de Gastos</li>
              <li>Documentos</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>info@travelhub.com</li>
              <li>+54 11 1234-5678</li>
              <li>Lun-Vie 9:00-18:00</li>
              <li>Asistencia 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-sm text-gray-600">
          <p>© 2024 TravelHub. Todos los derechos reservados.</p>
          <p className="mt-2">Hecho con ❤️ para viajeros como vos</p>
        </div>
      </div>
    </footer>
  )
}
