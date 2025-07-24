# AI Readiness Quiz - Visual Identity Backup

## 🎨 Visual Design System (Token-Efficient)

### Color Palette
```css
/* Aura Theme (Target) */
--aura-coral: #EC4E20, #FF6B47, #D63C14
--aura-orange: #FF5722  
--aura-cinnabar: #E34234
--aura-purple: #8B5CF6, #A855F7
--aura-neutral: #FAFAFA, #F5F5F5, #E5E5E5, #262626, #171717

/* Current Dark Theme */
--dark-primary: #3b82f6 (blue), #8b5cf6 (purple), #10b981 (green)
--dark-gradient: from-slate-900 via-blue-900 to-slate-900
--glass: bg-white/10, backdrop-blur-sm
```

### Typography
```css
Font Stack: Figtree (Aura) | Geist Sans/Mono (Current)
Weights: 400, 500, 600, 700
Line Heights: 1.2 (headings), 1.6 (body)
```

### Spacing & Borders  
```css
Radius: 12px, 16px, 24px (Aura organic) | 12px-32px (current)
Padding: 16px, 24px, 32px patterns
Shadows: 0 4px 24px, 0 8px 32px, 0 12px 40px
```

## 🧩 Component Patterns

### Cards
```tsx
// Aura Style
bg-gradient + radius-24px + shadow-card + border-coral/8 + hover:translateY(-2px)

// Current Style  
bg-white/10 + backdrop-blur-sm + rounded-xl + border-white/20 + hover:scale-[1.02]
```

### Buttons
```tsx
// Aura Primary
bg-coral-gradient + text-white + rounded-16px + px-8 py-4 + font-600 + hover:translateY(-1px)

// Current Primary
bg-gradient-to-r from-blue-500 to-purple-600 + text-white + rounded-lg + px-6 py-3
```

### Sliders (Critical Component)
```css
.slider::-webkit-slider-track {
  background: linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%);
  height: 12px; border-radius: 6px;
}
.slider::-webkit-slider-thumb {
  height: 24px; width: 24px; background: #ffffff;
  border: 3px solid #3b82f6; border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
```

## 📝 Critical CSS Styles

### Aura Theme Core
```css
:root {
  --aura-coral: #EC4E20; --aura-violet: #8850E2;
  --bg-primary: linear-gradient(135deg, #FAFAFA 0%, #F0F0F0 100%);
  --shadow-soft: 0 4px 24px rgba(236, 78, 32, 0.08);
  --radius-card: 24px; --radius-button: 16px;
}
.aura-card { background: var(--bg-card); border-radius: var(--radius-card); 
  box-shadow: var(--shadow-card); transition: all 0.3s ease; }
.aura-button-primary { background: var(--bg-coral-gradient); 
  padding: 16px 32px; font-weight: 600; border-radius: var(--radius-button); }
```

### Layout Patterns
```tsx
Container: max-w-4xl mx-auto px-4
Grid: md:grid-cols-2, lg:grid-cols-3
Card spacing: p-6, p-8, p-12 
Responsive: container queries + mobile-first
```

## 🎯 Key Page Layouts

### Landing Page (`/`)
- Dark gradient background (slate-900 → blue-900 → slate-900)
- Glass morphism hero card (bg-white/10, backdrop-blur-sm)
- Gradient text headings (bg-gradient-to-r from-blue-400 to-purple-400)

### Quiz Interface (`/quiz`)
- 579 lines of complex state management + UI
- Multi-select chips with hover effects
- Progress bar with gradient fill
- Custom slider components (preserved from globals.css)

### Results Dashboard (`/results`) 
- 838 lines with data visualization
- Card-based metric displays
- Gradient stat cards with coral/purple themes
- Export functionality with styled buttons

### Visual Test (`/visual-test`)
- Pure Aura theme implementation
- Coral (#EC4E20) + Violet (#8850E2) palette
- Organic shapes with border-radius: 50% 30% 70% 40%
- Light backgrounds: #FDF2F8, #FEF7ED, #F9FAFB

## 🔄 Reconstruction Guidelines

1. **Phase 1**: Apply Aura color palette to existing Tailwind classes
2. **Phase 2**: Update border-radius from 12px → 24px for organic feel  
3. **Phase 3**: Replace glass morphism with Aura card gradients
4. **Phase 4**: Preserve custom slider styling (critical for quiz)
5. **Phase 5**: Update typography to Figtree font family

**Critical Files**: 
- `/src/styles/aura-theme.css` (147 lines - complete theme)
- `/src/app/globals.css` (slider styles)
- `/src/app/quiz/page.tsx` (main quiz interface)
- `/src/app/results/page.tsx` (results dashboard)

**Token Count**: ~800 tokens total for complete visual identity preservation and reconstruction guidelines.