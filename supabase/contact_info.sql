-- جدول معلومات الاتصال للموقع
create table if not exists public.contact_info (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text,
  address text,
  facebook text,
  instagram text,
  whatsapp text,
  updated_at timestamp with time zone default now()
);

-- إدخال بيانات افتراضية (يمكن تعديلها لاحقاً من لوحة التحكم)
insert into public.contact_info (email, phone, address, facebook, instagram, whatsapp)
values ('info@example.com', '+970000000000', 'العنوان هنا', '', '', '')
on conflict do nothing;
