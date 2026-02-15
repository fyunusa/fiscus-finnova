# Content Guide: 모집 마감 임박 상품

## Page Location
`investment/ending-soon`

## Design Source
**File**: `../02_핀노바_유저UI/01_UI_명세/Finnova_PRD.md`
**Section**: `ending_soon`

## Expected Content

### Data Structure
```typescript
interface Item {
  id: number;
  title: string;
  // Add more fields based on design doc
}
```

### UI Components Needed
- Card (main container)
- Table (for data display)
- Button (for actions)
- Badge (for status)

## Implementation Steps

1. Open the design file at `../02_핀노바_유저UI/01_UI_명세/Finnova_PRD.md`
2. Find the section labeled `ending_soon`
3. Extract the data structure and requirements
4. Replace the Alert in the page with actual Table/data
5. Wire up any action handlers
6. Test responsiveness

## Example Template

```tsx
// Replace this alert:
<Alert type="info">
  이 페이지는 자동으로 생성되었습니다.
</Alert>

// With actual content:
<Table
  columns={[
    { key: 'id', header: 'ID' },
    { key: 'title', header: 'Title' },
    // ... more columns
  ]}
  data={data}
  striped
/>
```

## Related Pages
- See COMPONENT_LIBRARY.md for available components
- See QUICK_START.md for coding patterns
- Check existing completed pages for examples

---
*Auto-generated guide. Last updated: 2025-02-14*
