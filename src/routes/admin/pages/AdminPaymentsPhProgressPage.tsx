import * as React from 'react'
import {
  ArrowLeft,
  BanknoteArrowDown,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  Info,
  Landmark,
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  User,
  Wallet,
  WalletCards,
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
import { Badge } from '@/components/ui/badge'
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
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TypographyH4, TypographyLarge } from '@/components/ui/typography'

import globeIcon from '@/assets/channels/globe.png'
import monitorIcon from '@/assets/channels/monitor.png'
import qrIcon from '@/assets/channels/qr.png'

type IconComponent = React.ComponentType<{ className?: string }>

// Monotonic id source for newly-created custom methods. A module-level counter
// keeps ids stable across dialog remounts. Mirrors the fulfillment page.
let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

// The global <Toaster/> paints every toast with the success (green) palette, so
// the in-progress "Saving changes…" toast overrides those vars to the neutral
// popover palette; the follow-up "Changes saved" restores green explicitly.
// Mirrors the store/fulfillment settings pages.
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
const SAVE_TOAST_ID = 'payments-save'

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

const PAYMENTS_PATH = '/admin/settings/payments-ph-progress'
const MANUAL_PATH = '/admin/settings/payments/manual'

// Client-side navigation matching the app's router (pushState + popstate).
function navigateTo(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

// ---------------------------------------------------------------------------
// Brand icons — rendered at the shared icon size (size-4) via className, so
// they keep their brand colors and match the size of the lucide icons.
// ---------------------------------------------------------------------------

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#002991"
        d="M381.58 128.5C381.58 184.24 330.14 250 252.31 250H177.34L173.66 273.22L156.17 385H63L119.05 25H270C320.83 25 360.82 53.33 375.55 92.7C379.798 104.147 381.844 116.293 381.58 128.5Z"
      />
      <path
        fill="#60CDFF"
        d="M435.28 232C425.009 294.408 370.987 340.153 307.74 340H255.68L234.01 475H141.34L156.17 385L173.67 273.22L177.34 250H252.31C330.04 250 381.58 184.24 381.58 128.5C419.83 148.24 442.13 188.13 435.28 232Z"
      />
      <path
        fill="#008CFF"
        d="M381.58 128.5C365.54 120.11 346.09 115 324.92 115H198.52L177.34 250H252.31C330.04 250 381.58 184.24 381.58 128.5Z"
      />
    </svg>
  )
}

function QrPhIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#CE1126"
        d="M181.069 440.091C188.24 445.889 222.801 469.293 228.279 472.061L233.925 474.915L308.41 474.997C349.377 475.042 387.078 474.596 392.189 474.006C407.281 472.265 426.529 462.921 441.758 449.943C454.237 439.308 468.044 414.771 472.167 395.899C474.788 383.905 474.723 387.638 474.287 273.119L473.977 191.781H439.36C420.32 191.781 403.423 192.282 401.811 192.894L398.879 194.007L399.121 274.232C399.254 318.356 399.27 360.007 399.121 366.828C398.93 375.522 400.325 387.754 394.091 393.587C387.543 399.713 379.376 398.753 305.445 399.048C234.955 399.329 233.623 399.419 226.427 404.368C224.563 405.651 218.018 410.014 211.884 414.065C205.75 418.116 195.508 424.982 189.123 429.324L177.516 437.219L181.069 440.091Z"
      />
      <path
        fill="#204884"
        d="M36.8374 80.4442C26.2314 101.772 26.5794 97.4822 26.2717 210.647L26 310.541L62.7148 310.541C91.6499 310.541 99.7178 310.194 100.79 308.904C101.744 307.757 102.252 279.531 102.491 214.374L102.831 121.479C102.438 107.98 112.331 104.363 121.419 104.567L193.913 103.949L266.407 103.33L271.255 100.306C273.921 98.6429 285.353 90.9331 296.659 83.1732C307.964 75.4133 318.469 68.5767 320.003 67.9809C321.536 67.3851 322.791 66.3665 322.791 65.7174C322.791 64.6604 312.604 57.4481 276.146 32.6918L264.818 25L188.781 25.604C102.656 26.2882 101.581 26.3956 81.1449 36.3456C72.1083 40.7454 68.5836 43.4957 56.3391 55.7016C44.1973 67.8051 41.286 71.4988 36.8374 80.4442Z"
      />
      <path
        fill="#FCD116"
        d="M249.194 358.539C308.224 358.539 356.076 310.769 356.076 251.841C356.076 192.914 308.224 145.143 249.194 145.143C190.165 145.143 142.312 192.914 142.312 251.841C142.312 310.769 190.165 358.539 249.194 358.539Z"
      />
    </svg>
  )
}

function GCashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#007CFF"
        stroke="#007CFF"
        strokeWidth="0.0340402"
        d="M155.388 69.3937C178.221 61.9343 202.509 58.8414 226.525 60.3879C261.73 62.2982 296.116 74.7609 324.771 95.2287C327.864 97.5029 331.229 99.5952 333.867 102.506C338.416 107.691 340.235 115.06 338.598 121.791C336.96 129.069 331.229 135.255 324.134 137.438C317.22 139.621 309.306 138.166 303.757 133.526C282.38 117.061 256.363 106.691 229.527 104.144C219.702 103.052 209.696 103.052 199.871 104.144C171.58 106.964 144.199 118.335 122.185 136.437C97.3503 156.723 79.2476 185.287 72.1521 216.58C65.6024 244.962 67.6037 275.346 78.156 302.545C89.2541 331.473 109.904 356.489 135.921 373.227C155.388 385.69 177.857 393.422 200.781 395.606C209.696 396.697 218.793 396.697 227.617 395.696C255.362 393.331 282.198 382.688 304.212 365.677C309.761 361.311 317.675 360.037 324.407 362.311C333.686 365.495 340.326 375.411 339.144 385.235C338.598 390.966 335.596 396.424 331.047 399.881C313.582 413.526 293.751 423.988 272.646 430.719C245.446 439.452 216.155 441.726 187.864 437.815C156.48 433.448 126.278 420.895 100.989 401.791C76.4276 383.416 56.4146 358.945 43.2243 331.2C30.3068 304.001 24.03 273.617 25.1216 243.507C26.1222 206.483 38.4029 169.914 60.0534 139.803C83.3412 107.055 117.09 81.8564 155.388 69.3937Z"
      />
      <path
        opacity="0.4"
        fill="#001934"
        stroke="#001934"
        strokeWidth="0.0340402"
        d="M199.875 104.144C209.7 103.052 219.706 103.052 229.531 104.144C219.615 103.871 209.791 103.871 199.875 104.144Z"
      />
      <path
        fill="#6FBAF7"
        stroke="#6FBAF7"
        strokeWidth="0.0340402"
        d="M421.563 121.064C431.024 118.244 442.122 122.701 446.67 131.616C468.503 174.28 478.055 223.039 474.143 270.797C471.414 304.819 462.044 338.387 446.307 368.679C440.576 379.504 425.202 382.961 415.286 375.866C406.099 369.953 403.097 356.762 408.555 347.211C438.938 287.535 439.211 213.578 409.192 153.721C406.463 148.809 405.007 142.987 406.372 137.438C407.918 129.706 414.013 123.156 421.563 121.064Z"
      />
      <path
        fill="#002CB8"
        stroke="#002CB8"
        strokeWidth="0.0340402"
        d="M152.478 146.626C191.048 123.338 243.173 123.975 280.652 149.355C289.931 156.177 291.841 170.732 284.654 179.738C278.196 188.562 264.823 191.2 255.636 185.287C241.081 176.009 223.433 172.006 206.331 174.007C189.229 175.827 172.855 183.741 160.847 196.022C148.839 207.938 141.016 223.949 139.105 240.778C137.377 254.423 139.651 268.523 145.291 281.077C152.751 297.633 166.305 311.369 182.861 319.01C199.781 327.016 219.612 328.289 237.442 322.74C261.276 315.463 281.016 295.723 287.838 271.798C270.736 271.889 253.634 271.798 236.532 271.798C228.345 271.798 220.431 266.704 217.065 259.335C212.88 250.875 215.064 239.868 222.159 233.682C225.798 230.407 230.619 228.224 235.532 228.042C261.367 227.86 287.111 227.951 312.945 227.951C321.405 227.678 329.593 232.955 332.958 240.687C335.869 246.691 334.96 253.513 334.596 259.972C332.322 287.99 319.677 315.008 299.664 334.839C280.47 354.124 254.544 366.587 227.435 369.316C200.782 372.227 173.218 365.768 150.567 351.304C127.734 336.84 109.905 314.371 101.172 288.718C92.2567 262.792 92.7116 233.773 101.99 208.029C111.087 182.558 129.281 160.544 152.478 146.626Z"
      />
      <path
        fill="#6FBAF7"
        stroke="#6FBAF7"
        strokeWidth="0.0340402"
        d="M362.426 158.543C371.796 156.087 382.439 160.908 386.806 169.55C410.457 219.582 410.457 280.167 386.806 330.2C383.804 336.112 377.8 340.479 371.159 341.571C363.427 342.935 355.149 339.66 350.327 333.474C345.324 327.016 344.414 317.737 348.053 310.459C365.701 272.162 365.428 226.223 347.598 188.016C342.231 176.281 349.872 161.272 362.426 158.543Z"
      />
      <path
        opacity="0.46"
        fill="#001E3E"
        stroke="#001E3E"
        strokeWidth="0.0340402"
        d="M200.785 395.606C209.791 395.788 218.706 395.788 227.621 395.697C218.797 396.697 209.7 396.697 200.785 395.606Z"
      />
    </svg>
  )
}

function MayaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#101010"
        d="M100.027 25H400.027C450.009 25 475.054 49.991 475.054 100.027V400.027C475.054 450.009 450.063 475.054 400.027 475.054H100.027C50.0452 475.054 25 450.063 25 400.027V100.027C25 50.0452 50.0452 25 100.027 25Z"
      />
      <path
        fill="#75EEA5"
        d="M326.903 132C300.583 131.993 275.306 142.275 256.478 160.645L266.684 180.014L262.5 183.378C253.656 168.075 240.981 155.33 225.718 146.394C210.455 137.459 193.129 132.639 175.438 132.408C119.915 132.408 75.0065 180.932 75.0065 237.815V360.145C74.9632 361.187 75.137 362.227 75.5167 363.198C75.8963 364.17 76.4738 365.053 77.2124 365.791C77.9509 366.528 78.8345 367.105 79.8076 367.484C80.7806 367.864 81.822 368.037 82.8657 367.993H123.079C124.062 368.007 125.037 367.824 125.947 367.456C126.857 367.086 127.684 366.538 128.378 365.844C129.073 365.151 129.621 364.325 129.991 363.416C130.36 362.507 130.544 361.533 130.53 360.552V236.489C130.53 208.252 147.677 185.519 176.867 185.519C204.119 185.519 223.614 205.907 223.614 235.98V337.921C223.544 338.931 223.682 339.946 224.018 340.902C224.355 341.857 224.884 342.735 225.572 343.479C226.26 344.223 227.093 344.819 228.02 345.231C228.947 345.642 229.947 345.861 230.962 345.872H269.032C270.046 345.861 271.048 345.642 271.975 345.231C272.902 344.819 273.735 344.223 274.423 343.479C275.111 342.735 275.639 341.857 275.976 340.902C276.313 339.946 276.45 338.931 276.381 337.921V235.98C275.929 229.47 276.833 222.936 279.037 216.794C281.241 210.65 284.696 205.03 289.186 200.288C293.674 195.546 299.099 191.785 305.116 189.243C311.134 186.701 317.614 185.433 324.148 185.519C353.236 185.519 369.464 208.659 369.464 236.489V360.348C369.544 362.367 370.411 364.275 371.878 365.666C373.347 367.055 375.3 367.818 377.324 367.79H417.129C418.176 367.849 419.225 367.686 420.205 367.313C421.186 366.939 422.075 366.363 422.818 365.622C423.559 364.881 424.136 363.992 424.51 363.013C424.885 362.033 425.047 360.986 424.988 359.94V237.611C424.988 180.524 382.018 132 326.903 132Z"
      />
    </svg>
  )
}

function BancnetIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EC2C2E"
        d="M100.027 25H400.027C450.009 25 475.054 49.991 475.054 100.027V400.027C475.054 450.009 450.063 475.054 400.027 475.054H100.027C50.0452 475.054 25 450.063 25 400.027V100.027C25 50.0452 50.0452 25 100.027 25Z"
      />
      <g clipPath="url(#bancnet-clip)">
        <path
          fill="white"
          d="M94.0337 210H133.599C136.004 210.186 138.453 210.886 140.329 212.45C142.064 213.901 142.889 216.23 142.674 218.452C142.375 221.762 140.668 224.732 138.846 227.437C135.667 232.016 131.107 235.658 125.841 237.562C124.454 238.201 122.891 238.311 121.51 238.941C123.651 239.346 125.951 239.872 127.514 241.506C129.036 243.036 129.508 245.322 129.231 247.406C128.7 250.756 127.09 253.827 125.183 256.597C121.925 261.415 117.046 265.083 111.522 266.945C103.498 269.676 94.9011 269.265 86.5467 269.29C78.325 269.29 70.1005 269.293 61.8789 269.287C72.5981 249.527 83.306 229.758 94.0337 210ZM106.547 221.663C104.462 225.581 102.318 229.465 100.215 233.372C102.727 233.375 105.239 233.386 107.751 233.347C109.446 233.361 111.152 233.24 112.802 232.832C115.947 232.134 118.645 229.991 120.244 227.235C120.996 226.054 121.987 224.313 120.88 223.05C119.696 222.004 118.015 221.849 116.503 221.728C113.186 221.607 109.864 221.632 106.547 221.663ZM87.0637 257.63C91.0389 257.649 95.0197 257.692 98.9921 257.523C101.137 257.368 103.306 256.91 105.174 255.813C107.717 254.305 109.482 251.737 110.415 248.981C110.627 248.171 110.663 247.184 110.076 246.517C109.053 245.421 107.462 245.235 106.047 245.12C101.998 244.959 97.9439 245.038 93.8924 245.027C91.6181 249.232 89.3352 253.428 87.0637 257.63Z"
        />
        <path
          fill="white"
          d="M303.726 210H326.998C328.051 222.898 329.04 235.802 330.134 248.694C331.818 245.961 333.222 243.058 334.798 240.257C340.262 230.171 345.741 220.091 351.199 210H368.479C357.743 229.755 347.049 249.535 336.313 269.293C328.642 269.273 320.971 269.321 313.306 269.271C312.69 262.546 311.975 255.83 311.323 249.108C310.698 243.171 310.204 237.217 309.5 231.291C308.113 233.636 306.887 236.075 305.565 238.457C299.979 248.734 294.427 259.03 288.825 269.296C283.078 269.282 277.329 269.293 271.582 269.29C282.29 249.524 293.012 229.763 303.726 210Z"
        />
        <path
          fill="white"
          d="M425.792 216.936C432.378 215.749 438.964 214.556 445.552 213.383C443.464 217.234 441.376 221.084 439.289 224.934C442.823 224.943 446.357 224.923 449.892 224.946V224.971C447.784 228.818 445.668 232.663 443.628 236.547C440.094 236.603 436.556 236.587 433.022 236.556C430.267 241.508 427.597 246.515 424.896 251.496C424.309 252.888 423.359 254.249 423.478 255.821C423.543 256.876 424.622 257.438 425.569 257.534C428.473 257.925 431.33 257.07 434.127 256.403C431.234 260.594 428.287 264.751 425.38 268.933C421.269 269.802 417.079 270.322 412.875 270.345C410.075 270.32 407.196 270.235 404.56 269.2C402.921 268.638 401.531 267.201 401.362 265.44C401.11 263.153 402.048 260.954 403.043 258.949C407.038 251.47 411.12 244.04 415.143 236.578C412.832 236.553 410.521 236.629 408.216 236.542C410.292 232.691 412.437 228.872 414.446 224.988C416.765 224.878 419.09 224.943 421.413 224.957C422.924 222.313 424.329 219.607 425.792 216.936Z"
        />
        <path
          fill="white"
          d="M169.042 224.032C173.8 223.84 178.688 223.61 183.298 225.022C185.403 225.694 187.601 226.928 188.392 229.114C189.201 231.353 188.322 233.746 187.302 235.763C181.278 246.937 175.173 258.068 169.175 269.257C163.219 269.316 157.255 269.307 151.299 269.262C154.884 262.673 158.492 256.097 162.007 249.473C157.21 251.22 151.991 251.819 147.474 254.303C146.417 255.028 145.27 255.712 144.541 256.797C144.035 257.551 143.529 258.459 143.755 259.396C143.973 260.158 144.764 260.535 145.479 260.709C147.954 261.182 150.477 260.729 152.887 260.133C150.251 263.367 147.637 266.624 144.979 269.839C141.713 270.055 138.435 270.522 135.161 270.224C132.601 270.131 129.962 269.631 127.773 268.247C126.354 267.358 125.267 265.915 124.959 264.256C124.538 261.986 125.258 259.688 126.227 257.649C127.578 254.868 129.49 252.311 131.957 250.416C135.404 247.527 139.65 245.772 143.939 244.538C150.276 242.687 156.916 242.127 163.247 240.26C165.448 239.483 168.045 238.342 168.694 235.875C169.098 234.505 167.66 233.633 166.496 233.484C162.318 232.93 158.136 233.825 154.034 234.531C150.24 235.349 146.485 236.336 142.769 237.45C142.86 237.205 142.978 236.975 143.12 236.758C145.38 233.386 147.606 229.994 149.858 226.616C156.201 225.418 162.592 224.394 169.042 224.032Z"
        />
        <path
          fill="white"
          d="M226.092 224.417C229.356 223.804 232.709 223.767 236.009 224.105C238.306 224.487 240.747 224.943 242.539 226.554C244.16 227.91 244.79 230.135 244.544 232.182C244.166 235.861 242.154 239.067 240.453 242.262C235.566 251.271 230.684 260.282 225.796 269.29C219.865 269.293 213.932 269.285 208.002 269.296C212.169 261.469 216.447 253.701 220.657 245.893C221.544 244.192 222.431 242.293 222.089 240.324C221.818 238.918 220.45 238.066 219.105 237.886C215.577 237.343 212.059 238.713 209.174 240.651C204.617 243.826 201.331 248.438 198.619 253.203C195.655 258.533 192.785 263.918 189.875 269.282C183.928 269.302 177.977 269.288 172.027 269.288C180.085 254.508 188.036 239.666 196.139 224.912C201.752 224.965 207.366 224.92 212.98 224.937C211.81 227.089 210.627 229.235 209.482 231.4C209.991 231.35 210.384 231.009 210.805 230.753C215.461 227.761 220.606 225.384 226.092 224.417Z"
        />
        <path
          fill="white"
          d="M267.678 224.622C271.846 223.717 276.137 223.823 280.372 224.006C283.876 224.243 287.438 224.563 290.789 225.632C288.933 230.053 287.116 234.494 285.336 238.946C281.463 237.653 277.451 236.362 273.306 236.643C269.896 236.783 266.523 237.894 263.731 239.855C260.267 242.24 257.725 245.786 256.185 249.659C255.662 251.248 255.202 253.037 255.849 254.66C256.58 256.401 258.547 257.101 260.276 257.419C265.655 258.212 270.905 256.432 276.089 255.278C272.981 259.764 269.902 264.27 266.8 268.759C261.053 269.912 255.173 270.595 249.305 270.247C245.895 269.971 242.349 269.285 239.532 267.234C237.405 265.704 236.066 263.224 235.848 260.631C235.484 256.676 236.857 252.826 238.453 249.274C241.985 241.95 247.099 235.242 253.837 230.571C257.982 227.685 262.708 225.593 267.678 224.622Z"
        />
        <path
          fill="white"
          d="M365.264 231.496C371.723 226.928 379.527 224.293 387.44 223.942C391.421 223.762 395.498 223.958 399.295 225.249C401.722 226.104 404.073 227.578 405.341 229.876C406.726 232.295 406.672 235.242 406.028 237.877C404.974 242.155 402.505 245.871 400.49 249.735C389.599 249.743 378.71 249.707 367.821 249.755C367.025 251.369 366.293 253.208 366.784 255.025C367.231 256.761 368.892 257.832 370.503 258.375C373.5 259.455 376.738 259.109 379.849 258.887C384.431 258.324 388.938 257.309 393.416 256.209C390.565 260.372 387.731 264.546 384.849 268.686C377.523 269.982 370.059 270.587 362.62 270.235C358.676 269.912 354.52 269.259 351.268 266.849C349.284 265.398 347.979 263.1 347.722 260.667C347.31 256.986 348.524 253.363 349.996 250.039C353.356 242.684 358.597 236.137 365.264 231.496ZM380.524 234.668C377.105 236.038 374.317 238.64 372.234 241.624C377.36 241.672 382.487 241.629 387.615 241.643C388.409 240.015 389.313 238.252 389.025 236.381C388.861 235.158 387.751 234.292 386.59 234.055C384.57 233.594 382.434 233.926 380.524 234.668Z"
        />
        <path
          fill="white"
          d="M59.4116 273.861C180.403 273.869 301.393 273.863 422.384 273.863C421.404 275.669 420.435 277.48 419.44 279.28C298.45 279.269 177.459 279.277 56.4648 279.275C57.4537 277.472 58.4171 275.658 59.4116 273.861Z"
        />
        <path
          fill="white"
          d="M53.0194 285.606C64.0042 285.566 74.989 285.6 85.9738 285.589C195.991 285.589 306.011 285.589 416.032 285.592C415.046 287.392 414.085 289.208 413.085 291H50.1094C51.0728 289.2 52.073 287.417 53.0194 285.606Z"
        />
      </g>
      <defs>
        <clipPath id="bancnet-clip">
          <rect
            width="400"
            height="81"
            fill="white"
            transform="translate(50 210)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Shared layout helpers (mirror the fulfillment settings page)
// ---------------------------------------------------------------------------

// A card wrapping a stack of divided settings rows.
function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="gap-0 py-0 shadow-none">
      <div className="divide-y divide-border/50 px-4 sm:px-6">{children}</div>
    </Card>
  )
}

// A titled section: heading sits above one or more cards.
function PaymentSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <TypographyLarge>{title}</TypographyLarge>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

// A single settings row: label (icon + text, with an optional description below)
// on the left, control on the right.
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
  description?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col py-4">
      <div className="flex items-center justify-between gap-4">
        <Label
          htmlFor={id}
          className="flex items-center gap-4 text-sm font-medium md:gap-6"
        >
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </Label>
        <div className="shrink-0">{children}</div>
      </div>
      {description ? (
        <div className="mt-1.5 text-sm text-muted-foreground md:pl-10">
          {description}
        </div>
      ) : null}
    </div>
  )
}

// A settings row that acts as a button, opening a dialog or navigating when
// clicked. Trails a chevron instead of an inline control.
function NavSettingRow({
  label,
  icon: Icon,
  description,
  onClick,
}: {
  label: string
  icon: IconComponent
  description?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mx-4 flex w-[calc(100%+2rem)] flex-col rounded-lg px-4 py-4 text-left transition-colors hover:bg-muted/50 sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-4 text-sm font-medium md:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          {label}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
      {description ? (
        <p className="mt-1.5 text-sm text-muted-foreground md:pl-10">
          {description}
        </p>
      ) : null}
    </button>
  )
}

