import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { AppProvider } from '@/context/AppContext';

vi.mock('../lib/supabase/client', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn().mockResolvedValue({ data: { user: {} }, error: null })
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { email: 'emp@test.com' }, error: null })
        }))
    }
}));

import { supabase } from '@/lib/supabase/client';

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderWithContext = (component: React.ReactNode) => {
        return render(
            <AppProvider>
                {component}
            </AppProvider>
        );
    };

    it('renders login form correctly', () => {
        renderWithContext(<Login />);
        expect(screen.getByText('ยินดีต้อนรับ')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('switches to employee code login mode', () => {
        renderWithContext(<Login />);
        const codeButton = screen.getByText('รหัสพนักงาน', { selector: 'button' });
        fireEvent.click(codeButton);
        expect(screen.getByPlaceholderText('EMP001')).toBeInTheDocument();
    });

    it('handles successful login with email', async () => {
        renderWithContext(<Login />);

        fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'user@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        const loginButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'user@test.com',
                password: 'password123'
            });
        });
    });

    it('handles successful login with employee code', async () => {
        renderWithContext(<Login />);

        const codeButton = screen.getByText('รหัสพนักงาน', { selector: 'button' });
        fireEvent.click(codeButton);

        fireEvent.change(screen.getByPlaceholderText('EMP001'), { target: { value: 'EMP001' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        const loginButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith('profiles');
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'emp@test.com',
                password: 'password123'
            });
        });
    });

    it('saves credentials to local storage when Remember Me is checked', async () => {
        renderWithContext(<Login />);

        fireEvent.change(screen.getByPlaceholderText('name@company.com'), { target: { value: 'user@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        const rememberMeCheckbox = screen.getByRole('checkbox');
        fireEvent.click(rememberMeCheckbox);

        const loginButton = screen.getByRole('button', { name: /เข้าสู่ระบบ/i });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(localStorage.getItem('hrms_loginId')).toBe('user@test.com');
            expect(localStorage.getItem('hrms_password')).toBe('password123');
            expect(localStorage.getItem('hrms_loginMode')).toBe('email');
        });
    });
});
