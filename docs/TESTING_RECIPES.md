# Testing Recipes - TravelHub

Recetas y ejemplos prácticos para casos comunes de testing.

---

## 📋 Tabla de Contenidos

- [Tests Unitarios](#tests-unitarios)
- [Tests de Componentes](#tests-de-componentes)
- [Tests de Formularios](#tests-de-formularios)
- [Tests de Server Actions](#tests-de-server-actions)
- [Tests de Hooks](#tests-de-hooks)
- [Tests E2E](#tests-e2e)
- [Mocking Patterns](#mocking-patterns)

---

## Tests Unitarios

### Testear función pura

```typescript
// lib/utils/formatters.ts
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

// __tests__/unit/utils/formatters.test.ts
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/utils/formatters'

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00')
  })

  it('should format EUR correctly', () => {
    expect(formatCurrency(100, 'EUR')).toBe('€100.00')
  })

  it('should handle decimals', () => {
    expect(formatCurrency(99.99, 'USD')).toBe('$99.99')
  })

  it('should handle large numbers', () => {
    expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00')
  })
})
```

---

### Testear función con side effects

```typescript
// lib/utils/storage.ts
export function saveToLocalStorage(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// __tests__/unit/utils/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { saveToLocalStorage } from '@/lib/utils/storage'

describe('saveToLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should save value to localStorage', () => {
    const data = { name: 'John', age: 30 }

    saveToLocalStorage('user', data)

    const stored = localStorage.getItem('user')
    expect(stored).toBe(JSON.stringify(data))
  })

  it('should overwrite existing value', () => {
    saveToLocalStorage('key', 'old')
    saveToLocalStorage('key', 'new')

    expect(localStorage.getItem('key')).toBe('"new"')
  })
})
```

---

### Testear Schema de Validación

```typescript
// lib/validations/user.ts
import { z } from 'zod'

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18).max(120)
})

// __tests__/unit/validations/user.test.ts
import { describe, it, expect } from 'vitest'
import { userSchema } from '@/lib/validations/user'

describe('userSchema', () => {
  it('should validate correct user', () => {
    const validUser = {
      email: 'user@example.com',
      password: 'securepass123',
      age: 25
    }

    const result = userSchema.safeParse(validUser)
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const invalidUser = {
      email: 'not-an-email',
      password: 'securepass123',
      age: 25
    }

    const result = userSchema.safeParse(invalidUser)
    expect(result.success).toBe(false)

    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email'])
    }
  })

  it('should reject short password', () => {
    const invalidUser = {
      email: 'user@example.com',
      password: 'short',
      age: 25
    }

    const result = userSchema.safeParse(invalidUser)
    expect(result.success).toBe(false)
  })

  it('should reject underage user', () => {
    const invalidUser = {
      email: 'user@example.com',
      password: 'securepass123',
      age: 17
    }

    const result = userSchema.safeParse(invalidUser)
    expect(result.success).toBe(false)
  })
})
```

---

## Tests de Componentes

### Testear componente simple

```typescript
// components/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function Button({ children, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

// __tests__/integration/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByText('Click me'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick} disabled>Click me</Button>)

    await user.click(screen.getByText('Click me'))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should have disabled attribute', () => {
    render(<Button disabled>Click me</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

---

### Testear componente con estado

```typescript
// components/Counter.tsx
'use client'
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}

// __tests__/integration/components/Counter.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from '@/components/Counter'

describe('Counter', () => {
  it('should start at 0', () => {
    render(<Counter />)

    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('should increment count', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByText('Increment'))

    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })

  it('should decrement count', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByText('Decrement'))

    expect(screen.getByText('Count: -1')).toBeInTheDocument()
  })

  it('should reset count', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    // Incrementar varias veces
    await user.click(screen.getByText('Increment'))
    await user.click(screen.getByText('Increment'))
    await user.click(screen.getByText('Increment'))

    // Resetear
    await user.click(screen.getByText('Reset'))

    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })
})
```

---

### Testear componente con props condicionales

```typescript
// components/Alert.tsx
interface AlertProps {
  message: string
  type: 'success' | 'error' | 'warning'
  onClose?: () => void
}

export function Alert({ message, type, onClose }: AlertProps) {
  return (
    <div className={`alert alert-${type}`}>
      <p>{message}</p>
      {onClose && <button onClick={onClose}>Close</button>}
    </div>
  )
}

// __tests__/integration/components/Alert.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Alert } from '@/components/Alert'

describe('Alert', () => {
  it('should render success alert', () => {
    const { container } = render(
      <Alert message="Success!" type="success" />
    )

    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(container.querySelector('.alert-success')).toBeInTheDocument()
  })

  it('should render error alert', () => {
    const { container } = render(
      <Alert message="Error!" type="error" />
    )

    expect(container.querySelector('.alert-error')).toBeInTheDocument()
  })

  it('should not render close button when onClose is not provided', () => {
    render(<Alert message="Info" type="warning" />)

    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('should render close button when onClose is provided', () => {
    render(<Alert message="Info" type="warning" onClose={() => {}} />)

    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    render(<Alert message="Info" type="warning" onClose={handleClose} />)

    await user.click(screen.getByText('Close'))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
```

---

## Tests de Formularios

### Testear formulario simple

```typescript
// components/LoginForm.tsx
'use client'
import { useState } from 'react'

export function LoginForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  )
}

// __tests__/integration/components/LoginForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/LoginForm'

describe('LoginForm', () => {
  it('should render form fields', () => {
    render(<LoginForm onSubmit={() => {}} />)

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should call onSubmit with form data', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByPlaceholderText('Email'), 'user@test.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password123'
    })
  })

  it('should clear form after submission', async () => {
    const user = userEvent.setup()

    render(<LoginForm onSubmit={() => {}} />)

    const emailInput = screen.getByPlaceholderText('Email')
    const passwordInput = screen.getByPlaceholderText('Password')

    await user.type(emailInput, 'user@test.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('user@test.com')
    expect(passwordInput).toHaveValue('password123')
  })
})
```

---

### Testear formulario con React Hook Form

```typescript
// components/ProfileForm.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email()
})

type FormData = z.infer<typeof schema>

export function ProfileForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Save</button>
    </form>
  )
}

// __tests__/integration/components/ProfileForm.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileForm } from '@/components/ProfileForm'

describe('ProfileForm', () => {
  it('should show validation errors', async () => {
    const user = userEvent.setup()

    render(<ProfileForm onSubmit={() => {}} />)

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/name/i)).toBeInTheDocument()
      expect(screen.getByText(/email/i)).toBeInTheDocument()
    })
  })

  it('should submit valid data', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<ProfileForm onSubmit={handleSubmit} />)

    await user.type(screen.getByPlaceholderText('Name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Email'), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      })
    })
  })
})
```

---

## Tests de Server Actions

### Testear Server Action básico

```typescript
// lib/actions/user-actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'

