'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { MatchCard } from '@/components/match-card'
import { EmptyState } from '@/components/empty-state'
import { Badge } from '@/components/ui/badge'
import { getMatches, getTeams, getGroups } from '@/lib/store'
import { Calendar, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'live' | 'upcoming' | 'completed' | 'blue' | 'red'

export default function MatchesPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')

  const matches = getMatches()
  const teams = getTeams()
  const groups = getGroups()

  const getTeamById = (id: string) => teams.find((t) => t.id === id)

  // Apply filters
  let filteredMatches = matches

  if (filter === 'live') {
    filteredMatches = filteredMatches.filter((m) => m.status === 'live')
  } else if (filter === 'upcoming') {
    filteredMatches = filteredMatches.filter((m) => m.status === 'upcoming')
  } else if (filter === 'completed') {
    filteredMatches = filteredMatches.filter((m) => m.status === 'completed')
  } else if (filter === 'blue') {
    filteredMatches = filteredMatches.filter((m) => m.court === 'blue')
  } else if (filter === 'red') {
    filteredMatches = filteredMatches.filter((m) => m.court === 'red')
  }

  if (groupFilter !== 'all') {
    const groupTeamIds = teams.filter((t) => t.groupId === groupFilter).map((t) => t.id)
    filteredMatches = filteredMatches.filter(
      (m) => groupTeamIds.includes(m.team1Id) || groupTeamIds.includes(m.team2Id)
    )
  }

  // Sort: live first, then upcoming, then completed
  filteredMatches.sort((a, b) => {
    const order = { live: 0, upcoming: 1, completed: 2 }
    return order[a.status] - order[b.status]
  })

  const liveCount = matches.filter((m) => m.status === 'live').length

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'live', label: 'Live' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'blue', label: 'Blue Court' },
    { value: 'red', label: 'Red Court' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Matches</h1>
            {liveCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {liveCount} match{liveCount > 1 ? 'es' : ''} in progress
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            {filterOptions.map((option) => (
              <Badge
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer whitespace-nowrap transition-colors',
                  filter === option.value && 'bg-primary text-primary-foreground',
                  option.value === 'blue' &&
                    filter === 'blue' &&
                    'bg-[var(--court-blue)] text-white border-[var(--court-blue)]',
                  option.value === 'red' &&
                    filter === 'red' &&
                    'bg-[var(--court-red)] text-white border-[var(--court-red)]'
                )}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Badge>
            ))}
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

        {/* Match List */}
        {filteredMatches.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No matches found"
            description="There are no matches matching your filters."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.map((match) => {
              const team1 = getTeamById(match.team1Id)
              const team2 = getTeamById(match.team2Id)
              if (!team1 || !team2) return null
              return <MatchCard key={match.id} match={match} team1={team1} team2={team2} />
            })}
          </div>
        )}
      </main>
    </div>
  )
}
