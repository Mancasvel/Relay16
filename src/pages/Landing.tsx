import { motion } from 'framer-motion'
import { 
  Zap, 
  Brain, 
  Users, 
  ShoppingBag, 
  ArrowRight, 
  Github, 
  Twitter,
  Globe,
  Shield,
  Sparkles,
  MessageSquare
} from 'lucide-react'
import { Button, Card, CardBody, Chip } from '@heroui/react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Social sin Censura",
      description: "Conecta con personas reales en una red social descentralizada y resistente a la censura."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "IA Integrada",
      description: "Asistente de escritura, resúmenes automáticos y análisis de contenido con inteligencia artificial."
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Marketplace DVMCP",
      description: "Descubre y utiliza herramientas de IA descentralizadas a través del protocolo DVMCP."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacidad Total",
      description: "Tus claves, tus datos. Control total sobre tu identidad digital sin intermediarios."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 dark:to-blue-950">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Relay16
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="bordered" 
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
              <Button 
                color="primary" 
                onClick={() => navigate('/login')}
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Comenzar Gratis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Chip 
                color="primary" 
                variant="flat" 
                startContent={<Sparkles className="w-4 h-4" />}
                className="mb-6"
              >
                🚀 Bienvenido al futuro de las redes sociales
              </Chip>
              
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
                La Red Social del
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Futuro
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Relay16 combina la libertad de Nostr con el poder de la inteligencia artificial. 
                Una experiencia social descentralizada, privada y potenciada por IA.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  color="primary"
                  onClick={() => navigate('/login')}
                  endContent={<ArrowRight className="w-5 h-5" />}
                  className="px-8 py-6 text-lg"
                >
                  Empezar Ahora
                </Button>
                <Button 
                  size="lg" 
                  variant="bordered"
                  startContent={<Github className="w-5 h-5" />}
                  className="px-8 py-6 text-lg"
                >
                  Ver en GitHub
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Revoluciona tu Experiencia Social
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre las características que hacen de Relay16 la plataforma social más avanzada
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardBody className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Tecnología de Vanguardia
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Protocolo Nostr</h3>
                    <p className="text-muted-foreground">
                      Red social descentralizada y resistente a la censura. Tus datos, tus reglas.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">DVMCP Marketplace</h3>
                    <p className="text-muted-foreground">
                      Accede a herramientas de IA descentralizadas a través del protocolo DVMCP.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">IA Integrada</h3>
                    <p className="text-muted-foreground">
                      Asistente de escritura, resúmenes automáticos y análisis inteligente de contenido.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm opacity-80">En línea</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-sm opacity-80">Usuario conectado</div>
                      <div className="font-medium">¡Bienvenido a Relay16! 🚀</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-sm opacity-80">IA Assistant</div>
                      <div className="font-medium">Tu post ha sido optimizado automáticamente ✨</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              ¿Listo para Experimentar el Futuro?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Únete a miles de usuarios que ya están disfrutando de una experiencia social sin límites
            </p>
            <Button 
              size="lg"
              variant="solid"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
              onClick={() => navigate('/login')}
              endContent={<ArrowRight className="w-5 h-5" />}
            >
              Crear mi Cuenta Gratis
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">Relay16</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Button variant="light" size="sm" startContent={<Github className="w-4 h-4" />}>
                GitHub
              </Button>
              <Button variant="light" size="sm" startContent={<Twitter className="w-4 h-4" />}>
                Twitter
              </Button>
              <span className="text-sm text-muted-foreground">
                © 2024 Relay16. Construyendo el futuro descentralizado.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 