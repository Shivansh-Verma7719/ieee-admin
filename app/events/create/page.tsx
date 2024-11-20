"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Image as ImageIcon, X, ShieldAlert } from "lucide-react";
import {
  Input,
  Textarea,
  Button,
  DatePicker,
  Card,
  CardHeader,
  CardBody,
} from "@nextui-org/react";
import { uploadImage, createEvent } from "./helpers";
import Image from "next/image";
import { motion } from "framer-motion";

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

export default function CreateEventPage() {
  const [event, setEvent] = useState<Event>({
    image: "",
    banner_image: "",
    name: "",
    category: "",
    register: "",
    datetime: "",
    location: "",
    description: "",
    one_liner: "",
  });
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(event);
  }, [event]);

  const validateEvent = () => {
    return (
      event.name &&
      event.category &&
      event.register &&
      event.one_liner &&
      event.datetime &&
      event.location &&
      event.description &&
      /^https?:\/\/.+/.test(event.register) // Check if register is a valid URL
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEvent((prevEvent) => ({
      ...prevEvent,
      [name]: value,
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isBanner: boolean
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const setImageFunc = isBanner ? setBannerImage : setImage;
      const setPreviewFunc = isBanner
        ? setBannerPreviewUrl
        : setImagePreviewUrl;

      setImageFunc(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFunc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (isBanner: boolean) => {
    if (isBanner) {
      setBannerImage(null);
      setBannerPreviewUrl(null);
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    } else {
      setImage(null);
      setImagePreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (!image || !bannerImage) {
      setError("Please upload both an event image and a banner image.");
      setLoading(false);
      return;
    }

    try {
      const imageUrl = await uploadImage(image);
      const bannerImageUrl = await uploadImage(bannerImage);
      if (!imageUrl || !bannerImageUrl) {
        throw new Error("Failed to upload images");
      }

      const eventData = {
        ...event,
        image: imageUrl,
        banner_image: bannerImageUrl,
      };

      const result = await createEvent(eventData);
      if (result.success) {
        setEvent({
          image: "",
          banner_image: "",
          name: "",
          datetime: "",
          location: "",
          description: "",
          category: "",
          one_liner: "",
          register: "",
        });
        setImage(null);
        setBannerImage(null);
        setImagePreviewUrl(null);
        setBannerPreviewUrl(null);
        router.push("/events");
      } else if (!result.success) {
        setError(result.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setError("An error occurred while creating the event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-center text-5xl font-bold text-[#302f2f] mb-8">
        Create New Event
      </h1>
      <form className="space-y-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#302f2f]">
            Event Details
          </h2>
          <div className="space-y-4">
            <Input
              label="Event Name"
              name="name"
              value={event.name}
              onChange={handleInputChange}
              isRequired
            />
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <DatePicker
                label="Event Date"
                name="datetime"
                granularity="minute"
                onChange={(value) =>
                  setEvent({ ...event, datetime: value?.toString() || "" })
                }
              />
            </div>
            <Input
              label="Event Location"
              name="location"
              value={event.location}
              onChange={handleInputChange}
              isRequired
              startContent={<MapPin className="w-4 h-4 text-gray-400" />}
            />
            <Input
              label="Event Category"
              name="category"
              value={event.category}
              onChange={handleInputChange}
              isRequired
            />
            <Input
              label="Event Register Link"
              name="register"
              value={event.register}
              onChange={handleInputChange}
              isRequired
            />
            <Input
              label="Event One Liner"
              name="one_liner"
              value={event.one_liner}
              onChange={handleInputChange}
              isRequired
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Banner Image
              </label>
              <div className="mt-1">
                {bannerPreviewUrl ? (
                  <div className="relative">
                    <Image
                      src={bannerPreviewUrl}
                      alt="Event banner preview"
                      width={1000}
                      height={400}
                      className="w-full h-96 object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute rounded inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <h1 className="text-center text-5xl font-bold text-[#fbfbf8]">
                        {event.name || "Event Name"}
                      </h1>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(true)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="flex flex-col items-center justify-center"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        Upload Banner Image
                      </span>
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, true)}
                  className="hidden"
                  ref={bannerInputRef}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Image
              </label>
              <div className="mt-1 h-[30rem] mx-auto w-full md:w-[30%] md:h-[46.25rem]">
                {imagePreviewUrl ? (
                  <motion.div className="rounded-[1.75rem] bg-gray-100 dark:bg-neutral-900 h-[30rem] w-full md:h-[46.25rem] overflow-hidden flex flex-col items-start justify-start relative z-10">
                    <div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-30 pointer-events-none" />
                    <div className="relative z-40 p-8">
                      <motion.p className="text-white text-sm md:text-base font-medium text-left">
                        {event.datetime || "Event Date"}
                      </motion.p>
                      <motion.p className="text-white text-sm md:text-base font-medium text-left">
                        {event.category || "Event Category"}
                      </motion.p>
                      <motion.p className="text-white text-sm md:text-base font-medium text-left">
                        {event.location || "Event Location"}
                      </motion.p>
                      <motion.p className="text-white text-xl md:text-3xl font-semibold max-w-xs text-left [text-wrap:balance] my-2">
                        {event.name || "Event Name"}
                      </motion.p>
                    </div>
                    <Image
                      src={imagePreviewUrl}
                      alt="Event preview"
                      fill
                      className="object-cover absolute z-10 inset-0"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(false)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 z-50"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center w-full h-[30rem] md:h-[46.25rem] bg-gray-100 rounded-[1.75rem] border-2 border-dashed border-gray-300">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        Upload Event Image
                      </span>
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, false)}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#302f2f]">
            Event Description
          </h2>
          <Textarea
            label="Description"
            name="description"
            value={event.description}
            onChange={handleInputChange}
            isRequired
            minRows={4}
          />
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
          <Link href="/events" className="text-blue-500 hover:underline">
            &larr; Back to Events
          </Link>
          <Button
            type="submit"
            color="primary"
            size="lg"
            isDisabled={loading || !validateEvent()}
            onClick={handleSubmit}
          >
            {loading ? "Creating Event..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
