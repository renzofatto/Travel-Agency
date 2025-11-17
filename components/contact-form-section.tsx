'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { contact, guarantees, getFormspreeEndpoint } from '@/lib/config/company'

export default function ContactFormSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch(getFormspreeEndpoint(), {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast.success('¡Mensaje enviado! Te contactaremos pronto.')
        form.reset()

        // Reset submitted state after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000)
      } else {
        toast.error('Hubo un error. Por favor intentá de nuevo.')
      }
    } catch (error) {
      toast.error('Error al enviar el mensaje. Verificá tu conexión.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contacto" className="relative py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 text-base px-6 py-2">
            <Mail className="w-4 h-4 mr-2" />
            Contacto
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            ¿Listo para tu
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {' '}
              próximo viaje
            </span>
            ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Contanos tus ideas y nosotros nos encargamos de hacerlas realidad.
            Te respondemos en menos de 24 horas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Hablemos de tu viaje</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Ya sea que tengas un destino en mente o necesites inspiración,
                estamos acá para ayudarte a planificar la experiencia perfecta.
              </p>
            </div>

            {/* Contact cards */}
            <div className="space-y-4">
              <div className="group flex items-start gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
                <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                  <a href={`mailto:${contact.email}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
                <div className="p-3 rounded-xl bg-purple-100 group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-300">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Teléfono</h4>
                  <a href={`tel:${contact.phoneRaw}`} className="text-gray-600 hover:text-purple-600 transition-colors">
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300">
                <div className="p-3 rounded-xl bg-pink-100 group-hover:bg-pink-200 group-hover:scale-110 transition-all duration-300">
                  <MapPin className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Ubicación</h4>
                  <p className="text-gray-600">
                    {contact.address.full}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {guarantees.responseTime}
                </p>
                <p className="text-sm text-gray-600 mt-1">Tiempo de respuesta</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {guarantees.customization}
                </p>
                <p className="text-sm text-gray-600 mt-1">Atención personalizada</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="relative">
            {/* Form card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-8 md:p-10">
              {/* Gradient border effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500 pointer-events-none" />

              <form onSubmit={handleSubmit} className="relative space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Juan Pérez"
                    className="w-full bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="juan@ejemplo.com"
                    className="w-full bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={contact.phone}
                    className="w-full bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Contanos sobre tu próximo viaje: destino, fechas, cantidad de personas..."
                    className="w-full bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl text-lg py-6 font-bold group/btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      ¡Mensaje enviado!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover/btn:translate-x-1 transition-transform" />
                      Enviar mensaje
                    </>
                  )}

                  {/* Shine effect */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  Al enviar este formulario, aceptás nuestra política de privacidad.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
