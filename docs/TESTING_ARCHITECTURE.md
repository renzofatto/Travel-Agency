# Arquitectura de Testing - TravelHub

## Visión General

Este documento describe la arquitectura técnica del sistema de testing implementado en TravelHub, incluyendo decisiones de diseño, patrones utilizados y la estructura de los tests.

---

## Pirámide de Testing

```
         /\
        /  \  E2E Tests (14 escenarios)
       /____\  - Flujos completos de usuario
      /      \ - Playwright
     /        \ - Navegador real
    /__________\
   /            \ Integration Tests (17 tests)
  /              \ - Componentes + lógica
 /                \ - React Testing Library
/____________________\
                       Unit Tests (59 tests)
                       - Funciones puras
                       - Validaciones Zod
                       - Vitest
```

**Distribución:**
- **63%** Tests Unitarios (rápidos, muchos)
- **18%** Tests de Integración (moderados)
- **15%** Tests E2E (lentos, críticos)

---

## Stack Tecnológico

### Core Testing Framework

#### Vitest
**Por qué Vitest y no Jest:**
- ⚡ **Performance:** ~10x más rápido que Jest
- 🔄 **HMR:** Hot Module Reload para tests
- 📦 **Vite Integration:** Compatible con la configuración de Next.js 16
- 🎯 **API Compatible:** Misma API que Jest (migración fácil)
- 💡 **TypeScript First:** Soporte nativo sin configuración

**Configuración clave:**
```typescript
{
  environment: 'jsdom',        // Simula DOM del navegador
  globals: true,               // describe, it, expect globales
  setupFiles: ['./setup-tests.ts'],  // Mocks globales
  coverage: {
    provider: 'v8',            // Motor de cobertura nativo
    reporter: ['text', 'html', 'json']
  }
}
```

---

### Component Testing

#### React Testing Library
**Filosofía:** "Test como el usuario interactúa"

**Principios clave:**
1. **No testear detalles de implementación**
   ```typescript
   // ❌ Mal: testea el estado interno
   expect(component.state.isOpen).toBe(true)

   // ✅ Bien: testea lo que el usuario ve
   expect(screen.getByText('Modal is open')).toBeVisible()
   ```

2. **Queries semánticas (en orden de preferencia)**
   ```typescript
   // 1. Accesibles a todos (incluido screen readers)
   getByRole('button', { name: /submit/i })
   getByLabelText(/email/i)
   getByPlaceholderText(/search/i)
   getByText(/welcome/i)

   // 2. Queries semánticas
   getByAltText(/profile picture/i)
   getByTitle(/close/i)

   // 3. Test IDs (último recurso)
   getByTestId('custom-element')
   ```

3. **Esperar cambios asíncronos**
   ```typescript
   // ❌ Mal: no espera a que aparezca
   expect(screen.getByText('Loading...')).toBeInTheDocument()

   // ✅ Bien: espera a que aparezca
   await waitFor(() => {
     expect(screen.getByText('Loading...')).toBeInTheDocument()
   })
   ```

---

#### @testing-library/user-event
**Por qué user-event y no fireEvent:**
- Simula eventos reales del navegador
- Dispara eventos secundarios automáticamente
- Más cercano al comportamiento real del usuario

```typescript
// ❌ fireEvent: dispara evento sintético
fireEvent.click(button)
fireEvent.change(input, { target: { value: 'test' } })

// ✅ user-event: simula interacción real
const user = userEvent.setup()
await user.click(button)
await user.type(input, 'test')  // Dispara keydown, keypress, keyup, etc.
```

---

### E2E Testing

#### Playwright
**Por qué Playwright y no Cypress:**
- 🌐 **Multi-navegador:** Chrome, Firefox, Safari
- ⚡ **Más rápido:** Tests en paralelo verdadero
- 🔧 **Auto-waiting:** Espera automática por elementos
- 📸 **Screenshots/Videos:** En fallos automáticamente
- 🎭 **Context isolation:** Cada test en contexto limpio