// A nav row with a quick enable switch before the chevron. The label area and
// the chevron open the dialog; the switch toggles the feature independently.
// A settings row with an enable switch and a chevron. When off, only the switch
// is interactive (the chevron is dimmed); toggling it enables the feature. When
// on, clicking anywhere on the row opens the dialog, while the switch (which
// sits above the click overlay) still toggles the feature off.
function SwitchNavRow({
  label,
  badge,
  icon: Icon,
  description,
  checked,
  onCheckedChange,
  onOpen,
}: {
  label: string
  badge?: string
  icon: IconComponent
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onOpen: () => void
}) {
  return (
    <div className="relative py-4">
      {checked ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${label}`}
          className="absolute inset-y-0 -left-4 -right-4 rounded-lg transition-colors hover:bg-muted/50 sm:-left-6 sm:-right-6"
        />
      ) : null}
      <div className="pointer-events-none relative flex items-center justify-between gap-4">
        <span className="flex items-center gap-4 text-sm font-medium md:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex items-center gap-2">
            {label}
            {badge ? (
              <Badge
                variant="secondary"
                className="hidden border-transparent bg-green-400/10 text-green-900 md:inline-flex"
              >
                {badge}
              </Badge>
            ) : null}
          </span>
        </span>
        <div className="flex shrink-0 items-center gap-3">
          <span className="pointer-events-auto">
            <Switch
              aria-label={label}
              checked={checked}
              onCheckedChange={onCheckedChange}
              className="translate-y-[2px]"
            />
          </span>
          <ChevronRight
            className={
              checked
                ? 'size-4 text-muted-foreground'
                : 'size-4 text-muted-foreground/40'
            }
          />
        </div>
      </div>
      {description ? (
        <p className="pointer-events-none relative mt-1.5 text-sm text-muted-foreground md:pl-10">
          {description}
        </p>
      ) : null}
      {badge ? (
        <div className="pointer-events-none relative mt-1.5 md:hidden">
          <Badge
            variant="secondary"
            className="border-transparent bg-green-400/10 text-green-900"
          >
            {badge}
          </Badge>
        </div>
      ) : null}
    </div>
  )
}

// A payment method row that trails an outline call-to-action button (e.g.
// "Finish setup" / "Connect") instead of an inline enable switch and chevron.
function MethodSetupRow({
  label,
  badge,
  icon: Icon,
  description,
  cta,
  onClick,
}: {
  label: string
  badge?: string
  icon: IconComponent
  description?: string
  cta: string
  onClick: () => void
}) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-4 text-sm font-medium md:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex items-center gap-2">
            {label}
            {badge ? (
              <Badge
                variant="secondary"
                className="hidden border-transparent bg-green-400/10 text-green-900 md:inline-flex"
              >
                {badge}
              </Badge>
            ) : null}
          </span>
        </span>
        {cta === 'Finish setup' ? (
          <Badge variant="outline" className="shrink-0 text-muted-foreground">
            Verifying KYC
          </Badge>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-10 px-3 shrink-0"
            onClick={onClick}
          >
            {cta}
          </Button>
        )}
      </div>
      {description ? (
        <p className="mt-1.5 text-sm text-muted-foreground md:pl-10">
          {description}
        </p>
      ) : null}
      {badge ? (
        <div className="mt-1.5 md:hidden">
          <Badge
            variant="secondary"
            className="border-transparent bg-green-400/10 text-green-900"
          >
            {badge}
          </Badge>
        </div>
      ) : null}
    </div>
  )
}

// A method row: name + summary on the left, an edit/delete menu on the right.
function MethodRow({
  icon: Icon,
  name,
  summary,
  onEdit,
  onDelete,
}: {
  icon: IconComponent
  name: string
  summary: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-col py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
          <Icon className="size-4 shrink-0 text-muted-foreground" />
          <p className="min-w-0 flex-1 truncate text-sm font-medium">{name}</p>
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
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="mt-1 text-sm text-muted-foreground md:pl-10">{summary}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tips
// ---------------------------------------------------------------------------

type TipOption = { id: string; value: string }
type TipsSettings = { enabled: boolean; options: TipOption[] }

const MAX_TIP_OPTIONS = 3

function defaultTips(): TipsSettings {
  return { enabled: false, options: [] }
}

// Whether tips have at least one saved option.
function tipsConfigured(tips: TipsSettings) {
  return tips.options.some((option) => option.value.trim() !== '')
}

// Row description: the entered tip options when on, otherwise the default blurb.
function tipsSummary(tips: TipsSettings) {
  if (!tips.enabled || !tipsConfigured(tips)) {
    return 'Let customers select a tip during checkout'
  }
  const values = tips.options
    .map((option) => option.value.trim())
    .filter((value) => value !== '')
  return values.map((value) => `${value}%`).join(', ')
}

// Keep only numeric input: digits plus a single decimal point.
function sanitizeNumber(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const [whole, ...rest] = cleaned.split('.')
  return rest.length > 0 ? `${whole}.${rest.join('')}` : whole
}

// The tips dialog, opened from the Tips row. Mirrors the add/edit method
// dialog: scrolling body, sticky Cancel/Save footer. Each option is a
// tip-percentage input with a delete button, and an "Add option" button
// appends a new row. Saving with no options is allowed.
function TipsDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: TipsSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: TipsSettings) => void
}) {
  // Seed one empty row when there are none so a field is shown immediately.
  const [draft, setDraft] = React.useState<TipsSettings>(() =>
    settings.options.length > 0
      ? settings
      : { ...settings, options: [{ id: nextId('tip'), value: '' }] },
  )

  function addOption() {
    setDraft((current) => {
      if (current.options.length >= MAX_TIP_OPTIONS) return current
      return {
        ...current,
        options: [...current.options, { id: nextId('tip'), value: '' }],
      }
    })
  }

  function updateOption(id: string, value: string) {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option) =>
        option.id === id ? { ...option, value: sanitizeNumber(value) } : option,
      ),
    }))
  }

  function removeOption(id: string) {
    setDraft((current) => ({
      ...current,
      options: current.options.filter((option) => option.id !== id),
    }))
  }

  // Normalize before saving/comparing: trim values and drop empty rows. The
  // comparison against `settings` drives the dirty check.
  const trimmedOptions = draft.options
    .map((option) => ({ ...option, value: option.value.trim() }))
    .filter((option) => option.value !== '')
  const payload: TipsSettings = { enabled: draft.enabled, options: trimmedOptions }
  const canSave = JSON.stringify(payload) !== JSON.stringify(settings)

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Tips</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Options</Label>
            {draft.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <InputGroup className="h-10 flex-1">
                  <InputGroupInput
                    aria-label={`Tip option ${index + 1}`}
                    inputMode="decimal"
                    value={option.value}
                    onChange={(event) =>
                      updateOption(option.id, event.target.value)
                    }
                    placeholder="10"
                    className="pl-3"
                  />
                  <InputGroupAddon align="inline-end" className="pr-3">
                    %
                  </InputGroupAddon>
                </InputGroup>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 text-muted-foreground"
                  aria-label={`Remove tip option ${index + 1}`}
                  onClick={() => removeOption(option.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {draft.options.length < MAX_TIP_OPTIONS ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 px-3 gap-2"
                onClick={addOption}
              >
                <Plus className="size-4" />
                Add option
              </Button>
            ) : null}
          </div>
        </DialogBody>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
            onClick={() => onSave(payload)}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Charges
// ---------------------------------------------------------------------------

type ChargeChannel = 'online-store' | 'pos' | 'qr'

// Sales channels a charge can apply to, with the icons used on the Orders page.
const CHARGE_CHANNELS: { value: ChargeChannel; label: string; icon: string }[] = [
  { value: 'online-store', label: 'Online Store', icon: globeIcon },
  { value: 'pos', label: 'POS', icon: monitorIcon },
  { value: 'qr', label: 'QR Code', icon: qrIcon },
]

// Every channel selected — the default for a newly configured item.
const ALL_CHANNELS: ChargeChannel[] = ['online-store', 'pos', 'qr']

// The Channels selector, shared by every dialog that scopes to sales
// channels. Lists each channel with its icon and a switch to toggle it.
function ChannelsField({
  value,
  onValueChange,
}: {
  value: ChargeChannel[]
  onValueChange: (value: ChargeChannel[]) => void
}) {
  const toggleChannel = (channel: ChargeChannel, on: boolean) => {
    onValueChange(
      on ? [...value, channel] : value.filter((c) => c !== channel),
    )
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">Channels</Label>
      <div className="divide-y rounded-md border">
        {CHARGE_CHANNELS.map((channel) => (
          <div
            key={channel.value}
            className="flex items-center justify-between px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <img src={channel.icon} alt="" className="size-5 shrink-0" />
              <span className="text-sm">{channel.label}</span>
            </div>
            <Switch
              checked={value.includes(channel.value)}
              onCheckedChange={(on) => toggleChannel(channel.value, on)}
              aria-label={channel.label}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

type ChargesSettings = {
  enabled: boolean
  name: string
  percentage: string
  channels: ChargeChannel[]
}

function defaultCharges(): ChargesSettings {
  return {
    enabled: false,
    name: '',
    percentage: '',
    channels: ALL_CHANNELS,
  }
}

// Whether a charge has saved details (a name and a positive percentage).
function chargesConfigured(charges: ChargesSettings) {
  return charges.name.trim() !== '' && Number(charges.percentage) > 0
}

// Row description: the entered details when on, otherwise the default blurb.
function chargesSummary(charges: ChargesSettings) {
  if (charges.enabled && chargesConfigured(charges)) {
    return `${charges.name} · ${charges.percentage}%`
  }
  return 'Add service charges to orders'
}

// The charges dialog, opened from the Charges row. Mirrors the Tips dialog
// shell: scrolling body, sticky Cancel/Save footer, 40px controls.
function ChargesDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: ChargesSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: ChargesSettings) => void
}) {
  const [draft, setDraft] = React.useState<ChargesSettings>(settings)

  function update<K extends keyof ChargesSettings>(
    key: K,
    value: ChargesSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const payload: ChargesSettings = {
    enabled: draft.enabled,
    name: draft.name.trim(),
    percentage: draft.percentage.trim(),
    channels: draft.channels,
  }
  const hasChanges = JSON.stringify(payload) !== JSON.stringify(settings)
  const canSave =
    hasChanges &&
    payload.name !== '' &&
    Number(payload.percentage) > 0 &&
    payload.channels.length > 0

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Charges</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="charge-name" className="text-sm font-medium">
              Charge name
            </Label>
            <Input
              id="charge-name"
              value={draft.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Service charge"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="charge-percentage" className="text-sm font-medium">
              Percentage
            </Label>
            <InputGroup className="h-10">
              <InputGroupInput
                id="charge-percentage"
                inputMode="decimal"
                value={draft.percentage}
                onChange={(event) =>
                  update('percentage', sanitizeNumber(event.target.value))
                }
                placeholder="10"
                className="pl-3"
              />
              <InputGroupAddon align="inline-end" className="pr-3">
                %
              </InputGroupAddon>
            </InputGroup>
          </div>

          <ChannelsField
            value={draft.channels}
            onValueChange={(value) => update('channels', value)}
          />
        </DialogBody>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
            onClick={() => onSave(payload)}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Tax
// ---------------------------------------------------------------------------

type TaxSettings = {
  enabled: boolean
  name: string
  percentage: string
  registrationEnabled: boolean
  registrationNumber: string
  includedInPrices: boolean
}

function defaultTax(): TaxSettings {
  return {
    enabled: false,
    name: '',
    percentage: '',
    registrationEnabled: false,
    registrationNumber: '',
    includedInPrices: false,
  }
}

// Whether a tax has saved details (a name and a positive percentage).
function taxConfigured(tax: TaxSettings) {
  return tax.name.trim() !== '' && Number(tax.percentage) > 0
}

// Row description: the entered details when on, otherwise the default blurb.
function taxSummary(tax: TaxSettings) {
  if (tax.enabled && taxConfigured(tax)) {
    return `${tax.name} · ${tax.percentage}%`
  }
  return 'Collect tax on your orders'
}

// The tax dialog, opened from the Tax row. Mirrors the Tips dialog shell, with
// the registration/inclusion toggles shown in cards like the Tips switch.
function TaxDialog({
  settings,
  onOpenChange,
  onSave,
}: {
  settings: TaxSettings
  onOpenChange: (open: boolean) => void
  onSave: (settings: TaxSettings) => void
}) {
  const [draft, setDraft] = React.useState<TaxSettings>(settings)

  function update<K extends keyof TaxSettings>(key: K, value: TaxSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  // Drop the registration number when its switch is off before saving/comparing.
  const payload: TaxSettings = {
    enabled: draft.enabled,
    name: draft.name.trim(),
    percentage: draft.percentage.trim(),
    registrationEnabled: draft.registrationEnabled,
    registrationNumber: draft.registrationEnabled
      ? draft.registrationNumber.trim()
      : '',
    includedInPrices: draft.includedInPrices,
  }
  const hasChanges = JSON.stringify(payload) !== JSON.stringify(settings)
  // Require a name, a positive percentage, and — when registration is on — a
  // registration number.
  const canSave =
    hasChanges &&
    payload.name !== '' &&
    Number(payload.percentage) > 0 &&
    (!payload.registrationEnabled || payload.registrationNumber !== '')

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">Tax</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="tax-name" className="text-sm font-medium">
              Tax name
            </Label>
            <Input
              id="tax-name"
              value={draft.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Goods & Services Tax"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tax-percentage" className="text-sm font-medium">
              Percentage
            </Label>
            <InputGroup className="h-10">
              <InputGroupInput
                id="tax-percentage"
                inputMode="decimal"
                value={draft.percentage}
                onChange={(event) =>
                  update('percentage', sanitizeNumber(event.target.value))
                }
                placeholder="10"
                className="pl-3"
              />
              <InputGroupAddon align="inline-end" className="pr-3">
                %
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="flex flex-col gap-3 rounded-md border p-3">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Tax registration number</FieldTitle>
                <FieldDescription>Shown on your receipts</FieldDescription>
              </FieldContent>
              <Switch
                aria-label="Tax registration number"
                checked={draft.registrationEnabled}
                onCheckedChange={(checked) =>
                  update('registrationEnabled', checked)
                }
              />
            </Field>
            {draft.registrationEnabled ? (
              <Input
                aria-label="Tax registration number"
                value={draft.registrationNumber}
                onChange={(event) =>
                  update('registrationNumber', event.target.value)
                }
                placeholder="1234567890"
                className="h-10 bg-background"
              />
            ) : null}
          </div>

          <FieldLabel
            htmlFor="tax-included"
            className="transition-colors hover:bg-muted/50"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Taxes are included in prices</FieldTitle>
                <FieldDescription>
                  Tax will be deducted from product prices
                </FieldDescription>
              </FieldContent>
              <Switch
                id="tax-included"
                checked={draft.includedInPrices}
                onCheckedChange={(checked) => update('includedInPrices', checked)}
              />
            </Field>
          </FieldLabel>
        </DialogBody>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
            onClick={() => onSave(payload)}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Payment methods (Credit / Debit card, PayNow, PayPal)
// ---------------------------------------------------------------------------

type PaymentMethodKey = 'card' | 'qrPh' | 'gcash' | 'maya' | 'bancnet' | 'payPal'

type PaymentMethodSettings = {
  enabled: boolean
  channels: ChargeChannel[]
  minimumSpendEnabled: boolean
  minimumSpend: string
}

// The three automatically-verified methods, shown as rows in a single card.
// Each trails an outline call-to-action button that opens its setup dialog.
const PAYMENT_METHODS: {
  key: PaymentMethodKey
  label: string
  badge?: string
  icon: IconComponent
  description: string
  cta: string
}[] = [
  {
    key: 'qrPh',
    label: 'QR Ph',
    badge: 'Best for unregistered businesses',
    icon: QrPhIcon,
    description: 'Accept payments from multiple banks and e-wallets',
    cta: 'Finish setup',
  },
  {
    key: 'maya',
    label: 'Maya',
    icon: MayaIcon,
    description: 'Accept payments via Maya',
    cta: 'Finish setup',
  },
  {
    key: 'bancnet',
    label: 'Bank Transfer via BancNet',
    icon: BancnetIcon,
    description: 'Accept bank transfers via BancNet',
    cta: 'Finish setup',
  },
  {
    key: 'card',
    label: 'Credit / Debit card',
    icon: CreditCard,
    description: 'Increase sales by accepting card payments',
    cta: 'Finish setup',
  },
  {
    key: 'gcash',
    label: 'GCash',
    icon: GCashIcon,
    description: 'Accept payments via GCash',
    cta: 'Finish setup',
  },
  {
    key: 'payPal',
    label: 'PayPal',
    icon: PayPalIcon,
    description: 'Receive payments to your PayPal account',
    cta: 'Connect',
  },
]

// The payment method dialog, opened from a method row. Mirrors the Charges
// dialog shell, but exposes only the Channels field; it can't be saved with no
// channel selected.
function PaymentMethodDialog({
  title,
  settings,
  showMinimumSpend = false,
  onOpenChange,
  onSave,
}: {
  title: string
  settings: PaymentMethodSettings
  showMinimumSpend?: boolean
  onOpenChange: (open: boolean) => void
  onSave: (settings: PaymentMethodSettings) => void
}) {
  const [draft, setDraft] = React.useState<PaymentMethodSettings>(settings)

  function update<K extends keyof PaymentMethodSettings>(
    key: K,
    value: PaymentMethodSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const payload: PaymentMethodSettings = {
    enabled: draft.enabled,
    channels: draft.channels,
    minimumSpendEnabled: draft.minimumSpendEnabled,
    minimumSpend: draft.minimumSpend,
  }
  const hasChanges = JSON.stringify(payload) !== JSON.stringify(settings)
  const canSave =
    hasChanges &&
    payload.channels.length > 0 &&
    (!payload.minimumSpendEnabled || payload.minimumSpend.trim() !== '')

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">{title}</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          {showMinimumSpend ? (
            <div className="space-y-3">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Minimum spend required</FieldTitle>
                  <FieldDescription>
                    Only allow card payments over this amount
                  </FieldDescription>
                </FieldContent>
                <Switch
                  aria-label="Minimum spend required"
                  checked={draft.minimumSpendEnabled}
                  onCheckedChange={(checked) =>
                    update('minimumSpendEnabled', checked)
                  }
                />
              </Field>
              {draft.minimumSpendEnabled ? (
                <InputGroup className="h-10">
                  <InputGroupAddon align="inline-start" className="pl-3">
                    $
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-label="Minimum spend amount"
                    inputMode="decimal"
                    value={draft.minimumSpend}
                    onChange={(event) =>
                      update('minimumSpend', sanitizeNumber(event.target.value))
                    }
                    placeholder="0"
                  />
                </InputGroup>
              ) : null}
            </div>
          ) : null}

          <ChannelsField
            value={draft.channels}
            onValueChange={(value) => update('channels', value)}
          />
        </DialogBody>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
            onClick={() => onSave(payload)}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Automated payments page
// ---------------------------------------------------------------------------

type AutomatedPayments = {
  customerPaysFees: boolean
}

export function AdminSettingsPaymentsPhProgressPage() {
  const [automated, setAutomated] = React.useState<AutomatedPayments>({
    customerPaysFees: false,
  })
  const [methods, setMethods] = React.useState<
    Record<PaymentMethodKey, PaymentMethodSettings>
  >({
    card: {
      enabled: true,
      channels: ALL_CHANNELS,
      minimumSpendEnabled: false,
      minimumSpend: '',
    },
    qrPh: {
      enabled: true,
      channels: ALL_CHANNELS,
      minimumSpendEnabled: false,
      minimumSpend: '',
    },
    gcash: {
      enabled: false,
      channels: ALL_CHANNELS,
      minimumSpendEnabled: false,
      minimumSpend: '',
    },
    maya: {
      enabled: false,
      channels: ALL_CHANNELS,
      minimumSpendEnabled: false,
      minimumSpend: '',
    },
    bancnet: {
      enabled: false,
      channels: ALL_CHANNELS,
      minimumSpendEnabled: false,
      minimumSpend: '',
    },
    payPal: {
      enabled: false,
      channels: ALL_CHANNELS,
      minimumSpendEnabled: false,
      minimumSpend: '',
    },
  })
  const [methodDialog, setMethodDialog] = React.useState<PaymentMethodKey | null>(
    null,
  )
  const [tips, setTips] = React.useState<TipsSettings>(defaultTips)
  const [tipsOpen, setTipsOpen] = React.useState(false)
  const [charges, setCharges] = React.useState<ChargesSettings>(defaultCharges)
  const [chargesOpen, setChargesOpen] = React.useState(false)
  const [tax, setTax] = React.useState<TaxSettings>(defaultTax)
  const [taxOpen, setTaxOpen] = React.useState(false)

  function toggle<K extends keyof AutomatedPayments>(key: K, value: boolean) {
    setAutomated((current) => ({ ...current, [key]: value }))
    runSaveFeedback()
  }

  function togglePaymentMethod(key: PaymentMethodKey, checked: boolean) {
    setMethods((current) => ({
      ...current,
      [key]: { ...current[key], enabled: checked },
    }))
    runSaveFeedback()
  }

  function saveMethod(key: PaymentMethodKey, settings: PaymentMethodSettings) {
    // Saving the dialog also keeps the method enabled.
    setMethods((current) => ({
      ...current,
      [key]: { ...settings, enabled: true },
    }))
    setMethodDialog(null)
    toast.success('Changes saved')
  }

  function saveTips(settings: TipsSettings) {
    // Saving the dialog also enables the card.
    setTips({ ...settings, enabled: true })
    setTipsOpen(false)
    toast.success('Changes saved')
  }

  function saveCharges(settings: ChargesSettings) {
    // Saving the dialog also enables the card.
    setCharges({ ...settings, enabled: true })
    setChargesOpen(false)
    toast.success('Changes saved')
  }

  function saveTax(settings: TaxSettings) {
    // Saving the dialog also enables the card.
    setTax({ ...settings, enabled: true })
    setTaxOpen(false)
    toast.success('Changes saved')
  }

  function toggleTips(checked: boolean) {
    // Enabling with no saved details opens the dialog first; the switch turns
    // on only once the dialog is saved.
    if (checked && !tipsConfigured(tips)) {
      setTipsOpen(true)
      return
    }
    setTips((current) => ({ ...current, enabled: checked }))
    runSaveFeedback()
  }

  function toggleCharges(checked: boolean) {
    // Enabling with no saved details opens the dialog first; the switch turns
    // on only once the dialog is saved.
    if (checked && !chargesConfigured(charges)) {
      setChargesOpen(true)
      return
    }
    setCharges((current) => ({ ...current, enabled: checked }))
    runSaveFeedback()
  }

  function toggleTax(checked: boolean) {
    if (checked && !taxConfigured(tax)) {
      setTaxOpen(true)
      return
    }
    setTax((current) => ({ ...current, enabled: checked }))
    runSaveFeedback()
  }

  return (
    <>
      <div className="w-full">
        <header className="relative mb-8 flex items-center justify-center">
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
            Payments
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <PaymentSection
            title="Payment methods"
            description={
              <>
                Orders get approved after payments are auto-verified.{' '}
                <a
                  href="https://support.cococart.co/en/articles/15529632-what-payment-methods-are-available-in-my-country-and-what-fees-apply"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Fees apply
                </a>
              </>
            }
            action={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 text-muted-foreground"
                    aria-label="Payment methods options"
                  >
                    <MoreHorizontal className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem>
                    <BanknoteArrowDown className="size-4" />
                    Payout details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          >
            <Card className="items-center gap-4 bg-muted/50 py-8 text-center shadow-none">
              <div className="rounded-xl border border-border bg-background p-3 shadow-[0_10px_24px_0_rgba(0,0,0,0.10)]">
                <Clock
                  className="size-6 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
              <div className="space-y-1 px-6">
                <TypographyLarge>
                  Your KYC verification is in progress
                </TypographyLarge>
                <p className="text-sm leading-[150%] text-muted-foreground">
                  We will email you in 3-5 working days when it completes
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 px-6">
                <Button type="button" className="h-10 px-3">
                  Add payout details
                </Button>
              </div>
            </Card>

            <SettingsCard>
              {PAYMENT_METHODS.map((method) =>
                (['qrPh', 'maya', 'bancnet'] as PaymentMethodKey[]).includes(
                  method.key,
                ) ? (
                  <SwitchNavRow
                    key={method.key}
                    label={method.label}
                    badge={method.badge}
                    icon={method.icon}
                    description={method.description}
                    checked={methods[method.key].enabled}
                    onCheckedChange={(checked) =>
                      togglePaymentMethod(method.key, checked)
                    }
                    onOpen={() => setMethodDialog(method.key)}
                  />
                ) : (
                  <MethodSetupRow
                    key={method.key}
                    label={method.label}
                    badge={method.badge}
                    icon={method.icon}
                    description={method.description}
                    cta={method.cta}
                    onClick={() => {
                      if (
                        method.cta !== 'Finish setup' &&
                        method.key !== 'payPal'
                      )
                        setMethodDialog(method.key)
                    }}
                  />
                ),
              )}
            </SettingsCard>

            <SettingsCard>
              <SettingRow
                id="pay-fees"
                label="Customer pays transaction fees"
                icon={User}
                description={
                  <span className="inline-flex items-center gap-1.5">
                    Add processing fees to the order total
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            aria-label="More information"
                            className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <Info className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Not applicable for PayNow transactions
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                }
              >
                <Switch
                  id="pay-fees"
                  aria-label="Customer pays transaction fees"
                  checked={automated.customerPaysFees}
                  onCheckedChange={(checked) =>
                    toggle('customerPaysFees', checked)
                  }
                />
              </SettingRow>
            </SettingsCard>
          </PaymentSection>

          <PaymentSection title="More">
            <SettingsCard>
              <NavSettingRow
                label="Manual payments"
                icon={WalletCards}
                description="Manually verify payments and approve orders"
                onClick={() => navigateTo(MANUAL_PATH)}
              />
            </SettingsCard>
            <SettingsCard>
              <SwitchNavRow
                label="Tips"
                icon={Coins}
                description={tipsSummary(tips)}
                checked={tips.enabled}
                onCheckedChange={toggleTips}
                onOpen={() => setTipsOpen(true)}
              />
            </SettingsCard>
            <SettingsCard>
              <SwitchNavRow
                label="Charges"
                icon={Receipt}
                description={chargesSummary(charges)}
                checked={charges.enabled}
                onCheckedChange={toggleCharges}
                onOpen={() => setChargesOpen(true)}
              />
            </SettingsCard>
            <SettingsCard>
              <SwitchNavRow
                label="Tax"
                icon={Landmark}
                description={taxSummary(tax)}
                checked={tax.enabled}
                onCheckedChange={toggleTax}
                onOpen={() => setTaxOpen(true)}
              />
            </SettingsCard>
          </PaymentSection>
        </div>
      </div>

      {tipsOpen ? (
        <TipsDialog
          settings={tips}
          onOpenChange={(open) => {
            if (!open) setTipsOpen(false)
          }}
          onSave={saveTips}
        />
      ) : null}

      {chargesOpen ? (
        <ChargesDialog
          settings={charges}
          onOpenChange={(open) => {
            if (!open) setChargesOpen(false)
          }}
          onSave={saveCharges}
        />
      ) : null}

      {taxOpen ? (
        <TaxDialog
          settings={tax}
          onOpenChange={(open) => {
            if (!open) setTaxOpen(false)
          }}
          onSave={saveTax}
        />
      ) : null}

      {methodDialog ? (
        <PaymentMethodDialog
          title={
            PAYMENT_METHODS.find((method) => method.key === methodDialog)!.label
          }
          settings={methods[methodDialog]}
          showMinimumSpend={methodDialog === 'card'}
          onOpenChange={(open) => {
            if (!open) setMethodDialog(null)
          }}
          onSave={(settings) => saveMethod(methodDialog, settings)}
        />
      ) : null}
    </>
  )
}

// ---------------------------------------------------------------------------
// Manual payments — default methods
// ---------------------------------------------------------------------------

type DefaultMethodId = 'paynow' | 'paypal' | 'bank-transfer' | 'cash'

type DefaultFieldKey =
  | 'account'
  | 'paypalLink'
  | 'bankName'
  | 'accountNumber'
  | 'instructions'

type DefaultFieldConfig = {
  key: DefaultFieldKey
  label: string
  placeholder: string
  multiline?: boolean
}

type DefaultMethodConfig = {
  id: DefaultMethodId
  name: string
  description: string
  icon: IconComponent
  fields: DefaultFieldConfig[]
}

const INSTRUCTIONS_FIELD: DefaultFieldConfig = {
  key: 'instructions',
  label: 'Instructions',
  placeholder: 'Shown to customers at checkout',
  multiline: true,
}

// The default methods, in the order they appear in the card.
const DEFAULT_METHODS: DefaultMethodConfig[] = [
  {
    id: 'paynow',
    name: 'PayNow',
    description: 'Accept payments via PayNow',
    icon: Wallet,
    fields: [
      {
        key: 'account',
        label: 'Account',
        placeholder: 'Enter account details',
      },
      INSTRUCTIONS_FIELD,
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept payments to your PayPal.me link',
    icon: Wallet,
    fields: [
      {
        key: 'paypalLink',
        label: 'PayPal.me link',
        placeholder: 'paypal.me/yourname',
      },
      INSTRUCTIONS_FIELD,
    ],
  },
  {
    id: 'bank-transfer',
    name: 'Bank transfer',
    description: 'Accept manual transfers to your bank account',
    icon: Wallet,
    fields: [
      { key: 'bankName', label: 'Bank name', placeholder: 'e.g. DBS' },
      {
        key: 'accountNumber',
        label: 'Account number',
        placeholder: 'Account number',
      },
      INSTRUCTIONS_FIELD,
    ],
  },
  {
    id: 'cash',
    name: 'Cash',
    description: 'Accept cash upon delivery or pickup',
    icon: Wallet,
    fields: [
      {
        key: 'instructions',
        label: 'Payment instructions',
        placeholder: 'e.g. Pay in cash on delivery',
        multiline: true,
      },
    ],
  },
]

type DefaultMethodValues = Partial<Record<DefaultFieldKey, string>>

type DefaultMethodState = {
  enabled: boolean
  values: DefaultMethodValues
  channels: ChargeChannel[]
}

const DEFAULT_INSTRUCTIONS =
  'Please include your order ID in the reference. Payment must be completed within 30 minutes.'
const CASH_INSTRUCTIONS = 'We will collect cash on delivery or pickup.'

function defaultMethodState(): Record<DefaultMethodId, DefaultMethodState> {
  return {
    paynow: {
      enabled: false,
      values: { instructions: DEFAULT_INSTRUCTIONS },
      channels: ALL_CHANNELS,
    },
    paypal: {
      enabled: false,
      values: { instructions: DEFAULT_INSTRUCTIONS },
      channels: ALL_CHANNELS,
    },
    'bank-transfer': {
      enabled: false,
      values: { instructions: DEFAULT_INSTRUCTIONS },
      channels: ALL_CHANNELS,
    },
    cash: {
      enabled: false,
      values: { instructions: CASH_INSTRUCTIONS },
      channels: ALL_CHANNELS,
    },
  }
}

// Row description: the static blurb when off, the entered detail once on.
function defaultMethodSummary(
  config: DefaultMethodConfig,
  state: DefaultMethodState,
) {
  if (!state.enabled) return config.description
  const primary = config.fields[0]
  return state.values[primary.key]?.trim() || config.description
}

// Whether a default method has its primary detail filled in.
function defaultMethodConfigured(
  config: DefaultMethodConfig,
  state: DefaultMethodState,
) {
  const primary = config.fields[0]
  return (state.values[primary.key]?.trim() ?? '') !== ''
}

// The add/edit dialog for a default method: an enable switch plus the method's
// fields. Re-mounted per open so its draft always starts fresh.
function DefaultMethodDialog({
  config,
  state,
  onOpenChange,
  onSave,
}: {
  config: DefaultMethodConfig
  state: DefaultMethodState
  onOpenChange: (open: boolean) => void
  onSave: (state: DefaultMethodState) => void
}) {
  const [draft, setDraft] = React.useState<DefaultMethodState>(state)

  function updateValue(key: DefaultFieldKey, value: string) {
    setDraft((current) => ({
      ...current,
      values: { ...current.values, [key]: value },
    }))
  }

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(state)
  const allFieldsFilled = config.fields.every(
    (field) => (draft.values[field.key]?.trim() ?? '') !== '',
  )
  const canSave = hasChanges && draft.channels.length > 0 && allFieldsFilled

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">{config.name}</TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          {config.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label
                htmlFor={`default-${field.key}`}
                className="text-sm font-medium"
              >
                {field.label}
              </Label>
              {field.multiline ? (
                <Textarea
                  id={`default-${field.key}`}
                  value={draft.values[field.key] ?? ''}
                  onChange={(event) => updateValue(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="min-h-10"
                />
              ) : (
                <Input
                  id={`default-${field.key}`}
                  value={draft.values[field.key] ?? ''}
                  onChange={(event) => updateValue(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="h-10"
                />
              )}
            </div>
          ))}

          <ChannelsField
            value={draft.channels}
            onValueChange={(channels) =>
              setDraft((current) => ({ ...current, channels }))
            }
          />
        </DialogBody>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 px-3 flex-1"
            onClick={() => onSave(draft)}
            disabled={!canSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Manual payments — custom methods
// ---------------------------------------------------------------------------

type CustomMethod = {
  id: string
  name: string
  details: string
  channels: ChargeChannel[]
}

// The add/edit dialog for a custom method: a name, free-form details, and the
// sales channels it applies to. Re-mounted per open so its draft always starts
// fresh from `initial`.
function CustomMethodDialog({
  initial,
  onOpenChange,
  onSave,
}: {
  initial: CustomMethod | null
  onOpenChange: (open: boolean) => void
  onSave: (method: {
    name: string
    details: string
    channels: ChargeChannel[]
  }) => void
}) {
  const isEditing = initial !== null
  const [name, setName] = React.useState(initial?.name ?? '')
  const [details, setDetails] = React.useState(initial?.details ?? '')
  const [channels, setChannels] = React.useState<ChargeChannel[]>(
    initial?.channels ?? ALL_CHANNELS,
  )

  const payload = { name: name.trim(), details: details.trim(), channels }
  const hasChanges =
    !isEditing ||
    payload.name !== initial.name ||
    payload.details !== initial.details ||
    JSON.stringify(payload.channels) !== JSON.stringify(initial.channels)
  const canSave =
    payload.name !== '' &&
    payload.details !== '' &&
    payload.channels.length > 0 &&
    hasChanges

  function handleSave() {
    if (!payload.name) {
      toast.error('Enter a method name')
      return
    }
    onSave(payload)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg [&_[data-slot=dialog-close]]:size-10">
        <DialogHeader className="shrink-0 text-center">
          <DialogTitle asChild>
            <TypographyH4 className="font-semibold">
              {isEditing ? 'Edit payment method' : 'Add payment method'}
            </TypographyH4>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="custom-method-name" className="text-sm font-medium">
              Method name
            </Label>
            <Input
              id="custom-method-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. GrabPay"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-method-details" className="text-sm font-medium">
              Details
            </Label>
            <Textarea
              id="custom-method-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Account name, number, instructions, etc."
              className="min-h-10"
            />
          </div>

          <ChannelsField value={channels} onValueChange={setChannels} />
        </DialogBody>

        <DialogFooter className="shrink-0 flex-row">
          <Button
            variant="outline"
            className="h-10 px-3 flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="h-10 px-3 flex-1" onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Manual payments page
// ---------------------------------------------------------------------------

export function AdminManualPaymentsPage() {
  const [defaults, setDefaults] = React.useState(defaultMethodState)
  const [openDefault, setOpenDefault] = React.useState<DefaultMethodId | null>(
    null,
  )

  const [customMethods, setCustomMethods] = React.useState<CustomMethod[]>([])
  const [customDialog, setCustomDialog] = React.useState<
    { method: CustomMethod | null } | null
  >(null)
  const [pendingDelete, setPendingDelete] = React.useState<CustomMethod | null>(
    null,
  )

  function saveDefault(id: DefaultMethodId, state: DefaultMethodState) {
    // Saving the dialog also enables the method.
    setDefaults((current) => ({
      ...current,
      [id]: { ...state, enabled: true },
    }))
    setOpenDefault(null)
    toast.success('Changes saved')
  }

  function toggleDefault(id: DefaultMethodId, checked: boolean) {
    const config = DEFAULT_METHODS.find((method) => method.id === id)!
    // Enabling an unconfigured method opens its dialog first; the switch turns
    // on only once the dialog is saved.
    if (checked && !defaultMethodConfigured(config, defaults[id])) {
      setOpenDefault(id)
      return
    }
    setDefaults((current) => ({
      ...current,
      [id]: { ...current[id], enabled: checked },
    }))
    toast.success('Changes saved')
  }

  function saveCustomMethod(draft: {
    name: string
    details: string
    channels: ChargeChannel[]
  }) {
    const editing = customDialog?.method ?? null
    setCustomMethods((current) =>
      editing
        ? current.map((method) =>
            method.id === editing.id ? { ...method, ...draft } : method,
          )
        : [...current, { id: nextId('custom'), ...draft }],
    )
    setCustomDialog(null)
    toast.success(editing ? 'Payment method updated' : 'Payment method added')
  }

  function confirmDelete() {
    if (pendingDelete === null) return
    setCustomMethods((current) =>
      current.filter((method) => method.id !== pendingDelete.id),
    )
    setPendingDelete(null)
    toast.success('Payment method deleted')
  }

  const openConfig = openDefault
    ? DEFAULT_METHODS.find((method) => method.id === openDefault)
    : null

  return (
    <>
      <div className="w-full">
        <header className="relative mb-8 flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label="Go back"
            onClick={() => navigateTo(PAYMENTS_PATH)}
            className="absolute left-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-normal text-neutral-900">
            Manual payments
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
          <p className="-mt-4 text-center text-sm text-muted-foreground">
            Manually verify payments and approve orders
          </p>
          <SettingsCard>
            {DEFAULT_METHODS.map((config) => (
              <SwitchNavRow
                key={config.id}
                label={config.name}
                icon={config.icon}
                description={defaultMethodSummary(config, defaults[config.id])}
                checked={defaults[config.id].enabled}
                onCheckedChange={(checked) => toggleDefault(config.id, checked)}
                onOpen={() => setOpenDefault(config.id)}
              />
            ))}
          </SettingsCard>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <TypographyLarge>Custom</TypographyLarge>
              <Button
                type="button"
                variant="outline"
                className="h-10 px-3 shrink-0"
                onClick={() => setCustomDialog({ method: null })}
              >
                <Plus className="size-4" />
                Add method
              </Button>
            </div>
            <SettingsCard>
              {customMethods.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No custom payment methods
                </p>
              ) : (
                customMethods.map((method) => (
                  <MethodRow
                    key={method.id}
                    icon={Wallet}
                    name={method.name}
                    summary={method.details || 'No details added'}
                    onEdit={() => setCustomDialog({ method })}
                    onDelete={() => setPendingDelete(method)}
                  />
                ))
              )}
            </SettingsCard>
          </div>
        </div>
      </div>

      {openConfig ? (
        <DefaultMethodDialog
          key={openConfig.id}
          config={openConfig}
          state={defaults[openConfig.id]}
          onOpenChange={(open) => {
            if (!open) setOpenDefault(null)
          }}
          onSave={(state) => saveDefault(openConfig.id, state)}
        />
      ) : null}

      {customDialog !== null ? (
        <CustomMethodDialog
          key={customDialog.method?.id ?? 'new'}
          initial={customDialog.method}
          onOpenChange={(open) => {
            if (!open) setCustomDialog(null)
          }}
          onSave={saveCustomMethod}
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
            <AlertDialogTitle>Delete payment method?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.name} will be removed and no longer offered at checkout.`
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
    </>
  )
}
