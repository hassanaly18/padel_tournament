'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  getTeams,
  getMatches,
  addMatch,
  updateMatch,
  deleteMatch,
} from '@/lib/store'
import { Plus, Pencil, Trash2, Calendar, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { EmptyState } from '@/components/empty-state'
import type { Match } from '@/lib/types'

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState(getMatches())
  const teams = getTeams()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)

  // Form state
  const [team1Id, setTeam1Id] = useState('')
  const [team2Id, setTeam2Id] = useState('')
  const [court, setCourt] = useState<'blue' | 'red'>('blue')
  const [status, setStatus] = useState<Match['status']>('upcoming')
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')

  // Combobox state
  const [team1Open, setTeam1Open] = useState(false)
  const [team2Open, setTeam2Open] = useState(false)
  const [team1Search, setTeam1Search] = useState('')
  const [team2Search, setTeam2Search] = useState('')

  const refreshMatches = () => setMatches(getMatches())

  const resetForm = () => {
    setTeam1Id('')
    setTeam2Id('')
    setCourt('blue')
    setStatus('upcoming')
    setScore1('')
    setScore2('')
    setTeam1Search('')
    setTeam2Search('')
  }

  const filteredTeams1 = useMemo(() => {
    return teams.filter(
      (t) =>
        t.id !== team2Id &&
        t.name.toLowerCase().includes(team1Search.toLowerCase())
    )
  }, [teams, team2Id, team1Search])

  const filteredTeams2 = useMemo(() => {
    return teams.filter(
      (t) =>
        t.id !== team1Id &&
        t.name.toLowerCase().includes(team2Search.toLowerCase())
    )
  }, [teams, team1Id, team2Search])

  const handleAddMatch = () => {
    if (!team1Id || !team2Id) {
      toast({
        title: 'Error',
        description: 'Please select both teams.',
        variant: 'destructive',
      })
      return
    }

    const result = addMatch({
      team1Id,
      team2Id,
      court,
      status,
      score1: score1 ? parseInt(score1) : null,
      score2: score2 ? parseInt(score2) : null,
    })

    if ('error' in result) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
      return
    }

    refreshMatches()
    resetForm()
    setIsAddOpen(false)
    toast({
      title: 'Match created',
      description: 'New match has been scheduled.',
    })
  }

  const handleUpdateMatch = () => {
    if (!editingMatch) return

    updateMatch(editingMatch.id, {
      court,
      status,
      score1: score1 ? parseInt(score1) : null,
      score2: score2 ? parseInt(score2) : null,
    })

    refreshMatches()
    setEditingMatch(null)
    resetForm()
    toast({
      title: 'Match updated',
      description: 'Match details have been saved.',
    })
  }

  const handleDeleteMatch = (match: Match) => {
    const team1 = teams.find((t) => t.id === match.team1Id)
    const team2 = teams.find((t) => t.id === match.team2Id)
    if (confirm(`Delete match between ${team1?.name} and ${team2?.name}?`)) {
      deleteMatch(match.id)
      refreshMatches()
      toast({
        title: 'Match deleted',
        description: 'The match has been removed.',
      })
    }
  }

  const openEditDialog = (match: Match) => {
    setEditingMatch(match)
    setTeam1Id(match.team1Id)
    setTeam2Id(match.team2Id)
    setCourt(match.court)
    setStatus(match.status)
    setScore1(match.score1?.toString() ?? '')
    setScore2(match.score2?.toString() ?? '')
  }

  const getStatusBadge = (matchStatus: Match['status']) => {
    switch (matchStatus) {
      case 'live':
        return <Badge className="bg-[var(--live)] text-[var(--live-foreground)]">LIVE</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge variant="outline">Upcoming</Badge>
    }
  }

  // Sort matches: live first, then upcoming, then completed
  const sortedMatches = [...matches].sort((a, b) => {
    const order = { live: 0, upcoming: 1, completed: 2 }
    return order[a.status] - order[b.status]
  })

  return (
    <div className="space-y-6">
      <Toaster />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matches</h1>
          <p className="text-sm text-muted-foreground">
            {matches.length} total matches
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Match
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Match</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Team 1 Combobox */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Team 1</label>
                <Popover open={team1Open} onOpenChange={setTeam1Open}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={team1Open}
                      className="w-full justify-between"
                    >
                      {team1Id
                        ? teams.find((t) => t.id === team1Id)?.name
                        : 'Search and select team...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search teams..."
                        value={team1Search}
                        onValueChange={setTeam1Search}
                      />
                      <CommandList>
                        <CommandEmpty>No team found.</CommandEmpty>
                        <CommandGroup>
                          {filteredTeams1.map((team) => (
                            <CommandItem
                              key={team.id}
                              value={team.name}
                              onSelect={() => {
                                setTeam1Id(team.id)
                                setTeam1Open(false)
                                setTeam1Search('')
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  team1Id === team.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <span>{team.name}</span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                Group {team.groupId}
                              </Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Team 2 Combobox */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Team 2</label>
                <Popover open={team2Open} onOpenChange={setTeam2Open}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={team2Open}
                      className="w-full justify-between"
                    >
                      {team2Id
                        ? teams.find((t) => t.id === team2Id)?.name
                        : 'Search and select team...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search teams..."
                        value={team2Search}
                        onValueChange={setTeam2Search}
                      />
                      <CommandList>
                        <CommandEmpty>No team found.</CommandEmpty>
                        <CommandGroup>
                          {filteredTeams2.map((team) => (
                            <CommandItem
                              key={team.id}
                              value={team.name}
                              onSelect={() => {
                                setTeam2Id(team.id)
                                setTeam2Open(false)
                                setTeam2Search('')
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  team2Id === team.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <span>{team.name}</span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                Group {team.groupId}
                              </Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Court */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Court</label>
                <Select value={court} onValueChange={(v) => setCourt(v as 'blue' | 'red')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[var(--court-blue)]" />
                        Blue Court
                      </span>
                    </SelectItem>
                    <SelectItem value="red">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[var(--court-red)]" />
                        Red Court
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as Match['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scores (only if not upcoming) */}
              {status !== 'upcoming' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Score Team 1</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={score1}
                      onChange={(e) => setScore1(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Score Team 2</label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={score2}
                      onChange={(e) => setScore2(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button onClick={handleAddMatch} className="w-full">
                Create Match
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No matches yet"
          description="Create your first match to get started."
        />
      ) : (
        <div className="grid gap-3">
          {sortedMatches.map((match) => {
            const team1 = teams.find((t) => t.id === match.team1Id)
            const team2 = teams.find((t) => t.id === match.team2Id)

            return (
              <Card
                key={match.id}
                className={cn(match.status === 'live' && 'ring-2 ring-[var(--live)]')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getStatusBadge(match.status)}
                        <Badge
                          variant="outline"
                          className={cn(
                            match.court === 'blue' && 'border-[var(--court-blue)] text-[var(--court-blue)]',
                            match.court === 'red' && 'border-[var(--court-red)] text-[var(--court-red)]'
                          )}
                        >
                          {match.court === 'blue' ? 'Blue Court' : 'Red Court'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{team1?.name ?? 'Unknown'}</span>
                          <span className="text-lg font-bold ml-2">{match.score1 ?? '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{team2?.name ?? 'Unknown'}</span>
                          <span className="text-lg font-bold ml-2">{match.score2 ?? '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(match)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMatch(match)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingMatch}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMatch(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Match</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Teams (read-only) */}
            <div className="rounded-lg bg-muted p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{teams.find((t) => t.id === team1Id)?.name}</span>
                <Badge variant="outline">Team 1</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{teams.find((t) => t.id === team2Id)?.name}</span>
                <Badge variant="outline">Team 2</Badge>
              </div>
            </div>

            {/* Court */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Court</label>
              <Select value={court} onValueChange={(v) => setCourt(v as 'blue' | 'red')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--court-blue)]" />
                      Blue Court
                    </span>
                  </SelectItem>
                  <SelectItem value="red">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--court-red)]" />
                      Red Court
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as Match['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {teams.find((t) => t.id === team1Id)?.name} Score
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {teams.find((t) => t.id === team2Id)?.name} Score
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleUpdateMatch} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
