"use client";
import { JwtClaims } from "@/types/supabase";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Skeleton
} from "@heroui/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { IconCamera, IconCalendar,IconUsers, IconQuestionMark } from "@tabler/icons-react";

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalTeamMembers: number;
  activeTeamMembers: number;
  totalPhotos: number;
  totalQueries: number;
  pendingQueries: number;
  totalTeams: number;
}

export default function HomePageWrapper({ user }: { user: JwtClaims | null }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const supabase = createClient();

      // Fetch all stats in parallel
      const [
        eventsResult,
        upcomingEventsResult,
        peopleResult,
        activePeopleResult,
        photosResult,
        queriesResult,
        pendingQueriesResult,
        teamsResult
      ] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).gte('datetime', new Date().toISOString()),
        supabase.from('people').select('id', { count: 'exact', head: true }),
        supabase.from('people').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('photos').select('id', { count: 'exact', head: true }),
        supabase.from('query').select('id', { count: 'exact', head: true }),
        supabase.from('query').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('teams').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        totalEvents: eventsResult.count || 0,
        upcomingEvents: upcomingEventsResult.count || 0,
        totalTeamMembers: peopleResult.count || 0,
        activeTeamMembers: activePeopleResult.count || 0,
        totalPhotos: photosResult.count || 0,
        totalQueries: queriesResult.count || 0,
        pendingQueries: pendingQueriesResult.count || 0,
        totalTeams: teamsResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full mx-4">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold text-primary">IEEE Admin</h1>
          </CardHeader>
          <CardBody className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to access the admin dashboard
            </p>
            <Button
              as={Link}
              href="/login"
              color="primary"
              variant="solid"
              size="lg"
              className="w-full"
            >
              Login
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Hello, {user?.user_metadata?.full_name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to your IEEE Admin Dashboard
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              as={Link}
              href="/events/create"
              color="primary"
              variant="solid"
              size="lg"
            >
              Create Event
            </Button>
            <Button
              as={Link}
              href="/events"
              color="secondary"
              variant="flat"
              size="lg"
            >
              Manage Events
            </Button>
            <Button
              as={Link}
              href="/team"
              color="success"
              variant="flat"
              size="lg"
            >
              Manage Team
            </Button>
            <Button
              as={Link}
              href="/photos"
              color="warning"
              variant="flat"
              size="lg"
            >
              Manage Photos
            </Button>
            <Button
              as={Link}
              href="/queries"
              color="danger"
              variant="flat"
              size="lg"
            >
              Manage Queries
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Events Card */}
          <Card className="border-none shadow-lg">
            <CardHeader className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Events</h3>
                <div className="flex items-center gap-2 mt-2">
                  {loading ? (
                    <Skeleton className="h-8 w-16 rounded" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">{stats?.totalEvents}</span>
                  )}
                  <Chip color="primary" variant="flat" size="sm">Total</Chip>
                </div>
              </div>
              <div className="text-4xl"><IconCalendar /></div>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Skeleton className="h-4 w-full rounded" />
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
                  <Chip color="success" variant="flat" size="sm">{stats?.upcomingEvents}</Chip>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Team Members Card */}
          <Card className="border-none shadow-lg">
            <CardHeader className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Team</h3>
                <div className="flex items-center gap-2 mt-2">
                  {loading ? (
                    <Skeleton className="h-8 w-16 rounded" />
                  ) : (
                    <span className="text-3xl font-bold text-success">{stats?.totalTeamMembers}</span>
                  )}
                  <Chip color="success" variant="flat" size="sm">Members</Chip>
                </div>
              </div>
              <div className="text-4xl"><IconUsers /></div>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Skeleton className="h-6 w-full rounded" />
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                    <span className="text-sm font-medium">{stats?.activeTeamMembers}/{stats?.totalTeamMembers}</span>
                  </div>
                  <Progress
                    value={stats?.totalTeamMembers ? (stats.activeTeamMembers / stats.totalTeamMembers) * 100 : 0}
                    color="success"
                    size="sm"
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Photos Card */}
          <Card className="border-none shadow-lg">
            <CardHeader className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Photos</h3>
                <div className="flex items-center gap-2 mt-2">
                  {loading ? (
                    <Skeleton className="h-8 w-16 rounded" />
                  ) : (
                    <span className="text-3xl font-bold text-warning">{stats?.totalPhotos}</span>
                  )}
                  <Chip color="warning" variant="flat" size="sm">Total</Chip>
                </div>
              </div>
              <div className="text-4xl"><IconCamera /></div>
            </CardHeader>
            <CardBody>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gallery items</span>
                <Button
                  as={Link}
                  href="/photos/create"
                  color="warning"
                  variant="light"
                  size="sm"
                >
                  Add Photo
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Queries Card */}
          <Card className="border-none shadow-lg">
            <CardHeader className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Queries</h3>
                <div className="flex items-center gap-2 mt-2">
                  {loading ? (
                    <Skeleton className="h-8 w-16 rounded" />
                  ) : (
                    <span className="text-3xl font-bold text-danger">{stats?.totalQueries}</span>
                  )}
                  <Chip color="danger" variant="flat" size="sm">Total</Chip>
                </div>
              </div>
              <div className="text-4xl"><IconQuestionMark /></div>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Skeleton className="h-4 w-full rounded" />
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                  <Chip
                    color={stats?.pendingQueries && stats.pendingQueries > 0 ? "danger" : "success"}
                    variant="flat"
                    size="sm"
                  >
                    {stats?.pendingQueries}
                  </Chip>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teams Overview */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Teams Overview</h3>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Teams</span>
                    <Chip color="primary" variant="flat">{stats?.totalTeams}</Chip>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Active Members</span>
                    <Chip color="success" variant="flat">{stats?.activeTeamMembers}</Chip>
                  </div>
                  <Button
                    as={Link}
                    href="/team"
                    color="primary"
                    variant="flat"
                    className="w-full"
                  >
                    View All Teams
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">System Status</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Database</span>
                  <Chip color="success" variant="flat">Online</Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Storage</span>
                  <Chip color="success" variant="flat">Healthy</Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Auth System</span>
                  <Chip color="success" variant="flat">Active</Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
