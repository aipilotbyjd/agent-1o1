import Wrapper from '@/components/layout/Wrapper';
import { Outlet } from 'react-router';
import MailAsideTemplate from '@/templates/asides/MailAside.template';

const MailLayout = () => {
	return (
		<>
			<MailAsideTemplate />
			<Wrapper borderDisabled={true}>
				<Outlet />
			</Wrapper>
		</>
	);
};

export default MailLayout;
