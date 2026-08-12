import * as React from 'react'
import {
  ArrowLeft,
  Banknote,
  CircleHelp,
  Coins,
  MoreHorizontal,
  MousePointer,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'
import { CustomQuestionDialog } from '../components/custom-question-dialog'
import {
  customCaption,
  type CustomQuestion,
  type CustomQuestionDraft,
} from '../custom-questions'

type IconComponent = React.ComponentType<{ className?: string }>

// Monotonic id source for custom questions. A module-level counter keeps ids
// stable across dialog remounts. Mirrors the online store order form page.
let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

// The global <Toaster/> paints every toast with the success (green) palette, so
// the in-progress "Saving changes…" toast overrides those vars to the neutral
// popover palette; the follow-up "Changes saved" restores green explicitly
// (updating a toast by id keeps its prior inline style otherwise).
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
const SAVE_TOAST_ID = 'qr-order-form-save'

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
// optional Description. Checkout buttons are the exception: scanning to order
// always pays up front, so it carries a single payment-button label instead.
// `default*` values back "Reset to default".
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
      paymentButton: string
      defaultPaymentButton: string
    }

// Scanning a QR code already answers when and how the order is fulfilled, so
// this form asks far less than the online store's: what to buy, who's ordering,
// and how to pay.
const STANDARD_SEED: Array<{
  id: string
  group: QuestionGroup
  icon: IconComponent
  name: string
  title: string
  description: string
}> = [
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
    paymentButton: 'Proceed to pay',
    defaultPaymentButton: 'Proceed to pay',
  },
]

// The muted line shown under a question's name: its title, or — for checkout
// buttons — the payment button's label.
function questionCaption(question: Question): string {
  return question.kind === 'standard' ? question.title : question.paymentButton
}

// A titled section: heading (with an optional right-aligned action) sits outside
// the card, questions stack as divided rows inside a single card. Mirrors the
// online store order form page.
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
// custom questions offer Edit / Delete.
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
// optional. Re-mounted per open so the draft always starts fresh from the
// question being edited.
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

// The edit dialog for the checkout-buttons question, whose only field is the
// payment button's label.
function EditButtonsDialog({
  paymentButton: initialPaymentButton,
  onOpenChange,
  onSave,
}: {
  paymentButton: string
  onOpenChange: (open: boolean) => void
  onSave: (paymentButton: string) => void
}) {
  const [paymentButton, setPaymentButton] = React.useState(initialPaymentButton)

  const trimmed = paymentButton.trim()
  const canSave = trimmed !== '' && paymentButton !== initialPaymentButton

  function handleSave() {
    if (!trimmed) {
      toast.error('Enter a label for the button')
      return
    }
    onSave(trimmed)
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
            <Label htmlFor="payment-button" className="text-sm font-medium">
              Payment button
            </Label>
            <Input
              id="payment-button"
              value={paymentButton}
              onChange={(event) => setPaymentButton(event.target.value)}
              placeholder="e.g. Proceed to pay"
              className="h-10"
            />
          </div>
        </DialogBody>

        <DialogFooter className="flex-row">
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

export function AdminQrOrderFormPage() {
  const [questions, setQuestions] = React.useState<Question[]>(INITIAL_QUESTIONS)
  // The built-in question currently open in the edit dialog, or null.
  const [editing, setEditing] = React.useState<Question | null>(null)

  const [customQuestions, setCustomQuestions] = React.useState<CustomQuestion[]>(
    [],
  )
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

  function saveButtons(id: string, paymentButton: string) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id && question.kind === 'buttons'
          ? { ...question, paymentButton }
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
          : { ...question, paymentButton: question.defaultPaymentButton }
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
                  onEdit={() => setCustomDialog({ mode: 'edit', question })}
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
          paymentButton={editing.paymentButton}
          onOpenChange={(open) => {
            if (!open) setEditing(null)
          }}
          onSave={(paymentButton) => saveButtons(editing.id, paymentButton)}
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
