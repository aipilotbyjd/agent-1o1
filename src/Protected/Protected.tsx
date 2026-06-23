import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/authContext';
import { LogoDark } from '@/assets/images';

const IS_MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const Protected = ({ role }: { role: string }) => {
	const { userData, isAuthenticated, isLoading } = useAuth();
	void role;

	if (IS_MOCK_AUTH) return <Outlet />;

	if (isLoading) {
		return (
			<div className='flex h-full items-center justify-center'>
				<img src={LogoDark} alt='' className='h-24' />
			</div>
		);
	}
	if (!isAuthenticated || !userData) {
		return <Navigate to='/login' />;
	}

	return <Outlet />;
};

export default Protected;
