import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plane, Users, Calendar, DollarSign, FileText, Camera } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">TravelHub</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Comenzar Gratis</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Organiza tus viajes grupales
          <br />
          de manera simple
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          La plataforma completa para planificar, gestionar y disfrutar viajes en grupo.
          Cronogramas, gastos compartidos, documentos y mucho más.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-8">
              Crear cuenta gratis
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Todo lo que necesitas para tu viaje grupal
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Gestión de Grupos</CardTitle>
              <CardDescription>
                Crea grupos de viaje con amigos, familia o desconocidos.
                Asigna líderes y administra miembros fácilmente.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Cronograma Colaborativo</CardTitle>
              <CardDescription>
                Planifica actividades día a día con horarios, ubicaciones y categorías.
                Reorganiza con drag & drop.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>División de Gastos</CardTitle>
              <CardDescription>
                Sistema tipo Splitwise integrado. Registra gastos, divide entre miembros
                y ve quién debe a quién.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Documentos Centralizados</CardTitle>
              <CardDescription>
                Guarda pasajes, reservas de hotel, tickets de actividades y más.
                Todo en un solo lugar accesible para el grupo.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>Galería Compartida</CardTitle>
              <CardDescription>
                Todos los miembros pueden subir fotos del viaje.
                Comenta y revive los mejores momentos juntos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Notas Colaborativas</CardTitle>
              <CardDescription>
                Espacio para recomendaciones, listas de equipaje y cualquier
                información importante del viaje.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="pt-10 pb-10">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para organizar tu próximo viaje?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Únete ahora y comienza a planificar viajes inolvidables
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Comenzar Gratis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 TravelHub. Organiza tus viajes con facilidad.</p>
        </div>
      </footer>
    </div>
  )
}
