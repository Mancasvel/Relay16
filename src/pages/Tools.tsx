import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Shield, 
  TrendingUp,
  Search,
  Filter,
  Star,
  Zap,
  Clock,
  ArrowRight,
  Coins,
  Users
} from 'lucide-react'
import { 
  Button, 
  Card, 
  CardBody, 
  Input, 
  Tabs, 
  Tab,
  Chip,
  Avatar,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Select,
  SelectItem
} from '@heroui/react'
import { useDVMCP } from '@/hooks/useDVMCP'
import { useAIStore } from '@/stores/ai'
import { DVMCPProvider, DVMCPRequest } from '@/types/dvmcp'

// Custom provider interface for the marketplace mockup
interface DVMProvider {
  id: string
  name: string
  description: string
  category: string
  rating: number
  usageCount: number
  price: { amount: number; currency: string }
  responseTime: string
  accuracy: number
  provider: {
    name: string
    verified: boolean
    pubkey: string
  }
  capabilities: string[]
  tags: string[]
}

export default function Tools() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTool, setSelectedTool] = useState<DVMProvider | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestInput, setRequestInput] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)
  
  const { 
    requestTool, 
    isDiscovering: loading,
    availableTools,
    activeProviders
  } = useDVMCP()
  
  const { services } = useAIStore()

  useEffect(() => {
    // Tools are auto-discovered by the hook
  }, [])

  const categories = [
    { key: 'all', label: 'Todos', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'text-generation', label: 'Generación de Texto', icon: <FileText className="w-4 h-4" /> },
    { key: 'analysis', label: 'Análisis', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'moderation', label: 'Moderación', icon: <Shield className="w-4 h-4" /> },
    { key: 'translation', label: 'Traducción', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'ai-assistant', label: 'Asistente IA', icon: <Brain className="w-4 h-4" /> },
  ]

  const mockProviders: DVMProvider[] = [
    {
      id: 'text-summarizer-pro',
      name: 'Text Summarizer Pro',
      description: 'Resúmenes automáticos de textos largos con alta precisión y contexto preservado.',
      category: 'analysis',
      rating: 4.8,
      usageCount: 1240,
      price: { amount: 100, currency: 'sats' },
      responseTime: 'avg 2s',
      accuracy: 0.95,
      provider: {
        name: 'AI Labs',
        verified: true,
        pubkey: 'npub1...'
      },
      capabilities: ['text-summarization', 'multi-language', 'context-preservation'],
      tags: ['summary', 'analysis', 'productivity']
    },
    {
      id: 'sentiment-analyzer',
      name: 'Sentiment Analyzer',
      description: 'Análisis de sentimientos avanzado para textos, posts y conversaciones.',
      category: 'analysis',
      rating: 4.6,
      usageCount: 856,
      price: { amount: 50, currency: 'sats' },
      responseTime: 'avg 1s',
      accuracy: 0.92,
      provider: {
        name: 'DataMind',
        verified: true,
        pubkey: 'npub2...'
      },
      capabilities: ['sentiment-analysis', 'emotion-detection', 'batch-processing'],
      tags: ['sentiment', 'emotions', 'social']
    },
    {
      id: 'content-moderator',
      name: 'Content Moderator',
      description: 'Moderación automatizada de contenido con detección de spam, toxicidad y contenido inapropiado.',
      category: 'moderation',
      rating: 4.9,
      usageCount: 2103,
      price: { amount: 75, currency: 'sats' },
      responseTime: 'avg 1.5s',
      accuracy: 0.97,
      provider: {
        name: 'SafeNet AI',
        verified: true,
        pubkey: 'npub3...'
      },
      capabilities: ['spam-detection', 'toxicity-analysis', 'content-classification'],
      tags: ['moderation', 'safety', 'automation']
    },
    {
      id: 'writing-assistant',
      name: 'Writing Assistant',
      description: 'Asistente de escritura que mejora tus textos con sugerencias de estilo, gramática y claridad.',
      category: 'text-generation',
      rating: 4.7,
      usageCount: 967,
      price: { amount: 125, currency: 'sats' },
      responseTime: 'avg 3s',
      accuracy: 0.94,
      provider: {
        name: 'WriteSmart',
        verified: false,
        pubkey: 'npub4...'
      },
      capabilities: ['grammar-check', 'style-improvement', 'clarity-enhancement'],
      tags: ['writing', 'grammar', 'improvement']
    },
    {
      id: 'translator-pro',
      name: 'Translator Pro',
      description: 'Traductor multiidioma con preservación de contexto y tono para más de 50 idiomas.',
      category: 'translation',
      rating: 4.5,
      usageCount: 1456,
      price: { amount: 80, currency: 'sats' },
      responseTime: 'avg 2.5s',
      accuracy: 0.91,
      provider: {
        name: 'LinguaAI',
        verified: true,
        pubkey: 'npub5...'
      },
      capabilities: ['multi-language', 'context-preservation', 'tone-matching'],
      tags: ['translation', 'languages', 'communication']
    },
    {
      id: 'ai-conversationalist',
      name: 'AI Conversationalist',
      description: 'Chatbot inteligente para conversaciones naturales y asistencia personalizada.',
      category: 'ai-assistant',
      rating: 4.4,
      usageCount: 789,
      price: { amount: 150, currency: 'sats' },
      responseTime: 'avg 4s',
      accuracy: 0.89,
      provider: {
        name: 'ConvoBot',
        verified: false,
        pubkey: 'npub6...'
      },
      capabilities: ['natural-conversation', 'context-awareness', 'personalization'],
      tags: ['chatbot', 'conversation', 'assistant']
    }
  ]

  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleRequestTool = async () => {
    if (!selectedTool || !requestInput.trim()) return
    
    setRequestLoading(true)
    try {
      const result = await requestTool(selectedTool.id, {
        text: requestInput,
        context: 'marketplace_request'
      })
      
      console.log('Tool result:', result)
      setShowRequestModal(false)
      setRequestInput('')
      setSelectedTool(null)
    } catch (error) {
      console.error('Error requesting tool:', error)
    } finally {
      setRequestLoading(false)
    }
  }

  const openRequestModal = (tool: DVMProvider) => {
    setSelectedTool(tool)
    setShowRequestModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Marketplace DVMCP</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Descubre y utiliza herramientas de IA descentralizadas. Conecta con proveedores de servicios 
          y potencia tu experiencia con inteligencia artificial avanzada.
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex-1">
          <Input
            placeholder="Buscar herramientas, categorías o funcionalidades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4 text-muted-foreground" />}
            classNames={{
              input: "text-sm",
              inputWrapper: "bg-background border-2 border-border hover:border-primary/50"
            }}
          />
        </div>
        <Select
          placeholder="Categoría"
          selectedKeys={[selectedCategory]}
          onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string)}
          className="w-full sm:w-48"
          startContent={<Filter className="w-4 h-4" />}
        >
          {categories.map(category => (
            <SelectItem key={category.key} textValue={category.label}>
              <div className="flex items-center space-x-2">
                {category.icon}
                <span>{category.label}</span>
              </div>
            </SelectItem>
          ))}
        </Select>
      </motion.div>

      {/* Categories Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Tabs 
          selectedKey={selectedCategory} 
          onSelectionChange={(key) => setSelectedCategory(key as string)}
          className="w-full"
          variant="underlined"
        >
          {categories.map(category => (
            <Tab 
              key={category.key} 
              title={
                <div className="flex items-center space-x-2">
                  {category.icon}
                  <span className="hidden sm:inline">{category.label}</span>
                </div>
              }
            />
          ))}
        </Tabs>
      </motion.div>

      {/* Tools Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredProviders.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{tool.provider.name}</span>
                        {tool.provider.verified && (
                          <Badge content="" color="primary" size="sm" className="p-0">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{tool.rating}</span>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {tool.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.tags.slice(0, 3).map((tag: string) => (
                    <Chip key={tag} size="sm" variant="flat" color="primary">
                      {tag}
                    </Chip>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{tool.responseTime}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{tool.usageCount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{tool.price.amount} {tool.price.currency}</span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      color="primary"
                      onClick={() => openRequestModal(tool)}
                      endContent={<ArrowRight className="w-4 h-4" />}
                    >
                      Usar
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredProviders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12"
        >
          <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No se encontraron herramientas</h3>
          <p className="text-muted-foreground">
            Intenta ajustar tu búsqueda o explorar diferentes categorías
          </p>
        </motion.div>
      )}

      {/* Request Tool Modal */}
      <Modal 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{selectedTool?.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedTool?.provider.name}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Descripción:</p>
                <p className="text-sm">{selectedTool?.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Tiempo de respuesta</span>
                  </div>
                  <span className="text-muted-foreground">{selectedTool?.responseTime}</span>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Coins className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">Costo</span>
                  </div>
                  <span className="text-muted-foreground">
                    {selectedTool?.price.amount} {selectedTool?.price.currency}
                  </span>
                </div>
              </div>

              <Textarea
                label="Texto a procesar"
                placeholder="Ingresa el contenido que deseas procesar con esta herramienta..."
                value={requestInput}
                onChange={(e) => setRequestInput(e.target.value)}
                minRows={4}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={() => setShowRequestModal(false)}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleRequestTool}
              isLoading={requestLoading}
              isDisabled={!requestInput.trim()}
              startContent={!requestLoading && <Zap className="w-4 h-4" />}
            >
              {requestLoading ? 'Procesando...' : `Usar por ${selectedTool?.price.amount} sats`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
} 