export async function getUser(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return { error: error.message }
  return { data }
}

// __tests__/unit/actions/user-actions.test.ts
import { describe, it, expect, vi } from 'vitest'
import { getUser } from '@/lib/actions/user-actions'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '1', name: 'John' },
            error: null
          }))
        }))
      }))
    }))
  }))
}))

describe('getUser', () => {
  it('should return user data', async () => {
    const result = await getUser('1')

    expect(result.data).toEqual({ id: '1', name: 'John' })
    expect(result.error).toBeUndefined()
  })

  it('should handle error', async () => {
    // Re-mock para este test
    vi.mocked(createClient).mockResolvedValueOnce({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({ data: null, error: { message: 'Not found' } })
          })
        })
      })
    } as any)

    const result = await getUser('999')

    expect(result.error).toBe('Not found')
  })
})
```

---

## Tests de Hooks

### Testear custom hook

```typescript
// hooks/useCounter.ts
import { useState } from 'react'

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  const reset = () => setCount(initialValue)

  return { count, increment, decrement, reset }
}

// __tests__/unit/hooks/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCounter } from '@/hooks/useCounter'

describe('useCounter', () => {
  it('should start with initial value', () => {
    const { result } = renderHook(() => useCounter(5))

    expect(result.current.count).toBe(5)
  })

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter(0))

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(10))

    act(() => {
      result.current.decrement()
    })

    expect(result.current.count).toBe(9)
  })

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(5))

    act(() => {
      result.current.increment()
      result.current.increment()
      result.current.reset()
    })

    expect(result.current.count).toBe(5)
  })
})
```

---

## Tests E2E

### Testear flujo de autenticación

```typescript
// __tests__/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'user@example.com')
    await page.fill('[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/.*dashboard/)
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[type="password"]', 'wrongpass')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible()
  })

  test('should logout', async ({ page }) => {
    // Login primero
    await page.goto('/login')
    await page.fill('[name="email"]', 'user@example.com')
    await page.fill('[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Logout
    await page.click('[aria-label="User menu"]')
    await page.click('text=Logout')

    await expect(page).toHaveURL('/login')
  })
})
```

---

### Testear formulario con upload de archivo

```typescript
// __tests__/e2e/file-upload.spec.ts
import { test, expect } from '@playwright/test'
import path from 'path'

