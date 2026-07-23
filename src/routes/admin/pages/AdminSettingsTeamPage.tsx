import * as React from 'react'
import { ArrowLeft, MoreHorizontal, Plus, Trash2, User } from 'lucide-react'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { TypographyH4 } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

// The owner is fixed; everyone else can be promoted/demoted or removed.
type MemberRole = 'Owner' | 'Admin' | 'Member'

// A role that can be assigned when inviting or editing a member (the owner role
// is never assignable).
type AssignableRole = 'Admin' | 'Member'

type TeamMember = {
  id: string
  name: string
  email: string
  role: MemberRole
  // Tailwind background utility for the avatar, keyed to the member so it stays
  // stable across re-renders.
  avatarColor: string
}

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'owner',
    name: 'John Doe',
    email: 'coffeebrewer136@gmail.com',
    role: 'Owner',
    avatarColor: 'bg-red-500',
  },
  {
    id: 'kieran',
    name: 'kieran',
    email: 'kieran+test@cococart.co',
    role: 'Member',
    avatarColor: 'bg-orange-500',
  },
  {
    id: 'pri',
    name: 'Pri',
    email: 'pri+cb@cococart.co',
    role: 'Member',
    avatarColor: 'bg-green-500',
  },
]

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || '?'
}

// A single team member row: avatar + name/email on the left, role on the right,
// with an overflow menu for non-owner members. Mirrors the Store page's divided
// rows.
function MemberRow({
  member,
  onRoleChange,
  onRemove,
}: {
  member: TeamMember
  onRoleChange: (id: string, role: AssignableRole) => void
  onRemove: (id: string) => void
}) {
  const isOwner = member.role === 'Owner'
  const nextRole: AssignableRole = member.role === 'Admin' ? 'Member' : 'Admin'

  return (
    <div className="flex items-center gap-4 py-4">
      <Avatar size="lg">
        <AvatarFallback className={cn('text-white', member.avatarColor)}>
          {initialsFor(member.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {member.name}
        </p>
        <p className="truncate text-sm text-muted-foreground">{member.email}</p>
      </div>
      <span className="text-sm text-muted-foreground">{member.role}</span>
      {isOwner ? (
        <div className="size-9 shrink-0" aria-hidden />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 text-muted-foreground"
              aria-label={`Manage ${member.name}`}
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem
              className="whitespace-nowrap"
              onSelect={() => onRoleChange(member.id, nextRole)}
            >
              <User className="size-4" />
              Change to {nextRole}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onRemove(member.id)}
            >
              <Trash2 className="size-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

// Dialog for inviting a new member: an email field plus a radio field to pick
// the role. Reuses the bordered/divided radio layout from the Export to CSV
// dialog's "Show products" field.
function AddMemberDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (email: string, role: AssignableRole) => void
}) {
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState<AssignableRole>('Member')

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    // Reset the form once the dialog has closed.
    if (!next) {
      setEmail('')
      setRole('Member')
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    onAdd(email.trim(), role)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[&_[data-slot=dialog-close]]:size-10">
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader>
            <DialogTitle asChild>
              <TypographyH4 className="text-center font-semibold">
                Add member
              </TypographyH4>
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
          <FieldGroup className="gap-6">
            <Field>
              <FieldLabel htmlFor="member-email">Email address</FieldLabel>
              <Input
                id="member-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                className="h-10"
              />
            </Field>
            <FieldSet>
              <FieldLegend variant="label">Role</FieldLegend>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as AssignableRole)}
                className="gap-0 divide-y overflow-hidden rounded-lg border"
              >
                <FieldLabel
                  htmlFor="role-admin"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 font-normal transition-colors hover:bg-muted/50"
                >
                  <span className="flex flex-col gap-1">
                    <span className="font-medium">Admin</span>
                    <span className="text-sm text-muted-foreground">
                      Full access to everything
                    </span>
                  </span>
                  <RadioGroupItem value="Admin" id="role-admin" />
                </FieldLabel>
                <FieldLabel
                  htmlFor="role-member"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 font-normal transition-colors hover:bg-muted/50"
                >
                  <span className="flex flex-col gap-1">
                    <span className="font-medium">Member</span>
                    <span className="text-sm text-muted-foreground">
                      Limited access to non-sensitive pages
                    </span>
                  </span>
                  <RadioGroupItem value="Member" id="role-member" />
                </FieldLabel>
              </RadioGroup>
            </FieldSet>
          </FieldGroup>
          </DialogBody>
          <DialogFooter className="flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10 flex-1" disabled={!isEmailValid}>
              Add member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminSettingsTeamPage() {
  const [members, setMembers] = React.useState<TeamMember[]>(INITIAL_MEMBERS)
  const [addOpen, setAddOpen] = React.useState(false)
  const [pendingRemoval, setPendingRemoval] = React.useState<TeamMember | null>(
    null,
  )

  function handleRoleChange(id: string, role: AssignableRole) {
    setMembers((current) =>
      current.map((member) =>
        member.id === id ? { ...member, role } : member,
      ),
    )
    toast.success(`Role updated to ${role}`)
  }

  function handleAdd(email: string, role: AssignableRole) {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500']
    const name = email.split('@')[0] || email
    setMembers((current) => [
      ...current,
      {
        id: `${email}-${current.length}`,
        name,
        email,
        role,
        avatarColor: colors[current.length % colors.length],
      },
    ])
    toast.success(`Invite sent to ${email}`)
  }

  function confirmRemoval() {
    if (!pendingRemoval) return
    const removed = pendingRemoval
    setMembers((current) =>
      current.filter((member) => member.id !== removed.id),
    )
    setPendingRemoval(null)
    toast.success(`Removed ${removed.name}`)
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
            Team
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <section>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Add team members to help you manage your shop
            </p>
            <Card className="mb-6 gap-0 py-0 shadow-none">
              <div className="divide-y divide-border/50 px-4 sm:px-6">
                {members.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    onRoleChange={handleRoleChange}
                    onRemove={(id) =>
                      setPendingRemoval(
                        members.find((m) => m.id === id) ?? null,
                      )
                    }
                  />
                ))}
              </div>
            </Card>

            <Button
              type="button"
              variant="secondary"
              className="h-11 w-full"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-4" />
              Add member
            </Button>
          </section>
        </div>
      </div>

      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAdd}
      />

      <AlertDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemoval
                ? `${pendingRemoval.name} will lose access to your shop.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmRemoval}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
