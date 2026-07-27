"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TypographyH4 } from "@/components/ui/typography"

// Mock account details, matching the user shown in the sidebar footer.
const DEFAULT_PROFILE = { name: "Derek Low", email: "derek@haus.com" }

// Name/email form. The footer pairs a secondary "Change password" button —
// which hands off to ChangePasswordDialog — with the primary save action.
export function ProfileDialog({
  open,
  onOpenChange,
  onChangePassword,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChangePassword: () => void
}) {
  const [name, setName] = React.useState(DEFAULT_PROFILE.name)
  const [email, setEmail] = React.useState(DEFAULT_PROFILE.email)

  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
  const canSave = trimmedName !== "" && isEmailValid

  function handleSave() {
    if (!trimmedName) {
      toast.error("Enter your name")
      return
    }
    if (!isEmailValid) {
      toast.error("Enter a valid email address")
      return
    }
    toast.success("Profile updated")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="[&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Profile</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="h-10"
            />
          </div>
        </DialogBody>

        <DialogFooter className="flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1 px-3"
            onClick={onChangePassword}
          >
            Change password
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

// Minimum length enforced on the new password.
const MIN_PASSWORD_LENGTH = 8

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [oldPassword, setOldPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    // Clear the form once the dialog has closed.
    if (!next) {
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  const canSave =
    oldPassword !== "" &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword !== ""

  function handleSave() {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    toast.success("Password changed")
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Change password</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="old-password" className="text-sm font-medium">
              Old password
            </Label>
            <Input
              id="old-password"
              type="password"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              placeholder="Enter your current password"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-sm font-medium">
              New password
            </Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Set a strong password"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm new password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your new password"
              className="h-10"
            />
          </div>
        </DialogBody>

        <DialogFooter className="flex-row">
          <Button
            variant="outline"
            className="h-10 flex-1 px-3"
            onClick={() => handleOpenChange(false)}
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
