"use client"

import { useState, useEffect } from "react"
import { Mail01, Copy01, Check } from "@untitledui/icons"
import { DialogTrigger as AriaDialogTrigger, Heading as AriaHeading } from "react-aria-components"
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal"
import { Button } from "@/components/base/buttons/button"
import { CloseButton } from "@/components/base/buttons/close-button"
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon"
import { BackgroundPattern } from "@/components/shared-assets/background-patterns"
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator"

interface ContactVendorModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  vendorName: string
  issues: string[]
  invoiceInfo?: {
    invoiceNumber?: string
    date: string
    amount: string
  }
}

// Mock function to simulate AI drafting an email
const mockDraftEmail = async (vendorName: string, issues: string[], invoiceInfo?: { invoiceNumber?: string; date: string; amount: string }): Promise<string> => {
  // Simulate API delay (2-3 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
  
  const invoiceRef = invoiceInfo?.invoiceNumber 
    ? `Invoice #${invoiceInfo.invoiceNumber}` 
    : `Invoice dated ${invoiceInfo?.date || 'recently'}`
  
  const issuesList = issues.map(issue => `  • ${issue}`).join('\n')
  
  return `Subject: Action Required: ${invoiceRef} - Clarification Needed

Dear ${vendorName} Accounts Team,

I hope this email finds you well. I'm reaching out regarding ${invoiceRef}${invoiceInfo?.amount ? ` for ${invoiceInfo.amount}` : ''} that we recently received.

During our review, we identified the following items that require your attention:

${issuesList}

Could you please review these points and provide clarification or updated documentation as needed? This will help us process your invoice promptly.

If you have any questions or need additional information from our end, please don't hesitate to reach out.

Thank you for your prompt attention to this matter.

Best regards,
[Your Name]
Accounts Payable Department`
}

export function ContactVendorModal({ 
  isOpen, 
  onOpenChange, 
  vendorName,
  issues,
  invoiceInfo
}: ContactVendorModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [draftedEmail, setDraftedEmail] = useState<string>("")
  const [copied, setCopied] = useState(false)

  // Draft email when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setDraftedEmail("")
      setCopied(false)
      
      mockDraftEmail(vendorName, issues, invoiceInfo)
        .then(email => {
          setDraftedEmail(email)
          setIsLoading(false)
        })
    }
  }, [isOpen, vendorName, issues, invoiceInfo])

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(draftedEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleOpenMailClient = () => {
    const subject = encodeURIComponent(`Action Required: Invoice Clarification Needed`)
    const body = encodeURIComponent(draftedEmail)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <AriaDialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalOverlay isDismissable={!isLoading}>
        <Modal>
          <Dialog>
            <div className="relative w-full overflow-hidden rounded-2xl bg-primary shadow-xl sm:max-w-xl">
              {!isLoading && (
                <CloseButton 
                  onClick={() => onOpenChange(false)} 
                  theme="light" 
                  size="lg" 
                  className="absolute top-3 right-3 z-10" 
                />
              )}
              
              {isLoading ? (
                // Loading State
                <div className="flex flex-col items-center justify-center px-6 py-16 sm:px-8 sm:py-20">
                  <div className="relative mb-6">
                    <FeaturedIcon 
                      color="brand" 
                      size="lg" 
                      theme="light" 
                      icon={Mail01} 
                    />
                    <BackgroundPattern 
                      pattern="circle" 
                      size="sm" 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
                    />
                  </div>
                  
                  <LoadingIndicator size="md" type="line-simple" />
                  
                  <div className="mt-6 text-center">
                    <h3 className="text-lg font-semibold text-primary">
                      Crafting email to {vendorName}
                    </h3>
                    <p className="mt-1 text-sm text-tertiary">
                      Analyzing invoice issues and drafting a professional response...
                    </p>
                  </div>
                </div>
              ) : (
                // Email Draft State
                <>
                  <div className="flex flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
                    <div className="relative w-max">
                      <FeaturedIcon 
                        color="brand" 
                        size="lg" 
                        theme="light" 
                        icon={Mail01} 
                      />
                      <BackgroundPattern 
                        pattern="circle" 
                        size="sm" 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
                      />
                    </div>
                    
                    <div className="z-10 flex flex-col gap-0.5">
                      <AriaHeading slot="title" className="text-md font-semibold text-primary">
                        Email draft ready
                      </AriaHeading>
                      <p className="text-sm text-tertiary">
                        Review the draft below and send it to {vendorName} to resolve the issues.
                      </p>
                    </div>
                  </div>
                  
                  {/* Email Preview */}
                  <div className="mx-4 mt-4 sm:mx-6">
                    <div className="relative rounded-lg border border-secondary bg-secondary p-4">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-secondary leading-relaxed max-h-64 overflow-y-auto">
                        {draftedEmail}
                      </pre>
                      
                      {/* Copy button overlay */}
                      <button
                        onClick={handleCopyToClipboard}
                        className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md bg-primary px-2 py-1 text-xs font-medium text-secondary shadow-sm ring-1 ring-inset ring-secondary hover:bg-primary-hover transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="size-3.5 text-fg-success-secondary" />
                            <span className="text-fg-success-secondary">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy01 className="size-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="z-10 flex flex-1 flex-col-reverse gap-3 p-4 pt-6 *:grow sm:grid sm:grid-cols-2 sm:px-6 sm:pt-6 sm:pb-6">
                    <Button 
                      color="secondary" 
                      size="lg" 
                      onClick={() => onOpenChange(false)}
                    >
                      Close
                    </Button>
                    <Button 
                      color="primary" 
                      size="lg" 
                      onClick={handleOpenMailClient}
                    >
                      Open in mail client
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </AriaDialogTrigger>
  )
}



