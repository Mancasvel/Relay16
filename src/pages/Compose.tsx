import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Sparkles, Eye, Type } from 'lucide-react'
import { Button, Card, CardBody, Textarea, Chip, Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/react'
import { useNostr } from '@/hooks/useNostr'
import { useAIStore } from '@/stores/ai'
import aiService from '@/services/ai'

export default function Compose() {
  const [content, setContent] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const { publishEvent } = useNostr()
  const { assistanceLoading } = useAIStore()

  const handlePublish = async () => {
    if (!content.trim()) return

    setPublishing(true)
    try {
      await publishEvent({
        content: content.trim(),
        kind: 1,
      })
      setContent('')
      // TODO: Show success message
    } catch (error) {
      console.error('Failed to publish note:', error)
      // TODO: Show error message
    } finally {
      setPublishing(false)
    }
  }

  const handleGetAISuggestions = async () => {
    if (!content.trim()) return

    setLoadingSuggestions(true)
    try {
      const assistance = await aiService.improveWriting(content)
      setAiSuggestions(assistance.suggestions)
      setShowAssistant(true)
    } catch (error) {
      console.error('Failed to get AI suggestions:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const applySuggestion = (suggestion: any) => {
    // Simple implementation - in a real app, this would be more sophisticated
    setContent(suggestion.suggestion)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Compose Note</h1>
          <p className="text-muted-foreground">
            Share your thoughts with the Nostr network
          </p>
        </div>

        <Card>
          <CardBody className="p-6">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              minRows={6}
              className="mb-4"
              variant="flat"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{content.length} characters</span>
                {content.length > 280 && (
                  <Chip size="sm" color="warning">
                    Long note
                  </Chip>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="bordered"
                  size="sm"
                  startContent={<Sparkles size={16} />}
                  onClick={handleGetAISuggestions}
                  disabled={!content.trim() || loadingSuggestions}
                  isLoading={loadingSuggestions}
                >
                  AI Assist
                </Button>

                <Button
                  color="primary"
                  startContent={<Send size={16} />}
                  onClick={handlePublish}
                  disabled={!content.trim() || publishing}
                  isLoading={publishing}
                >
                  Publish
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* AI Writing Assistant Modal */}
        <Modal 
          isOpen={showAssistant} 
          onClose={() => setShowAssistant(false)}
          size="2xl"
        >
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center space-x-2">
                <Sparkles size={20} className="text-blue-500" />
                <span>AI Writing Assistant</span>
              </div>
            </ModalHeader>
            <ModalBody className="pb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Suggestions</h4>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <Card key={index} className="p-3 cursor-pointer hover:bg-muted/50" onClick={() => applySuggestion(suggestion)}>
                        <div className="flex items-start space-x-2">
                          <Type size={16} className="text-blue-500 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium capitalize">{suggestion.type}</span>
                              <Chip size="sm" variant="flat">{Math.round(suggestion.confidence * 100)}%</Chip>
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </motion.div>
    </div>
  )
} 