# Pathwise Demo Guide

## Quick Start

This is a fully functional prototype of **Pathwise**, a Theory-of-Mind-based retail visibility platform with a light, Apple-inspired interface. Tagline: "See behavior. Shape experience"

## Demo Flow

### 1. **Landing Page**
- Click "Get Started" to begin the journey
- Showcases the value proposition with glass morphism effects
- Features smooth parallax scrolling

### 2. **Login**
- Two-pane layout with ambient store imagery
- Enter any email/password to proceed
- Features input validation with shake animation on error

### 3. **Onboarding Wizard** (4 Steps)
- **Step 1**: Upload floor plan (click the drop zone)
- **Step 2**: Upload product locations CSV
- **Step 3**: Upload sales history
- **Step 4**: Review and run analysis (simulates 3-second processing)

### 4. **Dashboard**
Three hero action cards lead to main features:
- **Optimize Item**: Product placement analysis
- **Learning Insights**: AI-powered pattern discovery
- **Simulation**: Interactive layout testing

KPIs displayed:
- Visibility Index: 76/100
- Projected Sales: +6.8%
- Attention Hotspots: 3 zones

### 5. **Optimize Item**
- Search/filter products in left panel
- Select a product to see:
  - Heatmap visualization of current placement
  - Visibility score breakdown
  - AI-generated recommendations
  - Projected impact metrics
- Click "Apply to Simulation" to test changes

### 6. **Learning Insights**
- 5 AI-generated insight cards:
  1. High Visibility + High Sales (Green)
  2. Medium Visibility with Potential (Blue)
  3. Low Visibility Issues (Orange)
  4. Seasonal Movers (Purple)
  5. Adjacency Opportunities (Teal)
- Click any card to open detailed drawer
- Charts show trends and category performance

### 7. **Simulation**
- Drag items from left toolbox onto canvas
- Click "Run Simulation" to see projected changes
- Bottom status bar shows:
  - Projected Visibility: +9%
  - Projected Sales: +6%
  - Hotspots: −1
- Save plans for later comparison

### 8. **Saved Plans**
- View table of all saved layout plans
- Filter by status (All/Drafts/Last 30 Days)
- Actions: Open, Compare, Delete
- Click "New Comparison" for side-by-side analysis

### 9. **Plan Compare Modal**
- Side-by-side heatmap comparison
- Metric differences highlighted
- Impact summary shows:
  - Visibility gain
  - Sales projection
  - Hotspot reduction
- Set active plan or close

### 10. **Settings**
- Profile management
- Store details (name, address, timezone)
- Data connections (POS, Shopify, Analytics)
- Plan & billing information
- Notification preferences

## Design Features

### Glass Morphism
- 48px backdrop blur
- 24px border radius
- White hairline borders (15% opacity)
- Layered depth system

### Typography
- Manrope font family
- Weights: 300 (light), 400 (regular), 600 (semi-bold), 700 (bold)
- Carefully controlled hierarchy

### Color System
- Primary BG: `#21263F`
- Layer 1: `#3D4468`
- Layer 2: `#525972`
- Accent: `#676F8E`

### Interactions
- Hover lift (+2px translate)
- 120-200ms ease-out transitions
- Focus rings on interactive elements
- Toast notifications for actions
- Smooth page transitions

## Tech Stack
- **React** with TypeScript
- **Tailwind CSS v4**
- **shadcn/ui** components
- **Recharts** for visualizations
- **Lucide React** for icons
- **Sonner** for toast notifications

## Navigation Shortcuts
- Use the left sidebar to jump between screens
- Top bar has store selector and date range filter
- All major actions have clear CTAs

## Tips for Demo
1. Start from landing page to show full flow
2. Highlight the glass morphism effects
3. Demonstrate the hover interactions
4. Show the heatmap visualizations
5. Run a simulation to showcase real-time updates
6. Open plan comparison to show analytical depth
7. Point out the attention to micro-interactions

---

Built with ❤️ for the hackathon presentation
