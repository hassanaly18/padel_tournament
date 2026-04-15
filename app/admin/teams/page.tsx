'use client'

import { useState } from 'react'
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
import { getTeams, getGroups, addTeam, updateTeam, deleteTeam } from '@/lib/store'
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { EmptyState } from '@/components/empty-state'
import type { Team } from '@/lib/types'

export default function AdminTeamsPage() {
  const [search, setSearch] = useState('')
  const [teams, setTeams] = useState(getTeams())
  const groups = getGroups()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamGroup, setNewTeamGroup] = useState('')

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const refreshTeams = () => setTeams(getTeams())

  const handleAddTeam = () => {
    if (!newTeamName.trim() || !newTeamGroup) {
      toast({
        title: 'Error',
        description: 'Please enter a team name and select a group.',
        variant: 'destructive',
      })
      return
    }

    addTeam({ name: newTeamName.trim(), groupId: newTeamGroup })
    refreshTeams()
    setNewTeamName('')
    setNewTeamGroup('')
    setIsAddOpen(false)
    toast({
      title: 'Team added',
      description: `${newTeamName} has been added to Group ${newTeamGroup}.`,
    })
  }

  const handleUpdateTeam = () => {
    if (!editingTeam || !newTeamName.trim() || !newTeamGroup) return

    updateTeam(editingTeam.id, { name: newTeamName.trim(), groupId: newTeamGroup })
    refreshTeams()
    setEditingTeam(null)
    setNewTeamName('')
    setNewTeamGroup('')
    toast({
      title: 'Team updated',
      description: `Team has been updated successfully.`,
    })
  }

  const handleDeleteTeam = (team: Team) => {
    if (confirm(`Are you sure you want to delete "${team.name}"? This will also delete all their matches.`)) {
      deleteTeam(team.id)
      refreshTeams()
      toast({
        title: 'Team deleted',
        description: `${team.name} has been removed.`,
      })
    }
  }

  const openEditDialog = (team: Team) => {
    setEditingTeam(team)
    setNewTeamName(team.name)
    setNewTeamGroup(team.groupId)
  }

  return (
    <div className="space-y-6">
      <Toaster />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground">
            {teams.length} teams across {groups.length} groups
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  placeholder="Enter team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Group</label>
                <Select value={newTeamGroup} onValueChange={setNewTeamGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddTeam} className="w-full">
                Add Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Teams List */}
      {filteredTeams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams found"
          description={search ? 'Try a different search term.' : 'Add your first team to get started.'}
        />
      ) : (
        <div className="grid gap-3">
          {filteredTeams.map((team) => (
            <Card key={team.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <Badge variant="outline" className="text-xs">
                        Group {team.groupId}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(team)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteTeam(team)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Team Name</label>
              <Input
                placeholder="Enter team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Group</label>
              <Select value={newTeamGroup} onValueChange={setNewTeamGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateTeam} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
