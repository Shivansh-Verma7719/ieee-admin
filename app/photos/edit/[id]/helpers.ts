import { createClient } from "@/utils/supabase/client";

interface Photo {
  id: number;
  image_url: string;
  caption: string;
}

export async function getPhoto(id: number): Promise<{success: boolean, data?: Photo, error?: string}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching photo:", error);
    return {success: false, error: error.message};
  }

  return {success: true, data: data as Photo};
}

export async function updatePhoto(
  photo: Photo
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("photos")
    .update({
      caption: photo.caption,
      image_url: photo.image_url,
    })
    .eq("id", photo.id);

  if (error) {
    console.error("Error updating photo:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
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

export async function deleteImage(path: string): Promise<boolean> {
  const supabase = createClient();
  const fileName = path.split("/photos/").pop() || "";
//   console.log("fileName", fileName);
  const { data, error } = await supabase.storage
    .from("photos")
    .remove([fileName]);
//   console.log("data", data);
//   console.log("error", error);

  const result = error && !data ? false : true;
//   console.log("result", result);
  return result;
}
