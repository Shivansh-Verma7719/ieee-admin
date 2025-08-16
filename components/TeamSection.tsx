import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail } from "lucide-react";

interface TeamMember {
  name: string;
  desig: string;
  imageUrl: string;
  email?: string;
}

interface TeamSectionProps {
  title: string;
  members: TeamMember[];
}

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function TeamSection({ title, members }: TeamSectionProps) {
  return (
    <>
      <motion.h2
        className="text-center text-4xl font-bold mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.45 }}
      >
        {title}
      </motion.h2>
      <div className="space-y-8">
        {/* Co-Directors Section */}
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          className="grid p-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12"
        >
          <div className="col-span-full flex justify-center gap-6 sm:gap-12 flex-wrap">
            {members
              .filter((member) =>
                member.desig.toLowerCase().includes("co-director")
              )
              .map((member, index) => (
                <motion.div
                  key={`director-${index}`}
                  variants={cardVariants}
                  whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                  className="shadow-lg rounded-lg p-6 flex flex-col items-center w-[calc(50%-12px)] sm:w-[calc(50%-24px)] md:w-[calc(33.333%-32px)] lg:w-[calc(25%-36px)]"
                >
                  <div className="relative w-28 h-28 sm:w-40 sm:h-40 border-5 border-[#467eb5] rounded-full overflow-hidden">
                    <Image
                      src={member.imageUrl || "/images/placeholder.jpg"}
                      alt={`${member.name} Image`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <h2 className="font-bold text-xl sm:text-2xl mt-6">
                    {member.name}
                  </h2>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-[#c2674b] font-bold">
                      {member.desig}
                    </p>
                    {member.email && (
                      <div className="flex justify-center w-full">
                        <Link
                          href={`mailto:${member.email}`}
                          className="text-sm text-[#d47557] font-bold mt-2 text-center"
                        >
                          <Mail />
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Other Members Section */}
        <motion.div
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          className="grid p-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-12"
        >
          {members
            .filter(
              (member) => !member.desig.toLowerCase().includes("co-director")
            )
            .map((member, index) => (
              <motion.div
                key={`member-${index}`}
                variants={cardVariants}
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                className="shadow-lg rounded-lg p-6 flex flex-col items-center"
              >
                <div className="relative w-28 h-28 sm:w-40 sm:h-40 border-5 border-[#467eb5] rounded-full overflow-hidden">
                  <Image
                    src={member.imageUrl || "/images/placeholder.jpg"}
                    alt={`${member.name} Image`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <h2 className="font-bold text-xl sm:text-2xl mt-6">
                  {member.name}
                </h2>
                <div className="mt-4 text-center">
                  <p className="text-sm text-[#c2674b] font-bold">
                    {member.desig}
                  </p>
                  {member.email && (
                    <div className="flex justify-center w-full">
                      <Link
                        href={`mailto:${member.email}`}
                        className="text-sm text-[#d47557] font-bold mt-2 text-center"
                      >
                        <Mail />
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </>
  );
}