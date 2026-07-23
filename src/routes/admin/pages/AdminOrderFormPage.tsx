import * as React from 'react'
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  CircleHelp,
  Coins,
  Gift,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  MousePointer,
  Package,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
  Truck,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

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
  DialogBody,
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
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'

type IconComponent = React.ComponentType<{ className?: string }>

// Monotonic id source for custom questions and their choices. A module-level
// counter keeps ids stable across dialog remounts. Mirrors the fulfillment page.
let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

// The global <Toaster/> paints every toast with the success (green) palette, so
// the in-progress "Saving changes…" toast overrides those vars to the neutral
// popover palette; the follow-up "Changes saved" restores green explicitly
// (updating a toast by id keeps its prior inline style otherwise). Mirrors the
// other online-store settings pages.
const SAVING_TOAST_STYLE = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
} as React.CSSProperties

const SAVED_TOAST_STYLE = {
  '--normal-bg': 'var(--success)',
  '--normal-text': 'var(--success-foreground)',
  '--normal-border': 'var(--success-border)',
} as React.CSSProperties

// A single shared id keeps the save feedback to one toast that transitions
// in-place from "Saving changes…" to "Changes saved" a second later.
const SAVE_TOAST_ID = 'order-form-save'

function runSaveFeedback() {
  toast.loading('Saving changes...', {
    id: SAVE_TOAST_ID,
    style: SAVING_TOAST_STYLE,
  })
  window.setTimeout(() => {
    toast.success('Changes saved', {
      id: SAVE_TOAST_ID,
      style: SAVED_TOAST_STYLE,
    })
  }, 1000)
}

type QuestionGroup = 'main' | 'checkout'

// Most questions expose an editable Title (the customer-facing prompt) and an
// optional Description. Checkout buttons are the exception: they carry two
// button-label fields instead. `default*` values back "Reset to default".
type Question =
  | {
      kind: 'standard'
      id: string
      group: QuestionGroup
      icon: IconComponent
      name: string
      title: string
      defaultTitle: string
      description: string
      defaultDescription: string
    }
  | {
      kind: 'buttons'
      id: string
      group: QuestionGroup
      icon: IconComponent
      name: string
      automatedButton: string
      defaultAutomatedButton: string
      manualButton: string
      defaultManualButton: string
    }

// The standard order-form questions, minus the booking-only trio (booking type,
// number of guests, booking date). The row shows the question `name` with its
// `title` beneath; the Description is edited in the dialog.
const STANDARD_SEED: Array<{
  id: string
  group: QuestionGroup
  icon: IconComponent
  name: string
  title: string
  description: string
}> = [
  {
    id: 'fulfilment-type',
    group: 'main',
    icon: Package,
    name: 'Fulfilment type',
    title: 'What would you like to book?',
    description: '',
  },
  {
    id: 'fulfilment-date',
    group: 'main',
    icon: CalendarClock,
    name: 'Fulfilment date',
    title: 'When do you want your order?',
    description: 'Showing next available dates',
  },
  {
    id: 'products',
    group: 'main',
    icon: ShoppingBag,
    name: 'Products',
    title: 'What would you like to buy?',
    description: '',
  },
  {
    id: 'customer-name',
    group: 'main',
    icon: User,
    name: 'Customer name',
    title: "What's your name?",
    description: '',
  },
  {
    id: 'customer-email',
    group: 'main',
    icon: Mail,
    name: 'Customer email',
    title: "What's your email?",
    description: 'Your order confirmation will be sent here',
  },
  {
    id: 'customer-phone',
    group: 'main',
    icon: Phone,
    name: 'Customer phone',
    title: 'Where do we contact you?',
    description: 'No spam. For order purposes only',
  },
  {
    id: 'fulfilment-method',
    group: 'main',
    icon: Truck,
    name: 'Fulfilment method',
    title: 'How would you like to receive your order?',
    description: '',
  },
  {
    id: 'delivery-address',
    group: 'main',
    icon: MapPin,
    name: 'Delivery address',
    title: "What's the delivery address?",
    description: '',
  },
  {
    id: 'gift-order',
    group: 'main',
    icon: Gift,
    name: 'Gift order',
    title: 'Is this a gift for someone?',
    description: '',
  },
  {
    id: 'recipient-name',
    group: 'main',
    icon: User,
    name: 'Recipient name',
    title: "What's the recipient's name?",
    description: '',
  },
  {
    id: 'recipient-phone',
    group: 'main',
    icon: Phone,
    name: 'Recipient phone',
    title: "And what's their phone number?",
    description: 'No spam. For order purposes only',
  },
  {
    id: 'gift-message',
    group: 'main',
    icon: MessageSquare,
    name: 'Gift message',
    title: 'Type your gift message here, if any',
    description: '',
  },
  {
    id: 'tips',
    group: 'checkout',
    icon: Coins,
    name: 'Tips',
    title: 'Would you like to give a tip to [DEMO] Coffee Brewers?',
    description: 'Your tip supports our team preparing your order. We appreciate it!',
  },
  {
    id: 'payment-method',
    group: 'checkout',
    icon: Banknote,
    name: 'Payment method',
    title: 'And finally, how would you like to pay?',
    description: '',
  },
]

