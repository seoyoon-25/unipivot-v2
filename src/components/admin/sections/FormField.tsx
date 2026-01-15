'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  description?: string
  required?: boolean
  error?: string
  className?: string
  children?: React.ReactNode
}

export function FormField({
  label,
  description,
  required,
  error,
  className,
  children
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="space-y-1">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

interface TextFieldProps extends FormFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'number'
  multiline?: boolean
  rows?: number
}

export function TextField({
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 3,
  ...fieldProps
}: TextFieldProps) {
  return (
    <FormField {...fieldProps}>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={fieldProps.error ? 'border-destructive' : ''}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={fieldProps.error ? 'border-destructive' : ''}
        />
      )}
    </FormField>
  )
}

interface SwitchFieldProps extends FormFieldProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function SwitchField({
  checked,
  onCheckedChange,
  ...fieldProps
}: SwitchFieldProps) {
  return (
    <FormField {...fieldProps}>
      <div className="flex items-center space-x-2">
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <span className="text-sm">{checked ? '활성화' : '비활성화'}</span>
      </div>
    </FormField>
  )
}