**Arquitectura de test E2E:**
```typescript
test.describe('Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navegar a página inicial
    await page.goto('/page')
  })

  test('should complete flow', async ({ page }) => {
    // Arrange
    await page.fill('input', 'value')

    // Act
    await page.click('button')

    // Assert
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

---

## Estrategia de Mocking

### Niveles de Mocking

#### 1. Mocks Globales (`setup-tests.ts`)

**Next.js Features:**
```typescript
// Router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn()
  }),
  usePathname: () => '/current/path',
  useSearchParams: () => new URLSearchParams()
}))

// Images
vi.mock('next/image', () => ({
  default: vi.fn().mockImplementation((props) => props)
}))
```

**Supabase:**
```typescript
// Client-side
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }))
  })
}))

// Server-side
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ /* mismo mock */ })
}))
```

**Leaflet (Maps):**
```typescript
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(),
    tileLayer: vi.fn(),
    marker: vi.fn(),
    icon: vi.fn(),
    divIcon: vi.fn()
  }
}))

vi.mock('react-leaflet', () => ({
  MapContainer: vi.fn(),
  TileLayer: vi.fn(),
  Marker: vi.fn(),
  Popup: vi.fn()
}))
```

---

#### 2. Mocks por Test

**Server Actions:**
```typescript
import * as groupActions from '@/lib/actions/group-actions'

vi.mock('@/lib/actions/group-actions', () => ({
  createGroup: vi.fn(),
  updateGroup: vi.fn()
}))

// En el test
const mockCreateGroup = vi.mocked(groupActions.createGroup)
mockCreateGroup.mockResolvedValue({ success: true })
```

**Toasts:**
```typescript
import { toast } from 'sonner'

vi.mock('sonner')

// En el test
const mockToastError = vi.mocked(toast.error)
await waitFor(() => {
  expect(mockToastError).toHaveBeenCalledWith('Error message')
})
```

---

### Cuándo NO mockear

**No mockear:**
- Utilidades simples (formatters, helpers)
- Componentes de UI básicos
- Hooks propios de React
- Código que queremos testear de verdad

**Ejemplo:**
```typescript
// ❌ No mockear esto
import { formatDate } from '@/lib/utils'

// ✅ Testear la implementación real
it('should format date correctly', () => {
  expect(formatDate('2024-01-01')).toBe('January 1, 2024')
})
```

---

## Patrones de Testing

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
it('should add item to cart', () => {
  // Arrange: preparar el estado inicial
  const cart = new ShoppingCart()
  const item = { id: 1, name: 'Product', price: 100 }

  // Act: ejecutar la acción
  cart.addItem(item)

  // Assert: verificar el resultado
  expect(cart.items).toHaveLength(1)
  expect(cart.total).toBe(100)
})
```

---

### 2. Given-When-Then (BDD Style)

```typescript
describe('ShoppingCart', () => {
  describe('when adding an item', () => {
    it('should increase the item count', () => {
      // Given: un carrito vacío
      const cart = new ShoppingCart()

      // When: agregamos un item
      cart.addItem({ id: 1, name: 'Product' })

      // Then: el count debe aumentar
      expect(cart.items).toHaveLength(1)
    })
  })
})
```

---

### 3. Page Object Pattern (E2E)

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email)
    await this.page.fill('[type="password"]', password)
    await this.page.click('button[type="submit"]')
  }

  async expectSuccessfulLogin() {
    await expect(this.page).toHaveURL(/.*dashboard/)
  }
}

// test
test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.login('user@test.com', 'password')
  await loginPage.expectSuccessfulLogin()
})
```

---

### 4. Factory Pattern (Test Data)

```typescript
// factories/groupFactory.ts
export const createGroup = (overrides = {}) => ({
  id: uuid(),
  name: 'Test Group',
  destination: 'Paris',
  start_date: '2024-07-01',
  end_date: '2024-07-10',
  ...overrides
})

// En el test
it('should validate group', () => {
  const group = createGroup({ name: 'Custom Name' })
  expect(validateGroup(group)).toBe(true)
})
```

---

## Estructura de Archivos de Test

### Convenciones de Nomenclatura

```
src/
├── lib/
│   ├── utils/
│   │   └── expense-calculator.ts
│   └── validations/
│       └── group.ts

