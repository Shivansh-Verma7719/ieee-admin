"use client";
import React, { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, X, ShieldAlert } from "lucide-react";
import { Input, Button, Card, CardHeader, CardBody, Spinner } from "@heroui/react";
import { uploadImage, updatePhoto, getPhoto } from "./helpers";
import { deleteImage } from "@/utils/images/storage";
import Image from "next/image";
import { motion } from "framer-motion";

interface Photo {
  id: number;
  image_url: string;
  caption: string;
}

export default function EditPhotoPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [photo, setPhoto] = useState<Photo>({
    id: parseInt(params.id),
    image_url: "",
    caption: "",
  });
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      setLoading(true);
      await getPhoto(parseInt(params.id)).then((fetchedPhoto) => {
        if (fetchedPhoto.success) {
          setPhoto(fetchedPhoto.data!);
          setImagePreviewUrl(fetchedPhoto.data!.image_url);
        } else {
          setError("Photo not found");
        }
      }).finally(() => {
        setLoading(false);
      });
    };
    fetchPhoto();
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPhoto((prevPhoto) => ({
      ...prevPhoto,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = async () => {
    setImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = photo.image_url;
      if (image) {
        const newImageUrl = await uploadImage(image);
        if (!newImageUrl) {
          throw new Error("Failed to upload image");
        }
        if (photo.image_url) {
          //   console.log("photo.image_url", photo.image_url);
          const deleted = await deleteImage(photo.image_url, "photos");
          if (!deleted) {
            throw new Error("Failed to delete old image");
          }
        }
        imageUrl = newImageUrl;
      }

      const photoData = {
        ...photo,
        image_url: imageUrl,
      };

      const result = await updatePhoto(photoData);
      if (result.success) {
        router.push("/photos");
      } else {
        setError(result.error || "Failed to update photo");
      }
    } catch (error) {
      console.error("Error updating photo:", error);
      setError("An error occurred while updating the photo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="text-center">
          <Spinner className="mx-auto" />
        </div>
      </div>
    );
  }

  // If error or photo not found, show error state
  if (error || !photo) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Card className="max-w-md mx-auto">
          <CardHeader className="flex gap-3">
            <ShieldAlert className="text-red-500" />
            <div className="flex flex-col">
              <p className="text-lg">Error</p>
              <p className="text-small text-default-500">
                {error || "Failed to load photo"}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex justify-center mt-4">
              <Button as={Link} href="/photos" color="primary">
                Return to Photos
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-center text-5xl font-bold text-[#302f2f] mb-8">
        Edit Photo
      </h1>
      <form className="space-y-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#302f2f]">
            Photo Details
          </h2>
          <div className="space-y-4">
            <Input
              label="Caption"
              name="caption"
              value={photo.caption}
              onChange={handleInputChange}
              isRequired
            />
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#302f2f]">
                Photo
              </h2>
              <div className="mt-1 h-[30rem] mx-auto w-full md:w-[30%] md:h-[46.25rem]">
                {imagePreviewUrl ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative aspect-square overflow-hidden rounded-[1.75rem] shadow-2xl group"
                  >
                    <Image
                      src={imagePreviewUrl}
                      alt="Photo preview"
                      layout="fill"
                      objectFit="cover"
                      className="transition-all duration-300 group-hover:scale-110 group-hover:brightness-50"
                    />
                    <div className="absolute inset-0 flex items-end p-3 justify-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-[#fbfbf8] text-center font-semibold px-4 py-2 text-md md:text-2xl">
                        {photo.caption}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 z-50"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-[1.75rem] border-2 border-dashed border-gray-300">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        Upload Photo
                      </span>
                    </button>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Card radius="lg" className="mt-4 bg-red-500/20 p-2" shadow="sm">
            <CardHeader>
              <ShieldAlert className="text-red-500 mr-2" />
              <h1 className="text-red-500">Error</h1>
            </CardHeader>
            <CardBody>
              <p className="text-red-500">{error}</p>
            </CardBody>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <Link href="/photos" className="text-blue-500 hover:underline">
            &larr; Back to Photos
          </Link>
          <Button
            color="primary"
            isDisabled={isSubmitting || !photo.caption}

            onClick={handleSubmit}
          >
            {isSubmitting ? "Updating..." : "Update Photo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