test('should upload file', async ({ page }) => {
  await page.goto('/upload')

  // Crear archivo de prueba
  const filePath = path.join(__dirname, 'fixtures', 'test-file.pdf')

  // Upload
  await page.setInputFiles('input[type="file"]', filePath)

  await expect(page.locator('text=test-file.pdf')).toBeVisible()

  await page.click('button:has-text("Upload")')

  await expect(page.locator('text=Upload successful')).toBeVisible()
})
```

---

## Mocking Patterns

### Mock de API fetch

```typescript
// __tests__/unit/api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

global.fetch = vi.fn()

function createFetchResponse(data: any) {
  return { json: async () => data }
}

describe('API calls', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear()
  })

  it('should fetch user data', async () => {
    const mockUser = { id: 1, name: 'John' }

    vi.mocked(fetch).mockResolvedValue(
      createFetchResponse(mockUser) as Response
    )

    const response = await fetch('/api/user')
    const data = await response.json()

    expect(data).toEqual(mockUser)
    expect(fetch).toHaveBeenCalledWith('/api/user')
  })
})
```

---

### Mock de localStorage

```typescript
// __tests__/unit/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'

describe('localStorage operations', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should save and retrieve data', () => {
    localStorage.setItem('key', 'value')

    expect(localStorage.getItem('key')).toBe('value')
  })

  it('should remove data', () => {
    localStorage.setItem('key', 'value')
    localStorage.removeItem('key')

    expect(localStorage.getItem('key')).toBeNull()
  })
})
```

---

### Mock de timers

```typescript
// __tests__/unit/timers.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Timer tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call callback after delay', () => {
    const callback = vi.fn()

    setTimeout(callback, 1000)

    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should call interval callback multiple times', () => {
    const callback = vi.fn()

    setInterval(callback, 100)

    vi.advanceTimersByTime(500)

    expect(callback).toHaveBeenCalledTimes(5)
  })
})
```

---

### Mock de Date

```typescript
// __tests__/unit/date.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Date tests', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-01-01'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should use mocked date', () => {
    const now = new Date()

    expect(now.getFullYear()).toBe(2024)
    expect(now.getMonth()).toBe(0) // Enero
    expect(now.getDate()).toBe(1)
  })
})
```

---

## Quick Reference

### Common Queries

```typescript
// Por rol (preferido)
getByRole('button', { name: /submit/i })
getByRole('textbox', { name: /email/i })
getByRole('heading', { level: 1 })

// Por label
getByLabelText(/email/i)
getByLabelText('Password')

// Por texto
getByText(/welcome/i)
getByText('Exact text')

// Por placeholder
getByPlaceholderText(/search/i)

// Por alt text (imágenes)
getByAltText(/profile picture/i)

// Test ID (último recurso)
getByTestId('custom-element')
```

### Common Matchers

```typescript
// Existencia
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Visibilidad
expect(element).toBeVisible()
expect(element).not.toBeVisible()

// Valores
expect(input).toHaveValue('text')
expect(checkbox).toBeChecked()

// Clases
expect(element).toHaveClass('active')

// Atributos
expect(button).toBeDisabled()
expect(button).toBeEnabled()

// Llamadas a funciones
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
```

---

**Última actualización:** 2025-11-15
**Versión:** 1.0.0
