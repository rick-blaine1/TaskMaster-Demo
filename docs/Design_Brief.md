# **TaskMaster \- Design Brief**

**Target Tools:** Lovable, V0, Bolt.new, Figma Make | **Stack:** React \+ TypeScript \+ Tailwind CSS

## **Design System**

### **Colors (Tailwind)**

Primary: `blue-600` (\#3B82F6) | Success: `green-500` (\#10B981) | Error: `red-500` (\#EF4444) Grays: `gray-50/100/200/300/400/500/600/700/900`

### **Typography**

Font: Inter/System | Sizes: `text-xs/sm/base/lg/xl/2xl` | Weights: `font-normal/medium/semibold/bold`

### **Spacing & Borders**

Spacing: Tailwind scale (4/8/12/16/24/32px) | Radius: `rounded-md/lg/xl` | Shadow: `shadow-sm/md/lg/xl`

### **Breakpoints**

Mobile: \<768px | Tablet: 768-1023px | Desktop: ≥1024px

## **Layout**

┌─────────────────────────────────────────┐

│ TaskMaster Demo | ●Connected | 5 tasks │

├─────────────────────────────────────────┤

│ ➕ Add New Task \[collapsible form\]     │

├─────────────────────────────────────────┤

│ \[All\]\[Active\]\[Completed\] Sort Search   │

├─────────────────────────────────────────┤

│ ☐ Task Title            \[Edit\]\[Delete\] │

│   Description text...                   │

│   📅 Due | 🏷️ Category | 🕐 Created    │

└─────────────────────────────────────────┘

Container: `max-w-5xl mx-auto p-6`

## **Components**

### **1\. Header**

* Sticky top, `bg-white border-b border-gray-200 px-6 py-4`  
* Flex layout: Title (`text-2xl font-bold`) | Status (● \+ text) | Counter  
* Mobile: Stack vertically

### **2\. Add Task Form (Collapsible)**

* `bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6`  
* Toggle button: `flex justify-between items-center cursor-pointer hover:bg-gray-100`  
* Fields: Title\* (text, max 200), Description (textarea, max 1000), Due Date (date picker), Category (dropdown: Work/Personal/Shopping/Health)  
* Buttons: Cancel (secondary), Add Task (primary blue, loading state)  
* Validation: Red border \+ error text below field  
* Mobile: Full width inputs, stack date/category vertically

### **3\. Filter Controls**

* `bg-white border border-gray-200 rounded-lg p-4 mb-5 flex flex-wrap gap-4`  
* Filter buttons: Button group with active state (blue bg, white text)  
* Sort: Separate buttons with icons (🕐📅🔤)  
* Search: `w-full md:w-80` with 🔍 icon prefix

### **4\. Task Card**

**Active:**

* `bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all`  
* Checkbox (20×20px, custom styled) | Title (`text-lg font-semibold`) | Edit/Delete buttons (right)  
* Description: `text-base text-gray-600 mt-2`  
* Metadata row: `flex flex-wrap gap-4 text-sm text-gray-500 mt-3`  
* Due date, category tag (`bg-blue-100 text-blue-600 rounded-full px-3 py-1`), timestamp

**Completed:**

* Same \+ `line-through text-gray-500` for title/description  
* Checkbox: `bg-blue-600` with white ✓  
* Show completion timestamp

**Empty State:**

* Centered: 📝 icon, "No tasks yet" heading, CTA button

### **5\. Confirmation Dialog**

* Modal overlay: `bg-black bg-opacity-50 fixed inset-0`  
* Dialog: `bg-white rounded-xl shadow-xl max-w-md p-6 mx-auto mt-20`  
* Header with close × | Message | Task title in quotes | Warning text (red italic)  
* Buttons: Cancel (secondary), Delete (danger red)

### **6\. Toast Notification**

* Fixed bottom-right, `bg-white border rounded-lg shadow-lg p-4 max-w-md`  
* Types: Success (green), Error (red), Info (blue) \- border \+ icon color  
* Auto-dismiss after 4s, slide-in animation

### **7\. Loading States**

* Skeleton: 3-5 cards with `bg-gray-100 animate-pulse`  
* Button: Spinner icon, disabled, `opacity-75`  
* Inline: 16×16px spinning border

## **Interactions & Animations**

### **User Flows**

1. **Create:** Expand form → Fill fields → Submit → Loading → Card appears → Toast → Form resets  
2. **Complete:** Click checkbox → Immediate update (optimistic) → Strikethrough → API call → Revert if fails  
3. **Edit:** Click Edit → Inline/modal form → Modify → Save → Update card → Toast  
4. **Delete:** Click × → Confirm dialog → Delete → Gray out \+ spinner → Remove → Toast  
5. **Filter/Search:** Real-time filtering, no API calls

### **Animations**

* Card enter: Slide down \+ fade (300ms ease-out)  
* Card exit: Fade \+ shrink (200ms ease-in)  
* Form expand/collapse: Height transition (300ms)  
* Toast: Slide from right (300ms)  
* Hover: `scale-102` on buttons, shadow elevation on cards

## **Responsive Behavior**

**Mobile:** Stack all, full width inputs, 44px touch targets, vertical date/category, icon-only edit/delete **Tablet:** Single column, larger spacing, side-by-side date/category **Desktop:** Centered 800px max-width content, comfortable spacing

## **Accessibility**

* Tab order: Header → Form → Filters → Cards (checkbox → edit → delete)  
* ARIA labels: `aria-label`, `aria-checked`, `aria-required`, `aria-invalid`, `role="status"`  
* Focus: `ring-2 ring-blue-600` visible on all interactive elements  
* Contrast: Blue/white 4.5:1, Gray-700/white 10.7:1 (WCAG AA)  
* Keyboard: Enter (submit), Escape (close), Space (checkbox), Tab/Shift+Tab

## **API & Data**

### **Endpoints**

GET    /api/tasks           → Task\[\]

POST   /api/tasks           → Task

PUT    /api/tasks/{id}      → Task

DELETE /api/tasks/{id}      → 204

### **Task Model**

interface Task {

  id: number;

  title: string;

  description?: string;

  isCompleted: boolean;

  createdAt: string;        // ISO 8601

  completedAt?: string;     // ISO 8601

  dueDate?: string;         // ISO 8601

  category?: 'Work' | 'Personal' | 'Shopping' | 'Health';

}

### **Mock Data**

\[

  {id: 1, title: "Complete workshop setup", description: "Install VS Code, .NET SDK, and configure AI tools", isCompleted: true, createdAt: "2025-01-15T10:00:00Z", completedAt: "2025-01-15T15:30:00Z", dueDate: "2025-01-15T17:00:00Z", category: "Work"},

  {id: 2, title: "Build TaskMaster API", description: "Create CRUD endpoints", isCompleted: false, createdAt: "2025-01-15T11:00:00Z", dueDate: "2025-01-16T12:00:00Z", category: "Work"},

  {id: 3, title: "Grocery shopping", description: "Buy ingredients for dinner party", isCompleted: false, createdAt: "2025-01-15T14:00:00Z", dueDate: "2025-01-16T18:00:00Z", category: "Shopping"}

\]

## **Implementation Guide**

### **Code Structure**

src/

├── components/

│   ├── Header.tsx

│   ├── AddTaskForm.tsx

│   ├── FilterControls.tsx

│   ├── TaskCard.tsx

│   ├── TaskList.tsx

│   ├── ConfirmDialog.tsx

│   └── Toast.tsx

├── hooks/useTasks.ts

├── types/task.ts

├── utils/api.ts

└── App.tsx

### **State Management**

* Use React hooks: `useState` for tasks array, form state, filters  
* Optimistic updates: Update UI immediately, revert on API error  
* Form: Controlled components with inline validation

### **For Lovable/V0**

"Create a task management app with:

* Header with title, status indicator, task counter  
* Collapsible form: title\*, description, date, category dropdown  
* Filter buttons (All/Active/Completed), sort, search bar  
* Task cards with checkbox, title, description, metadata, edit/delete  
* Confirmation dialog for delete  
* Toast notifications for feedback  
* Use colors: blue-600 primary, green-500 success, red-500 error  
* Responsive: mobile \<768px, tablet 768-1023px, desktop ≥1024px  
* Optimistic UI updates for checkbox toggle"

## **Success Criteria Checklist**

* \[ \] All CRUD operations functional  
* \[ \] Form validation (required title, max lengths)  
* \[ \] Real-time filter/search  
* \[ \] Optimistic checkbox updates  
* \[ \] Loading states (skeleton, spinners)  
* \[ \] Error handling (toasts, revert)  
* \[ \] Responsive on all breakpoints  
* \[ \] Keyboard accessible (Tab, Enter, Escape, Space)  
* \[ \] ARIA labels present  
* \[ \] Focus indicators visible  
* \[ \] WCAG AA contrast ratios  
* \[ \] Smooth animations (300ms transitions)

## **Priority**

**P0 (Must Have):** CRUD ops, validation, responsive, visual design **P1 (High):** Filter/sort/search, animations, accessibility **P2 (Nice to Have):** Keyboard shortcuts, advanced features.