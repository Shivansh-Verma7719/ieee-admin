"use client";
import React from "react";
import { ExpandableCardDemo } from "@/components/ui/expandableCards";
import getEvents, { Event } from "@/app/events";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button, Link, Skeleton } from "@heroui/react";
import { RequirePermission, PERMISSIONS } from "@/lib/permissions";

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await getEvents();
        setEvents(res);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const EventSkeleton = () => (
    <div className="p-6 flex flex-col md:flex-row justify-between items-center rounded-xl shadow-md mb-4">
      <div className="flex gap-4 flex-col md:flex-row items-center md:items-start">
        <Skeleton className="h-40 w-40 md:h-30 md:w-30 rounded-lg" />
        <div className="flex flex-col items-center md:items-start">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-10 w-24 rounded-full mt-4 md:mt-0" />
    </div>
  );

  if (loading) {
    return (
      <RequirePermission permission={PERMISSIONS.EVENTS}>
        <div className="container mx-auto px-8 sm:px-20 lg:px-28 py-12">
          <div className="space-y-8 sm:space-y-10">
            <div className="flex justify-between items-center mb-6 sm:mb-8 pt-12 sm:pt-20">
              <h1 className="text-3xl sm:text-4xl font-bold">Our Events</h1>
              <Button
                as={Link}
                href="/events/create"
                color="primary"
                startContent={<Plus />}
              >
                Add New Event
              </Button>
            </div>
            {[...Array(5)].map((_, index) => (
              <EventSkeleton key={`upcoming-${index}`} />
            ))}
          </div>
        </div>
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission={PERMISSIONS.EVENTS}>
      <div className="container mx-auto px-8 sm:px-20 lg:px-28 py-12">
        <div className="space-y-8 sm:space-y-10">
          <div className="flex justify-between items-center mb-6 sm:mb-8 pt-12 sm:pt-20">
            <h1 className="text-3xl sm:text-4xl font-bold">Our Events</h1>
            <Button
              as={Link}
              href="/events/create"
              color="primary"
              startContent={<Plus />}
            >
              Add New Event
            </Button>
          </div>
          <ExpandableCardDemo cards={events} />
        </div>
      </div>
    </RequirePermission>
  );
};

export default EventsPage;
