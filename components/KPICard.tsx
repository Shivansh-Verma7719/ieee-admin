"use client";
import {
    Card,
    CardBody,
    CardHeader,
    Chip,
    Progress,
    Skeleton,
    Button,
} from "@heroui/react";
import { ReactNode } from "react";
import Link from "next/link";

export type KPICardColor = "primary" | "secondary" | "success" | "warning" | "danger" | "default";

interface KPICardProps {
    // Main content
    title: string;
    value: string | number;
    label?: string;
    icon: ReactNode;
    color?: KPICardColor;

    // Loading state
    loading?: boolean;

    // Bottom content variations
    bottomContent?: {
        type: "simple" | "progress" | "button" | "chip";
        label?: string;
        value?: string | number;
        progress?: {
            current: number;
            total: number;
            showFraction?: boolean;
        };
        button?: {
            label: string;
            href: string;
            variant?: "light" | "flat" | "solid";
        };
        chip?: {
            label: string | number;
            color?: KPICardColor;
        };
    };

    // Styling options
    className?: string;
    iconBackground?: "rounded-lg" | "rounded-xl" | "rounded-2xl" | "rounded-full";

    // Interactive
    onClick?: () => void;
    href?: string;
}

export default function KPICard({
    title,
    value,
    label,
    icon,
    color = "primary",
    loading = false,
    bottomContent,
    className = "",
    iconBackground = "rounded-2xl",
    onClick,
    href,
}: KPICardProps) {
    const getColorClasses = (color: KPICardColor) => {
        const colorMap = {
            primary: {
                text: "text-primary",
                bg: "bg-primary/10",
                icon: "text-primary"
            },
            secondary: {
                text: "text-secondary",
                bg: "bg-secondary/10",
                icon: "text-secondary"
            },
            success: {
                text: "text-success",
                bg: "bg-success/10",
                icon: "text-success"
            },
            warning: {
                text: "text-warning",
                bg: "bg-warning/10",
                icon: "text-warning"
            },
            danger: {
                text: "text-danger",
                bg: "bg-danger/10",
                icon: "text-danger"
            },
            default: {
                text: "text-default",
                bg: "bg-default/10",
                icon: "text-default"
            }
        };
        return colorMap[color];
    };

    const colorClasses = getColorClasses(color);

    const CardWrapper = ({ children }: { children: ReactNode }) => {
        if (href) {
            return (
                <Link href={href} className="block">
                    <Card className={`border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${className}`}>
                        {children}
                    </Card>
                </Link>
            );
        }

        if (onClick) {
            return (
                <Card
                    className={`border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${className}`}
                    isPressable
                    onPress={onClick}
                >
                    {children}
                </Card>
            );
        }

        return (
            <Card className={`border-none shadow-lg ${className}`}>
                {children}
            </Card>
        );
    };

    const renderBottomContent = () => {
        if (!bottomContent || loading) {
            return loading ? (
                <Skeleton className="h-4 w-full rounded" />
            ) : null;
        }

        switch (bottomContent.type) {
            case "simple":
                return (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {bottomContent.label}
                        </span>
                        <span className="text-sm font-medium">
                            {bottomContent.value}
                        </span>
                    </div>
                );

            case "progress":
                if (!bottomContent.progress) return null;
                const { current, total, showFraction = true } = bottomContent.progress;
                const percentage = total > 0 ? (current / total) * 100 : 0;

                return (
                    <div>
                        {showFraction && (
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {bottomContent.label || "Progress"}
                                </span>
                                <span className="text-sm font-medium">
                                    {current}/{total}
                                </span>
                            </div>
                        )}
                        <Progress
                            value={percentage}
                            color={color}
                            size="sm"
                            className="w-full"
                        />
                    </div>
                );

            case "button":
                if (!bottomContent.button) return null;
                return (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {bottomContent.label}
                        </span>
                        <Button
                            as={Link}
                            href={bottomContent.button.href}
                            color={color}
                            variant={bottomContent.button.variant || "light"}
                            size="sm"
                        >
                            {bottomContent.button.label}
                        </Button>
                    </div>
                );

            case "chip":
                if (!bottomContent.chip) return null;
                return (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {bottomContent.label}
                        </span>
                        <Chip
                            color={bottomContent.chip.color || color}
                            variant="flat"
                            size="sm"
                        >
                            {bottomContent.chip.label}
                        </Chip>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <CardWrapper>
            <CardHeader className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        {loading ? (
                            <Skeleton className="h-8 w-16 rounded" />
                        ) : (
                            <span className={`text-3xl font-bold ${colorClasses.text}`}>
                                {value}
                            </span>
                        )}
                        {label && !loading && (
                            <Chip color={color} variant="flat" size="sm">
                                {label}
                            </Chip>
                        )}
                    </div>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center ${iconBackground} ${colorClasses.bg} shrink-0`}>
                    <div className={`${colorClasses.icon} [&>svg]:h-6 [&>svg]:w-6`}>
                        {icon}
                    </div>
                </div>
            </CardHeader>
            {(bottomContent || loading) && (
                <CardBody className="pt-0">
                    {renderBottomContent()}
                </CardBody>
            )}
        </CardWrapper>
    );
}
