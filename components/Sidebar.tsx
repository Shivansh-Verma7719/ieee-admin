"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
    IconArrowLeft,
    IconUserBolt,
    IconPhoto,
    IconCalendarEvent,
    IconHome,
    IconUsers,
    IconFolderQuestion,
} from "@tabler/icons-react";
import { Avatar } from "@heroui/react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { JwtClaims } from "@/types/supabase";
import Image from "next/image";
import Link from "next/link";
import IEEELogo from "@/public/images/logo.png";

interface SidebarDemoProps {
    user: JwtClaims | null;
    children: React.ReactNode;
}

export function SidebarDemo({ user, children }: SidebarDemoProps) {
    const [open, setOpen] = useState(false);

    const getLinks = () => {
        if (!user) {
            return [
                {
                    label: "Home",
                    href: "/",
                    icon: (
                        <IconHome className="h-7 w-7 shrink-0 text-neutral-700 dark:text-neutral-200" />
                    ),
                },
                {
                    label: "Login",
                    href: "/login",
                    icon: (
                        <IconUserBolt className="h-7 w-7 shrink-0 text-neutral-700 dark:text-neutral-200" />
                    ),
                },
            ];
        }

        return [
            {
                label: "Home",
                href: "/",
                icon: (
                    <IconHome className="h-7 w-7 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            },
            {
                label: "Events",
                href: "/events",
                icon: (
                    <IconCalendarEvent className="h-7 w-7 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            },
            {
                label: "Photos",
                href: "/photos",
                icon: (
                    <IconPhoto className="h-7 w-7 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            },
            {
                label: "Team",
                href: "/team",
                icon: (
                    <IconUsers className="h-7 w-7 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            },
            {
                label: "Queries",
                href: "/queries",
                icon: (
                    <IconFolderQuestion className="h-7 w-7 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            },
            {
                label: "Logout",
                href: "/logout",
                icon: (
                    <IconArrowLeft className="h-7 w-7 shrink-0 text-neutral-700 dark:text-neutral-200" />
                ),
            },
        ];
    };

    const links = getLinks();

    return (
        <div
            className={cn(
                "mx-auto flex w-full max-w-none flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row dark:bg-neutral-800",
                "h-screen"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    {user && (
                        <div>
                            <SidebarLink
                                link={{
                                    label: user.user_metadata?.name || "User",
                                    subtext: user.email || "user@example.com",
                                    href: "#",
                                    icon: (
                                        <Avatar
                                            src={user.user_metadata?.avatar_url || ""}
                                            alt={user.user_metadata?.name || "User"}
                                            className="h-8 w-8 shrink-0 rounded-full"
                                            imgProps={{
                                                referrerPolicy: "no-referrer",
                                            }}
                                        />
                                    ),
                                }}
                            />
                        </div>
                    )}
                </SidebarBody>
            </Sidebar>
            <MainContent>{children}</MainContent>
        </div>
    );
}

export const Logo = () => {
    return (
        <Link
            href="/"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <Image src={IEEELogo} alt="IEEE Logo" width={35} height={35} className="shrink-0" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-pre text-black dark:text-white"
            >
                IEEE Admin
            </motion.span>
        </Link>
    );
};

export const LogoIcon = () => {
    return (
        <Link
            href="/"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <Image src={IEEELogo} alt="IEEE Logo" width={35} height={35} className="shrink-0" />
        </Link>
    );
};

// Main content component that wraps the children
const MainContent = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-1">
            <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border-2 border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900 overflow-auto">
                {children}
            </div>
        </div>
    );
};