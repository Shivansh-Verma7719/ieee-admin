"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Avatar,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Input,
    Select,
    SelectItem,
    Spinner,
    Switch,
    Card,
    CardBody,
    CardHeader,
    Divider,
    DatePicker
} from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { IconDots, IconEdit, IconTrash, IconShield, IconUserCheck, IconUserX, IconUsers, IconCrown, IconLogin, IconLock } from "@tabler/icons-react";
import KPICard from "@/components/KPICard";
import { RequirePermission, PERMISSIONS } from "@/lib/permissions";
import { getRoles, getTeams, updatePerson, Person, Role, Team, PersonUpdate, getPeople, deletePersonFromTable } from "../team/helpers";
import { getPersonPermissions, updatePersonPermissions, getAllPermissions, Permission, PersonPermissionWithDetails } from "./helpers";

export default function ManageTeamPage() {
    const [people, setPeople] = useState<Person[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [personPermissions, setPersonPermissions] = useState<Record<number, PersonPermissionWithDetails[]>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal controls
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    const { isOpen: isPermissionsModalOpen, onOpen: onPermissionsModalOpen, onClose: onPermissionsModalClose } = useDisclosure();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

    // Selected person for actions
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [editForm, setEditForm] = useState({
        full_name: "",
        email: "",
        role_id: "",
        team_id: "",
        linkedin: "",
        instagram: "",
        twitter: "",
    });

    // Permission management state
    const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
    const [permissionExpiry, setPermissionExpiry] = useState<Record<string, CalendarDate | null>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {

            const [peopleData, rolesData, teamsData, permissionsData] = await Promise.all([
                getPeople(false),
                getRoles(),
                getTeams(),
                getAllPermissions(),
            ]);

            setPeople(peopleData || []);
            setRoles(rolesData);
            setTeams(teamsData);
            setPermissions(permissionsData);

            // Fetch permissions for each person
            const permissionsMap: Record<number, PersonPermissionWithDetails[]> = {};
            await Promise.all(
                (peopleData || []).map(async (person: Person) => {
                    const personPerms = await getPersonPermissions(person.id);
                    permissionsMap[person.id] = personPerms;
                })
            );
            setPersonPermissions(permissionsMap);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }; const handleEditClick = (person: Person) => {
        setSelectedPerson(person);
        setEditForm({
            full_name: person.full_name || "",
            email: person.email || "",
            role_id: person.role_id?.toString() || "",
            team_id: person.team_id?.toString() || "",
            linkedin: person.linkedin || "",
            instagram: person.instagram || "",
            twitter: person.twitter || "",
        });
        onEditModalOpen();
    };

    const handlePermissionsClick = (person: Person) => {
        setSelectedPerson(person);
        const personPerms = personPermissions[person.id] || [];
        const activePermIds = personPerms
            .filter(p => !p.expires_at || new Date(p.expires_at) > new Date())
            .map(p => p.permission_id)
            .filter(Boolean) as string[];

        setSelectedPermissions(new Set(activePermIds));

        // Set expiry dates for existing permissions
        const expiryMap: Record<string, CalendarDate | null> = {};
        personPerms.forEach(p => {
            if (p.permission_id && p.expires_at) {
                try {
                    // Convert from ISO date string to CalendarDate
                    const dateStr = p.expires_at.split('T')[0]; // Get YYYY-MM-DD format
                    expiryMap[p.permission_id] = parseDate(dateStr);
                } catch (error) {
                    console.error("Error parsing date:", error);
                    expiryMap[p.permission_id] = null;
                }
            }
        });
        setPermissionExpiry(expiryMap);

        onPermissionsModalOpen();
    };

    const handleDeleteClick = (person: Person) => {
        setSelectedPerson(person);
        onDeleteModalOpen();
    };

    const handleToggleLoginAccess = async (person: Person) => {
        setSaving(true);
        try {
            // Only pass actual database columns, not joined data
            const updateData: PersonUpdate = {
                can_login: !person.can_login
            };

            const result = await updatePerson(person.id, updateData);

            if (result.success) {
                setPeople(people.map(p => p.id === person.id ? { ...p, can_login: !p.can_login } : p));
            } else {
                alert("Failed to update login access");
            }
        } catch (error) {
            console.error("Error updating login access:", error);
            alert("Failed to update login access");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActiveStatus = async (person: Person) => {
        setSaving(true);
        try {
            // Only pass actual database columns, not joined data
            const updateData: PersonUpdate = {
                is_active: !person.is_active
            };

            const result = await updatePerson(person.id, updateData);

            if (result.success) {
                setPeople(people.map(p => p.id === person.id ? { ...p, is_active: !p.is_active } : p));
            } else {
                alert("Failed to update active status");
            }
        } catch (error) {
            console.error("Error updating active status:", error);
            alert("Failed to update active status");
        } finally {
            setSaving(false);
        }
    };

    const handleEditSubmit = async () => {
        if (!selectedPerson) return;

        setSaving(true);
        try {
            // Only pass actual database columns, not joined data
            const updateData: PersonUpdate = {
                full_name: editForm.full_name,
                email: editForm.email,
                role_id: editForm.role_id ? parseInt(editForm.role_id) : null,
                team_id: editForm.team_id ? parseInt(editForm.team_id) : null,
                linkedin: editForm.linkedin,
                instagram: editForm.instagram,
                twitter: editForm.twitter,
            };

            const result = await updatePerson(selectedPerson.id, updateData);

            if (result.success) {
                // Update local state
                setPeople(people.map(p => p.id === selectedPerson.id ? {
                    ...p,
                    ...updateData,
                    role: roles.find(r => r.id === updateData.role_id) || p.role,
                    team: teams.find(t => t.id === updateData.team_id) || p.team
                } : p));
                onEditModalClose();
            } else {
                alert("Failed to update person details");
            }
        } catch (error) {
            console.error("Error updating person:", error);
            alert("Failed to update person details");
        } finally {
            setSaving(false);
        }
    };

    const handlePermissionsSubmit = async () => {
        if (!selectedPerson) return;

        setSaving(true);
        try {
            // Prepare permissions data
            const permissionsData = Array.from(selectedPermissions).map(permId => ({
                permission_id: permId,
                expires_at: permissionExpiry[permId] ? permissionExpiry[permId]!.toString() : null,
            }));

            const result = await updatePersonPermissions(selectedPerson.id, permissionsData);

            if (result.success) {
                // Refresh permissions for this person
                const updatedPerms = await getPersonPermissions(selectedPerson.id);
                setPersonPermissions(prev => ({
                    ...prev,
                    [selectedPerson.id]: updatedPerms
                }));
                onPermissionsModalClose();
            } else {
                alert("Failed to update permissions");
            }
        } catch (error) {
            console.error("Error updating permissions:", error);
            alert("Failed to update permissions");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedPerson) return;

        setSaving(true);
        try {
            const result = await deletePersonFromTable(selectedPerson);

            if (result.success) {
                setPeople(people.filter(p => p.id !== selectedPerson.id));
                onDeleteModalClose();
            } else {
                alert("Failed to delete person");
            }
        } catch (error) {
            console.error("Error deleting person:", error);
            alert("Failed to delete person");
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (isActive: boolean | null) => {
        if (isActive === null) return "default";
        return isActive ? "success" : "danger";
    };

    const getLoginStatusColor = (canLogin: boolean | null) => {
        if (canLogin === null) return "default";
        return canLogin ? "primary" : "warning";
    };

    const getPermissionsSummary = (personId: number) => {
        const perms = personPermissions[personId] || [];
        const activePerms = perms.filter(p => !p.expires_at || new Date(p.expires_at) > new Date());
        return activePerms.length;
    };

    if (loading) {
        return (
            <RequirePermission permission={PERMISSIONS.TEAM}>
                <div className="flex justify-center items-center h-screen">
                    <Spinner size="lg" />
                </div>
            </RequirePermission>
        );
    }

    return (
        <RequirePermission permission={PERMISSIONS.TEAM}>
            <div className="min-h-screen">
                <div className="py-8 px-6 mx-auto">
                    {/* KPI Cards Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <KPICard
                            title="Total Members"
                            value={people.length}
                            icon={<IconUsers />}
                            color="primary"
                            bottomContent={{
                                type: "simple",
                                label: "Total Teams",
                                value: `${teams.length}`
                            }}
                        />
                        <KPICard
                            title="Login Access"
                            value={people.filter(p => p.can_login).length}
                            icon={<IconLogin />}
                            color="success"
                            bottomContent={{
                                type: "simple",
                                label: "Can access system",
                                value: `${Math.round((people.filter(p => p.can_login).length / people.length) * 100) || 0}%`
                            }}
                        />
                        <KPICard
                            title="Active Members"
                            value={people.filter(p => p.is_active).length}
                            icon={<IconCrown />}
                            color="warning"
                            bottomContent={{
                                type: "progress",
                                label: "Active",
                                value: `${Math.round((people.filter(p => p.is_active).length / people.length) * 100) || 0}%`,
                                progress: {
                                    current: people.filter(p => p.is_active).length,
                                    total: people.length,
                                    showFraction: true
                                }
                            }}
                        />
                        <KPICard
                            title="Total Permissions"
                            value={Object.values(personPermissions).reduce((total, perms) =>
                                total + perms.filter(p => !p.expires_at || new Date(p.expires_at) > new Date()).length, 0
                            )}
                            icon={<IconLock />}
                            color="secondary"
                            bottomContent={{
                                type: "simple",
                                label: "Active permissions",
                                value: `${permissions.length} total available`
                            }}
                        />
                    </motion.div>

                    {/* Table Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.2 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6"
                    >
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage team members, their roles, and permissions</p>
                        </div>

                        <Table
                            aria-label="Team management table"
                            className="w-full"
                            classNames={{
                                wrapper: "shadow-none bg-transparent",
                            }}
                        >
                            <TableHeader>
                                <TableColumn>MEMBER</TableColumn>
                                <TableColumn>TEAM & ROLE</TableColumn>
                                <TableColumn>STATUS</TableColumn>
                                <TableColumn>LOGIN ACCESS</TableColumn>
                                <TableColumn>PERMISSIONS</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {people.map((person) => (
                                    <TableRow key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Avatar
                                                    src={person.profile_image || undefined}
                                                    name={person.full_name || "N/A"}
                                                    size="md"
                                                    fallback={person.full_name?.charAt(0) || "?"}
                                                    className="shrink-0"
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {person.full_name || "N/A"}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {person.email || "No email"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {person.team?.name || "No Team"}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {person.role?.name || "No Role"}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                color={getStatusColor(person.is_active)}
                                                size="md"
                                                variant="flat"
                                                onClick={() => handleToggleActiveStatus(person)}
                                                className="cursor-pointer transition-transform hover:scale-105"
                                            >
                                                {person.is_active ? "Active" : "Inactive"}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                color={getLoginStatusColor(person.can_login)}
                                                size="md"
                                                variant="flat"
                                                onClick={() => handleToggleLoginAccess(person)}
                                                className="cursor-pointer transition-transform hover:scale-105"
                                            >
                                                {person.can_login ? "Can Login" : "No Access"}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                color="secondary"
                                                size="md"
                                                variant="flat"
                                                onClick={() => handlePermissionsClick(person)}
                                                className="cursor-pointer transition-transform hover:scale-105"
                                            >
                                                {getPermissionsSummary(person.id)} permissions
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Dropdown>
                                                <DropdownTrigger>
                                                    <Button
                                                        isIconOnly
                                                        size="md"
                                                        variant="light"
                                                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <IconDots className="h-5 w-5" />
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownMenu>
                                                    <DropdownItem
                                                        key="edit"
                                                        startContent={<IconEdit className="h-4 w-4" />}
                                                        onPress={() => handleEditClick(person)}
                                                    >
                                                        Edit Details
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="login"
                                                        startContent={person.can_login ? <IconUserX className="h-4 w-4" /> : <IconUserCheck className="h-4 w-4" />}
                                                        onPress={() => handleToggleLoginAccess(person)}
                                                    >
                                                        {person.can_login ? "Restrict Login" : "Allow Login"}
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="permissions"
                                                        startContent={<IconShield className="h-4 w-4" />}
                                                        onPress={() => handlePermissionsClick(person)}
                                                    >
                                                        Edit Permissions
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="delete"
                                                        className="text-danger"
                                                        color="danger"
                                                        startContent={<IconTrash className="h-4 w-4" />}
                                                        onPress={() => handleDeleteClick(person)}
                                                    >
                                                        Delete
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </motion.div>
                </div>

                {/* Edit Details Modal */}
                <Modal isOpen={isEditModalOpen} onClose={onEditModalClose} size="2xl">
                    <ModalContent>
                        <ModalHeader>Edit Member Details</ModalHeader>
                        <ModalBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                                <Select
                                    label="Role"
                                    selectedKeys={editForm.role_id ? [editForm.role_id] : []}
                                    onSelectionChange={(keys) => {
                                        const selectedKey = Array.from(keys)[0] as string;
                                        setEditForm({ ...editForm, role_id: selectedKey || "" });
                                    }}
                                >
                                    {roles.map((role) => (
                                        <SelectItem key={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Team"
                                    selectedKeys={editForm.team_id ? [editForm.team_id] : []}
                                    onSelectionChange={(keys) => {
                                        const selectedKey = Array.from(keys)[0] as string;
                                        setEditForm({ ...editForm, team_id: selectedKey || "" });
                                    }}
                                >
                                    {teams.map((team) => (
                                        <SelectItem key={team.id.toString()}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Input
                                    label="LinkedIn"
                                    value={editForm.linkedin}
                                    onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                                />
                                <Input
                                    label="Instagram"
                                    value={editForm.instagram}
                                    onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                                />
                                <Input
                                    label="Twitter"
                                    value={editForm.twitter}
                                    onChange={(e) => setEditForm({ ...editForm, twitter: e.target.value })}
                                    className="md:col-span-2"
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onEditModalClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handleEditSubmit} isLoading={saving}>
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Permissions Modal */}
                <Modal isOpen={isPermissionsModalOpen} onClose={onPermissionsModalClose} size="3xl">
                    <ModalContent>
                        <ModalHeader>
                            Edit Permissions for {selectedPerson?.full_name}
                        </ModalHeader>
                        <ModalBody>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-transparent">
                                {permissions.map((permission) => {
                                    const isSelected = selectedPermissions.has(permission.id);
                                    const existingPermission = personPermissions[selectedPerson?.id || 0]?.find(
                                        p => p.permission_id === permission.id
                                    );

                                    return (
                                        <Card
                                            key={permission.id}
                                            className={`${isSelected ? 'ring-2 ring-primary bg-primary-50' : ''} relative`}
                                        >
                                            {/* Clickable selection area */}
                                            <div
                                                className="absolute inset-0 cursor-pointer z-10"
                                                onClick={() => {
                                                    const newSelected = new Set(selectedPermissions);
                                                    if (isSelected) {
                                                        newSelected.delete(permission.id);
                                                        // Remove expiry when deselecting
                                                        const newExpiry = { ...permissionExpiry };
                                                        delete newExpiry[permission.id];
                                                        setPermissionExpiry(newExpiry);
                                                    } else {
                                                        newSelected.add(permission.id);
                                                    }
                                                    setSelectedPermissions(newSelected);
                                                }}
                                            />

                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between w-full relative z-20">
                                                    <p className="text-sm font-semibold">
                                                        {permission.key || `Permission ${permission.id}`}
                                                    </p>
                                                    <Switch
                                                        isSelected={isSelected}
                                                        onChange={() => {
                                                            const newSelected = new Set(selectedPermissions);
                                                            if (isSelected) {
                                                                newSelected.delete(permission.id);
                                                                const newExpiry = { ...permissionExpiry };
                                                                delete newExpiry[permission.id];
                                                                setPermissionExpiry(newExpiry);
                                                            } else {
                                                                newSelected.add(permission.id);
                                                            }
                                                            setSelectedPermissions(newSelected);
                                                        }}
                                                        size="sm"
                                                    />
                                                </div>
                                            </CardHeader>
                                            <CardBody className="pt-0 relative z-20">
                                                <p className="text-xs text-default-500 mb-2">
                                                    {permission.description || "No description available"}
                                                </p>

                                                {/* Show existing permission info */}
                                                {existingPermission && (
                                                    <div className="mb-2 p-2 bg-gray-50 rounded text-xs">
                                                        <p className="text-default-600">
                                                            <strong>Granted by:</strong> {existingPermission.granted_by_person?.full_name || "Unknown"}
                                                        </p>
                                                        <p className="text-default-600">
                                                            <strong>Granted on:</strong> {existingPermission.granted_at ? new Date(existingPermission.granted_at).toLocaleDateString() : "Unknown"}
                                                        </p>
                                                        {existingPermission.expires_at && (
                                                            <p className="text-default-600">
                                                                <strong>Expires:</strong> {new Date(existingPermission.expires_at).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {isSelected && (
                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="relative z-30"
                                                    >
                                                        <Divider className="my-2" />
                                                        <div className="">
                                                            <DatePicker
                                                                label="Expires At (Optional)"
                                                                size="sm"
                                                                value={permissionExpiry[permission.id] || null}
                                                                onChange={(date) => {
                                                                    setPermissionExpiry({
                                                                        ...permissionExpiry,
                                                                        [permission.id]: date
                                                                    });
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onFocus={(e) => e.stopPropagation()}
                                                                showMonthAndYearPickers
                                                                className="max-w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    );
                                })}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onPermissionsModalClose}>
                                Cancel
                            </Button>
                            <Button color="primary" onPress={handlePermissionsSubmit} isLoading={saving}>
                                Save Permissions
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
                    <ModalContent>
                        <ModalHeader>Confirm Deletion</ModalHeader>
                        <ModalBody>
                            <p>
                                Are you sure you want to delete{" "}
                                <strong>{selectedPerson?.full_name}</strong>? This action cannot be undone.
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onDeleteModalClose}>
                                Cancel
                            </Button>
                            <Button color="danger" onPress={handleDeleteSubmit} isLoading={saving}>
                                Delete
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </RequirePermission>
    );
}
