import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Settings, 
  MessageCircle, 
  Users, 
  Calendar, 
  MapPin, 
  Link as LinkIcon,
  Edit3,
  Copy,
  Check,
  Sparkles,
  Edit,
  ExternalLink,
  MoreVertical,
  Heart,
  Repeat2
} from 'lucide-react'
import { 
  Button, 
  Card, 
  CardBody, 
  Chip, 
  Tabs, 
  Tab,
  Spinner,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@heroui/react'
import { useNostr } from '@/hooks/useNostr'
import { useNostrStore } from '@/stores/nostr'
import { useDVMCP } from '@/hooks/useDVMCP'
import { NostrKind, UserProfile } from '@/types/nostr'
import { formatTimeAgo, truncateText } from '@/lib/utils'

export default function Profile() {
  const { pubkey: targetPubkey } = useParams<{ pubkey?: string }>()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editProfile, setEditProfile] = useState<Partial<UserProfile>>({})
  
  const { 
    publishEvent, 
    subscribeToProfile, 
    subscribeToUserNotes,
    isConnected,
    currentUser,
    updateProfile
  } = useNostr()
  
  const { 
    profiles, 
    notes, 
    setProfileLoading, 
    profileLoading,
    userProfile
  } = useNostrStore()
  
  const { requestTool } = useDVMCP()

  // Determine if this is the current user's profile
  const isOwnProfile = !targetPubkey || targetPubkey === currentUser?.pubkey
  const profile = targetPubkey ? profiles.get(targetPubkey) : userProfile
  const userNotes = notes.filter(note => 
    isOwnProfile 
      ? note.pubkey === currentUser?.pubkey
      : note.pubkey === targetPubkey
  )

  useEffect(() => {
    if (targetPubkey && isConnected) {
      loadProfile()
    }
  }, [targetPubkey, isConnected])

  const loadProfile = async () => {
    if (!targetPubkey || !isConnected) return
    
    setProfileLoading(true)
    try {
      // Subscribe to profile metadata
      const unsubProfile = subscribeToProfile(targetPubkey)
      
      // Subscribe to user's notes
      const unsubNotes = subscribeToUserNotes(targetPubkey)
      
      // Auto-unsubscribe after 10 seconds
      setTimeout(() => {
        unsubProfile()
        unsubNotes()
        setProfileLoading(false)
      }, 10000)
    } catch (error) {
      console.error('Failed to load profile:', error)
      setProfileLoading(false)
    }
  }

  const handleCopyPubkey = async () => {
    const pubkey = targetPubkey || currentUser?.pubkey
    if (pubkey) {
      try {
        await navigator.clipboard.writeText(pubkey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy pubkey:', error)
      }
    }
  }

  const handleEditProfile = async () => {
    try {
      await updateProfile(editProfile)
      setShowEditModal(false)
      setEditProfile({})
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const openEditModal = () => {
    setEditProfile({
      name: profile?.name || '',
      about: profile?.about || '',
      picture: profile?.picture || '',
      website: profile?.website || '',
      nip05: profile?.nip05 || '',
    })
    setShowEditModal(true)
  }

  const handleAnalyzeProfile = async () => {
    if (!targetPubkey) return
    
    try {
      const analysisResult = await requestTool('sentiment-analysis', {
        texts: userNotes.slice(0, 10).map(note => note.content),
        context: 'user_profile_analysis'
      })
      
      console.log('Profile analysis:', analysisResult)
      // TODO: Show analysis in a modal or dedicated section
    } catch (error) {
      console.error('Failed to analyze profile:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Spinner size="lg" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Connecting to Nostr Network</h3>
          <p className="text-muted-foreground">Please wait while we establish connections...</p>
        </div>
      </div>
    )
  }

  if (!targetPubkey) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium">No Profile Selected</h3>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/settings')}
          >
            Go to Settings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6">
          <CardBody className="p-0">
            {/* Banner */}
            <div 
              className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative"
              style={{
                backgroundImage: profile?.banner ? `url(${profile.banner})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {isOwnProfile && (
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Edit3 size={16} />}
                  className="absolute top-4 right-4"
                  onClick={openEditModal}
                >
                  Edit Profile
                </Button>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar
                  src={profile?.picture}
                  name={profile?.name || profile?.display_name || 'User'}
                  size="lg"
                  className="flex-shrink-0 -mt-8 border-4 border-background"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">
                        {profile?.display_name || profile?.name || 'Anonymous'}
                      </h1>
                      {profile?.name && profile?.display_name && (
                        <p className="text-muted-foreground">@{profile.name}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        startContent={copied ? <Check size={16} /> : <Copy size={16} />}
                        onClick={handleCopyPubkey}
                      >
                        {copied ? 'Copied!' : 'Copy Pubkey'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        startContent={<Sparkles size={16} />}
                        onClick={handleAnalyzeProfile}
                      >
                        AI Analysis
                      </Button>
                    </div>
                  </div>
                  
                  {profile?.about && (
                    <p className="mt-3 text-sm whitespace-pre-wrap">
                      {profile.about}
                    </p>
                  )}
                  
                  {/* Profile Details */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                    {profile?.website && (
                      <div className="flex items-center space-x-1">
                        <LinkIcon size={14} />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-foreground"
                        >
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    
                    {profile?.nip05 && (
                      <div className="flex items-center space-x-1">
                        <Check size={14} className="text-green-500" />
                        <span>{profile.nip05}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>Member since 2024</span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="text-center">
                      <div className="font-bold">{userNotes.length}</div>
                      <div className="text-xs text-muted-foreground">Notes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">0</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">0</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Profile Tabs */}
      <Tabs 
        selectedKey={activeTab} 
        onSelectionChange={(key) => setActiveTab(key as string)}
        className="w-full"
      >
        <Tab key="notes" title="Notes">
          <div className="space-y-4">
            {profileLoading && userNotes.length === 0 ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="shimmer">
                    <CardBody className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded loading-pulse w-full" />
                        <div className="h-4 bg-muted rounded loading-pulse w-2/3" />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : userNotes.length > 0 ? (
              userNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(note.created_at)}
                        </span>
                      </div>
                      
                      <p className="whitespace-pre-wrap break-words mb-3">
                        {note.content}
                      </p>
                      
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag, index) => (
                            <Chip key={index} size="sm" variant="flat">
                              #{tag[1] || tag[0]}
                            </Chip>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Start sharing your thoughts!" : "This user hasn't posted any notes yet."}
                </p>
              </div>
            )}
          </div>
        </Tab>
        
        <Tab key="replies" title="Replies">
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No replies yet</h3>
            <p className="text-muted-foreground">Replies will appear here.</p>
          </div>
        </Tab>
        
        <Tab key="media" title="Media">
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No media yet</h3>
            <p className="text-muted-foreground">Photos and videos will appear here.</p>
          </div>
        </Tab>
      </Tabs>

      {/* Edit Profile Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Display Name"
                value={editProfile.name || ''}
                onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
              />
              <Textarea
                label="Bio"
                value={editProfile.about || ''}
                onChange={(e) => setEditProfile({ ...editProfile, about: e.target.value })}
                rows={3}
              />
              <Input
                label="Website"
                value={editProfile.website || ''}
                onChange={(e) => setEditProfile({ ...editProfile, website: e.target.value })}
              />
              <Input
                label="Picture URL"
                value={editProfile.picture || ''}
                onChange={(e) => setEditProfile({ ...editProfile, picture: e.target.value })}
              />
              <Input
                label="NIP-05 Identifier"
                value={editProfile.nip05 || ''}
                onChange={(e) => setEditProfile({ ...editProfile, nip05: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleEditProfile}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
} 