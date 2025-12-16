"use client"

import { useState, useEffect, useRef, useCallback, createContext, useContext, type ReactNode } from "react"
import { ChevronDown } from "@untitledui/icons"
import { cx } from "@/utils/cx"
import { motion, AnimatePresence } from "motion/react"

// =============================================================================
// COOKIE HELPERS
// =============================================================================

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

// =============================================================================
// CONTEXT
// =============================================================================

interface AccordionContextValue {
  expandedItems: Set<string>
  toggleItem: (id: string) => void
  expandItem: (id: string) => void
  allowMultiple: boolean
  registerItem: (id: string, itemCount?: number) => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

const useAccordionContext = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error("Accordion components must be used within Accordion.Root")
  }
  return context
}

// =============================================================================
// ROOT
// =============================================================================

interface AccordionRootProps {
  children: ReactNode
  /** Allow multiple items to be expanded at once */
  allowMultiple?: boolean
  /** Default expanded item IDs (deprecated - now all are expanded by default) */
  defaultExpanded?: string[]
  /** Additional class names */
  className?: string
  /** Cookie key for persisting collapsed state. If not provided, no persistence. */
  persistKey?: string
}

function AccordionRoot({ 
  children, 
  allowMultiple = true, 
  defaultExpanded,
  className,
  persistKey
}: AccordionRootProps) {
  // Track collapsed items (inverse of expanded for cookie storage efficiency)
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(() => {
    // Load collapsed state from cookie if persistKey is provided
    if (persistKey) {
      const stored = getCookie(`accordion_${persistKey}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            return new Set(parsed)
          }
        } catch {
          // Invalid cookie data, start fresh
        }
      }
    }
    return new Set()
  })

  // Track registered items as state (not ref) so registration triggers re-renders
  const [registeredItems, setRegisteredItems] = useState<Set<string>>(new Set())
  
  // Track item counts and previous items with refs (don't need re-renders for these)
  const previousItemsRef = useRef<Set<string>>(new Set())
  const itemCountsRef = useRef<Map<string, number>>(new Map())

  // Compute expanded items: all registered items minus collapsed ones
  const expandedItems = new Set(
    Array.from(registeredItems).filter(id => !collapsedItems.has(id))
  )

  // Expand a specific item (remove from collapsed)
  const expandItem = useCallback((id: string) => {
    setCollapsedItems(prev => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  // Register an item and auto-expand if it's new or has new content
  const registerItem = useCallback((id: string, itemCount?: number) => {
    setRegisteredItems(prev => {
      const isNewItem = !prev.has(id)
      
      // Track item count and detect if new content was added
      const previousCount = itemCountsRef.current.get(id) ?? 0
      const currentCount = itemCount ?? 0
      const hasNewContent = currentCount > previousCount && previousCount > 0
      
      if (itemCount !== undefined) {
        itemCountsRef.current.set(id, currentCount)
      }
      
      // Auto-expand if:
      // 1. This is a brand new accordion item (not seen before)
      // 2. OR the item has new content added to it
      if (isNewItem && previousItemsRef.current.size > 0) {
        // New accordion item appeared - expand it
        setCollapsedItems(prevCollapsed => {
          const next = new Set(prevCollapsed)
          next.delete(id)
          return next
        })
      } else if (hasNewContent) {
        // Existing accordion item got new content - expand it
        setCollapsedItems(prevCollapsed => {
          const next = new Set(prevCollapsed)
          next.delete(id)
          return next
        })
      }
      
      if (isNewItem) {
        const next = new Set(prev)
        next.add(id)
        return next
      }
      return prev
    })
  }, [])

  // Update previous items after render
  useEffect(() => {
    previousItemsRef.current = new Set(registeredItems)
  }, [registeredItems])

  // Persist collapsed state to cookie
  useEffect(() => {
    if (persistKey) {
      setCookie(`accordion_${persistKey}`, JSON.stringify(Array.from(collapsedItems)))
    }
  }, [collapsedItems, persistKey])

  const toggleItem = useCallback((id: string) => {
    setCollapsedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        // Was collapsed, now expand
        next.delete(id)
      } else {
        // Was expanded, now collapse
        if (!allowMultiple) {
          // In single mode, expand this one (remove from collapsed) and collapse others
          next.clear()
          registeredItems.forEach(itemId => {
            if (itemId !== id) next.add(itemId)
          })
        } else {
          next.add(id)
        }
      }
      return next
    })
  }, [allowMultiple, registeredItems])

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, expandItem, allowMultiple, registerItem }}>
      <div className={cx("divide-y divide-secondary", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

// =============================================================================
// ITEM
// =============================================================================

interface AccordionItemProps {
  children: ReactNode
  /** Unique identifier for this item */
  id: string
  /** Additional class names */
  className?: string
  /** Number of items in this accordion section. When this increases, the accordion auto-expands. */
  itemCount?: number
}

interface AccordionItemContextValue {
  id: string
  isExpanded: boolean
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null)

const useAccordionItemContext = () => {
  const context = useContext(AccordionItemContext)
  if (!context) {
    throw new Error("AccordionItem components must be used within Accordion.Item")
  }
  return context
}

function AccordionItem({ children, id, className, itemCount }: AccordionItemProps) {
  const { expandedItems, registerItem } = useAccordionContext()
  const isExpanded = expandedItems.has(id)

  // Register this item on mount and when itemCount changes
  useEffect(() => {
    registerItem(id, itemCount)
  }, [id, itemCount, registerItem])

  return (
    <AccordionItemContext.Provider value={{ id, isExpanded }}>
      <div className={cx("py-1", className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

// =============================================================================
// TRIGGER
// =============================================================================

interface AccordionTriggerProps {
  children: ReactNode
  /** Additional class names */
  className?: string
  /** Badge/count to show on the right side before chevron */
  badge?: ReactNode
}

function AccordionTrigger({ children, className, badge }: AccordionTriggerProps) {
  const { toggleItem } = useAccordionContext()
  const { id, isExpanded } = useAccordionItemContext()

  return (
    <button
      type="button"
      onClick={() => toggleItem(id)}
      className={cx(
        "flex w-full items-center justify-between gap-3 py-4 text-left transition-colors",
        "hover:bg-secondary/50 rounded-lg",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className
      )}
      aria-expanded={isExpanded}
    >
      <span className="flex-1 font-semibold text-primary text-md">
        {children}
      </span>
      {badge && (
        <span className="flex-shrink-0">
          {badge}
        </span>
      )}
      <ChevronDown 
        className={cx(
          "size-5 text-quaternary transition-transform duration-200 flex-shrink-0",
          isExpanded && "rotate-180"
        )} 
      />
    </button>
  )
}

// =============================================================================
// CONTENT
// =============================================================================

interface AccordionContentProps {
  children: ReactNode
  /** Additional class names */
  className?: string
}

function AccordionContent({ children, className }: AccordionContentProps) {
  const { id, isExpanded } = useAccordionItemContext()

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          key={`accordion-content-${id}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className={cx("pb-4", className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// EXPORTS
// =============================================================================

export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
}

