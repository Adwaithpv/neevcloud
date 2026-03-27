import { useState } from 'react'
import type { Group } from '../types/expense'

interface GroupManagerProps {
  groups: Group[]
  activeGroupId: string | null
  onCreateGroup: (name: string) => void
  onSetActiveGroup: (groupId: string) => void
  onAddMember: (groupId: string, memberName: string) => void
}

export const GroupManager = ({
  groups,
  activeGroupId,
  onCreateGroup,
  onSetActiveGroup,
  onAddMember,
}: GroupManagerProps) => {
  const [groupName, setGroupName] = useState('')
  const [memberName, setMemberName] = useState('')

  const activeGroup = groups.find((group) => group.id === activeGroupId)

  return (
    <section className="card">
      <h2>Groups</h2>
      <form
        className="inline-form"
        onSubmit={(event) => {
          event.preventDefault()
          onCreateGroup(groupName)
          setGroupName('')
        }}
      >
        <input
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          placeholder="Create new group"
        />
        <button type="submit">Add Group</button>
      </form>

      {groups.length > 0 && (
        <div className="group-list">
          {groups.map((group) => (
            <button
              key={group.id}
              className={group.id === activeGroupId ? 'group-button active' : 'group-button'}
              type="button"
              onClick={() => onSetActiveGroup(group.id)}
            >
              {group.name} ({group.members.length})
            </button>
          ))}
        </div>
      )}

      {activeGroup && (
        <form
          className="inline-form"
          onSubmit={(event) => {
            event.preventDefault()
            onAddMember(activeGroup.id, memberName)
            setMemberName('')
          }}
        >
          <input
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
            placeholder={`Add member to ${activeGroup.name}`}
          />
          <button type="submit">Add Member</button>
        </form>
      )}
    </section>
  )
}
