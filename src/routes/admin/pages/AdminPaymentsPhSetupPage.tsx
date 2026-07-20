import * as React from 'react'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  File as FileIcon,
  IdCard,
  Info,
  Landmark,
  MapPin,
  Phone,
  Plus,
  ScanFace,
  Shapes,
  Signature,
  Type,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/components/ui/attachment'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Client-side navigation matching the app's router (pushState + popstate).
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// Once submitted, the account moves to the in-review state.
const PROGRESS_PATH = '/admin/settings/payments-ph-progress'

type IconComponent = React.ComponentType<{ className?: string }>

// ---------------------------------------------------------------------------
// Steps progress (shown once past the first step). Mirrors the Book deliveries
// dialog on the All orders page: one segmented progress bar per step, each
// filling once its step is reached.
// ---------------------------------------------------------------------------

const STEPS = [
  {
    key: 'business',
    title: 'Business details',
    description: 'Let us know about your business',
  },
  {
    key: 'personal',
    title: 'Personal details',
    description: 'Tell us about the person that registered the business',
  },
  {
    key: 'documents',
    title: 'Documents',
    description: 'Upload your business documents',
  },
] as const

function ProgressSteps({ current }: { current: number }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {STEPS.map((step, index) => (
        <Progress key={step.key} value={index <= current ? 100 : 0} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

// A horizontal field row: label (icon + text, optional description below) on the
// left, control on the right. Matches the Fulfillment time slots settings page.
function FieldRow({
  icon: Icon,
  label,
  htmlFor,
  description,
  labelOffset,
  children,
}: {
  icon: IconComponent
  label: string
  htmlFor?: string
  description?: React.ReactNode
  // Nudges the label down on desktop so it aligns with the first line of a
  // multi-option control (radios, stacked inputs) rather than its top border.
  labelOffset?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 py-4 sm:flex-row sm:justify-between sm:gap-6',
        // Offset fields (multi-option controls) top-align the label; every other
        // field vertically centers the label against its control.
        labelOffset ? 'sm:items-start' : 'sm:items-center',
      )}
    >
      <div className="min-w-0 sm:flex-1">
        <Label
          htmlFor={htmlFor}
          className={cn(
            'flex items-center gap-4 text-sm font-medium md:gap-6',
            labelOffset && 'sm:mt-2',
          )}
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </Label>
        {description ? (
          <div className="mt-1.5 text-sm text-muted-foreground md:pl-10">
            {description}
          </div>
        ) : null}
      </div>
      <div className="w-full sm:w-72 sm:shrink-0">{children}</div>
    </div>
  )
}

// Human-readable file size for the attachment description.
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// A "Select file" upload control. Purely a mockup — once a file is chosen it's
// shown via the Attachment component (sm variant) with a remove action.
function FileSelect({ label }: { label: string }) {
  const [file, setFile] = React.useState<File | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function clearFile() {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex justify-end">
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        aria-label={label}
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      {file ? (
        <Attachment size="sm" className="w-full">
          <AttachmentMedia>
            <FileIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{file.name}</AttachmentTitle>
            <AttachmentDescription>
              {formatFileSize(file.size)}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              aria-label={`Remove ${file.name}`}
              onClick={clearFile}
            >
              <X />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 px-3"
          onClick={() => inputRef.current?.click()}
        >
          <Plus className="size-4" />
          Select file
        </Button>
      )}
    </div>
  )
}

// A radio group rendered as a vertically-stacked bordered list — the same
// component styling as the time slots "Length" selector, stacked instead of
// laid out in columns.
function VerticalRadioGroup({
  name,
  ariaLabel,
  value,
  onValueChange,
  options,
}: {
  name: string
  ariaLabel: string
  value: string
  onValueChange: (value: string) => void
  options: readonly { value: string; label: string }[]
}) {
  return (
    <RadioGroup
      aria-label={ariaLabel}
      value={value}
      onValueChange={onValueChange}
      className="grid w-full grid-cols-1 gap-0 divide-y overflow-hidden rounded-lg border"
    >
      {options.map((option) => {
        const id = `${name}-${option.value}`
        return (
          <FieldLabel
            key={option.value}
            htmlFor={id}
            className="flex w-full items-center justify-between gap-1 rounded-none px-3 py-3 text-sm font-normal transition-colors hover:bg-muted/50 has-[[data-checked]]:bg-primary/5"
          >
            {option.label}
            <RadioGroupItem value={option.value} id={id} />
          </FieldLabel>
        )
      })}
    </RadioGroup>
  )
}

const BUSINESS_TYPES = [
  { value: 'unregistered', label: 'Unregistered' },
  { value: 'sole-proprietor', label: 'Sole proprietor' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation', label: 'Corporation' },
] as const

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const

const PERSONAL_ID_TYPES = [
  'Passport ID',
  'Driver’s license',
  'National ID',
  'UMID',
  'PhilHealth ID',
] as const

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function BusinessDetailsStep({
  businessType,
  onBusinessTypeChange,
  onNext,
  onActivate,
}: {
  businessType: string
  onBusinessTypeChange: (value: string) => void
  onNext: () => void
  onActivate: () => void
}) {
  const isUnregistered = businessType === 'unregistered'

  return (
    <Card className="gap-0 py-0 shadow-none">
        <div className="divide-y divide-border/50 px-4 sm:px-6">
          <FieldRow icon={Shapes} label="Business type" labelOffset>
            <VerticalRadioGroup
              name="business-type"
              ariaLabel="Business type"
              value={businessType}
              onValueChange={onBusinessTypeChange}
              options={BUSINESS_TYPES}
            />
          </FieldRow>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-6">
          {isUnregistered ? (
            <Alert>
              <Info />
              <AlertTitle>QR-Ph, Maya and BancNet are available for you</AlertTitle>
              <AlertDescription>
                Xendit requires a business registration to support Card and
                GCash payments
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex justify-end">
            {isUnregistered ? (
              <Button type="button" className="h-10 px-3" onClick={onActivate}>
                Activate
              </Button>
            ) : (
              <Button
                type="button"
                className="h-10 gap-1.5 px-3"
                disabled={businessType === ''}
                onClick={onNext}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
    </Card>
  )
}

type PersonalDetails = {
  firstName: string
  surname: string
  gender: string
  dateOfBirth: Date | undefined
  placeOfBirth: string
  phone: string
  tin: string
  idType: string
}

function PersonalDetailsStep({
  details,
  onChange,
  onPrevious,
  onNext,
}: {
  details: PersonalDetails
  onChange: (details: PersonalDetails) => void
  onPrevious: () => void
  onNext: () => void
}) {
  const [dateOpen, setDateOpen] = React.useState(false)

  function update<K extends keyof PersonalDetails>(
    key: K,
    value: PersonalDetails[K],
  ) {
    onChange({ ...details, [key]: value })
  }

  return (
    <Card className="gap-0 py-0 shadow-none">
        <div className="divide-y divide-border/50 px-4 sm:px-6">
          <FieldRow icon={Type} label="Name" labelOffset>
            <div className="grid grid-cols-1 gap-2">
              <Input
                aria-label="First name"
                value={details.firstName}
                onChange={(event) => update('firstName', event.target.value)}
                placeholder="First name"
                className="h-10"
              />
              <Input
                aria-label="Surname"
                value={details.surname}
                onChange={(event) => update('surname', event.target.value)}
                placeholder="Surname"
                className="h-10"
              />
            </div>
          </FieldRow>

          <FieldRow icon={UserRound} label="Gender" labelOffset>
            <VerticalRadioGroup
              name="gender"
              ariaLabel="Gender"
              value={details.gender}
              onValueChange={(value) => update('gender', value)}
              options={GENDERS}
            />
          </FieldRow>

          <FieldRow icon={CalendarIcon} label="Date of birth" htmlFor="dob">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="dob"
                  type="button"
                  variant="outline"
                  className="h-10 w-full justify-between px-3 font-normal"
                >
                  <span
                    className={
                      details.dateOfBirth ? '' : 'text-muted-foreground'
                    }
                  >
                    {details.dateOfBirth
                      ? details.dateOfBirth.toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Select a date'}
                  </span>
                  <CalendarIcon className="size-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  startMonth={new Date(1920, 0)}
                  endMonth={new Date(new Date().getFullYear(), 11)}
                  defaultMonth={details.dateOfBirth}
                  disabled={{ after: new Date() }}
                  selected={details.dateOfBirth}
                  onSelect={(date) => {
                    update('dateOfBirth', date)
                    setDateOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          </FieldRow>

          <FieldRow
            icon={MapPin}
            label="Place of birth"
            htmlFor="place-of-birth"
          >
            <Input
              id="place-of-birth"
              value={details.placeOfBirth}
              onChange={(event) => update('placeOfBirth', event.target.value)}
              placeholder="Place name"
              className="h-10"
            />
          </FieldRow>

          <FieldRow icon={Phone} label="Phone number" htmlFor="phone">
            <Input
              id="phone"
              inputMode="tel"
              value={details.phone}
              onChange={(event) => update('phone', event.target.value)}
              placeholder="63XXXXXXXXXX"
              className="h-10"
            />
          </FieldRow>

          <FieldRow
            icon={Landmark}
            label="Tax Identification Number"
            htmlFor="tin"
            description="Name in the TIN should match your documents"
          >
            <Input
              id="tin"
              value={details.tin}
              onChange={(event) => update('tin', event.target.value)}
              placeholder="Number"
              className="h-10"
            />
          </FieldRow>

          <FieldRow
            icon={IdCard}
            label="Personal ID"
            description={
              <ul className="list-disc space-y-0.5 pl-4">
                <li>Should match the provided details</li>
                <li>Your signature should be clearly visible</li>
              </ul>
            }
          >
            <div className="space-y-3">
              <Select
                value={details.idType}
                onValueChange={(value) => update('idType', value)}
              >
                <SelectTrigger className="w-full data-[size=default]:h-10">
                  <SelectValue placeholder="Select an ID type" />
                </SelectTrigger>
                <SelectContent>
                  {PERSONAL_ID_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FileSelect label="Personal ID file" />
            </div>
          </FieldRow>

          <FieldRow
            icon={ScanFace}
            label="Selfie with personal ID"
            description="Your face should be clearly seen and match your personal ID"
          >
            <FileSelect label="Selfie with personal ID file" />
          </FieldRow>

          <FieldRow
            icon={Signature}
            label="Photo of your signature"
            description="For verification purpose only. Ensure that it matches your ID."
          >
            <FileSelect label="Signature file" />
          </FieldRow>
        </div>

        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-1.5 px-3"
            onClick={onPrevious}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button type="button" className="h-10 gap-1.5 px-3" onClick={onNext}>
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
    </Card>
  )
}

function DocumentsStep({
  onPrevious,
  onSubmit,
}: {
  onPrevious: () => void
  onSubmit: () => void
}) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-1.5 px-3"
          onClick={onPrevious}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button type="button" className="h-10 px-3" onClick={onSubmit}>
          Submit
        </Button>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Setup page
// ---------------------------------------------------------------------------

export function AdminSettingsPaymentsPhSetupPage() {
  const [stepIndex, setStepIndex] = React.useState(0)
  const [businessType, setBusinessType] = React.useState('')
  const [personal, setPersonal] = React.useState<PersonalDetails>({
    firstName: '',
    surname: '',
    gender: '',
    dateOfBirth: undefined,
    placeOfBirth: '',
    phone: '',
    tin: '',
    idType: '',
  })

  // The first step is for unregistered businesses too, who don't continue past
  // it — so the steps progress only appears once the flow moves forward.
  const showSteps = stepIndex > 0

  function goNext() {
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1))
  }

  function goPrevious() {
    setStepIndex((index) => Math.max(index - 1, 0))
  }

  function activate() {
    toast.success('Payment methods activated')
    navigateTo(PROGRESS_PATH)
  }

  function submit() {
    toast.success('Details submitted for review')
    navigateTo(PROGRESS_PATH)
  }

  return (
    <div className="w-full">
      <header className="relative mb-4 flex items-center justify-center">
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
          {STEPS[stepIndex].title}
        </h1>
      </header>

      <div className="mx-auto w-full max-w-[640px]">
        <p className="mb-8 text-center text-sm text-muted-foreground">
          {STEPS[stepIndex].description}
        </p>

        {showSteps ? <ProgressSteps current={stepIndex} /> : null}

        {stepIndex === 0 ? (
          <BusinessDetailsStep
            businessType={businessType}
            onBusinessTypeChange={setBusinessType}
            onNext={goNext}
            onActivate={activate}
          />
        ) : null}
        {stepIndex === 1 ? (
          <PersonalDetailsStep
            details={personal}
            onChange={setPersonal}
            onPrevious={goPrevious}
            onNext={goNext}
          />
        ) : null}
        {stepIndex === 2 ? (
          <DocumentsStep onPrevious={goPrevious} onSubmit={submit} />
        ) : null}
      </div>
    </div>
  )
}
