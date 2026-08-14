import * as React from 'react'
import { Check, ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TypographyH4, TypographyMuted } from '@/components/ui/typography'

export type LibraryImage = {
  id: string
  name: string
  // Uploaded images carry an object URL. The store's own images are
  // intentionally empty placeholders, as the email thumbnails are.
  url?: string
}

// Images already on the store, shown as a grid to pick from.
const STORE_LIBRARY: LibraryImage[] = Array.from({ length: 24 }, (_, index) => ({
  id: `store-image-${index + 1}`,
  name: `Store image ${index + 1}`,
}))

// Picks a single image for an email: either a fresh upload or one of the images
// already on the store. The choice is only handed back once Choose is pressed,
// so cancelling leaves the current image untouched.
export function ChooseImageDialog({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: LibraryImage | null
  onChange: (image: LibraryImage) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const uploadCount = React.useRef(0)
  // Uploads last for the session so they can be picked alongside the store's
  // images. They sit in the dropzone rather than the grid, since they aren't on
  // the store yet.
  const [uploads, setUploads] = React.useState<LibraryImage[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(
    value?.id ?? null,
  )
  // Highlights the dropzone while a file is held over it.
  const [dragging, setDragging] = React.useState(false)

  const selected =
    [...uploads, ...STORE_LIBRARY].find((image) => image.id === selectedId) ??
    null

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    // Closing without choosing drops the draft selection, so reopening starts
    // from whatever image is currently chosen.
    if (!next) setSelectedId(value?.id ?? null)
  }

  function addFiles(files: File[]) {
    const added = files.map((file) => {
      uploadCount.current += 1
      return {
        id: `upload-${uploadCount.current}`,
        name: file.name,
        url: URL.createObjectURL(file),
      }
    })
    setUploads((current) => [...added, ...current])
    // An upload is almost always the image the merchant wants, so select the
    // last one added rather than making them click it again.
    setSelectedId(added[added.length - 1].id)
  }

  function removeUpload(image: LibraryImage) {
    setUploads((current) => current.filter((upload) => upload.id !== image.id))
    // Nothing is chosen once the chosen image is gone.
    if (image.id === selectedId) setSelectedId(null)
    if (image.url) URL.revokeObjectURL(image.url)
  }

  function handleChoose() {
    if (!selected) return
    onChange(selected)
    // Closed directly rather than through `handleOpenChange`, which would reset
    // the selection to the image chosen before this one.
    onOpenChange(false)
    toast.success('Image selected')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">
              Images
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <TypographyMuted className="leading-6 font-normal">
            We recommend using images that are at least 1200px wide
          </TypographyMuted>

          <input
            ref={inputRef}
            id="choose-image-upload"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              // Snapshot the files to an array before resetting the input:
              // clearing `value` empties the live FileList.
              const files = event.target.files
                ? Array.from(event.target.files)
                : []
              // Reset so picking the same file again still fires onChange.
              event.target.value = ''
              if (files.length > 0) addFiles(files)
            }}
          />
          {/* A div rather than a button so the uploaded thumbnails, which carry
              their own buttons, can live inside it. */}
          <div
            onDragOver={(event) => {
              // Claiming the drag is what stops the browser from opening the
              // dropped file in a new tab.
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              const files = Array.from(event.dataTransfer.files).filter((file) =>
                file.type.startsWith('image/'),
              )
              if (files.length > 0) addFiles(files)
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-6 transition-colors',
              dragging && 'border-primary bg-muted/50',
            )}
          >
            {uploads.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-3">
                {uploads.map((image) => {
                  const isSelected = image.id === selectedId
                  return (
                    <div key={image.id} className="relative size-20">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedId(image.id)}
                        className={cn(
                          'size-full overflow-hidden rounded-lg border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isSelected && 'ring-2 ring-ring',
                        )}
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className="size-full object-cover"
                        />
                        {/* Sits opposite the remove button so the two don't
                            overlap on a thumbnail this small. */}
                        <span
                          className={cn(
                            'absolute top-1 left-1 flex size-5 items-center justify-center rounded-full border',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background/80',
                          )}
                        >
                          {isSelected ? <Check className="size-3" /> : null}
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        aria-label={`Remove ${image.name}`}
                        onClick={() => removeUpload(image)}
                        className="absolute top-1 right-1 size-6"
                      >
                        <X className="text-neutral-700" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-lg text-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* The thumbnails above stand in for the icon once there's
                  something in the zone. */}
              {uploads.length === 0 ? (
                <ImagePlus className="size-6 text-muted-foreground" />
              ) : null}
              <span className="text-sm font-medium text-muted-foreground">
                Upload or drop a new image
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-foreground">
              Choose from your store
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {STORE_LIBRARY.map((image) => {
                const isSelected = image.id === selectedId
                return (
                  <button
                    key={image.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedId(image.id)}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-md border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected && 'ring-2 ring-ring',
                    )}
                  >
                    <span className="sr-only">{image.name}</span>
                    <span
                      className={cn(
                        'absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full border',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background/80',
                      )}
                    >
                      {isSelected ? <Check className="size-3" /> : null}
                    </span>
                  </button>
                )
              })}
            </div>
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
          <Button
            className="h-10 flex-1"
            disabled={!selected}
            onClick={handleChoose}
          >
            Choose
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
