import React from "react";
import Image from "next/image";
import { motion, Reorder } from "framer-motion";
import Link from "next/link";
import { Mail, Edit, Trash2, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@heroui/react";
import { Person } from "@/app/team/helpers";

interface DynamicTeamSectionProps {
    title: string;
    members: Person[];
    canEdit?: boolean;
    teamId?: number;
    onEdit?: (person: Person) => void;
    onDelete?: (id: number) => void;
    onEditTeam?: (teamId: number) => void;
    onDeleteTeam?: (teamId: number) => void;
    onMoveTeamUp?: (teamId: number) => void;
    onMoveTeamDown?: (teamId: number) => void;
    onReorderMembers?: (teamId: number, newOrder: Person[]) => void;
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

export default function DynamicTeamSection({
    title,
    members,
    canEdit = false,
    teamId,
    onEdit,
    onDelete,
    onEditTeam,
    onDeleteTeam,
    onMoveTeamUp,
    onMoveTeamDown,
    onReorderMembers
}: DynamicTeamSectionProps) {
    // Filter co-directors (assuming they have "co-director" in their role name)
    const coDirectors = members.filter((member) =>
        member.role?.name?.toLowerCase().includes("co-director")
    );

    const otherMembers = members.filter((member) =>
        !member.role?.name?.toLowerCase().includes("co-director")
    );

    const handleMemberReorder = (newOrder: Person[]) => {
        if (onReorderMembers && teamId) {
            onReorderMembers(teamId, newOrder);
        }
    };

    const moveMemberLeft = (member: Person, membersList: Person[]) => {
        const currentIndex = membersList.findIndex(m => m.id === member.id);
        if (currentIndex > 0) {
            const newOrder = [...membersList];
            [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
            handleMemberReorder(newOrder);
        }
    };

    const moveMemberRight = (member: Person, membersList: Person[]) => {
        const currentIndex = membersList.findIndex(m => m.id === member.id);
        if (currentIndex < membersList.length - 1) {
            const newOrder = [...membersList];
            [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
            handleMemberReorder(newOrder);
        }
    };

    return (
        <div className="w-full">
            <div className="relative group">
                <motion.h2
                    className="text-center text-4xl font-bold mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.45 }}
                >
                    {title}
                </motion.h2>
                {canEdit && teamId && (
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                        {onEditTeam && (
                            <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => onEditTeam(teamId)}
                                className="bg-white/80 backdrop-blur-sm"
                                title="Edit Team"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                        )}
                        {onDeleteTeam && (
                            <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => onDeleteTeam(teamId)}
                                className="bg-white/80 backdrop-blur-sm text-danger"
                                title="Delete Team"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                        {onMoveTeamUp && (
                            <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => onMoveTeamUp(teamId)}
                                className="bg-white/80 backdrop-blur-sm"
                                title="Move Team Up"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </Button>
                        )}
                        {onMoveTeamDown && (
                            <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => onMoveTeamDown(teamId)}
                                className="bg-white/80 backdrop-blur-sm"
                                title="Move Team Down"
                            >
                                <ArrowDown className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
            <div className="space-y-8 w-full">
                {/* Co-Directors Section */}
                {coDirectors.length > 0 && (
                    <motion.div
                        variants={staggerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full"
                    >
                        {canEdit && onReorderMembers && teamId ? (
                            <Reorder.Group
                                axis="x"
                                values={coDirectors}
                                onReorder={handleMemberReorder}
                                className="flex justify-center gap-6 sm:gap-12 flex-wrap"
                            >
                                {coDirectors.map((member) => (
                                    <Reorder.Item
                                        key={`director-${member.id}`}
                                        value={member}
                                        
                                    >
                                        <motion.div
                                            variants={cardVariants}
                                            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                                            className="shadow-lg rounded-lg p-6 flex flex-col items-center w-full max-w-sm relative group"
                                        >
                                            {canEdit && onEdit && onDelete && (
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-10">
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
                                            {canEdit && (
                                                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-10">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        isIconOnly
                                                        onPress={() => moveMemberLeft(member, coDirectors)}
                                                        className="bg-white/80 backdrop-blur-sm"
                                                        isDisabled={coDirectors.findIndex(m => m.id === member.id) === 0}
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        isIconOnly
                                                        onPress={() => moveMemberRight(member, coDirectors)}
                                                        className="bg-white/80 backdrop-blur-sm"
                                                        isDisabled={coDirectors.findIndex(m => m.id === member.id) === coDirectors.length - 1}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
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
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        ) : (
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
                        )}
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
                        {canEdit && onReorderMembers && teamId ? (
                            <Reorder.Group
                                axis="x"
                                values={otherMembers}
                                onReorder={handleMemberReorder}
                                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-12"
                                as="div"
                            >
                                {otherMembers.map((member) => (
                                    <Reorder.Item
                                        key={`member-${member.id}`}
                                        value={member}
                                        as="div"
                                    >
                                        <motion.div
                                            variants={cardVariants}
                                            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                                            className="shadow-lg rounded-lg p-6 flex flex-col items-center w-full relative group"
                                        >
                                            {canEdit && onEdit && onDelete && (
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-10">
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
                                            {canEdit && (
                                                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-10">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        isIconOnly
                                                        onPress={() => moveMemberLeft(member, otherMembers)}
                                                        className="bg-white/80 backdrop-blur-sm"
                                                        isDisabled={otherMembers.findIndex(m => m.id === member.id) === 0}
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        isIconOnly
                                                        onPress={() => moveMemberRight(member, otherMembers)}
                                                        className="bg-white/80 backdrop-blur-sm"
                                                        isDisabled={otherMembers.findIndex(m => m.id === member.id) === otherMembers.length - 1}
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
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
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        ) : (
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
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