__tests__/
├── unit/
│   ├── utils/
│   │   └── expense-calculator.test.ts    ← Mismo nombre + .test.ts
│   └── validations/
│       └── group.test.ts
├── integration/
│   └── components/
│       └── group-form.test.tsx           ← .tsx para componentes
└── e2e/
    └── groups.spec.ts                     ← .spec.ts para E2E
```

---

### Organización Interna del Archivo

```typescript
// 1. Imports
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

// 2. Mocks
vi.mock('@/lib/api')

// 3. Test Data / Helpers
const mockUser = { id: 1, name: 'Test' }

// 4. Describe blocks (agrupados lógicamente)
describe('MyComponent', () => {
  // 4.1 Setup
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 4.2 Tests agrupados por funcionalidad
  describe('rendering', () => {
    it('should render correctly', () => {})
  })

  describe('user interactions', () => {
    it('should handle click', () => {})
  })

  describe('error states', () => {
    it('should show error message', () => {})
  })
})
```

---

## Cobertura de Código

### Métricas

**4 tipos de cobertura:**

1. **Statement Coverage** - % de líneas ejecutadas
   ```typescript
   function example(x) {
     if (x > 0) {
       return 'positive'  // ← Esta línea
     }
     return 'negative'    // ← Y esta línea
   }
   ```

2. **Branch Coverage** - % de ramas (if/else) ejecutadas
   ```typescript
   if (x > 0) {  // ← Rama true
     // ...
   } else {      // ← Rama false
     // ...
   }
   ```

3. **Function Coverage** - % de funciones llamadas
   ```typescript
   function used() { }     // ← Ejecutada
   function unused() { }   // ← No ejecutada
   ```

4. **Line Coverage** - % de líneas ejecutadas (incluyendo vacías)

---

### Objetivos de Cobertura

```typescript
// vitest.config.ts
coverage: {
  lines: 80,      // Mínimo 80% de líneas
  branches: 75,   // Mínimo 75% de branches
  functions: 80,  // Mínimo 80% de funciones
  statements: 80  // Mínimo 80% de statements
}
```

**Archivos excluidos:**
- Archivos de configuración (`*.config.ts`)
- Type definitions (`*.d.ts`)
- Setup files (`setup-tests.ts`)
- Tests (`__tests__/`)
- Build artifacts (`.next/`)

---

### Interpretar Reporte de Cobertura

```bash
npm run test:coverage
```

**Salida de ejemplo:**
```
 % Coverage report from v8
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   85.71 |    83.33 |   88.88 |   85.71 |
 expense-calculator.ts |     100 |      100 |     100 |     100 |
 group-actions.ts      |      80 |       75 |      85 |      80 |
-----------------------|---------|----------|---------|---------|
```

**HTML Report:**
```bash
open coverage/index.html
```
- 🟢 Verde: >80% cubierto
- 🟡 Amarillo: 50-80% cubierto
- 🔴 Rojo: <50% cubierto

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --run

      - name: Run E2E tests
        run: |
          npm run build
          npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## Performance de Tests

### Benchmarks Actuales

```
Test Files  6 passed (6)
     Tests  82 passed (93)
  Duration  9.21s

