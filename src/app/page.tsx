import { redirect } from "next/navigation";

export default function HomePage() {
    // Redirect to Home as the default page
    redirect("/home");
}