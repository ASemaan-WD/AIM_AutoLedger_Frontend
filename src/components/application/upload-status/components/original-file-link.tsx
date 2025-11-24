"use client"

import { File03, LinkExternal01 } from "@untitledui/icons"

interface OriginalFileLinkProps {
  filename: string
  show?: boolean
  onClick?: () => void
}

export function OriginalFileLink({ filename, show = true, onClick }: OriginalFileLinkProps) {
  if (!show) return null
  
  return (
    <div className="border-t border-secondary pt-4 mt-5">
      <button 
        className="flex items-center gap-2 group hover:bg-secondary rounded-lg p-2 -m-2 transition-colors"
        aria-label="View original file"
        onClick={onClick}
      >
        <File03 className="size-3.5 text-quaternary flex-shrink-0" />
        <p className="text-xs text-tertiary truncate flex-1 min-w-0 text-left">
          Original file: {filename}
        </p>
        <LinkExternal01 className="size-3.5 text-quaternary flex-shrink-0 group-hover:text-tertiary transition-colors" />
      </button>
    </div>
  )
}







