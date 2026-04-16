'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { fetchTeams, fetchGroups, fetchMatches } from '@/lib/supabase-api'
import type { Team, Group, Match } from '@/lib/types'
import { Users, Calendar, Trophy, Zap } from 'lucide-react'

export default function AdminDashboard() {
  const [teams, setTeams] = useState<Team[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchTeams(), fetchGroups(), fetchMatches()]).then(([t, g, m]) => {
      setTeams(t)
      setGroups(g)
      setMatches(m)
      setLoading(false)
    })
  }, [])

  if (loading) return <div>Loading...</div>

  const liveMatches = matches.filter((m) => m.status === 'live')
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming')
  const completedMatches = matches.filter((m) => m.status === 'completed')

  const stats = [
    {
      title: 'Total Teams',
      value: teams.length,
      icon: Users,
      description: `Across ${groups.length} groups`,
    },
    {
      title: 'Total Matches',
      value: matches.length,
      icon: Calendar,
      description: `${completedMatches.length} completed`,
    },
    {
      title: 'Live Matches',
      value: liveMatches.length,
      icon: Zap,
      description: 'Currently in progress',
      highlight: liveMatches.length > 0,
    },
    {
      title: 'Upcoming',
      value: upcomingMatches.length,
      icon: Trophy,
      description: 'Scheduled matches',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Tournament overview and quick stats</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className={stat.highlight ? 'ring-2 ring-[var(--live)]' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon
                  className={`h-4 w-4 ${stat.highlight ? 'text-[var(--live)]' : 'text-muted-foreground'}`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/admin/teams"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Manage Teams</p>
                <p className="text-xs text-muted-foreground">Add or edit teams</p>
              </div>
            </a>
            <a
              href="/admin/matches"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Create Match</p>
                <p className="text-xs text-muted-foreground">Schedule new fixtures</p>
              </div>
            </a>
            <a
              href="/admin/matches"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <Zap className="h-5 w-5 text-[var(--live)]" />
              <div>
                <p className="font-medium">Update Scores</p>
                <p className="text-xs text-muted-foreground">Live score updates</p>
              </div>
            </a>
            <a
              href="/admin/settings"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <Trophy className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Tournament Settings</p>
                <p className="text-xs text-muted-foreground">Configure groups</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <Card className="border-[var(--live)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--live)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--live)]"></span>
              </span>
              Live Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveMatches.map((match) => {
                const team1 = teams.find((t) => t.id === match.team1Id)
                const team2 = teams.find((t) => t.id === match.team2Id)
                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{team1?.name}</span>
                        <span className="text-xl font-bold text-[var(--live)]">
                          {match.score1 ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{team2?.name}</span>
                        <span className="text-xl font-bold text-[var(--live)]">
                          {match.score2 ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
