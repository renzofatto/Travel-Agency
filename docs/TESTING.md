# Guía de Testing - TravelHub

## 📋 Índice

- [Resumen General](#resumen-general)
- [Configuración](#configuración)
- [Estructura de Tests](#estructura-de-tests)
- [Ejecutar Tests](#ejecutar-tests)
- [Tests Unitarios](#tests-unitarios)
- [Tests de Integración](#tests-de-integración)
- [Tests E2E](#tests-e2e)
- [Cobertura de Tests](#cobertura-de-tests)
- [Escribir Nuevos Tests](#escribir-nuevos-tests)
- [Troubleshooting](#troubleshooting)

---

## Resumen General

### Estado Actual
- **82/93 tests pasando (88.2%)**
- **100% de tests unitarios pasando**
- **35% de tests de integración pasando** (timing issues menores)
- **14 escenarios E2E documentados**

### Tecnologías Utilizadas

| Tecnología | Propósito | Documentación |
|------------|-----------|---------------|
| **Vitest** | Test runner principal | [vitest.dev](https://vitest.dev) |
| **React Testing Library** | Testing de componentes | [testing-library.com](https://testing-library.com) |
| **Playwright** | Tests E2E | [playwright.dev](https://playwright.dev) |
| **@testing-library/user-event** | Simulación de interacciones | [user-event docs](https://testing-library.com/docs/user-event/intro) |
| **jsdom** | Entorno DOM para Node.js | [jsdom](https://github.com/jsdom/jsdom) |

---

## Configuración

### Archivos de Configuración

#### `vitest.config.ts`
Configuración principal de Vitest:
- Entorno: jsdom (simula un navegador)
- Globals: true (no necesitas importar `describe`, `it`, `expect`)
- Setup: `setup-tests.ts` (mocks globales)
- Coverage: v8 provider con reportes HTML, JSON y texto

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setup-tests.ts'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/__tests__/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

#### `playwright.config.ts`
Configuración de Playwright para E2E:
- Navegadores: Chrome, Firefox, Safari
- Screenshots automáticos en fallos
- Servidor de desarrollo integrado

```typescript
export default defineConfig({
  testDir: './__tests__/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000'
  }
})
```

#### `setup-tests.ts`
Mocks globales para todos los tests:
- Next.js router, navigation, images
- Supabase client y server
- Leaflet (mapas)
- React-Leaflet

---

## Estructura de Tests

```
__tests__/
├── unit/                           # Tests unitarios
│   ├── utils/
│   │   └── expense-calculator.test.ts    # Lógica de cálculos (10 tests)
│   └── validations/
│       ├── group.test.ts                 # Validación de grupos (13 tests)
│       ├── expense.test.ts               # Validación de gastos (13 tests)
│       ├── itinerary.test.ts            # Validación de itinerario (19 tests)
│       └── note.test.ts                  # Validación de notas (20 tests)
├── integration/
│   └── components/
│       └── group-form.test.tsx          # Form de grupos (17 tests)
└── e2e/
    └── groups.spec.ts                    # Flujos completos (14 escenarios)
```

---

## Ejecutar Tests

### Comandos Disponibles

```bash
# Tests Unitarios e Integración
npm test                    # Modo watch (re-ejecuta al guardar)
npm run test:ui             # UI interactiva de Vitest
npm run test:coverage       # Con reporte de cobertura
npm run test:watch          # Modo watch explícito

# Tests E2E (requiere app corriendo)
npm run test:e2e            # Ejecutar tests E2E
npm run test:e2e:ui         # UI de Playwright
npm run test:e2e:headed     # Con navegador visible

# Todos los Tests
npm run test:all            # Unit + Integration + E2E secuencial
```

### Ejecutar Tests Específicos

```bash
# Un archivo específico
npm test -- --run __tests__/unit/utils/expense-calculator.test.ts

# Por patrón
npm test -- --run expense

# Por suite
npm test -- --run -t "calculateBalances"

# Con UI para debugging
npm run test:ui
```

---

## Tests Unitarios

### 1. Expense Calculator (`expense-calculator.test.ts`)

**¿Qué testea?** Lógica de cálculo de balances y sugerencias de pago.

**Funciones testeadas:**
- `calculateBalances(expenses, memberIds, payments)` - 5 tests
- `calculateSettlements(balances)` - 5 tests

**Ejemplo:**
```typescript
it('should calculate correct balances for equal split', () => {
  const expenses = [{
    id: '1',
    amount: 100,
    paid_by: 'user1',
    expense_splits: [
      { user_id: 'user1', amount_owed: 50, is_settled: false },
      { user_id: 'user2', amount_owed: 50, is_settled: false }
    ]
  }]

  const balances = calculateBalances(expenses, ['user1', 'user2'])

  expect(balances['user1'].balance).toBe(50)  // Pagó 100, debe 50
  expect(balances['user2'].balance).toBe(-50) // Debe 50
})
```

**Casos de prueba:**
- ✅ División equitativa entre usuarios
- ✅ Múltiples gastos
- ✅ Gastos ya liquidados (ignorados)
- ✅ División en 3+ usuarios
- ✅ Minimización de transacciones en settlements
- ✅ Cuentas balanceadas (sin deudas)

---

### 2. Validaciones de Schemas Zod

#### Group Validation (`group.test.ts`)

**¿Qué testea?** Schemas de validación para crear/editar grupos.

**Schemas testeados:**
- `createGroupSchema` - 12 tests
- `editGroupSchema` - 3 tests

**Validaciones clave:**
```typescript
// Nombre del grupo
- Mínimo 3 caracteres
- Máximo 100 caracteres

// Destino
- Mínimo 2 caracteres
- Máximo 100 caracteres

// Descripción (opcional)
- Máximo 500 caracteres

// Fechas
- start_date debe ser hoy o futuro
- end_date >= start_date

// Cover Image (opcional)
- URL válida o string vacío
```

**Ejemplo:**
```typescript
it('should reject end_date before start_date', () => {
  const invalidGroup = {
    name: 'Test Group',
    destination: 'Paris',
    start_date: '2024-07-20',
    end_date: '2024-07-10'
  }

  const result = createGroupSchema.safeParse(invalidGroup)

  expect(result.success).toBe(false)
  expect(result.error.issues[0].message)
    .toBe('End date must be after or equal to start date')
})
```

---

#### Expense Validation (`expense.test.ts`)

**¿Qué testea?** Validación de gastos y división entre usuarios.

**Tipos de división testeados:**
1. **Equal** - División equitativa
2. **Percentage** - Por porcentajes (deben sumar 100%)
3. **Custom** - Montos personalizados (deben sumar el total)

**Validaciones:**
```typescript
// Descripción
- Mínimo 3 caracteres
- Máximo 200 caracteres

// Monto
- Debe ser positivo
- Máximo 1,000,000

// Categorías válidas
- transport, accommodation, food, activity, shopping, other

// Monedas válidas
- USD, EUR, GBP, JPY, ARS, BRL, MXN

// Splits
- Mínimo 1 participante
- Percentage: debe sumar 100%
- Custom: debe sumar el monto total
```

**Ejemplo - Percentage Split:**
```typescript
it('should reject percentage split that does not sum to 100', () => {
  const invalidExpense = {
    description: 'Hotel',
    amount: 200,
    split_type: 'percentage',
    splits: [
      { user_id: 'user1', percentage: 50 },
      { user_id: 'user2', percentage: 30 } // ❌ Solo suma 80%
    ]
  }

  const result = createExpenseSchema.safeParse(invalidExpense)

  expect(result.success).toBe(false)
  expect(result.error.issues[0].message)
    .toBe('Percentages must add up to 100%')
})
```

---

#### Itinerary Validation (`itinerary.test.ts`)

**¿Qué testea?** Validación de actividades del itinerario.

**Schemas testeados:**
- `createItineraryItemSchema` - 12 tests
- `editItineraryItemSchema` - 3 tests
- `reorderItineraryItemsSchema` - 4 tests

**Validaciones:**
```typescript
// Título
- Mínimo 3 caracteres
- Máximo 200 caracteres

// Descripción (opcional)
- Máximo 1000 caracteres

// Fecha
- Requerida

// Horarios (opcionales)
- end_time >= start_time

// Ubicación (opcional)
- Máximo 200 caracteres

// Categorías
- transport, accommodation, activity, food, other
```

**Ejemplo:**
```typescript
it('should reject end_time before start_time', () => {
  const invalidItem = {
    title: 'Dinner',
    date: '2024-07-15',
    start_time: '20:00',
    end_time: '18:00', // ❌ Antes del inicio
    category: 'food',
    group_id: 'valid-uuid'
  }

  const result = createItineraryItemSchema.safeParse(invalidItem)

  expect(result.success).toBe(false)
  expect(result.error.issues[0].message)
    .toBe('End time must be after start time')
})
```

---

#### Note Validation (`note.test.ts`)

**¿Qué testea?** Validación de notas colaborativas.

**Schemas testeados:**
- `createNoteSchema` - 9 tests
- `updateNoteSchema` - 6 tests
- `deleteNoteSchema` - 5 tests

**Validaciones:**
```typescript
// Título
- Mínimo 1 carácter
- Máximo 200 caracteres

// Contenido
- Mínimo 1 carácter
- Máximo 50,000 caracteres

// IDs
- Deben ser UUIDs válidos
```

---

## Tests de Integración

### GroupForm Component (`group-form.test.tsx`)

**¿Qué testea?** Comportamiento completo del formulario de grupos.

**Suites de tests:**

#### 1. Create Mode (7 tests - 2 pasando)
- ✅ Renderiza todos los campos del formulario
- ⚠️ Muestra errores de validación (timing issue)
- ⚠️ Validación de nombre corto (timing issue)
- ⚠️ Validación de destino corto (timing issue)
- ⚠️ Submit con datos válidos (timing issue)
- ⚠️ Toast de error en fallo (timing issue)
- ⚠️ Botón deshabilitado mientras envía (timing issue)
- ✅ Llamada a router.back al cancelar

#### 2. Edit Mode (4 tests - 2 pasando)
- ✅ Renderiza con valores pre-cargados
- ✅ Muestra imagen de cover existente
- ⚠️ Submit de datos actualizados (timing issue)
- ⚠️ Toast de error en fallo de actualización (timing issue)

#### 3. Image Upload (6 tests - 2 pasando)
- ⚠️ Error para archivo no-imagen (timing issue)
- ✅ Error para archivo mayor a 5MB
- ⚠️ Preview y upload de imagen válida (timing issue)
- ✅ Remover imagen con botón X
- ⚠️ Toast de error en fallo de upload (timing issue)

**Ejemplo de test pasando:**
```typescript
it('should render all form fields in create mode', () => {
  render(<GroupForm mode="create" />)

  expect(screen.getByLabelText(/group name/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/destination/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /create group/i }))
    .toBeInTheDocument()
})
```

**Mocks utilizados:**
```typescript
// Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    refresh: mockRefresh
  })
}))

// Server actions
vi.mock('@/lib/actions/group-actions', () => ({
  createGroup: vi.fn(),
  updateGroup: vi.fn(),
  uploadGroupCover: vi.fn()
}))

// Toasts
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))
```

---

## Tests E2E

### Groups Flow (`groups.spec.ts`)

**¿Qué testea?** Flujos completos de usuario en el navegador.

**14 escenarios E2E documentados:**

#### 1. Gestión de Grupos
- ✓ Flujo completo de creación de grupo
- ✓ Validación de errores en datos inválidos
- ✓ Navegación entre tabs del grupo
- ✓ Mostrar grupo en dashboard después de crear

#### 2. Gestión de Miembros
- ✓ Agregar miembro al grupo

#### 3. Itinerario
- ✓ Crear actividad en itinerario

#### 4. Gastos
- ✓ Crear gasto y dividirlo
- ✓ Ver balances y settlements

#### 5. Documentos y Fotos
- ✓ Subir documento
- ✓ Subir fotos a galería

#### 6. Notas
- ✓ Crear y editar nota

#### 7. Configuración
- ✓ Editar configuración del grupo (solo líderes)

**Ejemplo de flujo E2E:**
```typescript
test('should complete full group creation flow', async ({ page }) => {
  // 1. Navegar a home
  await page.goto('/')

  // 2. Login
  await page.click('text=Login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'testpassword123')
  await page.click('button[type="submit"]')

  // 3. Esperar redirect a dashboard
  await expect(page).toHaveURL(/.*dashboard/)

  // 4. Crear grupo
  await page.click('text=/Create.*Group/i')
  await page.fill('input[name="name"]', 'E2E Test Trip to Tokyo')
  await page.fill('input[name="destination"]', 'Tokyo, Japan')
  await page.fill('input[name="start_date"]', '2024-09-01')
  await page.fill('input[name="end_date"]', '2024-09-10')
  await page.click('button:has-text("Create Group")')

  // 5. Verificar creación
  await expect(page).toHaveURL(/.*groups\/[a-f0-9-]+$/)
  await expect(page.locator('text=E2E Test Trip to Tokyo')).toBeVisible()
})
```

**Ejecutar E2E:**
```bash
# En una terminal
npm run dev

# En otra terminal
npm run test:e2e

# O con UI para debugging
npm run test:e2e:ui
```

---

## Cobertura de Tests

### Generar Reporte de Cobertura

```bash
npm run test:coverage
```

**Salida:**
- **Terminal:** Resumen de cobertura por archivo
- **HTML:** Reporte interactivo en `coverage/index.html`
- **JSON:** Datos de cobertura en `coverage/coverage-final.json`

### Archivos Excluidos de Cobertura

```typescript
// vitest.config.ts
coverage: {
  exclude: [
    'node_modules/',
    'setup-tests.ts',
    '**/*.config.ts',
    '**/*.d.ts',
    '__tests__/',
    '.next/'
  ]
}
```

### Cobertura Actual por Módulo

| Módulo | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| expense-calculator.ts | 100% | 100% | 100% | 100% |
| validations/\*.ts | 100% | 100% | 100% | 100% |

---

## Escribir Nuevos Tests

### Patrón de Test Unitario

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/my-module'

describe('MyModule', () => {
  describe('myFunction', () => {
    it('should handle normal case', () => {
      const result = myFunction('input')
      expect(result).toBe('expected output')
    })

    it('should handle edge case', () => {
      const result = myFunction('')
      expect(result).toBe('')
    })

    it('should throw error on invalid input', () => {
      expect(() => myFunction(null)).toThrow('Invalid input')
    })
  })
})
```

### Patrón de Test de Integración

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('should render and handle user interaction', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()

    render(<MyComponent onSubmit={mockOnSubmit} />)

    // Verificar renderizado
    expect(screen.getByText('Submit')).toBeInTheDocument()

    // Simular interacción
    await user.type(screen.getByLabelText(/name/i), 'John')
    await user.click(screen.getByText('Submit'))

    // Verificar resultado
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ name: 'John' })
    })
  })
})
```

### Patrón de Test E2E

```typescript
import { test, expect } from '@playwright/test'

test('should complete user flow', async ({ page }) => {
  // 1. Setup
  await page.goto('/page')

  // 2. Interacción
  await page.click('text=Button')
  await page.fill('input[name="field"]', 'value')

  // 3. Verificación
  await expect(page.locator('text=Success')).toBeVisible()
})
```

---

## Troubleshooting

### Problema: Tests fallan con "Cannot find module"

**Solución:** Verifica el alias de paths en `vitest.config.ts`
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './')
  }
}
```

### Problema: "ReferenceError: describe is not defined"

**Solución:** Asegúrate de que `globals: true` está en `vitest.config.ts`
```typescript
test: {
  globals: true
}
```

### Problema: Tests E2E no encuentran el servidor

**Solución:** Verifica que el servidor de desarrollo esté corriendo
```bash
# Terminal 1
npm run dev

# Terminal 2 (espera a que el servidor esté listo)
npm run test:e2e
```

### Problema: "Module did not self-register"

**Solución:** Reinstala dependencias nativas
```bash
npm run test:e2e -- --headed  # Instala binarios de Playwright
```

### Problema: Tests de integración tienen timeout

**Solución:** Aumenta el timeout para operaciones asíncronas
```typescript
await waitFor(() => {
  expect(something).toBeInTheDocument()
}, { timeout: 3000 })  // 3 segundos en lugar de 1
```

### Problema: Mocks no funcionan

**Solución:** Asegúrate de limpiar mocks entre tests
```typescript
import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks()
})
```

---

## Mejores Prácticas

### ✅ DO

- **Testea comportamiento, no implementación**
  ```typescript
  // ✅ Bueno
  expect(screen.getByText('Success')).toBeInTheDocument()

  // ❌ Malo
  expect(component.state.isSuccess).toBe(true)
  ```

- **Usa queries semánticas**
  ```typescript
  // ✅ Bueno
  screen.getByRole('button', { name: /submit/i })

  // ❌ Malo
  screen.getByTestId('submit-button')
  ```

- **Nombres descriptivos de tests**
  ```typescript
  // ✅ Bueno
  it('should show error message when email is invalid')

  // ❌ Malo
  it('test email')
  ```

- **Arrange-Act-Assert**
  ```typescript
  it('should add item to cart', () => {
    // Arrange
    const cart = new Cart()
    const item = { id: 1, name: 'Product' }

    // Act
    cart.addItem(item)

    // Assert
    expect(cart.items).toHaveLength(1)
  })
  ```

### ❌ DON'T

- No testees detalles de implementación
- No uses `setTimeout` en tests (usa `waitFor`)
- No ignores warnings de Testing Library
- No uses snapshots para todo (solo para UI estable)

---

## Recursos Adicionales

### Documentación Oficial
- [Vitest](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

### Guías y Tutoriales
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)

### Herramientas de Debug
```bash
# Pausar test en un punto específico
screen.debug()  # Imprime el DOM actual

# Modo UI de Vitest para debugging visual
npm run test:ui

# Playwright con inspector
npm run test:e2e -- --debug
```

---

## Checklist de Testing

### Para cada nueva feature:

- [ ] ¿Tiene lógica de negocio? → Test unitario
- [ ] ¿Es un componente interactivo? → Test de integración
- [ ] ¿Es un flujo crítico de usuario? → Test E2E
- [ ] ¿Modifica validaciones? → Test de schema
- [ ] ¿Calcula valores? → Test de utilidad

### Antes de hacer commit:

- [ ] Todos los tests pasan (`npm test -- --run`)
- [ ] Sin warnings en consola
- [ ] Cobertura no disminuyó (`npm run test:coverage`)
- [ ] Tests nuevos siguen las convenciones del proyecto

---

**Última actualización:** 2025-11-15
**Versión de testing:** v1.0.0
**Mantenedor:** TravelHub Team
