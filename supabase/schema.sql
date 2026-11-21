-- Initial schema foundation. Review and apply through Supabase migrations.
-- RLS is enabled. Policies below are deliberately restrictive until the
-- production role/assignment model is finalized; do not open access broadly.

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('super_admin','school_admin','teacher','student','guardian')),
  school_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_on > starts_on),
  unique (school_id, name)
);

create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  name text not null,
  starts_on date,
  ends_on date,
  weight numeric(6,3) not null default 1 check (weight > 0),
  status text not null default 'planned' check (status in ('planned','active','closed')),
  created_at timestamptz not null default now(),
  unique (academic_year_id, name)
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  unique (school_id, name)
);

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  name text not null,
  unique (grade_id, name)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  admission_number text not null,
  full_name text not null,
  mothers_name text,
  date_of_birth date,
  home_address text,
  photo_path text,
  grade_label text,
  section_label text,
  status text not null default 'active' check (status in ('active','pending','withdrawn','graduated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, admission_number)
);

create table if not exists public.guardians (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  full_name text not null,
  address text,
  phone text not null,
  photo_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.student_guardians (
  student_id uuid not null references public.students(id) on delete restrict,
  guardian_id uuid not null references public.guardians(id) on delete restrict,
  relationship text not null,
  is_primary boolean not null default false,
  primary key (student_id, guardian_id)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  grade_id uuid not null references public.grades(id) on delete restrict,
  section_id uuid not null references public.sections(id) on delete restrict,
  status text not null default 'enrolled' check (status in ('enrolled','transferred','withdrawn','completed')),
  created_at timestamptz not null default now(),
  unique (student_id, academic_year_id)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null,
  code text,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (school_id, code)
);

create table if not exists public.grade_subjects (
  id uuid primary key default gen_random_uuid(),
  grade_id uuid not null references public.grades(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  academic_year_id uuid not null references public.academic_years(id) on delete restrict,
  unique (grade_id, subject_id, academic_year_id)
);

create table if not exists public.assessment_structures (
  id uuid primary key default gen_random_uuid(),
  grade_subject_id uuid not null references public.grade_subjects(id) on delete restrict,
  semester_id uuid not null references public.semesters(id) on delete restrict,
  name text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (grade_subject_id, semester_id)
);

create table if not exists public.assessment_components (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid not null references public.assessment_structures(id) on delete cascade,
  name text not null,
  max_mark numeric(8,2) not null check (max_mark > 0),
  weight numeric(7,3) not null check (weight >= 0 and weight <= 100),
  sort_order integer not null default 0
);

create table if not exists public.student_marks (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.assessment_components(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  mark numeric(8,2) not null check (mark >= 0),
  status text not null default 'draft' check (status in ('draft','submitted','approved','published')),
  entered_by uuid references public.user_profiles(id),
  updated_at timestamptz not null default now(),
  unique (component_id, student_id)
);

create index if not exists idx_students_school_name on public.students(school_id, full_name);
create index if not exists idx_students_admission on public.students(school_id, admission_number);
create index if not exists idx_enrollments_year on public.enrollments(academic_year_id, grade_id, section_id);
create index if not exists idx_marks_student on public.student_marks(student_id);

-- Enable RLS on every exposed table.
do $$
declare t text;
begin
  foreach t in array array['user_profiles','academic_years','semesters','grades','sections','students','guardians','student_guardians','enrollments','subjects','grade_subjects','assessment_structures','assessment_components','student_marks']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- No broad policies are added here. Add role- and school-scoped policies
-- after establishing trusted authorization helpers and membership rules.
