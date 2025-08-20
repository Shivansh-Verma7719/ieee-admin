"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
} from "@heroui/react";
import { getPhotos, deletePhoto } from "./helpers";
import { RequirePermission, PERMISSIONS } from "@/lib/permissions";

interface Photo {
  id: number;
  image_url: string;
  caption: string;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const fetchedPhotos = await getPhotos();
    setPhotos(fetchedPhotos);
  };

  const handleDelete = async (id: number) => {
    setSelectedPhotoId(id);
    onOpen();
  };

  const DeleteModal = ({
    isOpen,
    onClose,
    id,
    onDeleteSuccess,
  }: {
    isOpen: boolean;
    onClose: () => void;
    id: number;
    onDeleteSuccess: () => void;
  }) => {
    const handleDelete = async () => {
      setIsLoading(true);
      await deletePhoto(id);
      onDeleteSuccess();
      onClose();
      setIsLoading(false);
    };

    return (
      <Modal isOpen={isOpen} onOpenChange={onClose}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Photo
              </ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this photo?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={handleDelete} isLoading={isLoading}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  };

  return (
    <RequirePermission permission={PERMISSIONS.PHOTOS}>
      <div className="container mx-auto px-4 py-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Photo Gallery</h1>
          <Button
            as={Link}
            href="/photos/create"
            color="primary"
            startContent={<Plus />}
          >
            Add New Photo
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square overflow-hidden rounded-lg shadow-lg group"
            >
              <Image
                src={photo.image_url}
                alt={photo.caption}
                layout="fill"
                objectFit="cover"
                className="transition-all duration-300 group-hover:scale-110 group-hover:brightness-50"
              />
              <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-lg font-semibold">
                  {photo.caption}
                </p>
              </div>
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  as={Link}
                  href={`/photos/edit/${photo.id}`}
                  size="sm"
                  color="primary"
                  isIconOnly
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  isIconOnly
                  onClick={() => handleDelete(photo.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        <DeleteModal
          isOpen={isOpen}
          onClose={onOpenChange}
          id={selectedPhotoId || 0}
          onDeleteSuccess={fetchPhotos}
        />
      </div>
    </RequirePermission>
  );
}
