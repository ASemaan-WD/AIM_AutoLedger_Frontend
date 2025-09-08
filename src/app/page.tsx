import { redirect } from "next/navigation";

export default function HomePage() {
    // Redirect to Invoices as the default page
    redirect("/invoices");
}