# 6. Components

## 6.1 Frontend Component Architecture

**Category Card Component** (`apps/web/components/category-card.tsx`)
```typescript
interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    budget: number;
    spend: number;
    savings: number;
    recommendedRetailer: string;
    itemCount: number;
  };
  onClick: () => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  const status = getStatus(category.spend, category.budget);
  
  return (
    <Card className={cn("cursor-pointer", statusColors[status])} onClick={onClick}>
      <CardHeader>
        <CardTitle>{category.name}</CardTitle>
        <Badge variant={status}>{category.itemCount} items</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Budget:</span>
            <span className="font-bold">R{category.budget}</span>
          </div>
          <div className="flex justify-between">
            <span>Spend:</span>
            <span>R{category.spend}</span>
          </div>
          {category.savings > 0 && (
            <Alert variant="success">
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                Save R{category.savings} at {category.recommendedRetailer}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## 6.2 Key UI Components

1. **CategoryDashboard** - Main screen with category cards grid
2. **CategoryDetailView** - Expandable category with item list
3. **OptimizationResults** - Store recommendations with map
4. **ShoppingListExport** - PDF/App export options
5. **OnboardingWizard** - 5-screen persona/location/loyalty setup
6. **ThemeToggle** - Dark mode switcher (from Story 1.2)

## 6.3 Accessibility Patterns

### 6.3.1 Semantic HTML Guidelines

**Use semantic HTML elements for proper document structure:**

```typescript
// ✅ CORRECT: Semantic HTML with proper landmarks
export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <>
      <header role="banner">
        <nav role="navigation" aria-label="Main navigation">
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/lists">Shopping Lists</a></li>
            <li><a href="/profile">Profile</a></li>
          </ul>
        </nav>
      </header>
      <main role="main" id="main-content">
        {children}
      </main>
      <footer role="contentinfo">
        <p>&copy; 2025 TillLess</p>
      </footer>
    </>
  );
}

// ❌ INCORRECT: Generic divs without semantic meaning
<div className="header">
  <div className="nav">...</div>
</div>
<div className="content">...</div>
```

**Button vs Link Guidelines:**
- Use `<button>` for actions (submit form, open modal, toggle state)
- Use `<a>` for navigation (go to new page, scroll to section)
- Never use `<div onClick>` or `<span onClick>` for interactive elements

```typescript
// ✅ CORRECT
<button onClick={handleSaveList}>Save List</button>
<a href="/help">Help Center</a>

// ❌ INCORRECT
<div onClick={handleSaveList}>Save List</div>
<button onClick={() => router.push('/help')}>Help Center</button>
```

### 6.3.2 ARIA Implementation Guidelines

**ARIA Labels for Screen Readers:**

```typescript
// Icon-only buttons require aria-label
<button
  onClick={handleDelete}
  aria-label="Delete shopping list"
  className="icon-button"
>
  <TrashIcon className="h-5 w-5" />
</button>

// Form inputs require labels
<label htmlFor="list-name" className="sr-only">
  Shopping List Name
</label>
<input
  id="list-name"
  type="text"
  placeholder="e.g., Weekly Groceries"
  aria-describedby="list-name-hint"
/>
<p id="list-name-hint" className="text-sm text-muted-foreground">
  Choose a memorable name for your list
</p>
```

**ARIA Live Regions for Dynamic Content:**

```typescript
// Optimization results that update dynamically
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="optimization-status"
>
  {isOptimizing ? (
    <span>Calculating savings...</span>
  ) : (
    <span>You can save R{savings} by shopping at {storeCount} stores</span>
  )}
</div>

// Error messages require assertive announcements
<div
  role="alert"
  aria-live="assertive"
  className="error-message"
>
  {error && <span>{error.message}</span>}
</div>
```

**ARIA Expanded for Collapsible Sections:**

```typescript
export function CategoryDetailView({ category }: CategoryDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="category-detail">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`category-items-${category.id}`}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category.name} category`}
      >
        <ChevronDown
          className={cn("transition-transform", isExpanded && "rotate-180")}
          aria-hidden="true"
        />
        {category.name}
      </button>

      <div
        id={`category-items-${category.id}`}
        className={cn("items-list", !isExpanded && "hidden")}
        aria-hidden={!isExpanded}
      >
        {/* Item list content */}
      </div>
    </div>
  );
}
```

### 6.3.3 Keyboard Navigation Patterns

**Tab Order and Focus Management:**

```typescript
// Modal dialogs must trap focus and restore on close
export function AddItemModal({ isOpen, onClose }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus first input in modal
      modalRef.current?.querySelector<HTMLElement>('input, button')?.focus();

      // Trap focus within modal
      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusableElements || focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Escape key closes modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
      className="modal-overlay"
    >
      <div className="modal-content">
        <h2 id="modal-title">Add Item</h2>
        {/* Modal content */}
        <button onClick={onClose} aria-label="Close dialog">
          Close
        </button>
      </div>
    </div>
  );
}
```

