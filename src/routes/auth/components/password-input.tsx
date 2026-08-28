import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'
import { AUTH_CONTROL_CLASS } from '../auth'

// A password field with a reveal toggle. The group owns the border so the
// toggle sits inside the field rather than beside it.
export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <InputGroup className={AUTH_CONTROL_CLASS}>
      <InputGroupInput
        type={isVisible ? 'text' : 'password'}
        className={cn('pl-3', className)}
        {...props}
      />
      <InputGroupAddon align="inline-end" className="pr-1.5">
        <InputGroupButton
          type="button"
          size="icon-sm"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
