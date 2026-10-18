import * as React from 'react'
import { ArrowLeft, Image, Mic, Plus, Send, X } from 'lucide-react'

import mavenLogo from '@/assets/admin/maven-logo.svg'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type ChatMessage = {
  id: number
  from: 'maven' | 'merchant'
  text: string
}

// The opening message and the prompts under it stand in for a real
// conversation. Sending anything gets the one scripted reply below, after a
// pause long enough to show the typing indicator.
const WELCOME_MESSAGE: ChatMessage = {
  id: 0,
  from: 'maven',
  text: "Hi! I'm Maven. I create and manage Facebook and Instagram ads for your store, and nothing goes live until you approve it. What would you like to promote?",
}

const SUGGESTED_PROMPTS = [
  'Promote my best sellers for the holidays',
  'Bring back customers who ordered before',
  'Set up a gift bundle campaign',
  'How much should I spend per day?',
]

const SCRIPTED_REPLY =
  "Got it. I'll draft a campaign for that: the ad copy, a couple of image options from your products, and an audience to start with. Before I do, what daily budget are you comfortable with? Stores your size usually start between $10 and $20."

const REPLY_DELAY_MS = 900

// The conversation travels with the panel from page to page (see maven-panel),
// so it's kept in session storage too: a reopened panel showing an empty chat
// would read as a lost conversation.
const STORAGE_KEY = 'cococart.maven-chat'

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { id, from, text } = value as Record<string, unknown>
  return (
    typeof id === 'number' &&
    (from === 'maven' || from === 'merchant') &&
    typeof text === 'string'
  )
}

function readStoredMessages(): ChatMessage[] {
  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? 'null')
    const messages = Array.isArray(stored) ? stored.filter(isChatMessage) : []
    // An empty or unreadable store starts the conversation over from the
    // welcome message.
    return messages.length > 0 ? messages : [WELCOME_MESSAGE]
  } catch {
    return [WELCOME_MESSAGE]
  }
}

type MavenChatProps = {
  // The panel closes with an X at the top right; the mobile page goes back
  // with an arrow at the top left. Whichever is given decides the header.
  onClose?: () => void
  onBack?: () => void
  className?: string
}

export function MavenChat({ onClose, onBack, className }: MavenChatProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(readStoredMessages)
  const [draft, setDraft] = React.useState('')
  const [replying, setReplying] = React.useState(false)
  // Ids carry on from the stored conversation so a new message never reuses
  // one as its key.
  const nextId = React.useRef(Math.max(...messages.map((message) => message.id)) + 1)
  const replyTimeout = React.useRef(0)
  const endRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => () => window.clearTimeout(replyTimeout.current), [])

  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // Without storage the conversation starts over on the next page, which
      // is a better outcome than the chat not loading.
    }
  }, [messages])

  // Keeps the newest message in view, whether the list scrolls on its own (the
  // panel) or with the page (mobile).
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, replying])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || replying) {
      return
    }

    setMessages((current) => [
      ...current,
      { id: nextId.current++, from: 'merchant', text: trimmed },
    ])
    setDraft('')
    setReplying(true)
    replyTimeout.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: nextId.current++, from: 'maven', text: SCRIPTED_REPLY },
      ])
      setReplying(false)
    }, REPLY_DELAY_MS)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter breaks the line, like most chat composers.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send(draft)
    }
  }

  // The prompts only make sense as an opener, so they go once the merchant has
  // said anything.
  const showPrompts = messages.length === 1

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-2">
        {onBack ? (
          <Button type="button" variant="ghost" size="icon" aria-label="Go back" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </Button>
        ) : null}
        <div className={cn('flex min-w-0 items-center gap-2.5', onBack ? '' : 'pl-2')}>
          <img src={mavenLogo} alt="" className="size-8 shrink-0" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">Maven</p>
            <p className="truncate text-xs text-muted-foreground">Run Meta ads on autopilot</p>
          </div>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={onClose}
            className="ml-auto"
          >
            <X className="size-5" />
          </Button>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {replying ? <TypingIndicator /> : null}
        {showPrompts ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto whitespace-normal rounded-full py-1.5 text-left font-normal"
                onClick={() => send(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      {/* Pinned to the bottom of the panel, and to the bottom of the screen on
          the mobile page, where the whole page scrolls instead. */}
      <form
        className="sticky bottom-0 shrink-0 bg-background px-3 pb-3 pt-2"
        onSubmit={(event) => {
          event.preventDefault()
          send(draft)
        }}
      >
        {/* A grey pill: an attach button at the left, the message in the
            middle, and image, voice and send at the right. The pill rounds
            fully on one line and relaxes as the message grows. The attach,
            image and voice buttons are placeholders for now; only send does
            anything. */}
        <div className="flex items-end gap-1 rounded-[26px] bg-muted px-2 py-1.5 focus-within:ring-3 focus-within:ring-ring/50">
          <ComposerButton label="Attach" icon={Plus} />
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Maven"
            rows={1}
            aria-label="Message Maven"
            className="max-h-40 min-h-9 flex-1 resize-none border-0 bg-transparent px-1 py-2 shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
          <ComposerButton label="Add image" icon={Image} />
          <ComposerButton label="Voice message" icon={Mic} />
          <ComposerButton
            label="Send"
            icon={Send}
            type="submit"
            disabled={!draft.trim() || replying}
          />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Maven is AI and can make mistakes.{' '}
          <a href="#" className="whitespace-nowrap font-medium text-foreground hover:underline">
            Give feedback
          </a>
        </p>
      </form>
    </div>
  )
}

type ComposerButtonProps = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  type?: 'button' | 'submit'
  disabled?: boolean
}

// The icon-only buttons in the composer pill: grey glyphs on the grey pill,
// darkening on hover, with no outline of their own.
function ComposerButton({ label, icon: Icon, type = 'button', disabled }: ComposerButtonProps) {
  return (
    <Button
      type={type}
      variant="ghost"
      size="icon"
      aria-label={label}
      disabled={disabled}
      className="shrink-0 rounded-full text-muted-foreground hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_6%)] hover:text-foreground"
    >
      <Icon className="size-5" />
    </Button>
  )
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const fromMaven = message.from === 'maven'
  return (
    <div className={cn('flex', fromMaven ? 'justify-start' : 'justify-end')}>
      <p
        className={cn(
          'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6',
          fromMaven
            ? 'rounded-bl-md bg-muted text-foreground'
            : 'rounded-br-md bg-primary text-foreground',
        )}
      >
        {message.text}
      </p>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-label="Maven is typing">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3.5 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
