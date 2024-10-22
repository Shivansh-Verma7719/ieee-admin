import { createClient } from "@/utils/supabase/client";

interface Event {
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

export async function uploadImage(file: File): Promise<string | null> {
  const supabase = createClient();
  
  // Generate a unique file name
  const fileName = `event-${Date.now()}-${file.name}`;
  
  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from("event_images")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  // Get the public URL for the uploaded image
  const { data: { publicUrl } } = supabase.storage
    .from("event_images")
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function createEvent(eventData: Event): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .insert([eventData]);

  if (error) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

