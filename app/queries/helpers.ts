import { createClient } from "@/utils/supabase/server";

export async function getQueryStats() {
  const supabase = await createClient();

  const { data: queries, error } = await supabase
    .from("query")
    .select("id, status");

  if (error) {
    console.error("Error fetching query stats:", error);
    return {
      total: 0,
      pending: 0,
      resolved: 0,
      rejected: 0,
    };
  }

  const stats = {
    total: queries.length,
    pending: queries.filter((q) => q.status === "pending").length,
    resolved: queries.filter((q) => q.status === "resolved").length,
    rejected: queries.filter((q) => q.status === "rejected").length,
  };

  return stats;
}

export async function updateQueryStatus(id: number, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("query")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update query status: ${error.message}`);
  }

  return { success: true };
}

export async function getQueriesByStatus(status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("query")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch queries: ${error.message}`);
  }

  return data || [];
}
