"use client"

import { XCircle } from "@untitledui/icons"
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components"
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal"
import { Button } from "@/components/base/buttons/button"
import { CloseButton } from "@/components/base/buttons/close-button"
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon"
import { BackgroundPattern } from "@/components/shared-assets/background-patterns"

interface CancelFileModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  filename: string
  /** Whether this is an invoice (shows "invoice" in text) or a file (shows "file" in text) */
  isInvoice?: boolean
  onConfirm: () => void
}

export function CancelFileModal({ isOpen, onOpenChange, filename, isInvoice = false, onConfirm }: CancelFileModalProps) {
  const handleCancel = () => {
    onConfirm()
    onOpenChange(false)
  }

  const itemType = isInvoice ? "invoice" : "file"

  return (
    <AriaDialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalOverlay isDismissable>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-100">
              <CloseButton 
                onClick={() => onOpenChange(false)} 
                theme="light" 
                size="lg" 
                className="absolute top-3 right-3" 
              />
              
              <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                <div className="relative w-max">
                  <FeaturedIcon 
                    color="error" 
                    size="lg" 
                    theme="light" 
                    icon={XCircle} 
                  />
                  <BackgroundPattern 
                    pattern="circle" 
                    size="sm" 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
                  />
                </div>
                
                <div className="z-10 flex flex-col gap-0.5">
                  <AriaHeading slot="title" className="text-md font-semibold text-primary">
                    Cancel {itemType}
                  </AriaHeading>
                  <p className="text-sm text-tertiary">
                    Are you sure you want to cancel "{filename}"? This will stop processing and remove the {itemType}.
                  </p>
                </div>
              </div>
              
              <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-6 sm:pt-8 sm:pb-6">
                <Button 
                  color="secondary" 
                  size="lg" 
                  onClick={() => onOpenChange(false)}
                >
                  Keep Processing
                </Button>
                <Button 
                  color="primary-destructive" 
                  size="lg" 
                  onClick={handleCancel}
                >
                  Cancel {itemType}
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  )
}