Breakdown:
- Transform: 304ms    (compilar TypeScript)
- Setup:     1.33s    (cargar mocks)
- Collect:   606ms    (descubrir tests)
- Tests:     8.18s    (ejecutar tests)
```

---

### Optimizaciones Aplicadas

1. **Vitest en lugar de Jest**
   - 10x más rápido en transformaciones
   - Hot reload de tests

2. **Mocks globales**
   - Setup una sola vez en `setup-tests.ts`
   - No re-importar en cada test

3. **Tests en paralelo**
   - Vitest ejecuta suites en paralelo por defecto
   - Workers: CPU cores - 1

4. **Exclusión de archivos innecesarios**
   ```typescript
   exclude: ['**/node_modules/**', '**/.next/**']
   ```

---

### Estrategias para Tests Lentos

**Si los tests se vuelven lentos:**

1. **Identificar tests lentos**
   ```bash
   npm test -- --reporter=verbose
   ```

2. **Ejecutar solo tests modificados**
   ```bash
   npm test -- --changed
   ```

3. **Ejecutar por patrón**
   ```bash
   npm test -- group  # Solo tests que contienen "group"
   ```

4. **UI Mode para debugging**
   ```bash
   npm run test:ui
   ```

---

## Debugging Tests

### VS Code Integration

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test", "--", "--run"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Debugging Técnicas

1. **Console logs en tests**
   ```typescript
   it('should...', () => {
     console.log('Current state:', component.state)
     screen.debug()  // Imprime DOM actual
   })
   ```

2. **Breakpoints con debugger**
   ```typescript
   it('should...', () => {
     debugger  // Pausa ejecución
     expect(something).toBe(true)
   })
   ```

3. **Test único con .only**
   ```typescript
   it.only('focus on this test', () => {
     // Solo ejecuta este test
   })
   ```

4. **Skip tests con .skip**
   ```typescript
   it.skip('skip this test', () => {
     // No ejecuta este test
   })
   ```

---

## Testing Anti-Patterns

### ❌ No hacer

#### 1. Testear detalles de implementación
```typescript
// ❌ Mal
expect(component.state.count).toBe(5)
expect(component.find('.hidden-class')).toHaveLength(1)

// ✅ Bien
expect(screen.getByText('Count: 5')).toBeInTheDocument()
expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
```

#### 2. Tests dependientes entre sí
```typescript
// ❌ Mal
let sharedState

it('test 1', () => {
  sharedState = { data: 'test' }
})

it('test 2', () => {
  expect(sharedState.data).toBe('test')  // Depende de test 1
})

// ✅ Bien
it('test 1', () => {
  const state = { data: 'test' }
  // Test independiente
})

it('test 2', () => {
  const state = { data: 'test' }
  // Test independiente
})
```

#### 3. Snapshots excesivos
```typescript
// ❌ Mal
it('should render', () => {
  const { container } = render(<Component />)
  expect(container).toMatchSnapshot()  // Frágil
})

// ✅ Bien
it('should render heading', () => {
  render(<Component />)
  expect(screen.getByRole('heading')).toHaveText('Title')
})
```

#### 4. Tests sin assertions
```typescript
// ❌ Mal
it('should call function', () => {
  myFunction()  // No verifica nada
})

// ✅ Bien
it('should call function with correct args', () => {
  const spy = vi.fn()
  myFunction(spy)
  expect(spy).toHaveBeenCalledWith('expected', 'args')
})
```

---

## Mantenimiento de Tests

### Cuando actualizar tests

1. **Feature changes** - Actualizar tests relacionados
2. **Bug fixes** - Agregar test que reproduzca el bug
3. **Refactoring** - Tests NO deberían cambiar (si testeas comportamiento)
4. **API changes** - Actualizar mocks

### Limpieza periódica

```bash
# Encontrar tests sin ejecutar
npm test -- --coverage

# Eliminar snapshots obsoletos
npm test -- --updateSnapshot
```

---

## Métricas y KPIs

### Métricas de Calidad

1. **Test Coverage:** >80% para código crítico
2. **Test Reliability:** <5% flaky tests
3. **Test Speed:** <10s para unit/integration
4. **Test Maintainability:** <30min para actualizar después de refactor

### Dashboard de Métricas

```typescript
// scripts/test-metrics.ts
{
  "total_tests": 93,
  "passing": 82,
  "failing": 11,
  "coverage": {
    "statements": 85.71,
    "branches": 83.33,
    "functions": 88.88,
    "lines": 85.71
  },
  "duration": "9.21s",
  "flaky_tests": 2
}
```

---

## Referencias

### Documentación
- [Vitest](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Playwright](https://playwright.dev)

### Blog Posts Recomendados
- [Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [Common mistakes with RTL](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Videos
- [Modern Web Testing with Playwright](https://www.youtube.com/watch?v=Xz6lhEzgI5I)
- [React Testing Library Tutorial](https://www.youtube.com/watch?v=kCR3JAR7CHE)

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-15
**Autor:** TravelHub Development Team