**Keyboard Shortcuts Documentation:**

| Key | Action | Context |
|-----|--------|---------|
| `Tab` | Navigate to next focusable element | Global |
| `Shift + Tab` | Navigate to previous focusable element | Global |
| `Enter` | Activate button or link | Buttons, links |
| `Space` | Toggle checkbox, activate button | Checkboxes, buttons |
| `Escape` | Close modal, dismiss popover | Modals, popovers |
| `Arrow Up/Down` | Navigate list items | Lists, dropdowns |
| `Home` | Jump to first item | Lists |
| `End` | Jump to last item | Lists |
| `/` | Focus search input | Dashboard |
| `Ctrl/Cmd + S` | Save current list | List editor |

### 6.3.4 Color Contrast & Visual Design

**WCAG AA Compliance Requirements:**

- **Text Contrast:** Minimum 4.5:1 ratio for normal text (14px+), 3:1 for large text (18px+ or 14px+ bold)
- **UI Component Contrast:** Minimum 3:1 ratio for interactive elements (buttons, form borders, focus indicators)
- **Focus Indicators:** Visible focus indicator with 3:1 contrast against background (2px outline minimum)

```typescript
// Tailwind v4 OKLCH colors already meet WCAG AA standards
// See Story 1.2 for complete color palette

// Focus ring styles (apply to all interactive elements)
const focusStyles = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

// Example usage
<button className={cn("btn", focusStyles)}>
  Save List
</button>
```

**Budget Status Colors (Green/Yellow/Red) with WCAG AA:**

```typescript
// Don't rely on color alone - use icons and text labels
export function BudgetStatusBadge({ status }: { status: 'under' | 'near' | 'over' }) {
  const variants = {
    under: {
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />,
      label: "Under budget"
    },
    near: {
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: <AlertCircleIcon className="h-4 w-4" aria-hidden="true" />,
      label: "Near budget limit"
    },
    over: {
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      icon: <XCircleIcon className="h-4 w-4" aria-hidden="true" />,
      label: "Over budget"
    }
  };

  const { className, icon, label } = variants[status];

  return (
    <span className={cn("badge", className)}>
      {icon}
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{status === 'under' ? '✓' : status === 'near' ? '!' : '×'}</span>
    </span>
  );
}
```

### 6.3.5 Touch Target Sizing (Mobile)

**Minimum touch target size: 44px × 44px (NFR40)**

```typescript
// Button sizing guidelines
const buttonSizes = {
  sm: "h-9 px-3 min-w-[44px]",      // Small buttons: 36px height + 8px padding = 44px minimum
  md: "h-11 px-4 min-w-[44px]",     // Medium buttons: 44px height (default)
  lg: "h-14 px-6 min-w-[56px]",     // Large buttons: 56px height
};

// Icon-only buttons must have explicit size
<button
  className="w-11 h-11 rounded-md"  // 44px × 44px minimum
  aria-label="Delete item"
>
  <TrashIcon className="h-5 w-5" />
</button>

// Interactive list items
<li className="min-h-[44px] flex items-center px-4 py-2">
  <button className="flex-1 text-left">
    {item.name}
  </button>
</li>
```

### 6.3.6 Screen Reader Testing Checklist

**Testing Process (to be performed before Epic 8 completion):**

1. **macOS VoiceOver:**
   - Cmd + F5 to enable
   - Navigate dashboard with VO + arrow keys
   - Verify all interactive elements have labels
   - Test modals trap focus correctly

2. **Windows NVDA:**
   - Download from https://www.nvaccess.org/
   - Navigate with Tab, arrow keys, H (headings), F (forms)
   - Verify shopping list creation flow

3. **Mobile Screen Readers:**
   - iOS VoiceOver: Settings > Accessibility > VoiceOver
   - Android TalkBack: Settings > Accessibility > TalkBack
   - Test category card interactions with swipe gestures

**Automated Testing Tools:**

```bash
# Run axe-core accessibility tests in Playwright
# See docs/architecture/16-testing-strategy.md Section 16.3

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('Dashboard accessibility', async ({ page }) => {
  await page.goto('/dashboard');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
});
```

### 6.3.7 Reduced Motion Support

**Respect prefers-reduced-motion for animations (NFR39):**

```css
/* globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```typescript
// React: conditionally disable animations
import { useReducedMotion } from 'framer-motion';

export function AnimatedCard() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      {/* Card content */}
    </motion.div>
  );
}
```
