"use client"

interface InvoiceDetailsProps {
  description: string
  date: string
  amount: string
  show?: boolean
}

export function InvoiceDetails({ description, date, amount, show = true }: InvoiceDetailsProps) {
  if (!show) return null
  
  return (
    <div className="border-t border-secondary pt-4 mt-5 flex flex-col gap-0.5">
      <p className="text-md text-secondary">{description}</p>
      <div className="flex gap-4 text-md text-tertiary">
        <span>{date}</span>
        <span>{amount}</span>
      </div>
    </div>
  )
}







