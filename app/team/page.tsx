"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
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
    RadioGroup,
    Radio,
} from "@heroui/react";
import DynamicTeamSection from "@/components/DynamicTeamSection";
import {
    getPeople,
    getRoles,
    getTeams,
    createPerson,
    updatePerson,
    deletePerson,
    createRole,
    createTeam,
    updateTeam,
    deleteTeam,
    updatePersonOrder,
    updateTeamOrder,
    uploadProfileImage,
    Person,
    Role,
    Team,
} from "./helpers";
import { IconSitemap, IconUserPlus, IconUsersPlus } from "@tabler/icons-react";

export default function TeamPage() {
    const [people, setPeople] = useState<Person[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal controls
    const { isOpen: isPersonModalOpen, onOpen: onPersonModalOpen, onClose: onPersonModalClose } = useDisclosure();
    const { isOpen: isRoleModalOpen, onOpen: onRoleModalOpen, onClose: onRoleModalClose } = useDisclosure();
    const { isOpen: isTeamModalOpen, onOpen: onTeamModalOpen, onClose: onTeamModalClose } = useDisclosure();

    // Form states
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [personForm, setPersonForm] = useState({
        full_name: "",
        email: "",
        role_id: "",
        team_id: "",
        profile_image: "",
        linkedin: "",
        instagram: "",
        twitter: "",
        can_login: false,
        display_order: 0,
    });
    const [roleForm, setRoleForm] = useState({ name: "" });
    const [teamForm, setTeamForm] = useState({ name: "", display_order: 0 });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageInputType, setImageInputType] = useState<"upload" | "url">("url");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [peopleData, rolesData, teamsData] = await Promise.all([
            getPeople(),
            getRoles(),
            getTeams(),
        ]);
        setPeople(peopleData);
        setRoles(rolesData);
        setTeams(teamsData);
        setLoading(false);
    };

    const handlePersonSubmit = async () => {
        setSaving(true);
        try {
            let profileImageUrl = personForm.profile_image;

            // Only upload file if user selected upload option and provided a file
            if (imageInputType === "upload" && imageFile) {
                const uploadedUrl = await uploadProfileImage(imageFile);
                if (uploadedUrl) {
                    profileImageUrl = uploadedUrl;
                }
            }
            // If user selected URL option, use the URL from the form
            // (profileImageUrl is already set from personForm.profile_image)

            const personData = {
                ...personForm,
                profile_image: profileImageUrl,
                role_id: personForm.role_id ? parseInt(personForm.role_id) : null,
                team_id: personForm.team_id ? parseInt(personForm.team_id) : null,
                is_active: true,
            };

            if (editingPerson) {
                // Optimistic update for editing
                const updatedPeople = people.map(person =>
                    person.id === editingPerson.id
                        ? {
                            ...person,
                            ...personData,
                            role: roles.find(r => r.id === personData.role_id) || person.role,
                            team: teams.find(t => t.id === personData.team_id) || person.team
                        }
                        : person
                );
                setPeople(updatedPeople);

                // Update database in background
                const result = await updatePerson(editingPerson.id, personData);
                if (!result.success) {
                    // Revert on failure
                    setPeople(people);
                    alert("Failed to update person");
                    return;
                }
            } else {
                // For new people, add optimistically
                const newPerson: Person = {
                    id: Date.now(), // Temporary ID
                    ...personData,
                    role: roles.find(r => r.id === personData.role_id) || undefined,
                    team: teams.find(t => t.id === personData.team_id) || undefined,
                    created_at: new Date().toISOString()
                };

                setPeople([...people, newPerson]);

                // Create in database
                const result = await createPerson(personData);
                if (!result.success) {
                    // Revert on failure
                    setPeople(people);
                    alert("Failed to create person");
                    return;
                } else {
                    // Refresh to get the real ID and proper relations from database
                    const [peopleData] = await Promise.all([
                        getPeople(),
                    ]);
                    setPeople(peopleData);
                }
            }

            resetPersonForm();
            onPersonModalClose();
        } catch (error) {
            console.error("Error saving person:", error);
            // Revert optimistic update on error
            if (editingPerson) {
                setPeople(people);
            } else {
                setPeople(people);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePerson = async (id: number) => {
        // Optimistic update - remove from local state immediately
        const updatedPeople = people.filter(person => person.id !== id);
        setPeople(updatedPeople);

        // Update database in background
        const result = await deletePerson(id);
        if (!result.success) {
            // Revert on failure
            setPeople(people);
            alert("Failed to delete person");
        }
    };

    const handleDeleteTeam = async (teamId: number) => {
        // Optimistic update - remove from local state immediately
        const updatedTeams = teams.filter(team => team.id !== teamId);
        setTeams(updatedTeams);

        // Update database in background
        const result = await deleteTeam(teamId);
        if (!result.success) {
            // Revert on failure
            setTeams(teams);
            alert(result.error || "Failed to delete team");
        }
    };

    const handleMoveTeamUp = async (teamId: number) => {
        const currentTeam = teams.find(t => t.id === teamId);
        if (!currentTeam) return;

        const sortedTeams = [...teams].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        const currentIndex = sortedTeams.findIndex(t => t.id === teamId);

        if (currentIndex > 0) {
            const teamAbove = sortedTeams[currentIndex - 1];

            // Optimistic update - update local state immediately
            const updatedTeams = teams.map(team => {
                if (team.id === currentTeam.id) {
                    return { ...team, display_order: teamAbove.display_order || 0 };
                } else if (team.id === teamAbove.id) {
                    return { ...team, display_order: currentTeam.display_order || 0 };
                }
                return team;
            });
            setTeams(updatedTeams);

            // Update database in background
            const updates = [
                { id: currentTeam.id, display_order: teamAbove.display_order || 0 },
                { id: teamAbove.id, display_order: currentTeam.display_order || 0 }
            ];

            const result = await updateTeamOrder(updates);
            if (!result.success) {
                // Revert on failure
                setTeams(teams);
                alert("Failed to update team order");
            }
        }
    };

    const handleMoveTeamDown = async (teamId: number) => {
        const currentTeam = teams.find(t => t.id === teamId);
        if (!currentTeam) return;

        const sortedTeams = [...teams].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        const currentIndex = sortedTeams.findIndex(t => t.id === teamId);

        if (currentIndex < sortedTeams.length - 1) {
            const teamBelow = sortedTeams[currentIndex + 1];

            // Optimistic update - update local state immediately
            const updatedTeams = teams.map(team => {
                if (team.id === currentTeam.id) {
                    return { ...team, display_order: teamBelow.display_order || 0 };
                } else if (team.id === teamBelow.id) {
                    return { ...team, display_order: currentTeam.display_order || 0 };
                }
                return team;
            });
            setTeams(updatedTeams);

            // Update database in background
            const updates = [
                { id: currentTeam.id, display_order: teamBelow.display_order || 0 },
                { id: teamBelow.id, display_order: currentTeam.display_order || 0 }
            ];

            const result = await updateTeamOrder(updates);
            if (!result.success) {
                // Revert on failure
                setTeams(teams);
                alert("Failed to update team order");
            }
        }
    };

    const handleReorderMembers = async (teamId: number, newOrder: Person[]) => {
        // Optimistic update - update local state immediately
        const updatedPeople = people.map(person => {
            const newPerson = newOrder.find(p => p.id === person.id);
            if (newPerson && person.team_id === teamId) {
                const newIndex = newOrder.findIndex(p => p.id === person.id);
                return { ...person, display_order: newIndex + 1 };
            }
            return person;
        });
        setPeople(updatedPeople);

        // Update database in background
        const updates = newOrder.map((person, index) => ({
            id: person.id,
            display_order: index + 1
        }));

        const result = await updatePersonOrder(updates);
        if (!result.success) {
            // Revert on failure
            setPeople(people);
            alert("Failed to update member order");
        }
    };

    const handleRoleSubmit = async () => {
        setSaving(true);
        await createRole(roleForm);
        await fetchData();
        setRoleForm({ name: "" });
        onRoleModalClose();
        setSaving(false);
    };

    const handleTeamSubmit = async () => {
        setSaving(true);
        try {
            if (editingTeam) {
                // Optimistic update for team editing
                const updatedTeams = teams.map(team =>
                    team.id === editingTeam.id
                        ? { ...team, name: teamForm.name }
                        : team
                );
                setTeams(updatedTeams);

                // Update database in background
                const result = await updateTeam(editingTeam.id, { name: teamForm.name });
                if (!result.success) {
                    // Revert on failure
                    setTeams(teams);
                    alert("Failed to update team");
                    return;
                }
            } else {
                // For new teams, add optimistically
                const maxOrder = Math.max(...teams.map(t => t.display_order || 0), 0);
                const newTeam = {
                    id: Date.now(), // Temporary ID
                    name: teamForm.name,
                    display_order: maxOrder + 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                setTeams([...teams, newTeam]);

                // Create in database
                const teamData = {
                    name: teamForm.name,
                    display_order: maxOrder + 1
                };
                const result = await createTeam(teamData);
                if (!result.success) {
                    // Revert on failure
                    setTeams(teams);
                    alert("Failed to create team");
                    return;
                } else {
                    // Refresh to get the real ID from database
                    const [, , teamsData] = await Promise.all([
                        Promise.resolve(people),
                        Promise.resolve(roles),
                        getTeams(),
                    ]);
                    setTeams(teamsData);
                }
            }
            resetTeamForm();
            onTeamModalClose();
        } catch (error) {
            console.error("Error saving team:", error);
            // Revert optimistic update on error
            if (editingTeam) {
                setTeams(teams);
            } else {
                setTeams(teams);
            }
        } finally {
            setSaving(false);
        }
    };

    const resetTeamForm = () => {
        setTeamForm({ name: "", display_order: 0 });
        setEditingTeam(null);
    };

    const resetPersonForm = () => {
        setPersonForm({
            full_name: "",
            email: "",
            role_id: "",
            team_id: "",
            profile_image: "",
            linkedin: "",
            instagram: "",
            twitter: "",
            can_login: false,
            display_order: 0,
        });
        setEditingPerson(null);
        setImageFile(null);
        setImageInputType("url");
    };

    const openEditModal = (person: Person) => {
        setEditingPerson(person);
        setPersonForm({
            full_name: person.full_name || "",
            email: person.email || "",
            role_id: person.role_id?.toString() || "",
            team_id: person.team_id?.toString() || "",
            profile_image: person.profile_image || "",
            linkedin: person.linkedin || "",
            instagram: person.instagram || "",
            twitter: person.twitter || "",
            can_login: person.can_login || false,
            display_order: person.display_order || 0,
        });
        onPersonModalOpen();
    };

    const groupedPeople = teams.reduce((acc, team) => {
        acc[team.name || ""] = people.filter(person => person.team_id === team.id);
        return acc;
    }, {} as Record<string, Person[]>);

    // Add people without teams
    const peopleWithoutTeam = people.filter(person => !person.team_id);
    if (peopleWithoutTeam.length > 0) {
        groupedPeople["No Team"] = peopleWithoutTeam;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-y-auto">
            <div className="py-14 px-6 sm:p-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75 }}
                    className="mb-8"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-center text-6xl pb-4 font-bold relative">
                            Meet the Team
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#467eb5]"
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 1 }}
                                transition={{ duration: 0.75, delay: 0.3 }}
                            />
                        </h1>
                        <div className="flex gap-2">
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<IconUserPlus />}
                                onPress={onRoleModalOpen}
                            >
                                Add Role
                            </Button>
                            <Button
                                color="secondary"
                                variant="flat"
                                startContent={<IconSitemap />}
                                onPress={() => {
                                    resetTeamForm();
                                    onTeamModalOpen();
                                }}
                            >
                                Add Team
                            </Button>
                            <Button
                                color="primary"
                                startContent={<IconUsersPlus />}
                                onPress={() => {
                                    resetPersonForm();
                                    onPersonModalOpen();
                                }}
                            >
                                Add Member
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-12">
                    {Object.entries(groupedPeople).map(([teamName, teamMembers], index) => {
                        const team = teams.find(t => t.name === teamName);
                        return (
                            <div key={teamName}>
                                <DynamicTeamSection
                                    title={teamName}
                                    members={teamMembers}
                                    canEdit={true}
                                    teamId={team?.id}
                                    onEdit={openEditModal}
                                    onDelete={handleDeletePerson}
                                    onEditTeam={(teamId) => {
                                        const teamToEdit = teams.find(t => t.id === teamId);
                                        if (teamToEdit) {
                                            setEditingTeam(teamToEdit);
                                            setTeamForm({
                                                name: teamToEdit.name || "",
                                                display_order: teamToEdit.display_order || 0
                                            });
                                            onTeamModalOpen();
                                        }
                                    }}
                                    onDeleteTeam={handleDeleteTeam}
                                    onMoveTeamUp={handleMoveTeamUp}
                                    onMoveTeamDown={handleMoveTeamDown}
                                    onReorderMembers={handleReorderMembers}
                                />
                                {index < Object.entries(groupedPeople).length - 1 && (
                                    <div className="py-6" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Person Modal */}
            <Modal isOpen={isPersonModalOpen} onClose={onPersonModalClose} size="2xl">
                <ModalContent>
                    <ModalHeader>
                        {editingPerson ? "Edit Member" : "Add New Member"}
                    </ModalHeader>
                    <ModalBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                placeholder="Enter full name"
                                value={personForm.full_name || ""}
                                onChange={(e) => setPersonForm({ ...personForm, full_name: e.target.value })}
                            />
                            <Input
                                label="Email"
                                placeholder="Enter email"
                                type="email"
                                value={personForm.email || ""}
                                onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })}
                            />
                            <Select
                                label="Role"
                                placeholder="Select a role"
                                selectedKeys={personForm.role_id ? [personForm.role_id] : []}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0] as string;
                                    setPersonForm({ ...personForm, role_id: selectedKey || "" });
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
                                placeholder="Select a team"
                                selectedKeys={personForm.team_id ? [personForm.team_id] : []}
                                onSelectionChange={(keys) => {
                                    const selectedKey = Array.from(keys)[0] as string;
                                    setPersonForm({ ...personForm, team_id: selectedKey || "" });
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
                                placeholder="LinkedIn profile URL"
                                value={personForm.linkedin || ""}
                                onChange={(e) => setPersonForm({ ...personForm, linkedin: e.target.value })}
                            />
                            <Input
                                label="Instagram"
                                placeholder="Instagram handle"
                                value={personForm.instagram || ""}
                                onChange={(e) => setPersonForm({ ...personForm, instagram: e.target.value })}
                            />
                            <Input
                                label="Twitter"
                                placeholder="Twitter handle"
                                value={personForm.twitter || ""}
                                onChange={(e) => setPersonForm({ ...personForm, twitter: e.target.value })}
                            />
                            <div className="col-span-full">
                                <div className="space-y-4">
                                    <RadioGroup
                                        label="Profile Image"
                                        orientation="horizontal"
                                        value={imageInputType}
                                        onValueChange={(value) => {
                                            setImageInputType(value as "upload" | "url");
                                            // Clear the profile_image field when switching to upload mode
                                            if (value === "upload") {
                                                setPersonForm({ ...personForm, profile_image: "" });
                                            }
                                        }}
                                    >
                                        <Radio value="url">Image URL</Radio>
                                        <Radio value="upload">Upload File</Radio>
                                    </RadioGroup>

                                    {imageInputType === "url" ? (
                                        <Input
                                            label="Profile Image URL"
                                            placeholder="Enter image URL"
                                            value={personForm.profile_image || ""}
                                            onChange={(e) => setPersonForm({ ...personForm, profile_image: e.target.value })}
                                        />
                                    ) : (
                                        <Input
                                            type="file"
                                            label="Profile Image File"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setImageFile(file);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onPersonModalClose}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handlePersonSubmit} isLoading={saving}>
                            {editingPerson ? "Update" : "Create"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Role Modal */}
            <Modal isOpen={isRoleModalOpen} onClose={onRoleModalClose}>
                <ModalContent>
                    <ModalHeader>Add New Role</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Role Name"
                            placeholder="Enter role name"
                            value={roleForm.name}
                            onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onRoleModalClose}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleRoleSubmit} isLoading={saving}>
                            Create Role
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Team Modal */}
            <Modal isOpen={isTeamModalOpen} onClose={() => { resetTeamForm(); onTeamModalClose(); }}>
                <ModalContent>
                    <ModalHeader>{editingTeam ? "Edit Team" : "Add New Team"}</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Team Name"
                            placeholder="Enter team name"
                            value={teamForm.name}
                            onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={() => { resetTeamForm(); onTeamModalClose(); }}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleTeamSubmit} isLoading={saving}>
                            {editingTeam ? "Update" : "Create"} Team
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
