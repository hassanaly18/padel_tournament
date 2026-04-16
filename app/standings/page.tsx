'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fetchTeams, fetchGroups, fetchMatches, calculateStandings } from '@/lib/supabase-api'
import type { Team, Group, Match } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function StandingsPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [groups, setGroups] = useState<Group[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchGroups(), fetchTeams(), fetchMatches()]).then(([g, t, m]) => {
      setGroups(g)
      setTeams(t)
      setMatches(m)
      setLoading(false)
    })
  }, [])

  const displayGroups = selectedGroup === 'all' ? groups : groups.filter((g) => g.id === selectedGroup)

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Standings</h1>
          <p className="text-sm text-muted-foreground">Points table for all groups</p>
        </div>

        {/* Group Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide mb-4">
          <Badge
            variant={selectedGroup === 'all' ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedGroup('all')}
          >
            All Groups
          </Badge>
          {groups.map((group) => (
            <Badge
              key={group.id}
              variant={selectedGroup === group.id ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedGroup(group.id)}
            >
              Group {group.id}
            </Badge>
          ))}
        </div>

        {/* Standings Tables */}
        <div className="space-y-6">
          {displayGroups.map((group) => {
            const groupTeams = teams.filter(t => t.groupId === group.id)
            const standings = calculateStandings(groupTeams, matches)

            return (
              <Card key={group.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">{group.name}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-2 p-4 pt-0">
                    {standings.map((standing, index) => (
                      <div
                        key={standing.team.id}
                        className={cn(
                          'flex items-center justify-between rounded-lg p-3',
                          index < 2 ? 'bg-[var(--live)]/10' : 'bg-muted/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold',
                              index < 2
                                ? 'bg-[var(--live)] text-[var(--live-foreground)]'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{standing.team.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {standing.played}P {standing.won}W {standing.lost}L
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{standing.points}</p>
                          <p className="text-xs text-muted-foreground">
                            {standing.pointsDiff >= 0 ? '+' : ''}
                            {standing.pointsDiff}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-muted-foreground">
                          <th className="p-3 font-medium">#</th>
                          <th className="p-3 font-medium">Team</th>
                          <th className="p-3 font-medium text-center">P</th>
                          <th className="p-3 font-medium text-center">W</th>
                          <th className="p-3 font-medium text-center">L</th>
                          <th className="p-3 font-medium text-center">PF</th>
                          <th className="p-3 font-medium text-center">PA</th>
                          <th className="p-3 font-medium text-center">+/-</th>
                          <th className="p-3 font-medium text-center">PTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((standing, index) => (
                          <tr
                            key={standing.team.id}
                            className={cn(
                              'border-b last:border-0',
                              index < 2 && 'bg-[var(--live)]/5'
                            )}
                          >
                            <td className="p-3">
                              <div
                                className={cn(
                                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                                  index < 2
                                    ? 'bg-[var(--live)] text-[var(--live-foreground)]'
                                    : 'bg-muted text-muted-foreground'
                                )}
                              >
                                {index + 1}
                              </div>
                            </td>
                            <td className="p-3 font-medium">{standing.team.name}</td>
                            <td className="p-3 text-center tabular-nums">{standing.played}</td>
                            <td className="p-3 text-center tabular-nums text-[var(--live)]">
                              {standing.won}
                            </td>
                            <td className="p-3 text-center tabular-nums text-[var(--court-red)]">
                              {standing.lost}
                            </td>
                            <td className="p-3 text-center tabular-nums">{standing.pointsFor}</td>
                            <td className="p-3 text-center tabular-nums">{standing.pointsAgainst}</td>
                            <td
                              className={cn(
                                'p-3 text-center tabular-nums font-medium',
                                standing.pointsDiff > 0 && 'text-[var(--live)]',
                                standing.pointsDiff < 0 && 'text-[var(--court-red)]'
                              )}
                            >
                              {standing.pointsDiff >= 0 ? '+' : ''}
                              {standing.pointsDiff}
                            </td>
                            <td className="p-3 text-center tabular-nums font-bold">
                              {standing.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
