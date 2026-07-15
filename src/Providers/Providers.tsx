import { ThemeContextProvider } from '@/context/themeContext';
import { AuthProvider } from '@/context/authContext';
import { ConfirmProvider } from '@/context/confirmContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/api/core/query-client';
import { useState } from 'react';

const Providers = () => {
	const [queryClient] = useState<QueryClient>(() => createQueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeContextProvider>
				<ConfirmProvider>
					{/* <Outlet /> must be used in the innermost provider. */}
					<AuthProvider />
				</ConfirmProvider>
			</ThemeContextProvider>
		</QueryClientProvider>
	);
};

export default Providers;
