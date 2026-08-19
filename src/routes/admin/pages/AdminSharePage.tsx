import * as React from 'react'
import { ArrowUpRight, Copy, Download, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

import FacebookIcon from '@/assets/links/facebook-color.svg?react'
import InstagramIcon from '@/assets/links/instagram-color.svg?react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TypographyLarge } from '@/components/ui/typography'
import { STORE_DOMAIN } from '../catalog'
import { StoreQrCode } from '../components/store-qr-code'

const STORE_URL = `https://${STORE_DOMAIN}`

type QrColor = {
  value: string
  label: string
  // A CSS background value: a solid colour for the presets, a gradient for the
  // custom option, whose colour isn't known until it's picked.
  swatch: string
  // Left off the custom option, which takes its colour from the hex field.
  hex?: string
}

// The palette the QR code can be printed in.
const QR_COLORS: QrColor[] = [
  { value: 'coral', label: 'Coral', swatch: '#F37154', hex: '#F37154' },
  { value: 'turquoise', label: 'Turquoise', swatch: '#33C1B1', hex: '#33C1B1' },
  { value: 'sky', label: 'Sky', swatch: '#5CB6EB', hex: '#5CB6EB' },
  { value: 'sapphire', label: 'Sapphire', swatch: '#02004B', hex: '#02004B' },
  { value: 'basic-black', label: 'Basic Black', swatch: '#000000', hex: '#000000' },
  { value: 'ruby-red', label: 'Ruby Red', swatch: '#C33630', hex: '#C33630' },
  {
    value: 'custom',
    label: 'Custom',
    swatch: 'linear-gradient(135deg, #EF4444 0%, #FACC15 100%)',
  },
]

const DEFAULT_QR_COLOR = 'basic-black'

// Where the custom picker starts, and what its inline reset returns to.
const DEFAULT_CUSTOM_COLOR = '#000000'

// The colour dot shown for an option, in both the dropdown and the trigger's
// selected value.
function ColorDot({ swatch }: { swatch: string }) {
  return (
    <span
      className="size-3 shrink-0 rounded-full"
      style={{ background: swatch }}
      aria-hidden="true"
    />
  )
}

// The custom colour row: one input group holding a native colour-picker swatch,
// a text field for typing the hex manually, and a reset button. All edit the
// same value, so picking and typing stay in sync. Mirrors the custom colour
// fields on the website appearance page.
function CustomColorField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  // The picker/swatch need a full 6-digit hex; while the user is mid-typing an
  // invalid value, keep the swatch on a neutral fallback but let the text field
  // show exactly what was typed.
  const isValidHex = isHex(value)
  const swatchColor = isValidHex ? value : DEFAULT_CUSTOM_COLOR

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
    <InputGroup className="h-10 w-full">
      <InputGroupAddon align="inline-start" className="pl-1.5">
        <input
          type="color"
          aria-label="Custom QR code color picker"
          value={swatchColor}
          onChange={(event) => onChange(event.target.value)}
          className="size-6 shrink-0 cursor-pointer appearance-none rounded-sm border border-input bg-transparent p-0 [&::-moz-color-swatch]:rounded-[3px] [&::-moz-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-[3px] [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
        />
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Custom QR code color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={handleBlur}
        placeholder={DEFAULT_CUSTOM_COLOR}
        className="uppercase"
      />
      {value !== DEFAULT_CUSTOM_COLOR ? (
        <InputGroupAddon align="inline-end" className="pr-1.5">
          <InputGroupButton
            type="button"
            aria-label="Reset custom color"
            onClick={() => onChange(DEFAULT_CUSTOM_COLOR)}
          >
            <RotateCcw />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}

function isHex(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

export function AdminSharePage() {
  const [color, setColor] = React.useState(DEFAULT_QR_COLOR)
  const [customColor, setCustomColor] = React.useState(DEFAULT_CUSTOM_COLOR)

  // A preset carries its own hex; the custom option reads the hex field, which
  // falls back while it holds a half-typed value.
  const selected = QR_COLORS.find((option) => option.value === color)
  const qrColor =
    selected?.hex ??
    (isHex(customColor) ? customColor : DEFAULT_CUSTOM_COLOR)

  function copyLink() {
    void navigator.clipboard?.writeText(STORE_DOMAIN)
    toast.success('Link copied')
  }

  // Facebook takes a link to share through its sharer; Instagram has no
  // equivalent web endpoint, so the link goes to the clipboard for pasting into
  // a bio or story instead.
  function shareOnInstagram() {
    void navigator.clipboard?.writeText(STORE_DOMAIN)
    toast.success('Link copied — paste it into your Instagram profile')
  }

  function shareOnFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(STORE_URL)}`,
      '_blank',
      'noreferrer',
    )
  }

  function downloadQrCode() {
    toast.success('QR code downloaded')
  }

  return (
    <div className="w-full">
      {/* Share is the Marketing section's hub on mobile, reached from the bottom
          nav, so there's no back button to show. */}
      <header className="mb-8 flex items-center justify-center">
        <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
          Share
        </h1>
      </header>

      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
        {/* The link section is a bare group of actions rather than a card: there
            are no rows to divide, so a card would only box in two buttons. */}
        <section className="space-y-3">
          <div className="space-y-1">
            <TypographyLarge>Share your link</TypographyLarge>
            <p className="text-sm text-muted-foreground">
              Share your shop with your customers
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* -ml-px folds the two outline borders into the single divider a
                button group should show. Mirrors the shop link on the website
                settings page. */}
            <div data-slot="button-group" className="flex w-full items-center">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-w-0 flex-1 rounded-r-none"
              >
                <a href={STORE_URL} target="_blank" rel="noreferrer">
                  <ArrowUpRight
                    data-icon="inline-start"
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  <span className="truncate">{STORE_DOMAIN}</span>
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="-ml-px rounded-l-none"
                aria-label="Copy shop link"
                onClick={copyLink}
              >
                <Copy className="size-4 text-muted-foreground" />
              </Button>
            </div>

            <div className="grid gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={shareOnInstagram}
              >
                <InstagramIcon className="size-4" />
                Share on Instagram
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={shareOnFacebook}
              >
                <FacebookIcon className="size-4" />
                Share on Facebook
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="space-y-1">
            <TypographyLarge>Share your QR code</TypographyLarge>
            <p className="text-sm text-muted-foreground">
              Get your Cococart store's unique QR code to share with the world
            </p>
          </div>

          <Card className="gap-0 py-0 shadow-none">
            {/* Live preview on the left, its controls on the right, each in
                half the card; they stack on a phone, where there's no room to
                sit side by side. flex-1 on both splits the row evenly with the
                gap taken out first, which a literal 50% would overflow. */}
            <div className="flex flex-col gap-6 p-4 sm:flex-row sm:items-center sm:p-6">
              <div className="flex justify-center sm:flex-1">
                <StoreQrCode
                  value={STORE_URL}
                  color={qrColor}
                  className="w-48 max-w-full"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-1">
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger
                    aria-label="QR code color"
                    className="w-full data-[size=default]:h-10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QR_COLORS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <ColorDot swatch={option.swatch} />
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Custom reveals the picker + hex field, which together set the
                    colour the preview draws in. */}
                {color === 'custom' ? (
                  <CustomColorField
                    value={customColor}
                    onChange={setCustomColor}
                  />
                ) : null}

                <Button type="button" size="lg" onClick={downloadQrCode}>
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
