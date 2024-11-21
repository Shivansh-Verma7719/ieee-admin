"use client";
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Event } from "@/app/events";

export function ExpandableCardDemo({ cards }: { cards: Event[] }) {
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null
  );
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 m-5 md:m-0 grid place-items-center z-[100]">
            <motion.div
              layoutId={`card-${active.name}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-fit md:max-h-[90%] flex flex-col bg-[#fbfbf8] rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.name}-${id}`}>
                <Image
                  priority
                  width={300}
                  height={300}
                  src={active.image}
                  alt={active.name}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.name}-${id}`}
                      className="font-bold text-neutral-700 "
                    >
                      {active.name}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.category}-${id}`}
                      className="text-neutral-600"
                    >
                      {active.category}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${active.name}-${id}`}
                    href={`/events/${active.id}`}
                    className="px-4 py-3 text-sm rounded-full font-bold bg-[#f186c1] text-white"
                  >
                    View Event
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-fit pb-10 flex flex-col items-start gap-4 overflow-auto [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {active.one_liner}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="mx-auto w-full gap-4">
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.name}-${id}`}
            key={`card-${card.name}-${id}`}
            onClick={() => setActive(card)}
            className="p-6 flex flex-col md:flex-row justify-between items-center rounded-xl cursor-pointer shadow-md"
          >
            <div className="flex gap-4 flex-col md:flex-row items-center md:items-start">
              <motion.div layoutId={`image-${card.name}-${id}`}>
                <Image
                  width={200}
                  height={200}
                  src={card.image}
                  alt={card.name}
                  className="h-40 w-40 md:h-30 md:w-30 rounded-lg object-cover object-top"
                />
              </motion.div>
              <div className="">
                <motion.h2
                  layoutId={`title-${card.name}-${id}`}
                  className="text-xl font-bold text-neutral-800 text-center md:text-left"
                >
                  {card.name}
                </motion.h2>
                <motion.p
                  layoutId={`description-${card.category}-${id}`}
                  className="text-neutral-600 text-center md:text-left"
                >
                  {card.category}
                </motion.p>
                <motion.p
                  layoutId={`description-${card.date}-${id}`}
                  className="text-neutral-600 text-center md:text-left"
                >
                  {card.date}
                </motion.p>
              </div>
            </div>
            <motion.button
              layoutId={`button-${card.name}-${id}`}
              className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-[#f186c1] hover:text-white text-black transition-all duration-100 mt-4 md:mt-0"
            >
              Learn More
            </motion.button>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
