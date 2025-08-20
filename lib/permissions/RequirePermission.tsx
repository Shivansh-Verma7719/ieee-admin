"use client";
import React from "react";
import { usePermissions } from "./PermissionsProvider";
import { Card, CardBody, Spinner } from "@heroui/react";
import { IconLock } from "@tabler/icons-react";

interface RequirePermissionProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    loadingComponent?: React.ReactNode;
}

export function RequirePermission({
    permission,
    children,
    fallback,
    loadingComponent
}: RequirePermissionProps) {
    const { hasPermission, loading } = usePermissions();

    // Show loading state
    if (loading) {
        return (
            loadingComponent || (
                <div className="flex justify-center items-center min-h-screen p-8">
                    <Spinner size="lg" label="Checking permissions..." />
                </div>
            )
        );
    }

    // Check if user has permission
    if (!hasPermission(permission)) {
        return (
            fallback || (
                <div className="flex justify-center items-center min-h-screen p-8">
                    <Card className="max-w-md">
                        <CardBody className="text-center">
                            <IconLock className="h-12 w-12 text-danger mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Access Denied
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                You don&apos;t have permission to access this module.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Required permission: <code className="bg-gray-100 px-1 rounded">{permission}</code>
                            </p>
                        </CardBody>
                    </Card>
                </div>
            )
        );
    }

    // User has permission, render children
    return <>{children}</>;
}

// Hook for checking permissions in components
export function usePermissionCheck() {
    const { hasPermission, loading, permissions } = usePermissions();

    return {
        hasPermission,
        loading,
        userPermissions: permissions,
    };
}
