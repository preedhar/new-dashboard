import * as React from 'react'
import { ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TypographyH4 } from '@/components/ui/typography'

type EmailTopic = 'products' | 'promotion'

type TemplateId = 'image-top' | 'image-bottom' | 'three-images'

const TOPIC_OPTIONS: { value: EmailTopic; label: string }[] = [
  { value: 'products', label: 'Products' },
  { value: 'promotion', label: 'Promotion' },
]

const TEMPLATES: {
  id: TemplateId
  label: string
  recommended?: boolean
}[] = [
  { id: 'image-top', label: 'Top image' },
  { id: 'image-bottom', label: 'Bottom image', recommended: true },
  { id: 'three-images', label: 'Three images' },
]

const RECOMMENDED_TEMPLATE: TemplateId = 'image-bottom'

// The wireframe pieces below stand in for an email's layout: a logo, copy, a
// call-to-action button and image slots. Sizes are percentages of the card so
// every template scales together as the dialog narrows.

// A step darker than `muted`, which all but disappears against the card at this
// size.
const PLACEHOLDER_FILL = 'bg-muted-foreground/20'

function LogoPlaceholder() {
  return (
    <div
      className={cn(
        'mx-auto aspect-square w-[20%] shrink-0 rounded-full',
        PLACEHOLDER_FILL,
      )}
    />
  )
}

function TextPlaceholder({ lines }: { lines: number }) {
  return (
    <div className="flex shrink-0 flex-col gap-1 px-[8%] sm:gap-1.5">
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={cn(
            'h-[3px] rounded-full',
            PLACEHOLDER_FILL,
            // The last line runs short, the way a paragraph ends.
            index === lines - 1 && 'w-[45%]',
          )}
        />
      ))}
    </div>
  )
}

function ButtonPlaceholder() {
  return (
    <div
      className={cn(
        'mx-[8%] h-[4%] w-[30%] shrink-0 rounded-xs',
        PLACEHOLDER_FILL,
      )}
    />
  )
}

function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        PLACEHOLDER_FILL,
        className,
      )}
    >
      <ImageIcon className="size-3.5 text-background sm:size-5" />
    </div>
  )
}

function TemplatePreview({ template }: { template: TemplateId }) {
  if (template === 'image-top') {
    return (
      <div className="flex size-full flex-col gap-[6%] pt-[8%] pb-[10%]">
        <LogoPlaceholder />
        <ImagePlaceholder className="min-h-0 flex-1" />
        <TextPlaceholder lines={6} />
        <ButtonPlaceholder />
      </div>
    )
  }

  if (template === 'image-bottom') {
    return (
      <div className="flex size-full flex-col gap-[6%] pt-[8%]">
        <LogoPlaceholder />
        <TextPlaceholder lines={7} />
        <ButtonPlaceholder />
        {/* Runs to the bottom edge of the card, so it inherits its rounding. */}
        <ImagePlaceholder className="min-h-0 flex-1 rounded-b-[inherit]" />
      </div>
    )
  }

  return (
    <div className="flex size-full flex-col gap-[6%] pt-[8%]">
      <LogoPlaceholder />
      <TextPlaceholder lines={7} />
      <ButtonPlaceholder />
      <div className="flex min-h-0 flex-1 flex-col gap-[2%]">
        <ImagePlaceholder className="min-h-0 flex-1" />
        <ImagePlaceholder className="min-h-0 flex-1" />
        <ImagePlaceholder className="min-h-0 flex-1 rounded-b-[inherit]" />
      </div>
    </div>
  )
}

// Picks what a new email is about and which layout it starts from. Nothing is
// composed yet — creating simply confirms the choice.
export function CreateEmailDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [topic, setTopic] = React.useState<EmailTopic>('products')
  const [template, setTemplate] = React.useState<TemplateId>(
    RECOMMENDED_TEMPLATE,
  )

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    // Reopening should start from the defaults rather than a half-made choice.
    if (!next) {
      setTopic('products')
      setTemplate(RECOMMENDED_TEMPLATE)
    }
  }

  function handleCreate() {
    onOpenChange(false)
    setTopic('products')
    setTemplate(RECOMMENDED_TEMPLATE)
    toast.success('Email created')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">
              Create an email
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              What is this email about?
            </Label>
            <RadioGroup
              aria-label="What is this email about?"
              value={topic}
              onValueChange={(value) => setTopic(value as EmailTopic)}
              className="grid w-full grid-cols-2 gap-0 divide-x overflow-hidden rounded-lg border"
            >
              {TOPIC_OPTIONS.map((option) => (
                <FieldLabel
                  key={option.value}
                  htmlFor={`email-topic-${option.value}`}
                  className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                >
                  {option.label}
                  <RadioGroupItem
                    value={option.value}
                    id={`email-topic-${option.value}`}
                  />
                </FieldLabel>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose the template</Label>
            {/* Same shape as the Theme picker in website appearance settings: a
                bordered preview with the radio and its name centered below. */}
            <RadioGroup
              aria-label="Choose the template"
              value={template}
              onValueChange={(value) => setTemplate(value as TemplateId)}
              className="grid-cols-3 gap-2 sm:gap-4"
            >
              {TEMPLATES.map((option) => {
                const isSelected = option.id === template
                return (
                  <Label
                    key={option.id}
                    htmlFor={`email-template-${option.id}`}
                    className="cursor-pointer flex-col items-stretch gap-3 font-normal"
                  >
                    <div
                      className={cn(
                        // Capped so the previews stay a touch narrower than
                        // their column once the dialog is at full width.
                        'relative mx-auto aspect-3/5 w-full max-w-40 overflow-hidden rounded-lg border bg-background transition-colors',
                        isSelected
                          ? 'border-foreground'
                          : 'border-border hover:border-muted-foreground/40',
                      )}
                    >
                      <TemplatePreview template={option.id} />
                      {option.recommended ? (
                        // Sits over the bottom of the preview, in the same
                        // style as the suggested-domain badge in website
                        // settings.
                        <Badge
                          variant="secondary"
                          className="absolute bottom-2 left-1/2 max-w-[calc(100%-0.5rem)] -translate-x-1/2 border-transparent bg-green-400/10 px-1.5 text-[10px] text-green-900 sm:px-2 sm:text-xs"
                        >
                          Recommended
                        </Badge>
                      ) : null}
                    </div>
                    {/* Stacked on mobile, where a name this long won't sit
                        beside the radio at this column width. */}
                    <div className="flex flex-col items-center justify-center gap-1.5 sm:flex-row sm:gap-2">
                      <RadioGroupItem
                        id={`email-template-${option.id}`}
                        value={option.id}
                      />
                      <span className="text-sm font-normal">
                        {option.label}
                      </span>
                    </div>
                  </Label>
                )
              })}
            </RadioGroup>
          </div>
        </DialogBody>

        <DialogFooter className="flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="h-10 flex-1" onClick={handleCreate}>
            Create email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
