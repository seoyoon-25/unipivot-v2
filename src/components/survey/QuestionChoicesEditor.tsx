'use client'

import { useCallback } from 'react'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ChoiceOption, generateChoiceId } from '@/types/survey'

interface QuestionChoicesEditorProps {
  choices: ChoiceOption[]
  onChange: (choices: ChoiceOption[]) => void
}

interface SortableChoiceItemProps {
  choice: ChoiceOption
  onTextChange: (text: string) => void
  onDelete: () => void
  canDelete: boolean
}

function SortableChoiceItem({
  choice,
  onTextChange,
  onDelete,
  canDelete,
}: SortableChoiceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: choice.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg bg-gray-50 p-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 text-xs text-gray-500">
        {choice.order}
      </div>

      <Input
        value={choice.text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="선택지 입력"
        className="flex-1"
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={!canDelete}
        className="text-gray-400 hover:text-red-500 disabled:opacity-30"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function QuestionChoicesEditor({
  choices,
  onChange,
}: QuestionChoicesEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const oldIndex = choices.findIndex((c) => c.id === active.id)
        const newIndex = choices.findIndex((c) => c.id === over.id)

        const reorderedChoices = arrayMove(choices, oldIndex, newIndex).map(
          (choice, index) => ({
            ...choice,
            order: index + 1,
          })
        )

        onChange(reorderedChoices)
      }
    },
    [choices, onChange]
  )

  const handleTextChange = (choiceId: string, text: string) => {
    onChange(
      choices.map((c) => (c.id === choiceId ? { ...c, text } : c))
    )
  }

  const handleDelete = (choiceId: string) => {
    const updatedChoices = choices
      .filter((c) => c.id !== choiceId)
      .map((choice, index) => ({
        ...choice,
        order: index + 1,
      }))
    onChange(updatedChoices)
  }

  const handleAdd = () => {
    const newChoice: ChoiceOption = {
      id: generateChoiceId(),
      text: '',
      order: choices.length + 1,
    }
    onChange([...choices, newChoice])
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm text-gray-600">선택지</Label>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={choices.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {choices.map((choice) => (
              <SortableChoiceItem
                key={choice.id}
                choice={choice}
                onTextChange={(text) => handleTextChange(choice.id, text)}
                onDelete={() => handleDelete(choice.id)}
                canDelete={choices.length > 2}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        선택지 추가
      </Button>
    </div>
  )
}
