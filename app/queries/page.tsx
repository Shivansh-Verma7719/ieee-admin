import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import QueriesPageClient from "./QueriesPageClient";

export default async function QueriesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    // Fetch all queries
    const { data: queries, error } = await supabase
        .from("query")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching queries:", error);
    }

    return <QueriesPageClient queries={queries || []} />;
}