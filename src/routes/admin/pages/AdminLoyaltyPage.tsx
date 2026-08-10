import * as React from 'react'
import {
  ArrowLeft,
  CircleHelp,
  Coins,
  Gift,
  MoreHorizontal,
  Pencil,
  Plus,
  Star,
  Trash2,
  UserPlus,
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
  DialogDescription,
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
import { Label } from '@/components/ui/label'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'

type IconComponent = React.ComponentType<{ className?: string }>

// Points customers earn per dollar spent. Drives the reward dialog's live
// "$x spend" suffix so a point threshold maps back to the spend that earns it.
const POINTS_PER_DOLLAR = 10

// The dollar spend a given point total represents. Non-numeric input reads as 0.
function spendFor(points: string) {
  const amount = Number(points)
  return Number.isFinite(amount)
    ? Math.round((amount / POINTS_PER_DOLLAR) * 100) / 100
    : 0
}

// A redeemable reward tier: reach a point threshold for a discount.
type Reward = {
  id: string
  points: string
  discount: string
}

const INITIAL_REWARDS: Reward[] = [
  { id: 'reward-1', points: '1000', discount: '10' },
  { id: 'reward-2', points: '2000', discount: '20' },
]

// The most reward tiers that can be offered at once. The add button hides once
// this many exist.
const MAX_REWARDS = 6

// Monotonic id source for newly-created rewards. A module-level counter keeps
// ids stable across dialog remounts.
let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

// A titled section: heading sits outside the card, rows stack as divided rows
// inside it. Title is optional so an untitled section renders just the card.
// Mirrors the fulfillment settings page.
function Section({
  title,
  description,
  info,
  action,
  children,
}: {
  title?: string
  description?: string
  info?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="space-y-3">
        {title ? (
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <TypographyLarge>{title}</TypographyLarge>
                {info ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label="More information"
                          className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <CircleHelp className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{info}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}
              </div>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        ) : null}
        <Card className="gap-0 py-0 shadow-none">
          <div className="divide-y divide-border/50 px-4 sm:px-6">{children}</div>
        </Card>
      </div>
    </section>
  )
}

// A single settings row: label (icon + text, with an optional description below)
// on the left, control on the right. Mirrors the fulfillment settings page.
function SettingRow({
  id,
  label,
  icon: Icon,
  description,
  children,
}: {
  id?: string
  label: string
  icon: IconComponent
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <Label
          htmlFor={id}
          className="flex items-center gap-4 text-sm font-medium md:gap-6"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </Label>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground md:pl-10">
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// A fixed earn-points row: the action label with its point value beneath.
function EarnRow({
  label,
  icon: Icon,
  value,
}: {
  label: string
  icon: IconComponent
  value: string
}) {
  return (
    <div className="py-4">
      <div className="flex min-w-0 items-center gap-4 text-sm font-medium md:gap-6">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        {label}
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground md:pl-10">{value}</p>
    </div>
  )
}

// A single reward row inside the Redeem rewards card: the point threshold on the
// left with the discount beneath, and the spend it maps to plus an edit/delete
// menu on the right. Mirrors the fulfillment method row.
function RewardRow({
  reward,
  canDelete,
  onEdit,
  onDelete,
}: {
  reward: Reward
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const title = `${reward.points} points`
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <Gift className="size-4 shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground md:pl-10">
          ${reward.discount} discount
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm text-muted-foreground">
          ${spendFor(reward.points)} spend
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 text-muted-foreground"
              aria-label={`Manage ${title}`}
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            {canDelete ? (
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// The saved shape passed into the dialog when editing, and returned via onSave.
type RewardDraft = {
  points: string
  discount: string
}

// The add/edit reward dialog. Re-mounted per open (keyed by the caller) so its
// draft always starts fresh from `initial`. Mirrors the fulfillment method
// dialog: scrolling body, sticky Cancel/Save footer.
function RewardDialog({
  initial,
  onOpenChange,
  onSave,
}: {
  initial: RewardDraft | null
  onOpenChange: (open: boolean) => void
  onSave: (reward: RewardDraft) => void
}) {
  const isEditing = initial !== null
  const [draft, setDraft] = React.useState<RewardDraft>(
    () => initial ?? { points: '', discount: '' },
  )

  function update<K extends keyof RewardDraft>(key: K, value: RewardDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const payload: RewardDraft = {
    points: draft.points.trim(),
    discount: draft.discount.trim(),
  }

  function handleSave() {
    if (!payload.points || !payload.discount) {
      toast.error('Enter a points threshold and discount')
      return
    }
    onSave(payload)
  }

  // Require both fields, and when editing require at least one unsaved change.
  const hasChanges =
    !isEditing || JSON.stringify(payload) !== JSON.stringify(initial)
  const canSave =
    payload.points !== '' && payload.discount !== '' && hasChanges

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {isEditing ? 'Edit reward' : 'Add reward'}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="reward-points" className="text-sm font-medium">
              Points required
            </Label>
            <p className="text-sm text-muted-foreground">
              Keeping this reasonably low encourages customers to order more
            </p>
            <InputGroup className="h-10">
              <InputGroupInput
                id="reward-points"
                inputMode="numeric"
                placeholder="0"
                value={draft.points}
                onChange={(event) => update('points', event.target.value)}
                className="pl-3"
              />
              <InputGroupAddon align="inline-end" className="pr-3">
                ${spendFor(draft.points)} spend
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reward-discount" className="text-sm font-medium">
              Discount
            </Label>
            <p className="text-sm text-muted-foreground">
              Encouraging rewards offer at least 10% of the spend as discount
            </p>
            <InputGroup className="h-10">
              <InputGroupAddon align="inline-start" className="pl-3 text-base">
                $
              </InputGroupAddon>
              <InputGroupInput
                id="reward-discount"
                inputMode="decimal"
                placeholder="0"
                value={draft.discount}
                onChange={(event) => update('discount', event.target.value)}
              />
            </InputGroup>
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

export function AdminLoyaltyPage() {
  const [active, setActive] = React.useState(true)
  const [rewards, setRewards] = React.useState<Reward[]>(INITIAL_REWARDS)
  // null when closed; { reward: null } when adding; { reward } when editing.
  const [dialog, setDialog] = React.useState<{ reward: Reward | null } | null>(
    null,
  )
  const [pendingDelete, setPendingDelete] = React.useState<Reward | null>(null)
  const [activateError, setActivateError] = React.useState(false)

  function toggleActive(checked: boolean) {
    // The program can't go live with nothing to redeem: block activation and
    // point the merchant at the rewards section.
    if (checked && rewards.length === 0) {
      setActivateError(true)
      return
    }
    setActive(checked)
    toast.success('Changes saved')
  }

  function saveReward(draft: RewardDraft) {
    const editing = dialog?.reward ?? null
    const next: Reward = {
      id: editing?.id ?? nextId('reward'),
      points: draft.points,
      discount: draft.discount,
    }
    setRewards((current) =>
      editing
        ? current.map((reward) => (reward.id === editing.id ? next : reward))
        : [...current, next],
    )
    setDialog(null)
    toast.success(editing ? 'Reward updated' : 'Reward added')
  }

  function confirmDelete() {
    if (pendingDelete === null) return
    setRewards((current) =>
      current.filter((reward) => reward.id !== pendingDelete.id),
    )
    setPendingDelete(null)
    toast.success('Reward deleted')
  }

  return (
    <>
      <div className="w-full">
        <header className="relative mb-6 flex items-center justify-center md:mb-4">
          {/* Back button is only shown on mobile; on desktop the sidebar covers
              navigation. */}
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Go back"
            onClick={() => window.history.back()}
            className="absolute left-0 md:hidden"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
            Loyalty Program
          </h1>
        </header>

        <div className="mx-auto w-full max-w-[640px]">
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Encourage repeat purchases by rewarding points
          </p>

          <div className="flex flex-col gap-8">
            <Section>
              <SettingRow
                id="loyalty-active"
                label="Activate"
                icon={Star}
                description="Allow customers to join and redeem rewards"
              >
                <Switch
                  id="loyalty-active"
                  aria-label="Activate"
                  checked={active}
                  onCheckedChange={toggleActive}
                />
              </SettingRow>
            </Section>

            <Section
              title="Earn points"
              info="These are standard values and are not customizable yet"
            >
              <EarnRow
                label="Joining the program"
                icon={UserPlus}
                value="100 points"
              />
              <EarnRow label="Every $1 spend" icon={Coins} value="10 points" />
            </Section>

            <Section
              title="Redeem rewards"
              action={
                rewards.length < MAX_REWARDS ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-10 px-3"
                    onClick={() => setDialog({ reward: null })}
                  >
                    <Plus className="size-4" />
                    Add reward
                  </Button>
                ) : null
              }
            >
              {rewards.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No rewards
                </p>
              ) : (
                rewards.map((reward) => (
                  <RewardRow
                    key={reward.id}
                    reward={reward}
                    // An active program must keep at least one reward to redeem,
                    // so the last remaining reward can't be deleted until it's
                    // deactivated.
                    canDelete={!active || rewards.length > 1}
                    onEdit={() => setDialog({ reward })}
                    onDelete={() => setPendingDelete(reward)}
                  />
                ))
              )}
            </Section>
          </div>
        </div>
      </div>

      {dialog !== null ? (
        <RewardDialog
          // Re-mount per open/target so the draft resets from `initial`.
          key={dialog.reward?.id ?? 'new'}
          initial={
            dialog.reward
              ? {
                  points: dialog.reward.points,
                  discount: dialog.reward.discount,
                }
              : null
          }
          onOpenChange={(open) => {
            if (!open) setDialog(null)
          }}
          onSave={saveReward}
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
            <AlertDialogTitle>Delete reward?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `The ${pendingDelete.points} points reward will be removed and customers will no longer be able to redeem it.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={activateError} onOpenChange={setActivateError}>
        <DialogContent className="sm:max-w-md [&_[data-slot=dialog-close]]:size-10">
          <DialogHeader className="text-center">
            <DialogTitle asChild>
              <TypographyH4 className="font-semibold">No rewards</TypographyH4>
            </DialogTitle>
          </DialogHeader>

          <DialogBody>
            <DialogDescription className="text-center">
              You need at least one reward before you can activate the loyalty
              program
            </DialogDescription>
          </DialogBody>

          <DialogFooter className="flex-row">
            <Button
              className="h-10 px-3 flex-1"
              onClick={() => {
                setActivateError(false)
                setDialog({ reward: null })
              }}
            >
              Add rewards
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
