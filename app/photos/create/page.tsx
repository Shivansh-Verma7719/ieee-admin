"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, X, ShieldAlert } from "lucide-react";
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import { uploadImage, createPhoto } from "./helpers";
import Image from "next/image";
import { motion } from "framer-motion";

interface Photo {
  image_url: string;
  caption: string;
}

export default function CreatePhotoPage() {
  const [photo, setPhoto] = useState<Photo>({
    image_url: "",
    caption: "",
  });
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const removeImage = () => {
    setImage(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!image) {
      setError("Please upload an image.");
      setLoading(false);
      return;
    }

    try {
      const imageUrl = await uploadImage(image);
      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      const photoData = {
        ...photo,
        image_url: imageUrl,
      };

      const result = await createPhoto(photoData);
      if (result.success) {
        setPhoto({
          image_url: "",
          caption: "",
        });
        setImage(null);
        setImagePreviewUrl(null);
        router.push("/photos");
      } else {
        setError(result.error || "Failed to create photo");
      }
    } catch (error) {
      console.error("Error creating photo:", error);
      setError("An error occurred while creating the photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-center text-5xl font-bold text-[#302f2f] mb-8">
        Upload New Photo
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
                  isRequired
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
            isDisabled={loading || !photo.caption}
            onClick={handleSubmit}
          >
            {loading ? "Uploading..." : "Upload Photo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
