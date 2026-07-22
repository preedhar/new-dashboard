import * as React from 'react'
import {
  AppWindowMac,
  ArrowLeft,
  BookText,
  ChevronRight,
  CircleHelp,
  Droplet,
  Globe,
  GripVertical,
  Handshake,
  ImageIcon,
  ImagePlus,
  Info,
  Link as LinkIcon,
  Mail,
  MapPin,
  MoreHorizontal,
  PaintBucket,
  Palette,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  ShoppingCart,
  Trash2,
  Type,
  Upload,
  Wallpaper,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import simpleThemeThumbnail from '@/assets/themes/simple.webp'
import professionalThemeThumbnail from '@/assets/themes/professional.webp'
import FacebookIcon from '@/assets/links/facebook.svg?react'
import InstagramIcon from '@/assets/links/instagram.svg?react'
import LineIcon from '@/assets/links/line.svg?react'
import LinkedinIcon from '@/assets/links/linkedin.svg?react'
import MessengerIcon from '@/assets/links/messenger.svg?react'
import PinterestIcon from '@/assets/links/pinterest.svg?react'
import TelegramIcon from '@/assets/links/telegram.svg?react'
import TiktokIcon from '@/assets/links/tiktok.svg?react'
import WhatsappIcon from '@/assets/links/whatsapp.svg?react'
import XIcon from '@/assets/links/x.svg?react'
import YoutubeIcon from '@/assets/links/youtube.svg?react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

type IconComponent = React.ComponentType<{ className?: string }>

// Monotonic id source for newly-created links and FAQs. A module-level counter
// keeps ids stable across dialog remounts. Mirrors the manual payments page.
let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

// The link-in-bio link types. The selected type drives both the row's icon and
// the value field's label/placeholder in the add/edit dialog.
type LinkTypeConfig = {
  value: string
  label: string
  icon: IconComponent
  valueLabel: string
  placeholder: string
}

const LINK_TYPES: LinkTypeConfig[] = [
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: WhatsappIcon,
    valueLabel: 'WhatsApp number',
    placeholder: '8123 4567',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    icon: InstagramIcon,
    valueLabel: 'Instagram handle',
    placeholder: 'instagram.com/',
  },
  {
    value: 'phone',
    label: 'Phone',
    icon: Phone,
    valueLabel: 'Phone number',
    placeholder: '8123 4567',
  },
  {
    value: 'address',
    label: 'Address',
    icon: MapPin,
    valueLabel: 'Link address',
    placeholder: 'https://maps.app.goo.gl/',
  },
  {
    value: 'website',
    label: 'Website',
    icon: Globe,
    valueLabel: 'Link address',
    placeholder: 'https://cococart.co',
  },
  {
    value: 'email',
    label: 'Email',
    icon: Mail,
    valueLabel: 'Email address',
    placeholder: 'hello@cococart.co',
  },
  {
    value: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    valueLabel: 'Facebook profile',
    placeholder: 'facebook.com/',
  },
  {
    value: 'line',
    label: 'LINE',
    icon: LineIcon,
    valueLabel: 'LINE profile',
    placeholder: 'https://lin.ee/abc4567',
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    icon: LinkedinIcon,
    valueLabel: 'LinkedIn profile',
    placeholder: 'linkedin.com/in/',
  },
  {
    value: 'messenger',
    label: 'Messenger',
    icon: MessengerIcon,
    valueLabel: 'Messenger link',
    placeholder: 'm.me/',
  },
  {
    value: 'pinterest',
    label: 'Pinterest',
    icon: PinterestIcon,
    valueLabel: 'Pinterest username',
    placeholder: 'pinterest.com/',
  },
  {
    value: 'telegram',
    label: 'Telegram',
    icon: TelegramIcon,
    valueLabel: 'Telegram channel',
    placeholder: 't.me/',
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    icon: TiktokIcon,
    valueLabel: 'TikTok profile',
    placeholder: 'https://vm.tiktok.com/',
  },
  {
    value: 'x',
    label: 'X',
    icon: XIcon,
    valueLabel: 'X handle',
    placeholder: 'x.com/',
  },
  {
    value: 'youtube',
    label: 'YouTube',
    icon: YoutubeIcon,
    valueLabel: 'YouTube channel or video',
    placeholder: 'https://www.youtube.com/channel/',
  },
]

const LINK_TYPES_BY_VALUE = new Map(
  LINK_TYPES.map((type) => [type.value, type]),
)

// Social profiles are gathered under a "Social" group in the type dropdown; the
// remaining contact types (Phone, Address, Website, etc.) sit above it ungrouped.
const SOCIAL_LINK_VALUES = new Set([
  'whatsapp',
  'instagram',
  'facebook',
  'line',
  'linkedin',
  'messenger',
  'pinterest',
  'telegram',
  'tiktok',
  'x',
  'youtube',
])

const OTHER_LINK_TYPES = LINK_TYPES.filter(
  (type) => !SOCIAL_LINK_VALUES.has(type.value),
)
const SOCIAL_LINK_TYPES = LINK_TYPES.filter((type) =>
  SOCIAL_LINK_VALUES.has(type.value),
)

// The type shown when opening the Add link dialog: the first non-social option
// so the default sits at the top of the dropdown.
const DEFAULT_LINK_TYPE = OTHER_LINK_TYPES[0].value

// Phone-style types collect a number alongside a country dial code, so their
// value field is a PhoneInput rather than a plain text field.
const PHONE_LINK_VALUES = new Set(['phone', 'whatsapp'])

type Country = { name: string; code: string; dial: string; flag: string }