const INITIAL_QUESTIONS: Question[] = [
  ...STANDARD_SEED.map(
    (question): Question => ({
      kind: 'standard',
      ...question,
      defaultTitle: question.title,
      defaultDescription: question.description,
    }),
  ),
  {
    kind: 'buttons',
    id: 'checkout-buttons',
    group: 'checkout',
    icon: MousePointer,
    name: 'Checkout buttons',
    automatedButton: 'Proceed to pay',
    defaultAutomatedButton: 'Proceed to pay',
    manualButton: 'Confirm Order',
    defaultManualButton: 'Confirm Order',
  },
]

// The muted line shown under a question's name: its title, or — for checkout
// buttons — the automated (card) payment button label.
function questionCaption(question: Question): string {
  return question.kind === 'standard' ? question.title : question.automatedButton
}

// ---------------------------------------------------------------------------
// Custom questions
// ---------------------------------------------------------------------------

type AnswerType = 'text' | 'multiple-choice'
// How many of a multiple-choice question's options a customer may pick.
type AnswerCount = 'one' | 'unlimited' | 'exact' | 'minimum' | 'range'

type CustomChoice = { id: string; value: string }

type CustomQuestion = {
  id: string
  title: string
  descriptionEnabled: boolean
  description: string
  answerType: AnswerType
  // The fields below only apply when answerType is 'multiple-choice'.
  answerCount: AnswerCount
  exactNumber: string
  minimumNumber: string
  rangeMin: string
  rangeMax: string
  limitSelections: boolean
  limitSelectionsCount: string
  choices: CustomChoice[]
  answerRequired: boolean
}

// The dialog edits everything except the id; the page assigns the id on save.
type CustomQuestionDraft = Omit<CustomQuestion, 'id'>

const ANSWER_TYPE_OPTIONS: { value: AnswerType; label: string }[] = [
  { value: 'text', label: 'Text input' },
  { value: 'multiple-choice', label: 'Multiple choice' },
]

// Rendered in a two-column grid, so the order fills One/Unlimited, then
// Exact/Minimum, then Range — matching the reference layout.
const ANSWER_COUNT_OPTIONS: { value: AnswerCount; label: string }[] = [
  { value: 'one', label: 'One' },
  { value: 'unlimited', label: 'Unlimited' },
  { value: 'exact', label: 'Exact number' },
  { value: 'minimum', label: 'Minimum number' },
  { value: 'range', label: 'Range' },
]

function newCustomChoices(): CustomChoice[] {
  return [
    { id: nextId('choice'), value: '' },
    { id: nextId('choice'), value: '' },
  ]
}

function defaultCustomDraft(): CustomQuestionDraft {
  return {
    title: '',
    descriptionEnabled: false,
    description: '',
    answerType: 'text',
    answerCount: 'one',
    exactNumber: '',
    minimumNumber: '',
    rangeMin: '',
    rangeMax: '',
    limitSelections: false,
    limitSelectionsCount: '1',
    choices: newCustomChoices(),
    answerRequired: false,
  }
}

