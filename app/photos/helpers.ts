import { createClient } from "@/utils/supabase/client";

export interface Photo {
  id: number;
  image_url: string;
  caption: string;
}

export async function getPhotos(): Promise<Photo[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching photos:", error);
    return [];
  }

  return data as Photo[];
}

export async function deletePhoto(id: number): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("photos").delete().eq("id", id);

  if (error) {
    console.error("Error deleting photo:", error);
    return false;
  }

  return true;
}

export async function uploadImage(file: File): Promise<string | null> {
  const supabase = createClient();
  const fileName = `photo-${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("photos")
    .upload(fileName, file);

  if (error) {
    console.error("Error uploading image:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("photos")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function getPhoto(id: number): Promise<Photo | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching photo:", error);
    return null;
  }

  return data as Photo;
}

export async function updatePhoto(
  photo: Photo
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("photos")
    .upsert(photo, { onConflict: "id" });

  if (error) {
    console.error("Error updating photo:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
