# Design Document

## Overview

This design addresses three critical issues in the CollectiSense application: fixing broken CRUD operations in the Prompt Repository, removing the SLA Compliance metric from the dashboard, and ensuring API endpoint consistency. The solution focuses on minimal, targeted changes that preserve existing functionality while resolving the identified problems.

## Architecture

### Frontend-Backend Communication Flow
```
Frontend Components → API Calls → FastAPI Backend → Database
     ↓                    ↓              ↓            ↓
PromptRepository.tsx → /api/prompts → prompts.py → SQLite DB
MainCarousel.tsx     → (no API)    → (static)   → (none)
```

### Component Hierarchy
```
Dashboard.tsx
├── MainCarousel.tsx (modified - remove SLA stat)
└── PromptRepository.tsx (modified - fix API calls)
```

## Components and Interfaces

### 1. PromptRepository Component Fixes

**Current Issues:**
- Uses `/api/prompts/` with trailing slash causing 307 redirects
- Inconsistent error handling for failed API calls

**Design Solution:**
- Remove trailing slashes from all API endpoint URLs
- Maintain existing component structure and functionality
- Preserve all existing features (search, filter, CRUD operations)

**API Endpoint Changes:**
```typescript
// Current (broken)
fetch('/api/prompts/')           // GET all prompts
fetch('/api/prompts/', {...})   // POST new prompt

// Fixed
fetch('/api/prompts')            // GET all prompts  
fetch('/api/prompts', {...})    // POST new prompt
```

### 2. MainCarousel Component Modifications

**Current Layout:**
- 4 carousel items (correct)
- 3 quick stats: Active Transactions, Processing Speed, SLA Compliance

**Design Solution:**
- Keep 4 carousel items unchanged
- Remove SLA Compliance stat entirely
- Maintain 2-column grid layout for remaining stats
- Preserve visual balance and spacing

**Layout Structure:**
```
Grid Layout: 1 md:2 lg:4 (carousel items)
Stats Layout: 1 md:2 (reduced from 1 md:3)
```

### 3. Backend API Consistency

**Current State:**
- Backend handles requests correctly
- Frontend uses inconsistent URL patterns

**Design Approach:**
- No backend changes required
- Frontend standardization only
- Maintain existing FastAPI router configuration

## Data Models

### Prompt Model (Unchanged)
```typescript
interface Prompt {
  id: number
  agent_role: string
  prompt_type: string
  prompt_text: string
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### PromptCreate Model (Unchanged)
```typescript
interface PromptCreate {
  agent_role: string
  prompt_type: string
  prompt_text: string
}
```

## Error Handling

### API Error Handling Strategy
1. **Network Errors**: Display user-friendly messages
2. **HTTP Errors**: Log to console, show generic error to user
3. **Validation Errors**: Show specific field-level errors
4. **Timeout Errors**: Provide retry mechanism

### Error Recovery Patterns
```typescript
try {
  const response = await fetch('/api/prompts')
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  // Handle success
} catch (error) {
  console.error('API Error:', error)
  // Show user-friendly message
}
```

## Testing Strategy

### Frontend Testing Approach
1. **Component Testing**: Verify UI renders correctly after changes
2. **API Integration Testing**: Test all CRUD operations work
3. **Visual Regression Testing**: Ensure layout changes don't break design
4. **Responsive Testing**: Verify 2-stat layout works on all screen sizes

### Backend Testing Approach
1. **Endpoint Testing**: Verify existing API endpoints still work
2. **CRUD Operation Testing**: Test all database operations
3. **Error Handling Testing**: Verify proper error responses

### Manual Testing Checklist
- [ ] Prompt Repository loads without errors
- [ ] Create new prompt works
- [ ] Edit existing prompt works  
- [ ] Delete prompt works
- [ ] Search and filter functions work
- [ ] Dashboard shows 2 stats instead of 3
- [ ] SLA Compliance metric is removed
- [ ] Carousel navigation still works
- [ ] Responsive design maintained

## Implementation Approach

### Phase 1: Fix API Endpoints
1. Update PromptRepository.tsx API calls
2. Remove trailing slashes from fetch URLs
3. Test CRUD operations

### Phase 2: Update Dashboard Layout
1. Modify MainCarousel.tsx stats section
2. Remove SLA Compliance stat
3. Update grid layout classes
4. Test responsive design

### Phase 3: Validation and Testing
1. Test all functionality works
2. Verify no regressions introduced
3. Confirm visual design maintained

## Risk Mitigation

### Potential Risks
1. **Breaking existing functionality**: Minimal changes reduce risk
2. **Visual layout issues**: Preserve existing CSS classes and structure
3. **API compatibility**: No backend changes required

### Mitigation Strategies
1. **Incremental changes**: Fix one component at a time
2. **Preserve existing code**: Only modify necessary lines
3. **Thorough testing**: Test each change before proceeding