import { LockKeyhole, ArrowLeft } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router';
import classNames from 'classnames';
import Aside, { AsideBody } from '@/components/layout/Aside';
import Icon from '@/components/icon/Icon';
import { TIcons } from '@/types/icons.type';
import pages from '@/Routes/pages';
import AsideHeaderPart from '@/templates/asides/_parts/AsideHeader.part';
import useAsideStatus from '@/hooks/useAsideStatus';

const SectionTitle = ({ children }: { children: string }) => {
	const { asideStatus } = useAsideStatus();
	if (!asideStatus) return null;
	return <div className='mb-2 px-2 text-xs font-bold text-zinc-500'>{children}</div>;
};

const SettingsNavItem = ({ to, icon, text }: { to: string; icon: TIcons; text: string }) => {
	const { asideStatus } = useAsideStatus();
	return (
		<NavLink
			to={to}
			end
			className={({ isActive }) =>
				classNames(
					'flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition',
					{
						'bg-zinc-100 text-zinc-950 dark:bg-white/10 dark:text-zinc-100': isActive,
						'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/5 dark:hover:text-zinc-100':
							!isActive,
						'justify-center': !asideStatus,
					},
				)
			}>
			<Icon icon={icon} className='shrink-0 text-lg' />
			{asideStatus && <span className='min-w-0 truncate'>{text}</span>}
		</NavLink>
	);
};

const LockedNavItem = ({ label }: { label: string }) => {
	const { asideStatus } = useAsideStatus();
	return (
		<div
			className={classNames(
				'flex h-11 w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 text-sm font-semibold text-zinc-400 opacity-50',
				{ 'justify-center': !asideStatus },
			)}>
			<LockKeyhole size={18} className='shrink-0' />
			{asideStatus && <span className='min-w-0 truncate'>{label}</span>}
		</div>
	);
};

const SettingsAsideTemplate = () => {
	const { asideStatus } = useAsideStatus();
	const navigate = useNavigate();

	return (
		<Aside className='!bg-white dark:!bg-zinc-900'>
			<AsideHeaderPart />
			<AsideBody className='[&>div:first-child]:from-white dark:[&>div:first-child]:from-zinc-900 [&>div:last-child]:from-white dark:[&>div:last-child]:from-zinc-900'>
				<button
					type='button'
					onClick={() => navigate(pages.app.subPages.workflows.to)}
					className={classNames(
						'mb-5 flex h-10 items-center gap-3 rounded-lg px-2 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-white/5',
						{ 'justify-center': !asideStatus },
					)}>
					<ArrowLeft size={18} />
					{asideStatus && <span>Go back</span>}
				</button>

				<div className='space-y-7'>
					<section>
						<SectionTitle>Account</SectionTitle>
						<div className='space-y-1'>
							<SettingsNavItem {...pages.settings.subPages.profile} />
							<SettingsNavItem {...pages.settings.subPages.secrets} />
						</div>
					</section>

					<section>
						<SectionTitle>Plan & Credits</SectionTitle>
						<div className='space-y-1'>
							<SettingsNavItem {...pages.settings.subPages.plan} />
							<SettingsNavItem {...pages.settings.subPages.usage} />
							<SettingsNavItem {...pages.settings.subPages.billing} />
						</div>
					</section>

					<section>
						<SectionTitle>Organization</SectionTitle>
						<div className='space-y-1'>
							{pages.app.subPages?.myWorkspace && (
								<SettingsNavItem {...pages.app.subPages.myWorkspace} />
							)}
							{pages.onboarding.subPages?.workspaceList && (
								<SettingsNavItem {...pages.onboarding.subPages.workspaceList} />
							)}
							<SettingsNavItem {...pages.settings.subPages.members} />
							<LockedNavItem label='Teams' />
							<LockedNavItem label='Custom Roles' />
							<LockedNavItem label='SAML & SCIM' />
						</div>
					</section>

					<section>
						<SectionTitle>Notifications</SectionTitle>
						<div className='space-y-1'>
							<SettingsNavItem {...pages.settings.subPages.notifications} />
							<SettingsNavItem {...pages.settings.subPages.notificationChannels} />
						</div>
					</section>

					<section>
						<SectionTitle>AI Providers</SectionTitle>
						<div className='space-y-1'>
							<LockedNavItem label='Model Restrictions' />
							<LockedNavItem label='API Keys & Proxies' />
						</div>
					</section>
				</div>
			</AsideBody>
		</Aside>
	);
};

export default SettingsAsideTemplate;
