-- Subject-specific assessment structures and mark-entry statuses.
-- The base schema already scopes one assessment_structure to each
-- grade_subject + semester pair. This migration makes mark entry distinguish
-- a genuine score from absent, exempt, and not-yet-entered records.

alter table public.student_marks
  alter column mark drop not null;

alter table public.student_marks
  add column if not exists entry_status text not null default 'scored'
  check (entry_status in ('scored', 'absent', 'exempt', 'pending'));

-- A scored entry must have a mark; non-scored statuses must not carry one.
alter table public.student_marks
  drop constraint if exists student_marks_entry_status_mark_check;
alter table public.student_marks
  add constraint student_marks_entry_status_mark_check
  check (
    (entry_status = 'scored' and mark is not null and mark >= 0)
    or (entry_status in ('absent', 'exempt', 'pending') and mark is null)
  );

-- Assessment components are independently configured under each structure.
create index if not exists idx_assessment_components_structure_order
  on public.assessment_components(structure_id, sort_order);

create index if not exists idx_student_marks_component_status
  on public.student_marks(component_id, status, entry_status);

comment on table public.assessment_structures is
  'One configurable assessment structure per grade-subject and semester.';
comment on column public.student_marks.entry_status is
  'Distinguishes scored, absent, exempt, and pending entries; pending is never treated as zero.';
