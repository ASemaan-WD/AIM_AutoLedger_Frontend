"use client"

import { AlertTriangle } from "@untitledui/icons"
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components"
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal"
import { Button } from "@/components/base/buttons/button"
import { CloseButton } from "@/components/base/buttons/close-button"
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon"
import { BackgroundPattern } from "@/components/shared-assets/background-patterns"

interface ExportWithIssuesModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  issues: string[]
  onConfirm: () => void
}

export function ExportWithIssuesModal({ 
  isOpen, 
  onOpenChange, 
  issues, 
  onConfirm 
}: ExportWithIssuesModalProps) {
  const handleExport = () => {
    onConfirm()
    onOpenChange(false)
  }

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
                    color="warning" 
                    size="lg" 
                    theme="light" 
                    icon={AlertTriangle} 
                  />
                  <BackgroundPattern 
                    pattern="circle" 
                    size="sm" 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
                  />
                </div>
                
                <div className="z-10 flex flex-col gap-0.5">
                  <AriaHeading slot="title" className="text-md font-semibold text-primary">
                    Export with issues
                  </AriaHeading>
                  <p className="text-sm text-tertiary">
                    We found {issues.length === 1 ? 'an issue' : 'some issues'} with this invoice. 
                    You can fix {issues.length === 1 ? 'it' : 'them'} in AIM after export.
                  </p>
                </div>
              </div>
              
              <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-6 sm:pt-8 sm:pb-6">
                <Button 
                  color="secondary" 
                  size="lg" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  size="lg" 
                  onClick={handleExport}
                >
                  Export to AIM
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  )
}