// Sorted alphabetically by country name. Mirrors the checkout settings page's
// PhoneInput country list.
const COUNTRIES: Country[] = [
  { name: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺' },
  { name: 'Brazil', code: 'BR', dial: '+55', flag: '🇧🇷' },
  { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'China', code: 'CN', dial: '+86', flag: '🇨🇳' },
  { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪' },
  { name: 'India', code: 'IN', dial: '+91', flag: '🇮🇳' },
  { name: 'Indonesia', code: 'ID', dial: '+62', flag: '🇮🇩' },
  { name: 'Italy', code: 'IT', dial: '+39', flag: '🇮🇹' },
  { name: 'Japan', code: 'JP', dial: '+81', flag: '🇯🇵' },
  { name: 'Malaysia', code: 'MY', dial: '+60', flag: '🇲🇾' },
  { name: 'Mexico', code: 'MX', dial: '+52', flag: '🇲🇽' },
  { name: 'Netherlands', code: 'NL', dial: '+31', flag: '🇳🇱' },
  { name: 'Philippines', code: 'PH', dial: '+63', flag: '🇵🇭' },
  { name: 'Singapore', code: 'SG', dial: '+65', flag: '🇸🇬' },
  { name: 'Spain', code: 'ES', dial: '+34', flag: '🇪🇸' },
  { name: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'United States', code: 'US', dial: '+1', flag: '🇺🇸' },
]

// The country pre-selected for a new phone/WhatsApp link.
const DEFAULT_COUNTRY = 'SG'

type LinkItem = {
  id: string
  type: string
  value: string
  // Only set for phone-style types; the dial code selected alongside the number.
  country?: string
  // Only set for the Website type; the label shown on the link button.
  buttonText?: string
}

// The row's secondary line: phone-style types show their dial code before the
// number, the Website type shows its button label before the address, and every
// other type shows its value as-is.
function linkSummary(link: LinkItem) {
  if (PHONE_LINK_VALUES.has(link.type)) {
    const country =
      COUNTRIES.find((item) => item.code === link.country) ??
      COUNTRIES.find((item) => item.code === DEFAULT_COUNTRY)!
    return `${country.dial} ${link.value}`
  }
  if (link.type === 'website' && link.buttonText) {
    return `${link.buttonText} · ${link.value}`
  }
  return link.value
}

// A single link row: the type's icon + name on the left, its value beneath, and
// an edit/delete menu on the right. Mirrors the Fulfillment delivery method row.
function LinkRow({
  link,
  onEdit,
  onDelete,
}: {
  link: LinkItem
  onEdit: () => void
  onDelete: () => void
}) {
  const config = LINK_TYPES_BY_VALUE.get(link.type)
  const Icon = config?.icon ?? LinkIcon
  const label = config?.label ?? 'Link'
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{label}</p>
        </div>
        {/* Summary aligns with the icon on mobile and under the name on desktop. */}
        <p className="mt-1 text-sm text-muted-foreground md:pl-10">
          {linkSummary(link)}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 text-muted-foreground"
            aria-label={`Manage ${label} link`}
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Phone input with a country-code dropdown on the left (flag emoji + dial code)
// and the number field on the right. Mirrors the checkout settings PhoneInput.
function PhoneInput({
  id,
  country,
  onCountryChange,
  number,
  onNumberChange,
  placeholder,
}: {
  id: string
  country: string
  onCountryChange: (code: string) => void
  number: string
  onNumberChange: (value: string) => void
  placeholder?: string
}) {
  const selected =
    COUNTRIES.find((item) => item.code === country) ?? COUNTRIES[0]
  const groupRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [menu, setMenu] = React.useState<{ width: number; offset: number }>()

  return (
    <div ref={groupRef} className="w-full">
      <InputGroup className="h-10">
        <InputGroupAddon align="inline-start">
          <Select
            value={selected.code}
            onValueChange={onCountryChange}
            onOpenChange={(open) => {
              if (open && groupRef.current && triggerRef.current) {
                const group = groupRef.current.getBoundingClientRect()
                const trigger = triggerRef.current.getBoundingClientRect()
                setMenu({
                  width: group.width,
                  offset: group.left - trigger.left,
                })
              }
            }}
          >
            <SelectTrigger
              ref={triggerRef}
              aria-label="Country code"
              className="h-full gap-1 border-0 bg-transparent px-0 text-foreground shadow-none focus-visible:ring-0 dark:bg-transparent"
            >
              <span className="text-base leading-none">{selected.flag}</span>
              <span className="tabular-nums">{selected.dial}</span>
            </SelectTrigger>
            <SelectContent
              align="start"
              alignOffset={menu?.offset}
              style={menu ? { width: menu.width } : undefined}
            >
              {COUNTRIES.map((item) => (
                <SelectItem
                  key={item.code}
                  value={item.code}
                  className="[&>span:last-child]:w-full"
                >
                  <span className="text-base leading-none">{item.flag}</span>
                  <span className="flex-1">{item.name}</span>
                  <span className="text-muted-foreground">{item.dial}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type="tel"
          value={number}
          onChange={(event) => onNumberChange(event.target.value)}
          placeholder={placeholder}
        />
      </InputGroup>
    </div>
  )
}

// A single option in the link-type dropdown: the type's icon followed by its
// name.
function LinkTypeOption({ option }: { option: LinkTypeConfig }) {
  const Icon = option.icon
  return (
    <SelectItem value={option.value}>
      <Icon className="size-4 text-muted-foreground" />
      {option.label}
    </SelectItem>
  )
}

// The add/edit dialog for a link: a type select and a single value field whose
// label and placeholder follow the selected type. Re-mounted per open so its
// draft always starts fresh from `initial`. Save is blocked until the required
// value is filled in.
function LinkDialog({
  initial,
  onOpenChange,
  onSave,
}: {
  initial: LinkItem | null
  onOpenChange: (open: boolean) => void
  onSave: (link: {
    type: string
    value: string
    country?: string
    buttonText?: string
  }) => void
}) {
  const isEditing = initial !== null
  const [type, setType] = React.useState(initial?.type ?? DEFAULT_LINK_TYPE)
  const [value, setValue] = React.useState(initial?.value ?? '')
  const [country, setCountry] = React.useState(
    initial?.country ?? DEFAULT_COUNTRY,
  )
  const [buttonText, setButtonText] = React.useState(initial?.buttonText ?? '')

  const config = LINK_TYPES_BY_VALUE.get(type) ?? LINK_TYPES[0]
  const isPhone = PHONE_LINK_VALUES.has(type)
  const isWebsite = type === 'website'
  const payload = {
    type,
    value: value.trim(),
    country: isPhone ? country : undefined,
    buttonText: isWebsite ? buttonText.trim() : undefined,
  }
  const hasChanges =
    !isEditing ||
    payload.type !== initial.type ||
    payload.value !== initial.value ||
    payload.country !== initial.country ||
    payload.buttonText !== initial.buttonText
  // Website requires its button label too; every type requires its value.
  const canSave =
    payload.value !== '' &&
    (!isWebsite || payload.buttonText !== '') &&
    hasChanges

  function handleSave() {
    if (!payload.value) {
      toast.error(`Enter a ${config.valueLabel.toLowerCase()}`)
      return
    }
    if (isWebsite && !payload.buttonText) {
      toast.error('Enter a button text')
      return
    }
    onSave(payload)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {isEditing ? 'Edit link' : 'Add link'}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <div className="space-y-1.5">
            <Label htmlFor="link-type" className="text-sm font-medium">
              Link type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger
                id="link-type"
                className="w-full data-[size=default]:h-10"
              >
                <SelectValue placeholder="Select a link type" />
              </SelectTrigger>
              <SelectContent>
                {OTHER_LINK_TYPES.map((option) => (
                  <LinkTypeOption key={option.value} option={option} />
                ))}
                <SelectGroup>
                  <SelectLabel>Social</SelectLabel>
                  {SOCIAL_LINK_TYPES.map((option) => (
                    <LinkTypeOption key={option.value} option={option} />
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {isWebsite ? (
            <div className="space-y-1.5">
              <Label htmlFor="link-button-text" className="text-sm font-medium">
                Button text
              </Label>
              <Input
                id="link-button-text"
                value={buttonText}
                onChange={(event) => setButtonText(event.target.value)}
                placeholder="My Website"
                className="h-10"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="link-value" className="text-sm font-medium">
              {config.valueLabel}
            </Label>
            {isPhone ? (
              <PhoneInput
                id="link-value"
                country={country}
                onCountryChange={setCountry}
                number={value}
                onNumberChange={setValue}
                placeholder={config.placeholder}
              />
            ) : (
              <Input
                id="link-value"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={config.placeholder}
                className="h-10"
              />
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1 px-3"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 flex-1 px-3"
            onClick={handleSave}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type FaqItem = {
  id: string
  question: string
  answer: string
}

// A single FAQ row: the question on top, the answer beneath, and an edit/delete
// menu on the right. Mirrors the Fulfillment delivery method row.
function FaqRow({
  faq,
  onEdit,
  onDelete,
}: {
  faq: FaqItem
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <CircleHelp className="size-4 shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium">
            {faq.question}
          </p>
        </div>
        {/* Answer aligns with the icon on mobile and under the question on desktop. */}
        <p className="mt-1 text-sm text-muted-foreground md:pl-10">
          {faq.answer}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 text-muted-foreground"
            aria-label={`Manage ${faq.question}`}
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// The add/edit dialog for a FAQ: a question and an answer. Re-mounted per open
// so its draft always starts fresh from `initial`. Save is blocked until both
// fields are filled in.
function FaqDialog({
  initial,
  onOpenChange,
  onSave,
}: {
  initial: FaqItem | null
  onOpenChange: (open: boolean) => void
  onSave: (faq: { question: string; answer: string }) => void
}) {
  const isEditing = initial !== null
  const [question, setQuestion] = React.useState(initial?.question ?? '')
  const [answer, setAnswer] = React.useState(initial?.answer ?? '')

  const payload = { question: question.trim(), answer: answer.trim() }
  const hasChanges =
    !isEditing ||
    payload.question !== initial.question ||
    payload.answer !== initial.answer
  const canSave = payload.question !== '' && payload.answer !== '' && hasChanges

  function handleSave() {
    if (!payload.question) {
      toast.error('Enter a question')
      return
    }
    if (!payload.answer) {
      toast.error('Enter an answer')
      return
    }
    onSave(payload)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {isEditing ? 'Edit FAQ' : 'Add FAQ'}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <div className="space-y-1.5">
            <Label htmlFor="faq-question" className="text-sm font-medium">
              Question
            </Label>
            <Input
              id="faq-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Where are you located?"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faq-answer" className="text-sm font-medium">
              Answer
            </Label>
            {/* 40px tall to start; `field-sizing-content` grows it as the answer
                is typed (min-h-10 overrides the component's min-h-16). */}
            <Textarea
              id="faq-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Add your answer"
              className="min-h-10 w-full"
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1 px-3"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 flex-1 px-3"
            onClick={handleSave}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AboutUsImage = { id: string; name: string; url: string }

type AboutUsSettings = {
  enabled: boolean
  buttonText: string
  description: string
  images: AboutUsImage[]
}

// The About Us section shows at most this many images.
const MAX_ABOUT_US_IMAGES = 4

// About Us starts off, with the default "About us" button label.
const DEFAULT_ABOUT_US: AboutUsSettings = {
  enabled: false,
  buttonText: 'About us',
  description: '',
  images: [],
}

// About Us is configured once its required fields (button text and description)
// are filled in.
function aboutUsConfigured(settings: AboutUsSettings) {
  return settings.buttonText.trim() !== '' && settings.description.trim() !== ''
}

// Row description: the saved description when enabled and configured, otherwise
// the default blurb.
function aboutUsSummary(settings: AboutUsSettings) {
  if (settings.enabled && aboutUsConfigured(settings)) {
    return settings.description
  }
  return 'Share your brand’s story, values, and more'
}

// The About Us images field: a row of 80x80 thumbnails (each removable) followed
// by an upload button. With more than one image the thumbnails become draggable
// to reorder them, and the hint changes to prompt for it.
function AboutUsImagesField({
  images,
  onChange,
}: {
  images: AboutUsImage[]
  onChange: (images: AboutUsImage[]) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dragIndex = React.useRef<number | null>(null)
  const reorderable = images.length > 1

  function addFiles(files: File[]) {
    const remaining = MAX_ABOUT_US_IMAGES - images.length
    if (remaining <= 0) return
    // Only accept what fits under the cap; flag the overflow.
    const accepted = files.slice(0, remaining)
    const added = accepted.map((file) => ({
      id: nextId('about-image'),
      name: file.name,
      url: URL.createObjectURL(file),
    }))
    onChange([...images, ...added])
    if (files.length > remaining) {
      toast.error(`You can add up to ${MAX_ABOUT_US_IMAGES} images`)
    } else {
      toast.success(added.length > 1 ? 'Images added' : 'Image added')
    }
  }

  function removeImage(id: string) {
    onChange(images.filter((image) => image.id !== id))
  }

  // Move the dragged thumbnail to the hovered position, keeping the rest in
  // order.
  function moveImage(from: number, to: number) {
    if (from === to) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="about-images" className="text-sm font-medium">
        Images
      </Label>
      <p className="text-sm text-muted-foreground">
        {reorderable ? 'Drag to reorder images' : 'Optional'}
      </p>
      <input
        ref={inputRef}
        id="about-images"
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          // Snapshot the files to an array before resetting the input: clearing
          // `value` empties the live FileList, so reading it afterwards is empty.
          const files = event.target.files ? Array.from(event.target.files) : []
          // Reset so selecting the same file again still fires onChange.
          event.target.value = ''
          if (files.length > 0) addFiles(files)
        }}
      />
      <div className="flex flex-wrap gap-3 pt-1">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable={reorderable}
            onDragStart={() => {
              dragIndex.current = index
            }}
            onDragOver={(event) => {
              if (!reorderable || dragIndex.current === null) return
              event.preventDefault()
              if (dragIndex.current !== index) {
                moveImage(dragIndex.current, index)
                dragIndex.current = index
              }
            }}
            onDragEnd={() => {
              dragIndex.current = null
            }}
            className={cn(
              'relative size-20 overflow-hidden rounded-lg border border-border bg-muted',
              reorderable && 'cursor-grab active:cursor-grabbing',
            )}
          >
            <img
              src={image.url}
              alt={image.name}
              className="pointer-events-none size-full object-cover"
            />
            {reorderable ? (
              <span className="pointer-events-none absolute top-1 left-1 rounded bg-black/50 p-0.5 text-white">
                <GripVertical className="size-3.5" />
              </span>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={`Remove ${image.name}`}
              onClick={() => removeImage(image.id)}
              className="absolute top-1 right-1 z-10 size-6"
            >
              <X className="text-neutral-700" />
            </Button>
          </div>
        ))}
        {images.length < MAX_ABOUT_US_IMAGES ? (
          <Button
            type="button"
            variant="outline"
            aria-label="Add images"
            onClick={() => inputRef.current?.click()}
            className="size-20 rounded-lg"
          >
            <ImagePlus className="size-5" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

// The About Us dialog: a button label, optional reorderable images, and a
// description. Button text and description are required. Re-mounted per open so
// its draft starts fresh from `settings`.
function AboutUsDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: AboutUsSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: AboutUsSettings) => void
}) {
  const [draft, setDraft] = React.useState(settings)

  function update<K extends keyof AboutUsSettings>(
    key: K,
    value: AboutUsSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const payload: AboutUsSettings = {
    enabled: draft.enabled,
    buttonText: draft.buttonText.trim(),
    description: draft.description.trim(),
    images: draft.images,
  }
  const hasChanges = JSON.stringify(payload) !== JSON.stringify(settings)
  const canSave =
    payload.buttonText !== '' && payload.description !== '' && hasChanges

  function handleSave() {
    if (!payload.buttonText) {
      toast.error('Enter a button text')
      return
    }
    if (!payload.description) {
      toast.error('Enter a description')
      return
    }
    onSave(payload)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-6 overflow-hidden sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">About us</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-6 flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-6">
          <div className="space-y-1.5">
            <Label htmlFor="about-button-text" className="text-sm font-medium">
              Button text
            </Label>
            <Input
              id="about-button-text"
              value={draft.buttonText}
              onChange={(event) => update('buttonText', event.target.value)}
              placeholder="About us"
              className="h-10"
            />
          </div>

          <AboutUsImagesField
            images={draft.images}
            onChange={(images) => update('images', images)}
          />

          <div className="space-y-1.5">
            <Label htmlFor="about-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="about-description"
              value={draft.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Share your brand’s story, values, and more"
              className="min-h-24 w-full"
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1 px-3"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 flex-1 px-3"
            onClick={handleSave}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// A titled section: heading (and optional description) sit outside the card,
// fields stack as divided rows inside it. Mirrors the Store settings page.
function Section({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      {title || description ? (
        <div className="space-y-1">
          {title ? <TypographyLarge>{title}</TypographyLarge> : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      <Card className="gap-0 py-0 shadow-none">
        <div className="divide-y-0 divide-border/50 px-4 sm:divide-y sm:px-6">
          {children}
        </div>
      </Card>
    </section>
  )
}

// A single settings row: label (icon + text, with an optional description below)
// on the left, control on the right. Mirrors the Store settings page's row.
function SettingRow({
  id,
  label,
  icon: Icon,
  description,
  rowClassName,
  controlClassName,
  children,
}: {
  id?: string
  label: string
  icon: IconComponent
  description?: string
  // Overrides applied to the row container, e.g. to keep it inline on mobile.
  rowClassName?: string
  // Overrides applied to the control column, e.g. to change its alignment.
  controlClassName?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6',
        rowClassName,
      )}
    >
      <div className="sm:flex-1">
        <Label
          htmlFor={id}
          className="flex items-center gap-3 text-sm font-medium sm:gap-6"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </Label>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground sm:pl-10">
            {description}
          </p>
        ) : null}
      </div>
      <div
        className={cn(
          'flex w-full justify-end sm:w-72 sm:shrink-0',
          controlClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

// A settings row with an enable switch and a chevron. When off, only the switch
// is interactive (the chevron is dimmed); toggling it enables the feature. When
// on, clicking anywhere on the row opens the dialog, while the switch (which
// sits above the click overlay) still toggles the feature off. Mirrors the
// Payments page's SwitchNavRow.
function SwitchNavRow({
  label,
  icon: Icon,
  description,
  checked,
  onCheckedChange,
  onOpen,
}: {
  label: string
  icon: IconComponent
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onOpen: () => void
}) {
  return (
    <div className="relative py-4">
      {checked ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${label}`}
          className="absolute inset-y-0 -left-4 -right-4 rounded-lg transition-colors hover:bg-muted/50 sm:-left-6 sm:-right-6"
        />
      ) : null}
      <div className="pointer-events-none relative flex items-center justify-between gap-4">
        <span className="flex items-center gap-3 text-sm font-medium sm:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <span className="pointer-events-auto">
            <Switch
              aria-label={label}
              checked={checked}
              onCheckedChange={onCheckedChange}
              className="translate-y-[2px]"
            />
          </span>
          <ChevronRight
            className={
              checked
                ? 'size-4 text-muted-foreground'
                : 'size-4 text-muted-foreground/40'
            }
          />
        </div>
      </div>
      {description ? (
        <p className="pointer-events-none relative mt-1.5 text-sm text-muted-foreground sm:pl-10">
          {description}
        </p>
      ) : null}
    </div>
  )
}

// The Save button for a text field, shown on its own row beneath the field once
// its value diverges from what's saved. 40px tall with 12px horizontal padding.
// `disabled` blocks committing an invalid value (e.g. an empty required field).
function SaveRow({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex justify-end pb-4">
      <Button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="h-10 px-3"
      >
        Save
      </Button>
    </div>
  )
}

type ImageFile = {
  name: string
  url: string
}

// Manages an uploaded image preview: holds the file, revokes its object URL on
// change/unmount so the blob doesn't leak, and toasts on upload.
function useImageUpload(label: string) {
  const [image, setImage] = React.useState<ImageFile | null>(null)
  React.useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url)
    }
  }, [image])
  function selectFile(file: File) {
    setImage({ name: file.name, url: URL.createObjectURL(file) })
    toast.success(`${label} uploaded`)
  }
  function remove() {
    setImage(null)
  }
  return { image, selectFile, remove }
}

// A logo/cover-style image field: an 80x80 upload button that becomes a
// clickable image (click to replace) with a remove button once a file is set.
function ImageUploadField({
  id,
  label,
  icon,
  description,
  image,
  onSelectFile,
  onRemove,
}: {
  id: string
  label: string
  icon: IconComponent
  description?: string
  image: ImageFile | null
  onSelectFile: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const noun = label.toLowerCase()
  return (
    // Image buttons left-align on mobile; they return to the right on desktop.
    <SettingRow
      id={id}
      label={label}
      icon={icon}
      description={description}
      controlClassName="justify-start sm:justify-end"
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          // Reset so selecting the same file again still fires onChange.
          event.target.value = ''
          if (file) onSelectFile(file)
        }}
      />
      {image ? (
        // Clicking the image replaces it; the trash button sits over it as a
        // sibling (buttons can't nest) to remove it.
        <div className="relative size-20">
          <button
            type="button"
            aria-label={`Replace ${noun}`}
            onClick={() => inputRef.current?.click()}
            className="size-full overflow-hidden rounded-lg border border-border bg-muted shadow-xs transition-colors hover:bg-muted/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <img
              src={image.url}
              alt={image.name}
              className="size-full object-cover"
            />
          </button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`Remove ${noun}`}
            onClick={onRemove}
            className="absolute top-1 right-1 z-10 size-8"
          >
            <Trash2 className="text-neutral-700" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          aria-label={`Upload a ${noun}`}
          onClick={() => inputRef.current?.click()}
          className="size-20 rounded-lg"
        >
          <Upload className="size-5" />
        </Button>
      )}
    </SettingRow>
  )
}

type ThemeOption = {
  value: string
  label: string
  thumbnail: string
}

const THEMES: ThemeOption[] = [
  { value: 'simple', label: 'Simple', thumbnail: simpleThemeThumbnail },
  {
    value: 'professional',
    label: 'Professional',
    thumbnail: professionalThemeThumbnail,
  },
]

type ColorTheme = {
  value: string
  label: string
  // Two CSS background values (solid colors or gradients) shown as swatches.
  swatches: [string, string]
}

const COLOR_THEMES: ColorTheme[] = [
  {
    value: 'baker-brown',
    label: 'Baker Brown',
    swatches: ['#F37154', '#54491E'],
  },
  {
    value: 'turtle-turquoise',
    label: 'Turtle Turquoise',
    swatches: ['#33C1B1', '#172B24'],
  },
  {
    value: 'sky-sapphire',
    label: 'Sky Sapphire',
    swatches: ['#5CB6EB', '#13293D'],
  },
  {
    value: 'basic-black',
    label: 'Basic Black',
    swatches: ['#222222', '#222222'],
  },
  { value: 'ruby-red', label: 'Ruby Red', swatches: ['#C33630', '#53181A'] },
  {
    value: 'custom',
    label: 'Custom Theme',
    swatches: [
      'linear-gradient(135deg, #EF4444 0%, #FACC15 100%)',
      'linear-gradient(135deg, #3B82F6 0%, #22C55E 100%)',
    ],
  },
]

// The pair of color dots shown for a color theme, in both the dropdown options
// and the trigger's selected value.
function ColorSwatches({ swatches }: { swatches: [string, string] }) {
  return (
    <span className="flex items-center gap-1">
      {swatches.map((background, index) => (
        <span
          key={index}
          className="size-3 shrink-0 rounded-full"
          style={{ background }}
        />
      ))}
    </span>
  )
}

// Custom theme starts from the Baker Brown palette on a light grey background.
const DEFAULT_CUSTOM_COLORS = {
  primary: '#F37154',
  text: '#54491E',
  background: '#F7F7F7',
}

// A custom-theme color row: one input group holding a native color-picker
// swatch, a text field for typing the hex manually, and a reset button. All
// edit the same value, so picking and typing stay in sync. Indented to sit
// under the Color theme row as a sub-field.
function ColorField({
  id,
  label,
  icon: Icon,
  value,
  defaultColor,
  onChange,
}: {
  id: string
  label: string
  icon: IconComponent
  value: string
  defaultColor: string
  onChange: (value: string) => void
}) {
  // The picker/swatch need a full 6-digit hex; while the user is mid-typing an
  // invalid value, keep the swatch on a neutral fallback but let the text field
  // show exactly what was typed.
  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(value)
  const swatchColor = isValidHex ? value : '#000000'

  // Remember the last valid hex so we can restore it if the field is left
  // holding an invalid value on blur.
  const lastValidRef = React.useRef(value)
  React.useEffect(() => {
    if (isValidHex) lastValidRef.current = value
  }, [isValidHex, value])

  function handleBlur() {
    if (!isValidHex) onChange(lastValidRef.current)
  }

  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <Label
        htmlFor={id}
        className="flex items-center gap-3 text-sm font-medium sm:gap-6"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        {label}
      </Label>
      <InputGroup className="h-10 w-full sm:w-72 sm:shrink-0">
        <InputGroupAddon align="inline-start" className="pl-1.5">
          <input
            type="color"
            aria-label={`${label} picker`}
            value={swatchColor}
            onChange={(event) => onChange(event.target.value)}
            className="size-6 shrink-0 cursor-pointer appearance-none rounded-sm border border-input bg-transparent p-0 [&::-moz-color-swatch]:rounded-[3px] [&::-moz-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[3px] [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
          />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={handleBlur}
          placeholder="#000000"
          className="uppercase"
        />
        {value !== defaultColor ? (
          <InputGroupAddon align="inline-end" className="pr-1.5">
            <InputGroupButton
              type="button"
              aria-label={`Reset ${label}`}
              onClick={() => onChange(defaultColor)}
            >
              <RotateCcw />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </div>
  )
}

export function AdminSettingsWebsiteAppearancePage() {
  const logo = useImageUpload('Logo')
  const coverImage = useImageUpload('Cover image')
  const [theme, setTheme] = React.useState('simple')
  const [colorTheme, setColorTheme] = React.useState('baker-brown')
  const [customColors, setCustomColors] = React.useState(DEFAULT_CUSTOM_COLORS)
  // Each Welcome field holds a working value and the last-saved value; they
  // diverge while editing, which surfaces a Save button until committed.
  const [welcomeTitle, setWelcomeTitle] = React.useState(
    'Welcome to Coffee Brewers',
  )
  const [savedWelcomeTitle, setSavedWelcomeTitle] = React.useState(welcomeTitle)
  // Welcome information starts hidden behind a "+" button; clicking it reveals
  // an auto-growing textarea (mirrors the Store page's optional-field pattern).
  const [welcomeInfoShown, setWelcomeInfoShown] = React.useState(false)
  const [welcomeInfo, setWelcomeInfo] = React.useState('')
  const [savedWelcomeInfo, setSavedWelcomeInfo] = React.useState('')
  const [orderButton, setOrderButton] = React.useState('Order now')
  const [savedOrderButton, setSavedOrderButton] = React.useState(orderButton)

  // Link-in-bio links, plus the open add/edit dialog and pending deletion.
  const [links, setLinks] = React.useState<LinkItem[]>([])
  const [linkDialog, setLinkDialog] = React.useState<{
    link: LinkItem | null
  } | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<LinkItem | null>(
    null,
  )

  // About Us section content, plus whether its dialog is open.
  const [aboutUs, setAboutUs] =
    React.useState<AboutUsSettings>(DEFAULT_ABOUT_US)
  const [aboutUsOpen, setAboutUsOpen] = React.useState(false)

  // FAQs, plus the open add/edit dialog and pending deletion.
  const [faqs, setFaqs] = React.useState<FaqItem[]>([])
  const [faqDialog, setFaqDialog] = React.useState<{
    faq: FaqItem | null
  } | null>(null)
  const [pendingDeleteFaq, setPendingDeleteFaq] =
    React.useState<FaqItem | null>(null)

  function selectTheme(value: string) {
    setTheme(value)
    toast.success('Theme updated')
  }

  function selectColorTheme(value: string) {
    setColorTheme(value)
    toast.success('Color theme updated')
  }

  function updateCustomColor(key: keyof typeof customColors, value: string) {
    setCustomColors((current) => ({ ...current, [key]: value }))
  }

  function saveWelcomeTitle() {
    setSavedWelcomeTitle(welcomeTitle)
    toast.success('Changes saved')
  }

  function saveWelcomeInfo() {
    setSavedWelcomeInfo(welcomeInfo)
    toast.success('Changes saved')
  }

  function saveOrderButton() {
    setSavedOrderButton(orderButton)
    toast.success('Changes saved')
  }

  function toggleAboutUs(checked: boolean) {
    // Enabling with nothing configured opens the dialog first; the switch turns
    // on only once the dialog is saved.
    if (checked && !aboutUsConfigured(aboutUs)) {
      setAboutUsOpen(true)
      return
    }
    setAboutUs((current) => ({ ...current, enabled: checked }))
    toast.success('Changes saved')
  }

  function saveAboutUs(settings: AboutUsSettings) {
    // Saving the dialog also enables the section.
    setAboutUs({ ...settings, enabled: true })
    setAboutUsOpen(false)
    toast.success('Changes saved')
  }

  function saveLink(draft: {
    type: string
    value: string
    country?: string
    buttonText?: string
  }) {
    const editing = linkDialog?.link ?? null
    setLinks((current) =>
      editing
        ? current.map((link) =>
            link.id === editing.id ? { ...link, ...draft } : link,
          )
        : [...current, { id: nextId('link'), ...draft }],
    )
    setLinkDialog(null)
    toast.success(editing ? 'Link updated' : 'Link added')
  }

  function confirmDeleteLink() {
    if (pendingDelete === null) return
    setLinks((current) =>
      current.filter((link) => link.id !== pendingDelete.id),
    )
    setPendingDelete(null)
    toast.success('Link deleted')
  }

  function saveFaq(draft: { question: string; answer: string }) {
    const editing = faqDialog?.faq ?? null
    setFaqs((current) =>
      editing
        ? current.map((faq) =>
            faq.id === editing.id ? { ...faq, ...draft } : faq,
          )
        : [...current, { id: nextId('faq'), ...draft }],
    )
    setFaqDialog(null)
    toast.success(editing ? 'FAQ updated' : 'FAQ added')
  }

  function confirmDeleteFaq() {
    if (pendingDeleteFaq === null) return
    setFaqs((current) =>
      current.filter((faq) => faq.id !== pendingDeleteFaq.id),
    )
    setPendingDeleteFaq(null)
    toast.success('FAQ deleted')
  }

  return (
    <>
      <div className="w-full">
        <header className="relative mb-8 flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Go back"
            onClick={() => window.history.back()}
            className="absolute left-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
            Appearance
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[1086px] justify-center gap-8 xl:justify-between">
          <div className="flex w-full max-w-[640px] flex-col gap-8">
            <Section>
              <ImageUploadField
                id="logo"
                label="Logo"
                icon={ImageIcon}
                description="Show on the website and receipts"
                image={logo.image}
                onSelectFile={logo.selectFile}
                onRemove={logo.remove}
              />

              <SettingRow
                label="Theme"
                icon={AppWindowMac}
                description="Choose how your website looks"
              >
                {/* Both options share the store page's input-field width (sm:w-72),
                  supplied by SettingRow's control column. */}
                <RadioGroup
                  value={theme}
                  onValueChange={selectTheme}
                  className="grid-cols-2 gap-3"
                >
                  {THEMES.map((option) => {
                    const selected = theme === option.value
                    return (
                      <Label
                        key={option.value}
                        htmlFor={`theme-${option.value}`}
                        className="cursor-pointer flex-col items-stretch gap-2 font-normal"
                      >
                        <div
                          className={cn(
                            'overflow-hidden rounded-lg border bg-muted transition-colors',
                            selected ? 'border-foreground' : 'border-border',
                          )}
                        >
                          <img
                            src={option.thumbnail}
                            alt=""
                            className="block h-auto w-full"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <RadioGroupItem
                            id={`theme-${option.value}`}
                            value={option.value}
                          />
                          <span className="text-sm font-normal">
                            {option.label}
                          </span>
                        </div>
                      </Label>
                    )
                  })}
                </RadioGroup>
              </SettingRow>

              {/* Color theme and its custom color fields form one divider group:
                the divider above (below Theme) separates them from the rest, but
                nothing divides the color theme select from the custom fields, nor
                the custom fields from each other. */}
              <div>
                <SettingRow
                  id="color-theme"
                  label="Color theme"
                  icon={Palette}
                  description="Pick colors that fit your brand"
                >
                  <Select value={colorTheme} onValueChange={selectColorTheme}>
                    <SelectTrigger
                      id="color-theme"
                      className="w-full data-[size=default]:h-10"
                    >
                      <SelectValue placeholder="Select a color theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_THEMES.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <ColorSwatches swatches={option.swatches} />
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingRow>

                {/* Custom theme reveals per-color controls; each opens a color
                  picker and accepts a manually-typed hex code. */}
                {colorTheme === 'custom' ? (
                  <>
                    <ColorField
                      id="custom-primary"
                      label="Primary color"
                      icon={Droplet}
                      value={customColors.primary}
                      defaultColor={DEFAULT_CUSTOM_COLORS.primary}
                      onChange={(value) => updateCustomColor('primary', value)}
                    />
                    <ColorField
                      id="custom-text"
                      label="Text color"
                      icon={Type}
                      value={customColors.text}
                      defaultColor={DEFAULT_CUSTOM_COLORS.text}
                      onChange={(value) => updateCustomColor('text', value)}
                    />
                    <ColorField
                      id="custom-background"
                      label="Background color"
                      icon={PaintBucket}
                      value={customColors.background}
                      defaultColor={DEFAULT_CUSTOM_COLORS.background}
                      onChange={(value) =>
                        updateCustomColor('background', value)
                      }
                    />
                  </>
                ) : null}
              </div>

              {/* The Professional theme has a hero banner, so it exposes a cover
                image field; the Simple theme has none. */}
              {theme === 'professional' ? (
                <ImageUploadField
                  id="cover-image"
                  label="Cover image"
                  icon={Wallpaper}
                  description="Background image shown at the top"
                  image={coverImage.image}
                  onSelectFile={coverImage.selectFile}
                  onRemove={coverImage.remove}
                />
              ) : null}
            </Section>

            {/* Information and About Us form one group with a 24px gap between
              their cards, tighter than the 32px between other sections. */}
            <div className="flex flex-col gap-6">
              <Section title="Info">
                {/* Field + its Save button share one divider group, so no divider
                sits between them. */}
                <div>
                  <SettingRow
                    id="welcome-title"
                    label="Welcome title"
                    icon={Handshake}
                    description="Write a welcome message"
                  >
                    <Input
                      id="welcome-title"
                      value={welcomeTitle}
                      onChange={(event) => setWelcomeTitle(event.target.value)}
                      placeholder="Welcome to Coffee Brewers"
                      className="h-10"
                    />
                  </SettingRow>
                  {welcomeTitle !== savedWelcomeTitle ? (
                    <SaveRow
                      onClick={saveWelcomeTitle}
                      disabled={welcomeTitle.trim() === ''}
                    />
                  ) : null}
                </div>

                <div>
                  <SettingRow
                    label="Welcome information"
                    icon={Info}
                    description="Share info about your business"
                    // Collapsed, the + button stays inline with the label on
                    // mobile; once the textarea is shown it drops to a new row.
                    rowClassName={
                      welcomeInfoShown
                        ? undefined
                        : 'flex-row items-center justify-between gap-4'
                    }
                    controlClassName={welcomeInfoShown ? undefined : 'w-auto'}
                  >
                    {welcomeInfoShown ? (
                      // 40px tall to start; `field-sizing-content` grows it as the
                      // customer types (min-h-10 overrides the component's min-h-16).
                      <Textarea
                        id="welcome-info"
                        value={welcomeInfo}
                        onChange={(event) => setWelcomeInfo(event.target.value)}
                        placeholder="We are open 7 days a week!"
                        autoFocus
                        className="min-h-10 w-full"
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-lg"
                        aria-label="Add welcome information"
                        className="text-muted-foreground"
                        onClick={() => setWelcomeInfoShown(true)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    )}
                  </SettingRow>
                  {welcomeInfoShown && welcomeInfo !== savedWelcomeInfo ? (
                    <SaveRow onClick={saveWelcomeInfo} />
                  ) : null}
                </div>

                {/* The order button is only configurable on the Simple theme. */}
                {theme === 'simple' ? (
                  <div>
                    <SettingRow
                      id="order-button"
                      label="Order button"
                      icon={ShoppingCart}
                      description="Customize the order button"
                    >
                      <Input
                        id="order-button"
                        value={orderButton}
                        onChange={(event) => setOrderButton(event.target.value)}
                        placeholder="Order now"
                        className="h-10"
                      />
                    </SettingRow>
                    {orderButton !== savedOrderButton ? (
                      <SaveRow
                        onClick={saveOrderButton}
                        disabled={orderButton.trim() === ''}
                      />
                    ) : null}
                  </div>
                ) : null}
              </Section>

              {/* About Us content, edited in a dialog and toggled by the row's
                switch. */}
              <Section>
                <SwitchNavRow
                  label="About Us"
                  icon={BookText}
                  description={aboutUsSummary(aboutUs)}
                  checked={aboutUs.enabled}
                  onCheckedChange={toggleAboutUs}
                  onOpen={() => setAboutUsOpen(true)}
                />
              </Section>
            </div>

            {/* Link-in-bio links. The heading carries an Add link button aligned
              to its right; the card lists the links or an empty-state line. */}
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <TypographyLarge>Links</TypographyLarge>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 px-3"
                  onClick={() => setLinkDialog({ link: null })}
                >
                  <Plus className="size-4" />
                  Add link
                </Button>
              </div>
              <Card className="gap-0 py-0 shadow-none">
                <div className="divide-y-0 divide-border/50 px-4 sm:divide-y sm:px-6">
                  {links.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No links added
                    </p>
                  ) : (
                    links.map((link) => (
                      <LinkRow
                        key={link.id}
                        link={link}
                        onEdit={() => setLinkDialog({ link })}
                        onDelete={() => setPendingDelete(link)}
                      />
                    ))
                  )}
                </div>
              </Card>
            </section>

            {/* FAQs. The heading carries an Add FAQ button aligned to its right;
              the card lists the FAQs or an empty-state line. */}
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <TypographyLarge>FAQs</TypographyLarge>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 px-3"
                  onClick={() => setFaqDialog({ faq: null })}
                >
                  <Plus className="size-4" />
                  Add FAQ
                </Button>
              </div>
              <Card className="gap-0 py-0 shadow-none">
                <div className="divide-y-0 divide-border/50 px-4 sm:divide-y sm:px-6">
                  {faqs.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No FAQs added
                    </p>
                  ) : (
                    faqs.map((faq) => (
                      <FaqRow
                        key={faq.id}
                        faq={faq}
                        onEdit={() => setFaqDialog({ faq })}
                        onDelete={() => setPendingDeleteFaq(faq)}
                      />
                    ))
                  )}
                </div>
              </Card>
            </section>
          </div>

          {/* Empty preview frame, shown only on wide (>1280px) screens. Sticks to
            the top of the viewport while scrolling a tall card. */}
          <div className="hidden xl:sticky xl:top-8 xl:block xl:shrink-0 xl:self-start">
            <div className="h-[640px] w-[350px] overflow-hidden rounded-lg border border-border bg-muted" />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Preview
            </p>
          </div>
        </div>
      </div>

      {aboutUsOpen ? (
        <AboutUsDialog
          settings={aboutUs}
          onOpenChange={(open) => {
            if (!open) setAboutUsOpen(false)
          }}
          onSave={saveAboutUs}
        />
      ) : null}

      {linkDialog !== null ? (
        <LinkDialog
          key={linkDialog.link?.id ?? 'new'}
          initial={linkDialog.link}
          onOpenChange={(open) => {
            if (!open) setLinkDialog(null)
          }}
          onSave={saveLink}
        />
      ) : null}

      {faqDialog !== null ? (
        <FaqDialog
          key={faqDialog.faq?.id ?? 'new'}
          initial={faqDialog.faq}
          onOpenChange={(open) => {
            if (!open) setFaqDialog(null)
          }}
          onSave={saveFaq}
        />
      ) : null}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete link?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `This ${
                    LINK_TYPES_BY_VALUE.get(pendingDelete.type)?.label ?? 'link'
                  } link will be removed from your website.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteLink}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingDeleteFaq !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteFaq(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteFaq
                ? `"${pendingDeleteFaq.question}" will be removed from your website.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDeleteFaq}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
