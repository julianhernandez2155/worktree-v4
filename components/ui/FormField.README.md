# FormField Component Documentation

A comprehensive, reusable form field component system for standardizing form inputs across the Worktree v4 application.

## Components

### FormField
Standard input field component supporting all HTML input types.

### FormTextarea
Textarea component for multi-line text input.

### FormSelect
Select dropdown component with custom styling.

## Features

- ✅ Consistent styling across all form inputs
- ✅ Full TypeScript support with proper types
- ✅ react-hook-form integration
- ✅ Icon support (label and prefix)
- ✅ Required field indicators
- ✅ Error message display with icons
- ✅ Helper text/hints
- ✅ Right-side elements (e.g., password toggle)
- ✅ Custom styling overrides
- ✅ Accessibility features
- ✅ Focus/blur callbacks
- ✅ All standard HTML input types

## Basic Usage

```tsx
import { FormField, FormTextarea, FormSelect } from '@/components/ui/FormField';
import { Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <form>
      {/* Basic input */}
      <FormField
        label="Full Name"
        placeholder="John Doe"
        required
        register={register('fullName', { required: 'Name is required' })}
        error={errors.fullName}
      />

      {/* Email with icon */}
      <FormField
        label="Email"
        type="email"
        icon={Mail}
        placeholder="john@example.com"
        register={register('email')}
        error={errors.email}
      />

      {/* Password with toggle */}
      <FormField
        label="Password"
        type="password"
        icon={Lock}
        rightElement={<PasswordToggle />}
        register={register('password')}
        error={errors.password}
      />

      {/* Textarea */}
      <FormTextarea
        label="Bio"
        rows={4}
        register={register('bio')}
        hint="Tell us about yourself"
      />

      {/* Select */}
      <FormSelect
        label="Category"
        register={register('category')}
        options={[
          { value: 'academic', label: 'Academic' },
          { value: 'social', label: 'Social' }
        ]}
      />
    </form>
  );
}
```

## Props

### Common Props (all components)

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Field label text |
| `error` | `string \| FieldError` | Error message or react-hook-form error object |
| `hint` | `string` | Helper text displayed below the field |
| `required` | `boolean` | Shows required indicator (*) |
| `icon` | `LucideIcon` | Icon component to display |
| `containerClassName` | `string` | Custom classes for the container div |
| `labelClassName` | `string` | Custom classes for the label |
| `helperTextClassName` | `string` | Custom classes for error/hint text |
| `onFieldFocus` | `(field: string) => void` | Callback when field is focused |
| `onFieldBlur` | `() => void` | Callback when field loses focus |
| `register` | `UseFormRegisterReturn` | react-hook-form register object |

### FormField Specific Props

| Prop | Type | Description |
|------|------|-------------|
| `type` | `InputType` | HTML input type (text, email, password, etc.) |
| `rightElement` | `ReactNode` | Element to display on the right side |
| All standard HTML input attributes | | Passed through to the input element |

### FormSelect Specific Props

| Prop | Type | Description |
|------|------|-------------|
| `options` | `Array<{value: string, label: string}>` | Option list for the select |
| All standard HTML select attributes | | Passed through to the select element |

## Examples

### Input with Prefix Icon (No Label)
```tsx
<FormField
  type="text"
  icon={User}
  placeholder="@username"
  hint="Your unique identifier"
/>
```

### Input with Validation
```tsx
<FormField
  label="Email"
  type="email"
  register={register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  })}
  error={errors.email}
/>
```

### Password with Toggle
```tsx
const [showPassword, setShowPassword] = useState(false);

<FormField
  label="Password"
  type={showPassword ? 'text' : 'password'}
  rightElement={
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="p-1 text-gray-400 hover:text-white"
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  }
/>
```

### Custom Styled Field
```tsx
<FormField
  label="Custom Field"
  className="py-4 text-lg" // Input classes
  containerClassName="bg-dark-card p-4 rounded-lg" // Container classes
  labelClassName="text-neon-green text-base" // Label classes
  helperTextClassName="text-xs italic" // Helper text classes
/>
```

### Select with Dynamic Options
```tsx
<FormSelect
  label="Organization"
  register={register('orgId')}
  error={errors.orgId}
>
  <option value="">Select an organization</option>
  {organizations.map(org => (
    <option key={org.id} value={org.id}>
      {org.name}
    </option>
  ))}
</FormSelect>
```

### Field with Focus Tracking
```tsx
<FormField
  label="Tracked Field"
  onFieldFocus={(field) => {
    console.log(`User focused on: ${field}`);
    // Could trigger help text, analytics, etc.
  }}
  onFieldBlur={() => {
    console.log('Field blurred');
  }}
/>
```

## Migration Guide

To migrate existing form inputs to use the new FormField components:

### Before:
```tsx
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Email
  </label>
  <input
    {...register('email')}
    type="email"
    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg"
  />
  {errors.email && (
    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
  )}
</div>
```

### After:
```tsx
<FormField
  label="Email"
  type="email"
  register={register('email')}
  error={errors.email}
/>
```

## Design Tokens

The components use the following design tokens from your Tailwind config:

- Background: `bg-dark-surface`
- Border: `border-dark-border`
- Focus: `focus:ring-neon-green/50 focus:border-neon-green/50`
- Error: `border-red-500/50 focus:ring-red-500/50`
- Text: `text-white` (input), `text-gray-300` (label), `text-gray-500` (hint)
- Error text: `text-red-400`

## Accessibility

- All inputs are properly labeled
- Error messages are associated with inputs via aria-describedby
- Required fields are marked with aria-required
- Focus states are clearly visible
- Keyboard navigation fully supported

## Best Practices

1. Always provide a label for accessibility (use aria-label if label prop not used)
2. Use appropriate input types for better mobile UX
3. Provide helpful error messages
4. Use hint text for additional context
5. Keep labels concise and clear
6. Group related fields together
7. Use consistent validation patterns