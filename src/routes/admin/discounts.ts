import * as React from 'react'

// The discounts shared by the Discounts list and the add/edit discount form.
// There's no backend behind the prototype, so they live in memory for the
// session: the form writes here and the list picks the change up on return.

export const DISCOUNTS_PATH = '/admin/marketing/discounts'
export const NEW_DISCOUNT_PATH = '/admin/marketing/discounts/new'
export const EDIT_DISCOUNT_PATH = '/admin/marketing/discounts/edit'

export function editDiscountPath(id: string) {
  return `${EDIT_DISCOUNT_PATH}?discount=${encodeURIComponent(id)}`
}

// What a discount comes off: the whole order, only some products or
// categories, or the delivery/pickup fee.
export type DiscountAppliesTo = 'all' | 'products' | 'categories' | 'fulfillment'

// A run of days. Without an end it keeps going from the start.
export type DateWindow = { start: Date; end: Date | null }

export type Discount = {
  id: string
  code: string
  // An amount off, or a percentage off.
  type: 'amount' | 'percent'
  value: number
  appliesTo: DiscountAppliesTo
  // The picks behind "Specific products" / "Specific categories".
  products: string[]
  categories: string[]
  // Caps a percentage discount at a dollar amount.
  maxDiscount: number | null
  active: boolean
  minPurchase: number | null
  // How many of the items the discount covers have to be in the order.
  minQuantity: number | null
  // When the code can be used, and which fulfillment days it covers.
  activeDates: DateWindow | null
  fulfillmentDates: DateWindow | null
  maxRedemptions: number | null
  oncePerCustomer: boolean
  redemptions: number
}

function seed(
  discount: Pick<Discount, 'id' | 'code' | 'type' | 'value' | 'redemptions' | 'active'> &
    Partial<Discount>,
): Discount {
  return {
    appliesTo: 'all',
    products: [],
    categories: [],
    maxDiscount: null,
    minPurchase: null,
    minQuantity: null,
    activeDates: null,
    fulfillmentDates: null,
    maxRedemptions: null,
    oncePerCustomer: false,
    ...discount,
  }
}

const SEED_DISCOUNTS: Discount[] = [
  seed({ id: 'd1', code: '10OFF1', type: 'amount', value: 10, redemptions: 3, active: true }),
  seed({
    id: 'd2',
    code: 'COFFEE',
    type: 'percent',
    value: 50,
    redemptions: 3,
    active: true,
    appliesTo: 'categories',
    categories: ['Hot Drinks', 'Cold Drinks'],
    maxDiscount: 5,
  }),
  seed({
    id: 'd3',
    code: 'BULK ORDER',
    type: 'amount',
    value: 50,
    redemptions: 0,
    active: true,
    minPurchase: 300,
  }),
  seed({ id: 'd4', code: 'SENIORS', type: 'percent', value: 5, redemptions: 38, active: true }),
  seed({
    id: 'd5',
    code: 'REGULARS',
    type: 'percent',
    value: 15,
    redemptions: 29,
    active: true,
    oncePerCustomer: true,
  }),
  seed({ id: 'd6', code: '10OFF', type: 'percent', value: 10, redemptions: 53, active: true }),
  seed({
    id: 'd7',
    code: 'LAUNCH25',
    type: 'percent',
    value: 25,
    redemptions: 112,
    active: false,
    maxRedemptions: 150,
    activeDates: { start: new Date(2026, 5, 1), end: new Date(2026, 5, 30) },
  }),
  seed({ id: 'd8', code: 'HOLIDAY5', type: 'amount', value: 5, redemptions: 17, active: false }),
]

let discounts = SEED_DISCOUNTS
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useDiscounts() {
  return React.useSyncExternalStore(subscribe, () => discounts)
}

export function updateDiscounts(update: (current: Discount[]) => Discount[]) {
  discounts = update(discounts)
  listeners.forEach((listener) => listener())
}
