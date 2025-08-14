"use client";
import React, { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Clock, Edit } from "lucide-react";
import getEvents, { Event } from "@/app/events";
import { Button, Skeleton } from "@heroui/react";

export default function EventPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const events = await getEvents();
        const foundEvent = events.find((e) => e.id === parseInt(params.id));
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setLoading(false);
          notFound();
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Skeleton className="w-full h-96 rounded-lg" />
        <div className="mt-8 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          <div className="flex-grow">
            <Skeleton className="w-full h-12 mb-4" />
            <Skeleton className="w-3/4 h-6 mb-2" />
            <Skeleton className="w-2/3 h-6 mb-2" />
            <Skeleton className="w-1/2 h-6" />
          </div>
          <Skeleton className="w-full md:w-1/4 h-16" />
        </div>
        <div className="mt-8">
          <Skeleton className="w-full h-48" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <h1>Event not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="relative">
        <Image
          src={event.banner_image}
          alt={`${event.name}`}
          width={1000}
          height={1000}
          className="w-full h-96 object-cover rounded-lg shadow-lg"
        />
        <div className="absolute rounded inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-center text-5xl font-bold text-[#fbfbf8]">
            {event.name}
          </h1>
        </div>
      </div>
      {/* Event Details and Register Button Section */}
      <div className="mt-8 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 h-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col gap-2 flex-grow">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-[#302f2f]">
            Event Details
          </h2>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#302f2f]">
              {event.category}
            </h3>
            <Link href={`/events/edit/${event.id}`}>
              <Button
                color="primary"
                variant="flat"
                startContent={<Edit className="w-4 h-4" />}
              >
                Edit Event
              </Button>
            </Link>
          </div>
          <p className="flex items-center gap-2 md:text-lg">
            <Calendar className="w-5 h-5" /> {event.date}
          </p>
          <p className="flex items-center gap-2 md:text-lg">
            <Clock className="w-5 h-5" /> {event.time}
          </p>
          <p className="flex items-center gap-2 md:text-lg">
            <MapPin className="w-5 h-5" /> {event.location}
          </p>
        </div>

        {event.register !== "" && event.register !== null && (
          <div className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-center md:w-1/4 h-auto">
            <a
              href={event.register}
              className="inline-block text-lg bg-blue-600 text-white font-bold py-2 px-6 m-auto rounded-lg hover:bg-blue-700 transition"
            >
              Register Now
            </a>
          </div>
        )}
      </div>
      {/* Event Description Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
        <div className="prose mt-8 md:text-lg">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-[#302f2f]">
            Description
          </h2>
          <p>{event.description}</p>
        </div>
      </div>
      {/* Back to Events Link */}
      <Link href="/events" className="text-blue-500 hover:underline block mt-6">
        &larr; Back to Events
      </Link>
    </div>
  );
}
