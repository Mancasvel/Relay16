import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, MessageCircle, Heart, Repeat2, Share, Sparkles } from 'lucide-react'
import { Button, Card, CardBody, Spinner, Chip } from '@heroui/react'
import { useNostr } from '@/hooks/useNostr'
import { useNostrStore } from '@/stores/nostr'
import { useDVMCP } from '@/hooks/useDVMCP'
import { NostrKind, NostrNote } from '@/types/nostr'
import { formatTimeAgo, truncateText } from '@/lib/utils'
import { quickSummarize } from '@/services/ai'

export default function Feed() {
  const [refreshing, setRefreshing] = useState(false)
  const [summarizing, setSummarizing] = useState<string | null>(null)
  
  const { subscribeToFeed, isConnected } = useNostr()
  const { notes, feedLoading, feedError, setFeedLoading } = useNostrStore()
  const { availableTools } = useDVMCP()

  useEffect(() => {
    if (isConnected && notes.length === 0) {
      loadFeed()
    }
  }, [isConnected])

  const loadFeed = async () => {
    if (!isConnected) return
    
    setFeedLoading(true)
    try {
      const unsubscribe = subscribeToFeed([
        {
          kinds: [NostrKind.TEXT_NOTE],
          limit: 50,
          since: Math.floor(Date.now() / 1000) - (24 * 60 * 60) // Last 24 hours
        }
      ])

      // Auto-unsubscribe after 10 seconds
      setTimeout(() => {
        unsubscribe()
        setFeedLoading(false)
      }, 10000)
    } catch (error) {
      console.error('Failed to load feed:', error)
      setFeedLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadFeed()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleSummarizeThread = async (note: NostrNote) => {
    setSummarizing(note.id)
    try {
      // Find related notes (replies, mentions)
      const threadNotes = notes.filter(n => 
        n.id === note.id || 
        n.replies.includes(note.id) ||
        note.replies.includes(n.id)
      )
      
      const summary = await quickSummarize(threadNotes)
      // TODO: Show summary in a modal or toast
      console.log('Thread summary:', summary)
    } catch (error) {
      console.error('Failed to summarize thread:', error)
    } finally {
      setSummarizing(null)
    }
  }

  const NoteCard = ({ note }: { note: NostrNote }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="note-card">
        <CardBody className="p-4">
          {/* Author Info */}
          <div className="flex items-start space-x-3 mb-3">
            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              {note.profile?.picture ? (
                <img 
                  src={note.profile.picture} 
                  alt={note.profile.name || 'User'} 
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {note.profile?.name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  {note.profile?.name || note.profile?.display_name || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(note.created_at)}
                </span>
              </div>
              
              {note.profile?.nip05 && (
                <div className="text-xs text-muted-foreground">
                  {note.profile.nip05}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="note-content mb-4">
            <p className="whitespace-pre-wrap break-words">
              {note.content}
            </p>
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {note.tags.slice(0, 3).map((tag, index) => (
                <Chip 
                  key={index} 
                  size="sm" 
                  variant="flat"
                  className="text-xs"
                >
                  #{tag[1] || tag[0]}
                </Chip>
              ))}
              {note.tags.length > 3 && (
                <Chip size="sm" variant="flat" className="text-xs">
                  +{note.tags.length - 3} more
                </Chip>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-4">
              <Button
                size="sm"
                variant="ghost"
                startContent={<MessageCircle size={16} />}
                className="text-muted-foreground hover:text-foreground"
              >
                {note.replies.length || ''}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                startContent={<Heart size={16} />}
                className="text-muted-foreground hover:text-red-500"
              >
                {note.reactions['❤️'] || ''}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                startContent={<Repeat2 size={16} />}
                className="text-muted-foreground hover:text-green-500"
              >
                {note.reposted_by?.length || ''}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                startContent={<Share size={16} />}
                className="text-muted-foreground hover:text-foreground"
              />
            </div>

            {/* AI Actions */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                startContent={
                  summarizing === note.id ? (
                    <Spinner size="sm" />
                  ) : (
                    <Sparkles size={16} />
                  )
                }
                className="text-muted-foreground hover:text-blue-500"
                onClick={() => handleSummarizeThread(note)}
                disabled={summarizing === note.id}
              >
                AI Summary
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )

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

  return (
    <div className="feed-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feed</h1>
          <p className="text-muted-foreground">
            Latest notes from the Nostr network
          </p>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing || feedLoading}
          startContent={<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />}
        >
          Refresh
        </Button>
      </div>

      {/* AI Tools Available */}
      {availableTools.length > 0 && (
        <Card className="mb-6 gradient-bg">
          <CardBody className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles size={20} className="text-blue-500" />
              <span className="font-medium">AI Tools Available</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {availableTools.length} AI tools ready to help analyze and enhance your Nostr experience
            </p>
            <div className="flex flex-wrap gap-2">
              {availableTools.slice(0, 3).map(tool => (
                <Chip key={tool.id} size="sm" variant="flat">
                  {tool.name}
                </Chip>
              ))}
              {availableTools.length > 3 && (
                <Chip size="sm" variant="flat">
                  +{availableTools.length - 3} more
                </Chip>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error State */}
      {feedError && (
        <Card className="mb-6 border-destructive">
          <CardBody className="p-4">
            <div className="text-destructive">
              <strong>Error:</strong> {feedError}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Loading State */}
      {feedLoading && notes.length === 0 && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="shimmer">
              <CardBody className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 bg-muted rounded-full loading-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded loading-pulse w-1/3" />
                    <div className="h-4 bg-muted rounded loading-pulse w-full" />
                    <div className="h-4 bg-muted rounded loading-pulse w-2/3" />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Feed Content */}
      {notes.length > 0 && (
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!feedLoading && notes.length === 0 && !feedError && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No notes yet</h3>
            <p>Start following people or wait for new notes to appear.</p>
          </div>
          <Button onClick={handleRefresh}>
            Load Feed
          </Button>
        </div>
      )}
    </div>
  )
} 