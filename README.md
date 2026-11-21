# Verdant — School Management

A React + Vite foundation for a modern high-school management platform, using a Jimma coffee-inspired forest-green and warm-ivory design system.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Without Supabase environment variables, the app runs in demo mode using in-memory sample data. Demo changes are not persisted.

## Connect Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (publishable/anon key only).
4. Review and apply `supabase/schema.sql` using a migration workflow.
5. Implement and test restrictive RLS policies before exposing real student data.

Never place a service-role or secret key in a Vite environment variable. Vite variables prefixed with `VITE_` are exposed to the browser.

## Current implementation

- Responsive application shell and navigation.
- Dashboard visual foundation.
- Student directory with search.
- Student admission form and basic validation.
- Supabase client configuration.
- Initial relational schema foundation.

## Important development notes

This is the first working frontend foundation, not the completed production platform. The dashboard contains illustrative figures. The current admission number generation in demo mode is for UI demonstration only; production admission numbers must be generated with a database sequence/transaction or a server-side RPC. The initial schema deliberately has no permissive RLS policies. Complete role membership, guardian linking, teacher assignments, account provisioning, storage policies, marks workflow, grading calculations, annual result finalization, report cards, and automated tests before production use.

## Suggested next milestones

1. Finalize school tenancy and trusted role/membership model.
2. Implement secure account provisioning and admission-number RPC.
3. Add guardian records and private photo/document storage.
4. Implement academic-year enrollment and promotion.
5. Implement dynamic subjects, assessment structures, marks, and audited result publishing.
6. Build teacher, student, and guardian portals.
7. Add reports, PDF report cards, and ID cards.
8. Add automated tests and security review.

## Subject-specific assessment and mark entry

The Examinations workspace now includes a configurable assessment structure for each academic year, semester, grade, and subject. Teachers/admins can add, rename, and remove components, set each component's maximum mark, copy a previous semester's structure, and enter marks in the generated subject-specific table. The demo also supports pending/absent/exempt statuses, score validation, totals, completion indicators, search/filtering, and CSV export.

The current assessment workspace is a front-end demo: configurations and marks live in React state and are not yet persisted to Supabase. The database foundation already contains `assessment_structures` scoped to `grade_subject_id + semester_id` and `assessment_components` scoped to each structure. Apply `supabase/20261121_subject_assessments.sql` after the base `supabase/schema.sql` when preparing the database. Production use still requires authenticated, school-scoped RLS policies, teacher-subject authorization, database-side mark validation, and an audited submission/approval workflow. Do not use the demo's sample student records as real student data.
