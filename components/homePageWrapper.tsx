"use client";
import Image from "next/image";
import KPICard from "./KPICard"; import { JwtClaims } from "@/types/supabase";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Skeleton
} from "@heroui/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { IconCamera, IconCalendar, IconUsers, IconQuestionMark } from "@tabler/icons-react";
import Google from "@/public/images/google.png";


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

  const handleLogin = async () => {
    const nextUrl = "/";
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${nextUrl}`,
      },
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="max-w-7xl mx-4">
          <CardHeader className="text-center">
            <h1 className="text-3xl font-bold text-primary">IEEE Admin</h1>
          </CardHeader>
          <CardBody className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to access the admin dashboard
            </p>
            <Button
              color="primary"
              variant="solid"
              size="lg"
              onPress={handleLogin}
              startContent={
                <Image src={Google} alt="Google" width={20} height={20} />
              }
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
            {/* First name only */}
            Hello, {user?.user_metadata?.full_name?.split(" ")[0]}! 👋
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
          <KPICard
            title="Events"
            value={stats?.totalEvents || 0}
            label="Total"
            icon={<IconCalendar />}
            color="primary"
            loading={loading}
            bottomContent={{
              type: "chip",
              label: "Upcoming",
              chip: {
                label: stats?.upcomingEvents || 0,
                color: "success"
              }
            }}
          />

          <KPICard
            title="Team"
            value={stats?.totalTeamMembers || 0}
            label="Members"
            icon={<IconUsers />}
            color="success"
            loading={loading}
            bottomContent={{
              type: "progress",
              label: "Active",
              progress: {
                current: stats?.activeTeamMembers || 0,
                total: stats?.totalTeamMembers || 0,
                showFraction: true
              }
            }}
          />

          <KPICard
            title="Photos"
            value={stats?.totalPhotos || 0}
            label="Total"
            icon={<IconCamera />}
            color="warning"
            loading={loading}
            bottomContent={{
              type: "button",
              label: "Gallery items",
              button: {
                label: "Add Photo",
                href: "/photos/create",
                variant: "light"
              }
            }}
          />

          <KPICard
            title="Queries"
            value={stats?.totalQueries || 0}
            label="Total"
            icon={<IconQuestionMark />}
            color="danger"
            loading={loading}
            bottomContent={{
              type: "chip",
              label: "Pending",
              chip: {
                label: stats?.pendingQueries || 0,
                color: stats?.pendingQueries && stats.pendingQueries > 0 ? "danger" : "success"
              }
            }}
          />
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
