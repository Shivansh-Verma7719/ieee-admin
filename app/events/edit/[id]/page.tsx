"use client";
import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Image as ImageIcon, X, ShieldAlert } from "lucide-react";
import { parseDateTime } from "@internationalized/date";
import {
  Input,
  Textarea,
  Button,
  DatePicker,
  Card,
  CardHeader,
  CardBody,
  Spinner,
} from "@heroui/react";
import { motion } from "framer-motion";
import { deleteImage, getEvent, updateEvent, uploadImage } from "./helpers";

interface Event {
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

export default function EditEventPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [event, setEvent] = useState<Event | null>(null);
  const [originalEvent, setOriginalEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isBannerChanged, setIsBannerChanged] = useState(false);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const fetchedEvent = await getEvent(parseInt(params.id));
        if (fetchedEvent) {
          setEvent(fetchedEvent);
          setOriginalEvent(fetchedEvent);
          setImagePreviewUrl(fetchedEvent.image);
          setBannerPreviewUrl(fetchedEvent.banner_image);
        } else {
          setError("Event not found");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Error fetching event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEvent((prevEvent) => ({
      ...prevEvent!,
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
      setIsBannerChanged(true);
      setBannerImage(null);
      setBannerPreviewUrl(null);
    } else {
      setIsImageChanged(true);
      setImage(null);
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!event) return;

    setLoading(true);
    setError(null);

    try {
      // Handle image uploads
      if (isImageChanged) {
        if (originalEvent?.image) await deleteImage(originalEvent.image);
        const imageUrl = await uploadImage(image as File);
        if (imageUrl) event.image = imageUrl;
      }
      if (isBannerChanged) {
        if (originalEvent?.banner_image)
          await deleteImage(originalEvent.banner_image);
        const bannerImageUrl = await uploadImage(bannerImage as File);
        if (bannerImageUrl) event.banner_image = bannerImageUrl;
      }

      const result = await updateEvent(event);
      if (result.success) {
        router.push("/events");
      } else {
        setError(result.error || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setError("An error occurred while updating the event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Card radius="lg" className="mt-4 bg-red-500/20 p-5" shadow="sm">
          <CardHeader>
            <ShieldAlert className="text-red-500 mr-2" />
            <h1 className="text-red-500">Error</h1>
          </CardHeader>
          <CardBody>
            <p className="text-red-500">{error || "Event not found"}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-center text-5xl font-bold text-[#302f2f] mb-8">
        Edit Event
      </h1>
      <form className="space-y-6">
        {/* Event Details */}
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
            <DatePicker
              label="Event Date"
              name="datetime"
              defaultValue={parseDateTime(event.datetime)}
              onChange={(value) =>
                setEvent({
                  ...event,
                  datetime: value ? value.toString() : event.datetime,
                })
              }
            />
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
            />
            <Input
              label="Event One Liner"
              name="one_liner"
              value={event.one_liner}
              onChange={handleInputChange}
              isRequired
            />
          </div>
        </div>

        {/* Banner Image */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#302f2f]">
            Event Banner Image
          </h2>
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
              accept="image/*"
              onChange={(e) => handleImageChange(e, true)}
              className="hidden"
              ref={bannerInputRef}
            />
          </div>
        </div>

        {/* Event Image */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#302f2f]">
            Event Image
          </h2>
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
              accept="image/*"
              onChange={(e) => handleImageChange(e, false)}
              className="hidden"
              ref={fileInputRef}
            />
          </div>
        </div>

        {/* Event Description */}
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
          <Button
            color="danger"
            variant="light"
            onClick={() => router.push("/events")}
          >
            Cancel
          </Button>
          <Button color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
