"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import { ChevronDown } from "@untitledui/icons"
import { cx } from "@/utils/cx"
import { motion, AnimatePresence } from "motion/react"

// =============================================================================
// CONTEXT
// =============================================================================

interface AccordionContextValue {
  expandedItems: Set<string>
  toggleItem: (id: string) => void
  allowMultiple: boolean
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
  /** Default expanded item IDs */
  defaultExpanded?: string[]
  /** Additional class names */
  className?: string
}

function AccordionRoot({ 
  children, 
  allowMultiple = true, 
  defaultExpanded = [],
  className 
}: AccordionRootProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  )

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!allowMultiple) {
          next.clear()
        }
        next.add(id)
      }
      return next
    })
  }

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, allowMultiple }}>
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

function AccordionItem({ children, id, className }: AccordionItemProps) {
  const { expandedItems } = useAccordionContext()
  const isExpanded = expandedItems.has(id)

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
        "hover:bg-secondary/50 rounded-lg px-3 -mx-3",
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
  const { isExpanded } = useAccordionItemContext()

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
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

