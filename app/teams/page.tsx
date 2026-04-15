'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { EmptyState } from '@/components/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { getTeams, getGroups } from '@/lib/store'
import { Users, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TeamsPage() {
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState<string>('all')

  const teams = getTeams()
  const groups = getGroups()

  // Filter teams
  let filteredTeams = teams

  if (search) {
    filteredTeams = filteredTeams.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (groupFilter !== 'all') {
    filteredTeams = filteredTeams.filter((t) => t.groupId === groupFilter)
  }

  // Group teams by group
  const teamsByGroup = groups.map((group) => ({
    group,
    teams: filteredTeams.filter((t) => t.groupId === group.id),
  }))

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Teams</h1>
          <p className="text-sm text-muted-foreground">
            {teams.length} teams across {groups.length} groups
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <Badge
              variant={groupFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setGroupFilter('all')}
            >
              All Groups
            </Badge>
            {groups.map((group) => (
              <Badge
                key={group.id}
                variant={groupFilter === group.id ? 'default' : 'outline'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setGroupFilter(group.id)}
              >
                Group {group.id}
              </Badge>
            ))}
          </div>
        </div>

        {/* Teams by Group */}
        {filteredTeams.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No teams found"
            description={search ? 'Try a different search term.' : 'No teams have been added yet.'}
          />
        ) : groupFilter === 'all' ? (
          <div className="space-y-6">
            {teamsByGroup.map(({ group, teams: groupTeams }) => {
              if (groupTeams.length === 0) return null
              return (
                <Card key={group.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline">{group.name}</Badge>
                      <span className="text-sm font-normal text-muted-foreground">
                        {groupTeams.length} teams
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {groupTeams.map((team, index) => (
                        <div
                          key={team.id}
                          className={cn(
                            'flex items-center gap-3 rounded-lg p-3 bg-muted/50',
                            'transition-colors hover:bg-muted'
                          )}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium">{team.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {filteredTeams.map((team, index) => (
              <div
                key={team.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg p-4 bg-card border',
                  'transition-colors hover:bg-muted'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-muted-foreground">Group {team.groupId}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
