"use client";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Select,
    SelectItem,
    Input,
    Pagination,
} from "@heroui/react";
import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/types/database.types";
import { IconEye, IconCheck, IconX, IconSearch, IconFilter, IconMail, IconClock, IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import KPICard from "@/components/KPICard";
import { RequirePermission, PERMISSIONS } from "@/lib/permissions";

type Query = Tables<"query">;

interface QueriesPageClientProps {
    queries: Query[];
}

export default function QueriesPageClient({ queries: initialQueries }: QueriesPageClientProps) {
    const [queries, setQueries] = useState<Query[]>(initialQueries);
    const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const rowsPerPage = 10;

    const supabase = createClient();

    // Filter and search queries
    const filteredQueries = useMemo(() => {
        let filtered = queries;

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(query => query.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(query =>
                query.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                query.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                query.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                query.query?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [queries, statusFilter, searchTerm]);

    // Paginate queries
    const paginatedQueries = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredQueries.slice(start, end);
    }, [filteredQueries, page]);

    const totalPages = Math.ceil(filteredQueries.length / rowsPerPage);

    const updateQueryStatus = async (id: number, status: string) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from("query")
                .update({ status })
                .eq("id", id);

            if (error) throw error;

            setQueries(queries.map(query =>
                query.id === id ? { ...query, status } : query
            ));

            console.log(`Query marked as ${status}`);
        } catch (error) {
            console.error("Error updating query status:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case "pending":
                return "warning";
            case "resolved":
                return "success";
            case "rejected":
                return "danger";
            default:
                return "default";
        }
    };

    const openQueryDetails = (query: Query) => {
        setSelectedQuery(query);
        onOpen();
    };

    return (
        <RequirePermission permission={PERMISSIONS.QUERIES}>
            <div className="min-h-screen p-4">
                <div className="w-full mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            Query Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage and respond to user queries
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="flex flex-row justify-between gap-6 mb-8">
                        <KPICard
                            title="Total Queries"
                            value={queries.length}
                            icon={<IconMail />}
                            color="primary"
                            className="w-full"
                        />

                        <KPICard
                            title="Pending"
                            value={queries.filter(q => q.status === "pending").length}
                            icon={<IconClock />}
                            color="warning"
                            className="w-full"
                        />

                        <KPICard
                            title="Resolved"
                            value={queries.filter(q => q.status === "resolved").length}
                            icon={<IconCircleCheck />}
                            color="success"
                            className="w-full"
                        />

                        <KPICard
                            title="Rejected"
                            value={queries.filter(q => q.status === "rejected").length}
                            icon={<IconCircleX />}
                            color="danger"
                            className="w-full"
                        />
                    </div>

                    {/* Filters and Search */}
                    <Card className="mb-6">
                        <CardHeader>
                            <h3 className="text-lg font-semibold">Filters & Search</h3>
                        </CardHeader>
                        <CardBody>
                            <div className="flex flex-col md:flex-row gap-4">
                                <Input
                                    placeholder="Search queries..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    startContent={<IconSearch size={20} />}
                                    className="flex-1"
                                />
                                <Select
                                    placeholder="Filter by status"
                                    selectedKeys={[statusFilter]}
                                    onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
                                    className="w-full md:w-48"
                                    startContent={<IconFilter size={20} />}
                                >
                                    <SelectItem key="all">All Status</SelectItem>
                                    <SelectItem key="pending">Pending</SelectItem>
                                    <SelectItem key="resolved">Resolved</SelectItem>
                                    <SelectItem key="rejected">Rejected</SelectItem>
                                </Select>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Queries Table */}
                    <Card className="border-none shadow-lg">
                        <CardHeader className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold">All Queries</h3>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {paginatedQueries.length} of {filteredQueries.length} queries
                            </div>
                        </CardHeader>
                        <CardBody>
                            <Table aria-label="Queries table">
                                <TableHeader>
                                    <TableColumn>NAME</TableColumn>
                                    <TableColumn>EMAIL</TableColumn>
                                    <TableColumn>QUERY</TableColumn>
                                    <TableColumn>STATUS</TableColumn>
                                    <TableColumn>DATE</TableColumn>
                                    <TableColumn>ACTIONS</TableColumn>
                                </TableHeader>
                                <TableBody>
                                    {paginatedQueries.map((query) => (
                                        <TableRow key={query.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {query.first_name} {query.last_name}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">{query.email}</p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm truncate max-w-xs">
                                                    {query.query}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={getStatusColor(query.status)}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {query.status || "pending"}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">
                                                    {new Date(query.created_at).toLocaleDateString()}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        color="primary"
                                                        onPress={() => openQueryDetails(query)}
                                                        startContent={<IconEye size={16} />}
                                                    >
                                                        View
                                                    </Button>
                                                    {query.status === "pending" && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                color="success"
                                                                onPress={() => updateQueryStatus(query.id, "resolved")}
                                                                startContent={<IconCheck size={16} />}
                                                                isLoading={loading}
                                                            >
                                                                Resolve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                color="danger"
                                                                onPress={() => updateQueryStatus(query.id, "rejected")}
                                                                startContent={<IconX size={16} />}
                                                                isLoading={loading}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-6">
                                    <Pagination
                                        total={totalPages}
                                        page={page}
                                        onChange={setPage}
                                        showControls
                                    />
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Query Details Modal */}
                    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                        <ModalContent>
                            <ModalHeader>Query Details</ModalHeader>
                            <ModalBody>
                                {selectedQuery && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                                                <p className="font-medium">
                                                    {selectedQuery.first_name} {selectedQuery.last_name}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                                <p className="font-medium">{selectedQuery.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                                                <Chip
                                                    color={getStatusColor(selectedQuery.status)}
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {selectedQuery.status || "pending"}
                                                </Chip>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                                                <p className="font-medium">
                                                    {new Date(selectedQuery.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Query</p>
                                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                                                <p>{selectedQuery.query}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={onClose}>
                                    Close
                                </Button>
                                {selectedQuery?.status === "pending" && (
                                    <div className="flex gap-2">
                                        <Button
                                            color="success"
                                            onPress={() => {
                                                updateQueryStatus(selectedQuery.id, "resolved");
                                                onClose();
                                            }}
                                            startContent={<IconCheck size={16} />}
                                        >
                                            Resolve
                                        </Button>
                                        <Button
                                            color="danger"
                                            onPress={() => {
                                                updateQueryStatus(selectedQuery.id, "rejected");
                                                onClose();
                                            }}
                                            startContent={<IconX size={16} />}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </div>
            </div>
        </RequirePermission>
    );
}