import * as React from "react"
import { ArrowLeft, Download } from "lucide-react"
import { toast } from "sonner"

import qrCodeSample from "@/assets/apps/qr-code-sample.png"
import cococartLogomark from "@/assets/cococart-logomark-bw.svg"
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
import { TypographyH4, TypographyMuted } from "@/components/ui/typography"

// The label is printed on the QR card, so it has to stay short enough to read
// at a glance on a table tent.
const LABEL_MAX_LENGTH = 20

// Generates a printable QR code for the storefront. The dialog has two states:
// the label form, and the generated card with the download action. "Back"
// returns to the form so several codes can be made in one sitting.
export function DownloadQrCodesDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [label, setLabel] = React.useState("")
  // The label as it was when Generate was pressed, so editing the field after
  // generating can't change the card that's already on screen.
  const [generatedLabel, setGeneratedLabel] = React.useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    // Clear the form once the dialog has closed.
    if (!next) {
      setLabel("")
      setGeneratedLabel(null)
    }
  }

  function handleGenerate() {
    setGeneratedLabel(label.trim())
  }

  function handleBack() {
    setLabel("")
    setGeneratedLabel(null)
  }

  function handleDownload() {
    toast.success("QR code downloaded")
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="[&_[data-slot=dialog-close]]:size-10">
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyH4 className="text-center font-semibold">
              Download QR codes
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <TypographyMuted className="leading-6">
            You can create any number of QR codes with unique labels to identify
            where the order came from
          </TypographyMuted>

          {generatedLabel === null ? (
            <div className="space-y-1.5">
              <Label htmlFor="qr-code-label" className="text-sm font-medium">
                Label (optional)
              </Label>
              <Input
                id="qr-code-label"
                value={label}
                maxLength={LABEL_MAX_LENGTH}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Example: Table 1"
                className="h-10"
              />
            </div>
          ) : (
            <QrCodeCard label={generatedLabel} />
          )}
        </DialogBody>

        {generatedLabel === null ? (
          <DialogFooter className="flex-row">
            <Button className="h-10 flex-1 px-3" onClick={handleGenerate}>
              Generate
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter className="flex-row">
            <Button
              variant="outline"
              className="h-10 flex-1 px-3"
              onClick={handleBack}
            >
              <ArrowLeft />
              Back
            </Button>
            <Button className="h-10 flex-1 px-3" onClick={handleDownload}>
              <Download />
              Download
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// A preview of the printable card the merchant gets: the QR code on a white
// tile, then the Cococart mark and the instruction to scan. The card is only as
// wide as the code it frames, centred in the dialog rather than filling it.
function QrCodeCard({ label }: { label: string }) {
  return (
    <div className="mx-auto flex w-64 flex-col items-center gap-4 rounded-2xl border-2 border-foreground bg-primary px-6 py-6 text-primary-foreground">
      <div className="flex w-full flex-col items-center gap-2 rounded-lg bg-background px-4 py-4">
        <img src={qrCodeSample} alt="QR code" className="w-full" />
        {label ? (
          <span className="w-full truncate text-center text-xs font-semibold text-foreground">
            {label}
          </span>
        ) : null}
      </div>
      <img src={cococartLogomark} alt="" className="size-10" />
      <p className="text-center text-lg leading-6 font-bold text-balance">
        Scan to order on Cococart
      </p>
    </div>
  )
}
