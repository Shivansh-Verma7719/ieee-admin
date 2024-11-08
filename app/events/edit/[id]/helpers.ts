import { createClient } from "@/utils/supabase/client";

export interface Event {
  id: number;
  image: string;
  banner_image: string;
  name: string;
  category: string;
  register: string;
  datetime: string;
  location: string;
  description: string;
  one_liner: string;
}

export async function getEvent(id: number): Promise<Event | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }

  return data as Event;
}

export async function updateEvent(
  event: Event
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("events")
    .upsert(event, { onConflict: 'id' });

  if (error) {
    console.error("Error updating event:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function uploadImage(file: File): Promise<string | null> {
  const supabase = createClient();
  const fileName = `event-${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("event_images")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("event_images")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteImage(path: string): Promise<void> {
  const supabase = createClient();
  const fileName = path.split("/event_images/").pop() || "";
  // console.log(fileName);
  const { error } = await supabase.storage
    .from("event_images")
    .remove([fileName]);

  // console.log(error);

  if (error) {
    console.error("Error deleting image:", error);
  }
}
