import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { clearTokens, getAccessToken, hasValidToken, TOKEN_CHANGE_EVENT } from '@/api/core';
import { useCurrentUser, useLogin, useLogout, useRegister } from '@/api/modules/auth';
import type { TLoginDto, TRegisterDto, TUser } from '@/types/auth.type';
import { WorkspaceProvider } from '@/context/workspaceContext';

const LOGIN_REDIRECT_PATH = '/workspaces';
const REGISTER_REDIRECT_PATH = '/verify-email';
const IS_MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export interface IAuthContextProps {
	isLoading: boolean;
	isAuthenticated: boolean;
	userData: TUser | null;
	onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
	onRegister: (data: TRegisterDto, rememberMe?: boolean) => Promise<void>;
	onLogout: (isRedirect: boolean) => Promise<void>;
	refreshCurrentUser: () => Promise<void>;
}
const AuthContext = createContext<IAuthContextProps>({} as IAuthContextProps);

// ─── Mock Auth (used when VITE_MOCK_AUTH=true) ───────────────
const MOCK_USER: TUser = {
	id: 'mock-1',
	name: 'Dev User',
	email: 'dev@localhost',
	avatar: null,
	email_verified_at: new Date().toISOString(),
	current_workspace_id: null,
	current_workspace: null,
	created_at: new Date().toISOString(),
	updated_at: new Date().toISOString(),
	firstName: 'Dev',
	lastName: 'User',
	role: 'Administrator',
	isVerified: true,
	image: { org: undefined },
};

const MockAuthProvider = () => {
	const navigate = useNavigate();
	const onLogin = useCallback(async () => {
		navigate(LOGIN_REDIRECT_PATH, { replace: true });
	}, [navigate]);
	const value = useMemo<IAuthContextProps>(
		() => ({
			isLoading: false,
			isAuthenticated: true,
			userData: MOCK_USER,
			onLogin,
			onRegister: async () => {},
			onLogout: async () => {},
			refreshCurrentUser: async () => {},
		}),
		[onLogin],
	);
	return (
		<AuthContext.Provider value={value}>
			<WorkspaceProvider>
				<Outlet />
			</WorkspaceProvider>
		</AuthContext.Provider>
	);
};

// ─── Real Auth ───────────────────────────────────────────────
const RealAuthProvider = () => {
	const navigate = useNavigate();
	const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
	const hasActiveToken = !!accessToken && hasValidToken();
	const {
		data: userData,
		isLoading: isCurrentUserLoading,
		refetch: refetchCurrentUser,
	} = useCurrentUser(hasActiveToken);
	const loginMutation = useLogin();
	const registerMutation = useRegister();
	const logoutMutation = useLogout();

	useEffect(() => {
		const syncToken = () => setAccessToken(getAccessToken());

		window.addEventListener(TOKEN_CHANGE_EVENT, syncToken);
		window.addEventListener('storage', syncToken);

		return () => {
			window.removeEventListener(TOKEN_CHANGE_EVENT, syncToken);
			window.removeEventListener('storage', syncToken);
		};
	}, []);

	const onLogin = useCallback(
		async (email: string, password: string, rememberMe: boolean) => {
			const credentials: TLoginDto = { email, password };
			const { res } = await loginMutation.mutateAsync({ ...credentials, rememberMe });
			setAccessToken(getAccessToken());
			const onboarding = res.data.user.onboarding;
			navigate(
				onboarding && !onboarding.is_complete && !onboarding.is_dismissed
					? '/onboarding'
					: LOGIN_REDIRECT_PATH,
				{ replace: true },
			);
		},
		[loginMutation, navigate],
	);

	const onRegister = useCallback(
		async (data: TRegisterDto) => {
			await registerMutation.mutateAsync(data);
			setAccessToken(getAccessToken());
			navigate(REGISTER_REDIRECT_PATH, { replace: true });
		},
		[registerMutation, navigate],
	);

	const onLogout = useCallback(
		async (isNavigate = true) => {
			try {
				if (accessToken) await logoutMutation.mutateAsync();
				else clearTokens();
			} finally {
				setAccessToken(getAccessToken());
				if (isNavigate) navigate('/login', { replace: true });
			}
		},
		[accessToken, logoutMutation, navigate],
	);

	const refreshCurrentUser = useCallback(async () => {
		await refetchCurrentUser();
	}, [refetchCurrentUser]);

	const isLoading =
		isCurrentUserLoading ||
		loginMutation.isPending ||
		registerMutation.isPending ||
		logoutMutation.isPending;
	const isAuthenticated = hasActiveToken && !!userData;

	const enrichedUserData = useMemo(() => {
		if (!userData) return null;
		const nameParts = userData.name.trim().split(/\s+/).filter(Boolean);
		const firstName = nameParts[0] || '';
		const lastName = nameParts.slice(1).join(' ') || '';
		return {
			...userData,
			firstName,
			lastName,
			role: userData.current_workspace?.role ?? 'Member',
			isVerified: !!userData.email_verified_at,
			image: { org: userData.avatar ?? undefined },
		};
	}, [userData]);

	const value: IAuthContextProps = useMemo(
		() => ({
			isLoading,
			isAuthenticated,
			onLogout,
			onLogin,
			onRegister,
			refreshCurrentUser,
			userData: enrichedUserData,
		}),
		[
			isLoading,
			isAuthenticated,
			onLogout,
			onLogin,
			onRegister,
			refreshCurrentUser,
			enrichedUserData,
		],
	);
	return (
		<AuthContext.Provider value={value}>
			<WorkspaceProvider>
				<Outlet />
			</WorkspaceProvider>
		</AuthContext.Provider>
	);
};

export const AuthProvider = IS_MOCK_AUTH ? MockAuthProvider : RealAuthProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	return useContext(AuthContext);
};
