// Shared model for the custom questions asked on the order form, reused by the
// product page for its customizations.

// Monotonic id source for the choices created while a dialog is open. A
// module-level counter keeps ids stable across remounts.
let idCounter = 0
export function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export type AnswerType = 'text' | 'multiple-choice'
// How many of a multiple-choice question's options a customer may pick.
export type AnswerCount = 'one' | 'unlimited' | 'exact' | 'minimum' | 'range'

// `surcharge` is what picking the choice adds to the price. Only the product
// page's customizations charge for a choice, so it stays empty elsewhere.
export type CustomChoice = { id: string; value: string; surcharge: string }

export type CustomQuestion = {
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
export type CustomQuestionDraft = Omit<CustomQuestion, 'id'>

export const ANSWER_TYPE_OPTIONS: { value: AnswerType; label: string }[] = [
  { value: 'text', label: 'Text input' },
  { value: 'multiple-choice', label: 'Multiple choice' },
]

// Rendered in a two-column grid, so the order fills One/Unlimited, then
// Exact/Minimum, then Range — matching the reference layout.
export const ANSWER_COUNT_OPTIONS: { value: AnswerCount; label: string }[] = [
  { value: 'one', label: 'One' },
  { value: 'unlimited', label: 'Unlimited' },
  { value: 'exact', label: 'Exact number' },
  { value: 'minimum', label: 'Minimum number' },
  { value: 'range', label: 'Range' },
]

function newCustomChoices(): CustomChoice[] {
  return [
    { id: nextId('choice'), value: '', surcharge: '' },
    { id: nextId('choice'), value: '', surcharge: '' },
  ]
}

export function defaultCustomDraft(): CustomQuestionDraft {
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
export function customCaption(question: CustomQuestion): string {
  if (question.descriptionEnabled && question.description.trim() !== '') {
    return question.description
  }
  return question.answerType === 'text' ? 'Text input' : 'Multiple choice'
}
