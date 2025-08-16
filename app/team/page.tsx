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
    });
    const [roleForm, setRoleForm] = useState({ name: "" });
    const [teamForm, setTeamForm] = useState({ name: "" });
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
                await updatePerson(editingPerson.id, personData);
            } else {
                await createPerson(personData);
            }

            await fetchData();
            resetPersonForm();
            onPersonModalClose();
        } catch (error) {
            console.error("Error saving person:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePerson = async (id: number) => {
        await deletePerson(id);
        await fetchData();
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
        await createTeam(teamForm);
        await fetchData();
        setTeamForm({ name: "" });
        onTeamModalClose();
        setSaving(false);
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
                                onPress={onTeamModalOpen}
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
                    {Object.entries(groupedPeople).map(([teamName, teamMembers], index) => (
                        <div key={teamName}>
                            <DynamicTeamSection
                                title={teamName}
                                members={teamMembers}
                                canEdit={true}
                                onEdit={openEditModal}
                                onDelete={handleDeletePerson}
                            />
                            {index < Object.entries(groupedPeople).length - 1 && (
                                <div className="py-6" />
                            )}
                        </div>
                    ))}
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
            <Modal isOpen={isTeamModalOpen} onClose={onTeamModalClose}>
                <ModalContent>
                    <ModalHeader>Add New Team</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Team Name"
                            placeholder="Enter team name"
                            value={teamForm.name}
                            onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onTeamModalClose}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleTeamSubmit} isLoading={saving}>
                            Create Team
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
