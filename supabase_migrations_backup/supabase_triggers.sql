-- 1. Create the Function to handle new user setup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id, 
    new.email, 
    split_part(new.email, '@', 1), -- Default first_name is the part before @
    '', 
    'employee'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the Trigger to authorize auto-creation
-- Drop it first if it exists to avoid errors
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Trigger to update 'updated_at' column automatically
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- 4. EMERGENCY FIX: Backfill missing profiles for existing users
-- This fixes the error you are seeing right now for your current user
INSERT INTO public.profiles (id, email, first_name, role)
SELECT 
  id, 
  email, 
  split_part(email, '@', 1), 
  'employee'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
