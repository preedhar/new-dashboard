import * as React from "react"
import {
  CheckIcon,
  CircleUserIcon,
  LanguagesIcon,
  LogOutIcon,
  Smile,
} from "lucide-react"

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
  { code: "EN", label: "English", flag: "🇺🇸" },
  { code: "BN", label: "বাংলা", flag: "🇧🇩" },
  { code: "MS", label: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "TH", label: "ไทย", flag: "🇹🇭" },
  { code: "FR", label: "Français", flag: "🇫🇷" },
  { code: "ID", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ES", label: "Español", flag: "🇪🇸" },
  { code: "ZH", label: "中文", flag: "🇨🇳" },
  { code: "PT", label: "Português Brasileiro", flag: "🇧🇷" },
  { code: "NL", label: "Nederlands", flag: "🇳🇱" },
  { code: "DE", label: "Deutsch", flag: "🇩🇪" },
]

type UserMenuContentProps = React.ComponentProps<typeof DropdownMenuContent>

export function UserMenuContent({
  className = "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg",
  side,
  align = "end",
  sideOffset = 4,
  ...props
}: UserMenuContentProps) {
  const [selectedLanguageCode, setSelectedLanguageCode] = React.useState("EN")
  const selectedLanguage =
    languages.find((language) => language.code === selectedLanguageCode) ?? languages[0]

  return (
    <DropdownMenuContent
      className={className}
      side={side}
      align={align}
      sideOffset={sideOffset}
      {...props}
    >
      <DropdownMenuItem>
        <CircleUserIcon />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Smile />
        Get Help
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <LanguagesIcon />
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span>Language</span>
            <span className="ml-auto text-base leading-none" aria-hidden="true">
              {selectedLanguage.flag}
            </span>
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-64 rounded-lg p-1">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              className="h-11 gap-3"
              onSelect={() => setSelectedLanguageCode(language.code)}
            >
              <span className="flex w-5 justify-center">
                {language.code === selectedLanguage.code ? (
                  <CheckIcon className="size-4 text-muted-foreground" />
                ) : null}
              </span>
              <span className="text-xl leading-none">{language.flag}</span>
              <span className="truncate">{language.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <LogOutIcon />
        Log Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
