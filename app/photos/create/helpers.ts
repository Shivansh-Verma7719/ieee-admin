import { createClient } from "@/utils/supabase/client";

interface Photo {
  image_url: string;
  caption: string;
}

export async function uploadImage(file: File): Promise<string | null> {
  const supabase = createClient();

  // Generate a unique file name
  const fileName = `photo-${Date.now()}-${file.name}`;

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from("photos")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  // Get the public URL for the uploaded image
  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(data.path);

  return publicUrl;
}

export async function createPhoto(
  photoData: Photo
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase.from("photos").insert(photoData);

  if (error) {
    console.error("Error creating photo:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
