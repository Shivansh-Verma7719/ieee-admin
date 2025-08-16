import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Edit, Trash2 } from "lucide-react";
import { Button } from "@heroui/react";
import { Person } from "@/app/team/helpers";

interface DynamicTeamSectionProps {
    title: string;
    members: Person[];
    canEdit?: boolean;
    onEdit?: (person: Person) => void;
    onDelete?: (id: number) => void;
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

export default function DynamicTeamSection({ title, members, canEdit = false, onEdit, onDelete }: DynamicTeamSectionProps) {
    // Filter co-directors (assuming they have "co-director" in their role name)
    const coDirectors = members.filter((member) =>
        member.role?.name?.toLowerCase().includes("co-director")
    );

    const otherMembers = members.filter((member) =>
        !member.role?.name?.toLowerCase().includes("co-director")
    );

    return (
        <div className="w-full">
            <motion.h2
                className="text-center text-4xl font-bold mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.45 }}
            >
                {title}
            </motion.h2>
            <div className="space-y-8 w-full">
                {/* Co-Directors Section */}
                {coDirectors.length > 0 && (
                    <motion.div
                        variants={staggerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        <div className="flex justify-center gap-6 sm:gap-12 flex-wrap">
                            {coDirectors.map((member) => (
                                <motion.div
                                    key={`director-${member.id}`}
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                                    className="shadow-lg rounded-lg p-6 flex flex-col items-center w-full max-w-sm relative group"
                                >
                                    {canEdit && onEdit && onDelete && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="light"
                                                isIconOnly
                                                onPress={() => onEdit(member)}
                                                className="bg-white/80 backdrop-blur-sm"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                isIconOnly
                                                onPress={() => onDelete(member.id)}
                                                className="bg-white/80 backdrop-blur-sm text-danger"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="relative w-28 h-28 sm:w-40 sm:h-40 border-4 border-[#467eb5] rounded-full overflow-hidden">
                                        <Image
                                            src={member.profile_image || "/images/placeholder.jpg"}
                                            alt={`${member.full_name} Image`}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                    <h2 className="font-bold text-xl sm:text-2xl mt-6 text-center">
                                        {member.full_name}
                                    </h2>
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-[#c2674b] font-bold">
                                            {member.role?.name}
                                        </p>
                                        {member.email && (
                                            <div className="flex justify-center w-full mt-2">
                                                <Link
                                                    href={`mailto:${member.email}`}
                                                    className="text-sm text-[#d47557] font-bold text-center"
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
                )}

                {/* Other Members Section */}
                {otherMembers.length > 0 && (
                    <motion.div
                        variants={staggerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-12">
                            {otherMembers.map((member) => (
                                <motion.div
                                    key={`member-${member.id}`}
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                                    className="shadow-lg rounded-lg p-6 flex flex-col items-center w-full relative group"
                                >
                                    {canEdit && onEdit && onDelete && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="light"
                                                isIconOnly
                                                onPress={() => onEdit(member)}
                                                className="bg-white/80 backdrop-blur-sm"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                isIconOnly
                                                onPress={() => onDelete(member.id)}
                                                className="bg-white/80 backdrop-blur-sm text-danger"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <div className="relative w-28 h-28 sm:w-40 sm:h-40 border-4 border-[#467eb5] rounded-full overflow-hidden">
                                        <Image
                                            src={member.profile_image || "/images/placeholder.jpg"}
                                            alt={`${member.full_name} Image`}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                    <h2 className="font-bold text-xl sm:text-2xl mt-6 text-center">
                                        {member.full_name}
                                    </h2>
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-[#c2674b] font-bold">
                                            {member.role?.name}
                                        </p>
                                        {member.email && (
                                            <div className="flex justify-center w-full mt-2">
                                                <Link
                                                    href={`mailto:${member.email}`}
                                                    className="text-sm text-[#d47557] font-bold text-center"
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
                )}
            </div>
        </div>
    );
}
