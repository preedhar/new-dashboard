import * as React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

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
import { TypographyH4 } from '@/components/ui/typography'
import { cn } from '@/lib/utils'
import {
  ANSWER_COUNT_OPTIONS,
  ANSWER_TYPE_OPTIONS,
  defaultCustomDraft,
  nextId,
  type AnswerCount,
  type AnswerType,
  type CustomChoice,
  type CustomQuestion,
  type CustomQuestionDraft,
} from '../custom-questions'

// The add/edit dialog for a custom question. The visible fields change with the
// answer type, and — for multiple choice — with the number of allowed answers.
// Modeled on the fulfillment add-method dialog (scrolling body, sticky footer).
// `noun` names what is being edited in the heading and error toasts, so the
// product page can show the same dialog as "Add customization".
export function CustomQuestionDialog({
  initial,
  noun = 'question',
  // Only a product's customizations can price a choice; the order form's
  // questions ask without charging, so they leave this off.
  showChoiceSurcharge = false,
  onOpenChange,
  onSave,
}: {
  initial: CustomQuestion | null
  noun?: string
  showChoiceSurcharge?: boolean
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

  function updateChoice(id: string, patch: Partial<CustomChoice>) {
    setDraft((current) => ({
      ...current,
      choices: current.choices.map((choice) =>
        choice.id === id ? { ...choice, ...patch } : choice,
      ),
    }))
  }

  function addChoice() {
    setDraft((current) => ({
      ...current,
      choices: [
        ...current.choices,
        { id: nextId('choice'), value: '', surcharge: '' },
      ],
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
  // A selection limit already implies whether an answer is required, so the
  // "Answer required" toggle is hidden for every limit other than "One".
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
      toast.error(`Enter a ${noun} title`)
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
              {isEditing ? `Edit ${noun}` : `Add ${noun}`}
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
                {/* Priced choices stack into two rows of their own on a phone,
                    so the list needs more air between them to read as separate
                    choices. Mirrors the bulk discounts dialog. */}
                <div
                  className={cn(
                    'space-y-3',
                    showChoiceSurcharge && 'space-y-6 sm:space-y-3',
                  )}
                >
                  {draft.choices.map((choice, index) => (
                    // The surcharge sits under the choice on a phone, with the
                    // delete button sharing the first row so both fields keep
                    // the same width. They line up side by side from sm up.
                    <div
                      key={choice.id}
                      className={cn(
                        'grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2 gap-y-3 sm:gap-3',
                        showChoiceSurcharge &&
                          'sm:grid-cols-[minmax(0,1fr)_7rem_auto]',
                      )}
                    >
                      <div className="col-start-1 row-start-1 min-w-0 space-y-1.5">
                        {/* The fields only need naming once there are two of
                            them to tell apart. */}
                        {showChoiceSurcharge ? (
                          <Label
                            htmlFor={`${choice.id}-value`}
                            className="text-sm font-normal text-muted-foreground"
                          >
                            Choice
                          </Label>
                        ) : null}
                        <Input
                          id={`${choice.id}-value`}
                          value={choice.value}
                          onChange={(event) =>
                            updateChoice(choice.id, {
                              value: event.target.value,
                            })
                          }
                          placeholder={`Choice ${index + 1}`}
                          className="h-10"
                        />
                      </div>
                      {/* What the choice adds to the price, left empty when it
                          costs nothing extra. */}
                      {showChoiceSurcharge ? (
                        <div className="col-start-1 row-start-2 min-w-0 space-y-1.5 sm:col-start-2 sm:row-start-1">
                          <Label
                            htmlFor={`${choice.id}-surcharge`}
                            className="text-sm font-normal text-muted-foreground"
                          >
                            Surcharge
                          </Label>
                          <InputGroup className="h-10">
                            <InputGroupAddon
                              align="inline-start"
                              className="pl-3"
                            >
                              $
                            </InputGroupAddon>
                            <InputGroupInput
                              id={`${choice.id}-surcharge`}
                              inputMode="decimal"
                              value={choice.surcharge}
                              onChange={(event) =>
                                updateChoice(choice.id, {
                                  surcharge: event.target.value,
                                })
                              }
                              placeholder="0"
                              className="tabular-nums"
                            />
                          </InputGroup>
                        </div>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'col-start-2 row-start-1 size-10 shrink-0 text-muted-foreground',
                          showChoiceSurcharge && 'sm:col-start-3',
                        )}
                        aria-label={`Remove choice ${index + 1}`}
                        disabled={draft.choices.length <= 1}
                        onClick={() => removeChoice(choice.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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

          {showLimitSelections ? null : (
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
          )}
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
