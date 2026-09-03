# 🌴 Dodoz Leisure - Hotel Accommodation Voucher & Reservation CRM

An enterprise-grade, modern SaaS CRM platform built for travel agencies and tour operators to streamline tour accommodation schedules, automatically group multi-day records by hotel, match reservation emails, generate graphical branded PDF vouchers with jsPDF/AutoTable, and dispatch bulk or individual emails with PDF attachments via server-side Nodemailer (Hostinger SMTP compatible).

![Dodoz Leisure CRM](public/logo-banner.png)

---

## ✨ Features & Capabilities

- 📊 **ExcelJS Spreadsheet Engine**: Drag-and-drop `.xlsx` / `.xls` tour accommodation schedule parser with case-insensitive column normalizer and validator.
- 🏨 **Automatic Hotel Grouping**: Automatically groups multi-day schedule rows by property, computes SGL/DBL/TPL room totals, meal plans (BB, HB, FB, AI), and date ranges.
- ✉️ **Hotel Email Auto-Matching**: Cross-references hotel names against the partner directory in PostgreSQL; supports inline email assignment and "Save to Hotel Directory".
- 📄 **Graphical Branded PDF Vouchers**: Generates PDF vouchers with Dodoz Leisure (or tenant agency) branding, client & tour references, AutoTable schedules, special requests, and hotel confirmation blocks.
- 🚀 **Server-Side Nodemailer Dispatch**: Secure email delivery with PDF attachments (`hotel-voucher.pdf`) using Hostinger SMTP (`smtp.hostinger.com:465` SSL / `587` TLS) or custom SMTP credentials.
- 📦 **Bulk & Single Dispatch**: Non-blocking bulk send modal with live progress (`Sending X of Y...`), progress bar, and "Retry Failed" error handling.
- 🗄️ **Multi-Tenant Supabase Architecture**: Complete PostgreSQL schema with UUID keys, foreign key constraints, and Row Level Security (RLS) policies.
- ⚙️ **White-Label Settings**: Customize agency branding, address, phone/WhatsApp hotlines, voucher titles, legal clauses, and SMTP credentials dynamically without changing source code.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 15+ (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **UI & Styling** | [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Spreadsheet Engine** | [ExcelJS](https://github.com/exceljs/exceljs) |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Email Delivery** | [Nodemailer](https://nodemailer.com/) (Server-side API routes) |
| **Database & Auth** | [Supabase PostgreSQL](https://supabase.com/) with Row Level Security |
| **Deployment** | Vercel Ready (`npm run build` validated) |

---

## 📁 Project Structure

```
├── .env.example                       # Environment variables template
├── package.json                       # Next.js, React, Tailwind, ExcelJS, jsPDF, Nodemailer
├── tsconfig.json                      # TypeScript configuration with @/* aliases
├── tailwind.config.ts                 # Modern luxury navy palette & design tokens
├── supabase/
│   └── schema.sql                     # Full Postgres schema, tables, RLS policies & seeds
├── public/
│   └── Dodoz_Accommodation_Schedule_Sample.xlsx # Ready-to-use sample spreadsheet
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with ToastProvider & typography
│   │   ├── page.tsx                   # Redirection to /dashboard
│   │   ├── login/page.tsx             # Supabase Auth & 1-Click Instant Demo Login
│   │   ├── dashboard/page.tsx         # KPI cards, Recent Bookings, Email Activity chart
│   │   ├── bulk-voucher/page.tsx      # ⭐ Core Workflow: Excel Upload, Grouping & Send
│   │   ├── bookings/page.tsx          # Bookings CRM table, filters, new booking modal
│   │   ├── hotels/page.tsx            # Hotel directory with live Test Email connectivity
│   │   ├── clients/page.tsx           # Client travel profiles & tour references
│   │   ├── voucher-history/page.tsx   # Audit history with PDF preview, download & resend
│   │   ├── email-templates/page.tsx   # Template editor with dynamic variable chips
│   │   ├── settings/page.tsx          # White-label profile, PDF clauses & SMTP tester
│   │   └── api/
│   │       ├── send-bulk-voucher/route.ts # Server API: PDF generation + SMTP dispatch
│   │       ├── send-email/route.ts        # Server API: Test email & notifications
│   │       ├── generate-voucher/route.ts  # Server API: Binary PDF voucher stream
│   │       └── download-sample-excel/route.ts # Server API: 1-click sample spreadsheet
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx            # Modern collapsible navigation sidebar
│   │   │   └── Header.tsx             # Responsive header with search & notifications
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx           # Premium KPI metric cards
│   │   │   ├── EmailActivityChart.tsx # Multi-segment status distribution chart
│   │   │   └── RecentBookingsTable.tsx# Interactive reservations table
│   │   ├── bulk-voucher/
│   │   │   ├── UploadDropzone.tsx     # Drag & drop Excel upload (.xlsx/.xls)
│   │   │   ├── HotelVoucherCard.tsx   # Grouped hotel card with email matcher
│   │   │   ├── BulkSendModal.tsx      # Progress modal (Sending X of Y, retry failed)
│   │   │   ├── EmailEditorModal.tsx   # Visual template editor with variable tokens
│   │   │   └── VoucherPreviewModal.tsx# High-resolution graphical PDF preview
│   │   └── ui/
│   │       ├── DataTable.tsx          # Searchable, paginated data table
│   │       ├── StatusBadge.tsx        # Status badge component
│   │       ├── LoadingButton.tsx      # Multi-variant button with spinner states
│   │       ├── Modal.tsx              # Accessible dialog modal
│   │       └── Toast.tsx              # Toast notification system
│   └── lib/
│       ├── types.ts                   # Comprehensive TypeScript interfaces
│       ├── initial-data.ts            # Realistic seed data for premier hotels & tours
│       ├── supabase.ts                # Supabase client initializer
│       ├── store.ts                   # Unified data store with localStorage & Supabase sync
│       ├── pdf.ts                     # Single reusable jsPDF + AutoTable voucher engine
│       ├── email.ts                   # Server-side Nodemailer transporter & templates
│       ├── excel.ts                   # ExcelJS parser, normalizer, and sample builder
│       └── templates.ts               # Dynamic template variable substitution engine
```

---

## ⚡ Getting Started

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your Hostinger SMTP credentials (or configure them in the web app under **Settings**):
```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=reservations@dodozleisure.com
SMTP_PASS=your-hostinger-app-password
SMTP_FROM="Dodoz Leisure Reservations" <reservations@dodozleisure.com>
SMTP_SECURE=true
```

*(Optional) Connect your live Supabase database:*
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production / Vercel
```bash
npm run build
npm run start
```

---

## 📋 Database Setup (Supabase PostgreSQL)

To set up your live Supabase database:
1. Create a project at [supabase.com](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire contents of [`supabase/schema.sql`](supabase/schema.sql).
4. Add your Supabase URL and Anon Key to `.env.local`.

---

## 📄 License & Branding
Developed for **Dodoz Leisure**. All modules and white-label settings are fully customizable for commercial travel agency operations.
