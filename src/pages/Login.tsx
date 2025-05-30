import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Key, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Zap,
  Shield,
  Sparkles,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Copy
} from 'lucide-react'
import { 
  Button, 
  Card, 
  CardBody, 
  Input, 
  Textarea,
  Tabs, 
  Tab,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress
} from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { useNostr } from '@/hooks/useNostr'
import { useNostrStore } from '@/stores/nostr'

export default function Login() {
  const navigate = useNavigate()
  const { generateKeys, importPrivateKey } = useNostr()
  const { setUserKeys, setCurrentUser } = useNostrStore()
  
  const [activeTab, setActiveTab] = useState<string>('generate')
  const [privateKey, setPrivateKey] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatedKeys, setGeneratedKeys] = useState<{ privateKey: string; publicKey: string } | null>(null)
  const [showKeysModal, setShowKeysModal] = useState(false)
  const [keysSaved, setKeysSaved] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateKeys = async () => {
    setLoading(true)
    setError('')
    
    try {
      const keys = generateKeys()
      setGeneratedKeys(keys)
      setShowKeysModal(true)
    } catch (error) {
      setError('Error al generar las claves. Inténtalo de nuevo.')
      console.error('Error generating keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportKeys = async () => {
    if (!privateKey.trim()) {
      setError('Por favor ingresa tu clave privada')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const keys = importPrivateKey(privateKey.trim())
      setUserKeys(keys)
      setCurrentUser({ pubkey: keys.publicKey, privkey: keys.privateKey })
      navigate('/feed')
    } catch (error) {
      setError('Clave privada inválida. Verifica el formato.')
      console.error('Error importing keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveKeys = () => {
    if (!generatedKeys) return
    
    setUserKeys(generatedKeys)
    setCurrentUser({ pubkey: generatedKeys.publicKey, privkey: generatedKeys.privateKey })
    setShowKeysModal(false)
    navigate('/feed')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setKeysSaved(true)
      setTimeout(() => setKeysSaved(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const downloadKeys = () => {
    if (!generatedKeys) return
    
    const content = `Relay16 - Claves Nostr
    
Clave Pública: ${generatedKeys.publicKey}
Clave Privada: ${generatedKeys.privateKey}

⚠️  IMPORTANTE: Guarda estas claves en un lugar seguro. Son tu identidad digital y no pueden ser recuperadas si las pierdes.

📱 Para mayor seguridad, considera usar un gestor de contraseñas.
🔐 Nunca compartas tu clave privada con nadie.
`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relay16-nostr-keys.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50 dark:to-blue-950">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button 
              variant="light" 
              startContent={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/')}
            >
              Volver
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">Relay16</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Accede a tu Identidad Digital
          </h1>
          <p className="text-lg text-muted-foreground">
            Genera nuevas claves Nostr o importa las existentes para comenzar
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="w-full">
            <CardBody className="p-8">
              <Tabs 
                selectedKey={activeTab} 
                onSelectionChange={(key) => setActiveTab(key as string)}
                className="w-full"
                classNames={{
                  tabList: "grid w-full grid-cols-2 gap-2 rounded-lg bg-muted p-1",
                  cursor: "w-full bg-background",
                  tab: "w-full px-3 py-2 text-sm font-medium",
                }}
              >
                <Tab 
                  key="generate" 
                  title={
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Generar Nuevas</span>
                    </div>
                  }
                >
                  <div className="mt-6 space-y-6">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                          <Key className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Generar Claves Nostr</h3>
                      <p className="text-muted-foreground mb-6">
                        Crea una nueva identidad digital con claves criptográficas seguras
                      </p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium mb-1">Seguridad garantizada</div>
                          <div className="text-muted-foreground">
                            Las claves se generan localmente en tu dispositivo usando criptografía estándar
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <span className="text-red-700 dark:text-red-300">{error}</span>
                        </div>
                      </div>
                    )}

                    <Button 
                      color="primary" 
                      size="lg"
                      className="w-full"
                      onClick={handleGenerateKeys}
                      isLoading={loading}
                      startContent={!loading && <Sparkles className="w-5 h-5" />}
                    >
                      {loading ? 'Generando...' : 'Generar Mis Claves'}
                    </Button>
                  </div>
                </Tab>

                <Tab 
                  key="import" 
                  title={
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Importar Existentes</span>
                    </div>
                  }
                >
                  <div className="mt-6 space-y-6">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Importar Claves</h3>
                      <p className="text-muted-foreground mb-6">
                        Usa tu clave privada existente para acceder a tu identidad Nostr
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <Textarea
                          label="Clave Privada"
                          placeholder="Pega tu clave privada aquí (formato hex)..."
                          value={privateKey}
                          onChange={(e) => setPrivateKey(e.target.value)}
                          type={showPrivateKey ? 'text' : 'password'}
                          minRows={3}
                        />
                        <Button
                          size="sm"
                          variant="light"
                          className="absolute top-2 right-2"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                        >
                          {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                          <div className="text-sm">
                            <div className="font-medium mb-1 text-amber-700 dark:text-amber-300">Mantén tu clave segura</div>
                            <div className="text-amber-600 dark:text-amber-400">
                              Nunca compartas tu clave privada. Es como la contraseña de tu identidad digital.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <span className="text-red-700 dark:text-red-300">{error}</span>
                        </div>
                      </div>
                    )}

                    <Button 
                      color="primary" 
                      size="lg"
                      className="w-full"
                      onClick={handleImportKeys}
                      isLoading={loading}
                      isDisabled={!privateKey.trim()}
                      startContent={!loading && <Upload className="w-5 h-5" />}
                    >
                      {loading ? 'Importando...' : 'Importar e Iniciar Sesión'}
                    </Button>
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground">
            Al continuar, aceptas nuestra política de privacidad y términos de uso
          </p>
        </motion.div>
      </div>

      {/* Keys Generated Modal */}
      <Modal 
        isOpen={showKeysModal} 
        onClose={() => setShowKeysModal(false)}
        size="2xl"
        closeButton={false}
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span>¡Claves Generadas Exitosamente!</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium mb-1 text-red-700 dark:text-red-300">⚠️ Muy Importante</div>
                    <div className="text-red-600 dark:text-red-400">
                      Guarda estas claves de forma segura. Son tu única forma de acceder a tu cuenta. No podemos recuperarlas si las pierdes.
                    </div>
                  </div>
                </div>
              </div>

              {generatedKeys && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Clave Pública (compartible)</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Input
                        value={generatedKeys.publicKey}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="bordered"
                        onClick={() => copyToClipboard(generatedKeys.publicKey)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Clave Privada (mantener secreta)</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Input
                        value={generatedKeys.privateKey}
                        type={showPrivateKey ? 'text' : 'password'}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="bordered"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                      >
                        {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="bordered"
                        onClick={() => copyToClipboard(generatedKeys.privateKey)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="bordered"
                  startContent={<Download className="w-4 h-4" />}
                  onClick={downloadKeys}
                >
                  Descargar como Archivo
                </Button>
                
                {keysSaved && (
                  <Chip color="success" startContent={<CheckCircle className="w-4 h-4" />}>
                    ¡Copiado!
                  </Chip>
                )}
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="text-sm text-green-700 dark:text-green-300">
                  <div className="font-medium mb-2">Recomendaciones de seguridad:</div>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Guarda una copia en un gestor de contraseñas</li>
                    <li>Haz una copia de seguridad offline</li>
                    <li>Nunca compartas tu clave privada</li>
                    <li>Considera usar un hardware wallet para mayor seguridad</li>
                  </ul>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              size="lg"
              onClick={handleSaveKeys}
              className="w-full"
            >
              He Guardado mis Claves - Continuar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
} 