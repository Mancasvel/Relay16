import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon, 
  Wifi, 
  Brain, 
  Key, 
  User, 
  Shield, 
  Palette,
  Bell,
  Download,
  Upload,
  Trash2,
  Plus,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader,
  Input, 
  Switch, 
  Tabs, 
  Tab,
  Textarea,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip
} from '@heroui/react'
import { useNostr } from '@/hooks/useNostr'
import { useNostrStore } from '@/stores/nostr'
import { useAIStore } from '@/stores/ai'
import { NostrRelay } from '@/types/nostr'

export default function Settings() {
  const [newRelayUrl, setNewRelayUrl] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('system')
  const [notifications, setNotifications] = useState({
    mentions: true,
    replies: true,
    reactions: true,
    follows: true
  })
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const { 
    connectToRelay, 
    disconnectFromRelay, 
    generateKeyPair,
    importPrivateKey,
    isConnected 
  } = useNostr()
  
  const { 
    relays, 
    currentUser,
    setCurrentUser 
  } = useNostrStore()
  
  const { 
    openRouterConfig,
    setOpenRouterConfig 
  } = useAIStore()

  useEffect(() => {
    if (openRouterConfig.apiKey) {
      setOpenRouterKey(openRouterConfig.apiKey)
    }
  }, [openRouterConfig])

  const handleAddRelay = async () => {
    if (!newRelayUrl.trim()) return
    
    try {
      await connectToRelay(newRelayUrl.trim())
      setNewRelayUrl('')
    } catch (error) {
      console.error('Failed to add relay:', error)
    }
  }

  const handleRemoveRelay = async (url: string) => {
    try {
      await disconnectFromRelay(url)
    } catch (error) {
      console.error('Failed to remove relay:', error)
    }
  }

  const handleGenerateKeys = async () => {
    try {
      const keyPair = await generateKeyPair()
      console.log('Generated new key pair:', keyPair)
    } catch (error) {
      console.error('Failed to generate keys:', error)
    }
  }

  const handleImportKey = async (privateKey: string) => {
    try {
      await importPrivateKey(privateKey)
      onClose()
    } catch (error) {
      console.error('Failed to import key:', error)
    }
  }

  const handleSaveOpenRouterKey = () => {
    setOpenRouterConfig({
      ...openRouterConfig,
      apiKey: openRouterKey
    })
  }

  const handleExportData = () => {
    const data = {
      relays: Object.values(relays),
      user: currentUser,
      settings: {
        theme: selectedTheme,
        notifications
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relay16-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        // TODO: Implement data import logic
        console.log('Import data:', data)
      } catch (error) {
        console.error('Failed to import data:', error)
      }
    }
    reader.readAsText(file)
  }

  const RelayCard = ({ relay }: { relay: NostrRelay }) => (
    <Card className="mb-3">
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${relay.connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <p className="font-medium">{relay.url}</p>
              <p className="text-sm text-muted-foreground">
                {relay.connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            color="danger"
            startContent={<Trash2 size={16} />}
            onClick={() => handleRemoveRelay(relay.url)}
          >
            Remove
          </Button>
        </div>
      </CardBody>
    </Card>
  )

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your Nostr identity, relays, and preferences
        </p>
      </div>

      <Tabs className="w-full">
        {/* Identity Tab */}
        <Tab 
          key="identity" 
          title={
            <div className="flex items-center space-x-2">
              <User size={16} />
              <span>Identity</span>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Current User */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Your Identity</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                {currentUser ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Public Key</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={currentUser.pubkey}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigator.clipboard.writeText(currentUser.pubkey)}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Private Key</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type={showPrivateKey ? 'text' : 'password'}
                          value={currentUser.privkey || ''}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                        >
                          {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Keep your private key secure. Never share it with anyone.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Key size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Identity</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate a new key pair or import an existing one to get started.
                    </p>
                    <div className="flex justify-center space-x-3">
                      <Button onClick={handleGenerateKeys}>
                        Generate New Keys
                      </Button>
                      <Button variant="ghost" onClick={onOpen}>
                        Import Private Key
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* Relays Tab */}
        <Tab 
          key="relays" 
          title={
            <div className="flex items-center space-x-2">
              <Wifi size={16} />
              <span>Relays</span>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Add Relay */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Add Relay</h3>
              </CardHeader>
              <CardBody>
                <div className="flex space-x-3">
                  <Input
                    placeholder="wss://relay.example.com"
                    value={newRelayUrl}
                    onChange={(e) => setNewRelayUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddRelay}
                    startContent={<Plus size={16} />}
                  >
                    Add
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Relay List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Connected Relays</h3>
                  <Chip size="sm" variant="flat">
                    {Object.values(relays).filter(r => r.connected).length} connected
                  </Chip>
                </div>
              </CardHeader>
              <CardBody>
                {Object.values(relays).length > 0 ? (
                  <div className="space-y-3">
                    {Object.values(relays).map((relay) => (
                      <RelayCard key={relay.url} relay={relay} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wifi size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Relays</h3>
                    <p className="text-muted-foreground">
                      Add relays to connect to the Nostr network.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* AI Services Tab */}
        <Tab 
          key="ai" 
          title={
            <div className="flex items-center space-x-2">
              <Brain size={16} />
              <span>AI Services</span>
            </div>
          }
        >
          <div className="space-y-6">
            {/* OpenRouter Configuration */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">OpenRouter API</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <Input
                    label="API Key"
                    type="password"
                    placeholder="sk-or-..."
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your API key from{' '}
                    <a 
                      href="https://openrouter.ai" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      openrouter.ai
                    </a>
                  </p>
                </div>
                
                <Button onClick={handleSaveOpenRouterKey}>
                  Save API Key
                </Button>
              </CardBody>
            </Card>

            {/* AI Features */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">AI Features</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-summarize long threads</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically summarize conversations with many replies
                    </p>
                  </div>
                  <Switch defaultSelected />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Writing assistance</p>
                    <p className="text-sm text-muted-foreground">
                      Get AI suggestions when composing notes
                    </p>
                  </div>
                  <Switch defaultSelected />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Content analysis</p>
                    <p className="text-sm text-muted-foreground">
                      Analyze sentiment and topics in your feed
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        {/* Preferences Tab */}
        <Tab 
          key="preferences" 
          title={
            <div className="flex items-center space-x-2">
              <SettingsIcon size={16} />
              <span>Preferences</span>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Appearance */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Appearance</h3>
              </CardHeader>
              <CardBody>
                <Select
                  label="Theme"
                  selectedKeys={[selectedTheme]}
                  onSelectionChange={(keys) => setSelectedTheme(Array.from(keys)[0] as string)}
                >
                  <SelectItem key="light">Light</SelectItem>
                  <SelectItem key="dark">Dark</SelectItem>
                  <SelectItem key="system">System</SelectItem>
                </Select>
              </CardBody>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Notifications</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mentions</p>
                    <p className="text-sm text-muted-foreground">
                      When someone mentions you
                    </p>
                  </div>
                  <Switch 
                    isSelected={notifications.mentions}
                    onValueChange={(checked) => setNotifications(prev => ({ ...prev, mentions: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Replies</p>
                    <p className="text-sm text-muted-foreground">
                      When someone replies to your notes
                    </p>
                  </div>
                  <Switch 
                    isSelected={notifications.replies}
                    onValueChange={(checked) => setNotifications(prev => ({ ...prev, replies: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reactions</p>
                    <p className="text-sm text-muted-foreground">
                      When someone reacts to your notes
                    </p>
                  </div>
                  <Switch 
                    isSelected={notifications.reactions}
                    onValueChange={(checked) => setNotifications(prev => ({ ...prev, reactions: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Follows</p>
                    <p className="text-sm text-muted-foreground">
                      When someone follows you
                    </p>
                  </div>
                  <Switch 
                    isSelected={notifications.follows}
                    onValueChange={(checked) => setNotifications(prev => ({ ...prev, follows: checked }))}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Data Management</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex space-x-3">
                  <Button 
                    variant="ghost"
                    startContent={<Download size={16} />}
                    onClick={handleExportData}
                  >
                    Export Data
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    startContent={<Upload size={16} />}
                    onClick={() => document.getElementById('import-file')?.click()}
                  >
                    Import Data
                  </Button>
                  
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </div>
                
                <Button 
                  color="danger"
                  variant="ghost"
                  startContent={<Trash2 size={16} />}
                >
                  Clear All Data
                </Button>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>

      {/* Import Private Key Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Import Private Key</ModalHeader>
          <ModalBody>
            <Textarea
              label="Private Key"
              placeholder="Enter your private key (hex format)"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Your private key will be stored locally and never shared.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={() => handleImportKey('')}>
              Import
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
} 