// The muted line shown under a custom question's title: its description when
// provided, otherwise a summary of its answer type.
function customCaption(question: CustomQuestion): string {
  if (question.descriptionEnabled && question.description.trim() !== '') {
    return question.description
  }
  return question.answerType === 'text' ? 'Text input' : 'Multiple choice'
}

// A titled section: heading (with an optional right-aligned action) sits outside
// the card, questions stack as divided rows inside a single card. Mirrors the
// fulfillment settings page.
function Section({
  title,
  action,
  children,
}: {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      {title || action ? (
        <div className="flex items-center justify-between gap-4">
          {title ? <TypographyLarge>{title}</TypographyLarge> : <span />}
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <Card className="gap-0 py-0 shadow-none">
        <div className="divide-y divide-border/50 px-4 sm:px-6">{children}</div>
      </Card>
    </section>
  )
}

// A single question row: icon + name on the left with the customer-facing prompt
// below, and a "more" menu on the right. Built-in questions offer Edit / Reset;
// custom questions offer Edit / Delete. Mirrors the method rows on the
// fulfillment settings page.
function QuestionRow({
  icon: Icon,
  name,
  caption,
  onEdit,
  onReset,
  onDelete,
}: {
  icon: IconComponent
  name: string
  caption: string
  onEdit: () => void
  onReset?: () => void
  onDelete?: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{name}</p>
        </div>
        {/* Caption aligns with the icon on mobile and under the name on desktop. */}
        <p className="mt-1 truncate text-sm text-muted-foreground md:pl-10">
          {caption}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 text-muted-foreground"
            aria-label={`Manage ${name}`}
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          {onReset ? (
            <DropdownMenuItem onSelect={onReset}>
              <RotateCcw className="size-4" />
              Reset to default
            </DropdownMenuItem>
          ) : null}
          {onDelete ? (
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// The edit dialog for a standard question. Title is required; description is
// optional. Mirrors the add/edit dialogs on the fulfillment page (scrolling
// body, sticky Cancel/Save footer). Re-mounted per open so the draft always
// starts fresh from the question being edited.
function EditQuestionDialog({
  title: initialTitle,
  description: initialDescription,
  onOpenChange,
  onSave,
}: {
  title: string
  description: string
  onOpenChange: (open: boolean) => void
  onSave: (title: string, description: string) => void
}) {
  const [title, setTitle] = React.useState(initialTitle)
  // Default the switch on when the question already has a description.
  const [descriptionEnabled, setDescriptionEnabled] = React.useState(
    initialDescription.trim() !== '',
  )
  const [description, setDescription] = React.useState(initialDescription)

  const trimmedTitle = title.trim()
  // With the switch off the question has no description.
  const effectiveDescription = descriptionEnabled ? description.trim() : ''
  const hasChanges =
    title !== initialTitle || effectiveDescription !== initialDescription
  const canSave = trimmedTitle !== '' && hasChanges

  function handleSave() {
    if (!trimmedTitle) {
      toast.error('Enter a question title')
      return
    }
    onSave(trimmedTitle, effectiveDescription)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Edit question</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="question-title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="question-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. What's your name?"
              className="h-10"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="question-description-enabled"
                className="text-sm font-medium"
              >
                Description
              </Label>
              <Switch
                id="question-description-enabled"
                aria-label="Description"
                checked={descriptionEnabled}
                onCheckedChange={setDescriptionEnabled}
              />
            </div>
            {descriptionEnabled ? (
              <Textarea
                id="question-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a description (optional)"
                className="min-h-10"
              />
            ) : null}
          </div>
        </DialogBody>

        <DialogFooter className="flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
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

// The edit dialog for the checkout-buttons question, whose fields are the two
// button labels rather than a title/description. Both labels are required.
function EditButtonsDialog({
  automatedButton: initialAutomatedButton,
  manualButton: initialManualButton,
  onOpenChange,
  onSave,
}: {
  automatedButton: string
  manualButton: string
  onOpenChange: (open: boolean) => void
  onSave: (automatedButton: string, manualButton: string) => void
}) {
  const [automatedButton, setAutomatedButton] =
    React.useState(initialAutomatedButton)
  const [manualButton, setManualButton] = React.useState(initialManualButton)

  const trimmedAutomated = automatedButton.trim()
  const trimmedManual = manualButton.trim()
  const hasChanges =
    automatedButton !== initialAutomatedButton ||
    manualButton !== initialManualButton
  const canSave =
    trimmedAutomated !== '' && trimmedManual !== '' && hasChanges

  function handleSave() {
    if (!trimmedAutomated || !trimmedManual) {
      toast.error('Enter a label for both buttons')
      return
    }
    onSave(trimmedAutomated, trimmedManual)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Edit buttons</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label
              htmlFor="automated-payments-button"
              className="text-sm font-medium"
            >
              Automated payments button
            </Label>
            <Input
              id="automated-payments-button"
              value={automatedButton}
              onChange={(event) => setAutomatedButton(event.target.value)}
              placeholder="e.g. Proceed to pay"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="manual-payments-button"
              className="text-sm font-medium"
            >
              Manual payments button
            </Label>
            <Input
              id="manual-payments-button"
              value={manualButton}
              onChange={(event) => setManualButton(event.target.value)}
              placeholder="e.g. Confirm Order"
              className="h-10"
            />
          </div>
        </DialogBody>

        <DialogFooter className="flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
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

// The add/edit dialog for a custom question. The visible fields change with the
// answer type, and — for multiple choice — with the number of allowed answers.
// Modeled on the fulfillment add-method dialog (scrolling body, sticky footer).
function CustomQuestionDialog({
  initial,
  onOpenChange,
  onSave,
}: {
  initial: CustomQuestion | null
  onOpenChange: (open: boolean) => void
  onSave: (draft: CustomQuestionDraft) => void
}) {
  const isEditing = initial !== null
  // The saved draft to diff against, so editing requires an actual change.
  const initialDraft = React.useMemo<CustomQuestionDraft | null>(() => {
    if (!initial) return null
    const rest: Partial<CustomQuestion> = { ...initial }
    delete rest.id
    return rest as CustomQuestionDraft
  }, [initial])

  const [draft, setDraft] = React.useState<CustomQuestionDraft>(
    () => initialDraft ?? defaultCustomDraft(),
  )

  function update<K extends keyof CustomQuestionDraft>(
    key: K,
    value: CustomQuestionDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updateChoice(id: string, value: string) {
    setDraft((current) => ({
      ...current,
      choices: current.choices.map((choice) =>
        choice.id === id ? { ...choice, value } : choice,
      ),
    }))
  }

  function addChoice() {
    setDraft((current) => ({
      ...current,
      choices: [...current.choices, { id: nextId('choice'), value: '' }],
    }))
  }

  // Keep at least one choice row so multiple-choice questions never empty out.
  function removeChoice(id: string) {
    setDraft((current) =>
      current.choices.length <= 1
        ? current
        : {
            ...current,
            choices: current.choices.filter((choice) => choice.id !== id),
          },
    )
  }

  // Enabling the limit seeds a default of 1 so the number field is never blank.
  function toggleLimitSelections(checked: boolean) {
    setDraft((current) => ({
      ...current,
      limitSelections: checked,
      limitSelectionsCount:
        checked && current.limitSelectionsCount.trim() === ''
          ? '1'
          : current.limitSelectionsCount,
    }))
  }

  const isMultiple = draft.answerType === 'multiple-choice'
  // "Limit selections" only makes sense when more than one answer can be picked.
  const showLimitSelections = isMultiple && draft.answerCount !== 'one'

  const trimmedTitle = draft.title.trim()
  const filledChoices = draft.choices.filter(
    (choice) => choice.value.trim() !== '',
  )
  const choicesValid = !isMultiple || filledChoices.length >= 1
  // The number/min/max fields for the exact/minimum/range limits are required.
  const countValid =
    !isMultiple ||
    (draft.answerCount === 'exact'
      ? draft.exactNumber.trim() !== ''
      : draft.answerCount === 'minimum'
        ? draft.minimumNumber.trim() !== ''
        : draft.answerCount === 'range'
          ? draft.rangeMin.trim() !== '' && draft.rangeMax.trim() !== ''
          : true)
  const changed = JSON.stringify(draft) !== JSON.stringify(initialDraft)
  const canSave =
    trimmedTitle !== '' &&
    choicesValid &&
    countValid &&
    (!isEditing || changed)

  function handleSave() {
    if (!trimmedTitle) {
      toast.error('Enter a question title')
      return
    }
    if (isMultiple && !countValid) {
      toast.error('Enter a value for the selection limit')
      return
    }
    if (isMultiple && filledChoices.length < 1) {
      toast.error('Add at least one choice')
      return
    }
    onSave({
      ...draft,
      title: trimmedTitle,
      description: draft.description.trim(),
    })
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {isEditing ? 'Edit question' : 'Add question'}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="custom-title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="custom-title"
              value={draft.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="e.g. Any allergies we should know about?"
              className="h-10"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="custom-description-enabled"
                className="text-sm font-medium"
              >
                Description
              </Label>
              <Switch
                id="custom-description-enabled"
                aria-label="Description"
                checked={draft.descriptionEnabled}
                onCheckedChange={(checked) =>
                  update('descriptionEnabled', checked)
                }
              />
            </div>
            {draft.descriptionEnabled ? (
              <Textarea
                id="custom-description"
                value={draft.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder="Flavors, gift message, allergies, etc."
                className="min-h-10"
              />
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Answer type</Label>
            <RadioGroup
              aria-label="Answer type"
              value={draft.answerType}
              onValueChange={(value) =>
                update('answerType', value as AnswerType)
              }
              className="grid w-full grid-cols-2 gap-0 divide-x overflow-hidden rounded-lg border"
            >
              {ANSWER_TYPE_OPTIONS.map((option) => (
                <FieldLabel
                  key={option.value}
                  htmlFor={`answer-type-${option.value}`}
                  className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                >
                  {option.label}
                  <RadioGroupItem
                    value={option.value}
                    id={`answer-type-${option.value}`}
                  />
                </FieldLabel>
              ))}
            </RadioGroup>
          </div>

          {isMultiple ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Limit selections</Label>
                <RadioGroup
                  aria-label="Number of answers"
                  value={draft.answerCount}
                  onValueChange={(value) =>
                    update('answerCount', value as AnswerCount)
                  }
                  className="flex w-full flex-col gap-0 divide-y overflow-hidden rounded-lg border"
                >
                  {ANSWER_COUNT_OPTIONS.map((option) => (
                    <FieldLabel
                      key={option.value}
                      htmlFor={`answer-count-${option.value}`}
                      className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
                    >
                      {option.label}
                      <RadioGroupItem
                        value={option.value}
                        id={`answer-count-${option.value}`}
                      />
                    </FieldLabel>
                  ))}
                </RadioGroup>
                {draft.answerCount === 'unlimited' ? (
                  <p className="text-sm text-muted-foreground">
                    Unlimited answers are optional as there is no minimum and
                    maximum number of selections
                  </p>
                ) : null}
              </div>

              {draft.answerCount === 'exact' ? (
                <div className="space-y-1.5">
                  <Label htmlFor="exact-number" className="text-sm font-medium">
                    Number
                  </Label>
                  <Input
                    id="exact-number"
                    inputMode="numeric"
                    value={draft.exactNumber}
                    onChange={(event) =>
                      update('exactNumber', event.target.value)
                    }
                    placeholder="5"
                    className="h-10"
                  />
                </div>
              ) : null}

              {draft.answerCount === 'minimum' ? (
                <div className="space-y-1.5">
                  <Label htmlFor="minimum-number" className="text-sm font-medium">
                    Minimum
                  </Label>
                  <InputGroup className="h-10">
                    <InputGroupInput
                      id="minimum-number"
                      inputMode="numeric"
                      value={draft.minimumNumber}
                      onChange={(event) =>
                        update('minimumNumber', event.target.value)
                      }
                      placeholder="5"
                      className="pl-3"
                    />
                    <InputGroupAddon align="inline-end" className="pr-3">
                      and up
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              ) : null}

              {draft.answerCount === 'range' ? (
                <div className="flex gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Label htmlFor="range-min" className="text-sm font-medium">
                      Minimum
                    </Label>
                    <Input
                      id="range-min"
                      inputMode="numeric"
                      value={draft.rangeMin}
                      onChange={(event) =>
                        update('rangeMin', event.target.value)
                      }
                      placeholder="1"
                      className="h-10"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Label htmlFor="range-max" className="text-sm font-medium">
                      Maximum
                    </Label>
                    <Input
                      id="range-max"
                      inputMode="numeric"
                      value={draft.rangeMax}
                      onChange={(event) =>
                        update('rangeMax', event.target.value)
                      }
                      placeholder="5"
                      className="h-10"
                    />
                  </div>
                </div>
              ) : null}

              {showLimitSelections ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <Label
                      htmlFor="limit-selections"
                      className="text-sm font-medium"
                    >
                      Limit selections of each choice
                    </Label>
                    <Switch
                      id="limit-selections-enabled"
                      aria-label="Limit selections of each choice"
                      checked={draft.limitSelections}
                      onCheckedChange={toggleLimitSelections}
                    />
                  </div>
                  {draft.limitSelections ? (
                    <Input
                      id="limit-selections"
                      aria-label="Selections per choice"
                      inputMode="numeric"
                      value={draft.limitSelectionsCount}
                      onChange={(event) =>
                        update('limitSelectionsCount', event.target.value)
                      }
                      placeholder="1"
                      className="h-10"
                    />
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-3">
                <Label className="text-sm font-medium">Choices</Label>
                {draft.choices.map((choice, index) => (
                  <div
                    key={choice.id}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <Input
                      value={choice.value}
                      onChange={(event) =>
                        updateChoice(choice.id, event.target.value)
                      }
                      placeholder={`Choice ${index + 1}`}
                      className="h-10 min-w-0 flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-10 shrink-0 text-muted-foreground"
                      aria-label={`Remove choice ${index + 1}`}
                      disabled={draft.choices.length <= 1}
                      onClick={() => removeChoice(choice.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 gap-2 px-3"
                  onClick={addChoice}
                >
                  <Plus className="size-4" />
                  Add choice
                </Button>
              </div>
            </>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="answer-required" className="text-sm font-medium">
              Answer required
            </Label>
            <Switch
              id="answer-required"
              aria-label="Answer required"
              checked={draft.answerRequired}
              onCheckedChange={(checked) => update('answerRequired', checked)}
            />
          </div>
        </DialogBody>

        <DialogFooter className="flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
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

export function AdminOrderFormPage() {
  const [questions, setQuestions] =
    React.useState<Question[]>(INITIAL_QUESTIONS)
  // The built-in question currently open in the edit dialog, or null.
  const [editing, setEditing] = React.useState<Question | null>(null)

  const [customQuestions, setCustomQuestions] = React.useState<
    CustomQuestion[]
  >([])
  // The custom-question dialog: 'add' for a new question, or the question being
  // edited. null when closed.
  const [customDialog, setCustomDialog] = React.useState<
    { mode: 'add' } | { mode: 'edit'; question: CustomQuestion } | null
  >(null)
  const [pendingDeleteCustom, setPendingDeleteCustom] =
    React.useState<CustomQuestion | null>(null)

  const mainQuestions = questions.filter((q) => q.group === 'main')
  const checkoutQuestions = questions.filter((q) => q.group === 'checkout')

  function saveStandard(id: string, title: string, description: string) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id && question.kind === 'standard'
          ? { ...question, title, description }
          : question,
      ),
    )
    setEditing(null)
    runSaveFeedback()
  }

  function saveButtons(
    id: string,
    automatedButton: string,
    manualButton: string,
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id && question.kind === 'buttons'
          ? { ...question, automatedButton, manualButton }
          : question,
      ),
    )
    setEditing(null)
    runSaveFeedback()
  }

  function resetToDefault(id: string) {
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== id) return question
        return question.kind === 'standard'
          ? {
              ...question,
              title: question.defaultTitle,
              description: question.defaultDescription,
            }
          : {
              ...question,
              automatedButton: question.defaultAutomatedButton,
              manualButton: question.defaultManualButton,
            }
      }),
    )
    runSaveFeedback()
  }

  function saveCustomQuestion(draft: CustomQuestionDraft) {
    const editingId =
      customDialog?.mode === 'edit' ? customDialog.question.id : null
    setCustomQuestions((current) =>
      editingId
        ? current.map((question) =>
            question.id === editingId ? { ...draft, id: editingId } : question,
          )
        : [...current, { ...draft, id: nextId('custom') }],
    )
    setCustomDialog(null)
    runSaveFeedback()
  }

  function confirmDeleteCustom() {
    if (!pendingDeleteCustom) return
    const { id } = pendingDeleteCustom
    setCustomQuestions((current) =>
      current.filter((question) => question.id !== id),
    )
    setPendingDeleteCustom(null)
    toast.success('Question deleted')
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
            Order form
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <Section>
            {mainQuestions.map((question) => (
              <QuestionRow
                key={question.id}
                icon={question.icon}
                name={question.name}
                caption={questionCaption(question)}
                onEdit={() => setEditing(question)}
                onReset={() => resetToDefault(question.id)}
              />
            ))}
          </Section>

          <Section
            title="Custom questions"
            action={
              <Button
                type="button"
                variant="secondary"
                className="h-10 px-3"
                onClick={() => setCustomDialog({ mode: 'add' })}
              >
                <Plus className="size-4" />
                Add question
              </Button>
            }
          >
            {customQuestions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No custom questions
              </p>
            ) : (
              customQuestions.map((question) => (
                <QuestionRow
                  key={question.id}
                  icon={CircleHelp}
                  name={question.title}
                  caption={customCaption(question)}
                  onEdit={() =>
                    setCustomDialog({ mode: 'edit', question })
                  }
                  onDelete={() => setPendingDeleteCustom(question)}
                />
              ))
            )}
          </Section>

          <Section title="Checkout">
            {checkoutQuestions.map((question) => (
              <QuestionRow
                key={question.id}
                icon={question.icon}
                name={question.name}
                caption={questionCaption(question)}
                onEdit={() => setEditing(question)}
                onReset={() => resetToDefault(question.id)}
              />
            ))}
          </Section>
        </div>
      </div>

      {editing && editing.kind === 'standard' ? (
        <EditQuestionDialog
          // Re-mount per target so the draft resets from the edited question.
          key={editing.id}
          title={editing.title}
          description={editing.description}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          onSave={(title, description) =>
            saveStandard(editing.id, title, description)
          }
        />
      ) : null}

      {editing && editing.kind === 'buttons' ? (
        <EditButtonsDialog
          key={editing.id}
          automatedButton={editing.automatedButton}
          manualButton={editing.manualButton}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          onSave={(automatedButton, manualButton) =>
            saveButtons(editing.id, automatedButton, manualButton)
          }
        />
      ) : null}

      {customDialog ? (
        <CustomQuestionDialog
          // Re-mount per open/target so the draft starts fresh.
          key={customDialog.mode === 'edit' ? customDialog.question.id : 'add'}
          initial={customDialog.mode === 'edit' ? customDialog.question : null}
          onOpenChange={(open) => {
            if (!open) setCustomDialog(null)
          }}
          onSave={saveCustomQuestion}
        />
      ) : null}

      <AlertDialog
        open={pendingDeleteCustom !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteCustom(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDeleteCustom
                ? `"${pendingDeleteCustom.title}" will be removed from your order form.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteCustom}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
