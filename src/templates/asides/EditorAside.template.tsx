import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Aside, { AsideBody } from '@/components/layout/Aside';
import { useLocation, useNavigate } from 'react-router';
import useAsideStatus from '@/hooks/useAsideStatus';
import Icon from '@/components/icon/Icon';
import Nav, {
	NavButton,
	NavCollapse,
	NavItem,
	NavSeparator,
	NavTitle,
} from '@/components/layout/Navigation/Nav';
import pages, { TPage, TPages } from '@/Routes/pages';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalFooterChild,
	ModalHeader,
} from '@/components/ui/Modal';
import classNames from 'classnames';
import AsideHeaderPart from '@/templates/asides/_parts/AsideHeader.part';
import AsideFooterPart from '@/templates/asides/_parts/AsideFooter.part';
import EXAMPLE from '@/examples/_index';

const getFlattenPages = (pages: TPages, parentId?: string): TPage[] => {
	return Object.values(pages).flatMap((page) => {
		const { subPages, ...pageData } = page;
		const currentPage: TPage = { ...pageData, parentId };
		const subPagesArray = subPages ? getFlattenPages(subPages, page.id) : [];
		return [currentPage, ...subPagesArray];
	});
};

const Search = () => {
	const { asideStatus } = useAsideStatus();
	const navigate = useNavigate();
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	/**
	 * CMD + K open modal
	 */
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setIsModalOpen(true);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	/**
	 * Auto focus input
	 */
	const inputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (isModalOpen) {
			inputRef.current?.focus();
		}
	}, [isModalOpen]);

	/**
	 * Search input
	 */
	const [inputValue, setInputValue] = useState<string>('');
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const flattenPages = [
		...getFlattenPages(pages.apps as TPages),
		pages.app as TPage,
		...getFlattenPages(pages.app.subPages as TPages, pages.app.id),
		pages.settings as TPage,
		...getFlattenPages(pages.settings.subPages as TPages, pages.settings.id),
		pages.editor as TPage,
		...getFlattenPages(pages.editor.subPages as TPages, pages.editor.id),
		pages.agent as TPage,
		...getFlattenPages(pages.agent.subPages as TPages, pages.agent.id),
		pages.onboarding as TPage,
		...getFlattenPages(pages.onboarding.subPages as TPages, pages.onboarding.id),
	];
	const result = flattenPages.filter((item: TPage) =>
		item.text.toLowerCase().includes(inputValue.toLowerCase()),
	);

	const [selectedIndex, setSelectedIndex] = useState<number>(0);

	const [prevIsModalOpen, setPrevIsModalOpen] = useState(isModalOpen);
	if (isModalOpen !== prevIsModalOpen) {
		setPrevIsModalOpen(isModalOpen);
		setSelectedIndex(0);
	}
	const [prevInputValue, setPrevInputValue] = useState(inputValue);
	if (inputValue !== prevInputValue) {
		setPrevInputValue(inputValue);
		setSelectedIndex(0);
	}

	const handleClick = (to: string) => {
		navigate(to);
		setIsModalOpen(false);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setSelectedIndex((prev) => Math.min(prev + 1, result.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setSelectedIndex((prev) => Math.max(prev - 1, 0));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const selectedItem = result[selectedIndex];
			if (selectedItem && selectedItem.to) {
				handleClick(selectedItem.to);
			}
		}
	};

	useEffect(() => {
		if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isModalOpen, selectedIndex, result]);
	return (
		<>
			{!asideStatus && (
				<Button
					icon='Search01'
					variant='outline'
					color='zinc'
					rounded='rounded-xl'
					className='mb-4 !h-[48px] w-full border-zinc-200/50 !text-zinc-400 shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-zinc-300/80 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)] dark:border-border-main dark:!text-white dark:shadow-none'
					onClick={() => setIsModalOpen(true)}
					aria-label=''
				/>
			)}
			<FieldWrap
				className={classNames({ hidden: !asideStatus })}
				firstSuffix={
					<Icon
						icon='Search01'
						className='ms-1 text-lg text-zinc-400 dark:!text-white'
					/>
				}
				lastSuffix={
					<span className='me-1 rounded-md border border-zinc-200/60 bg-white px-2 py-0.5 font-sans text-[10px] font-bold text-zinc-400 shadow-2xs dark:border-border-main dark:bg-zinc-950/40 dark:!text-white'>
						⌘K
					</span>
				}>
				<Input
					name='search'
					placeholder='Search workspace'
					type='search'
					dimension='default'
					rounded='rounded-xl'
					className='mb-4 border border-zinc-200/50 !bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-zinc-300/80 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)] dark:border-border-main dark:!bg-bg-card dark:shadow-none dark:placeholder:!text-white dark:!text-white'
					value={inputValue}
					onClick={() => setIsModalOpen(true)}
					onChange={() => {}}
				/>
			</FieldWrap>
			<Modal
				isOpen={isModalOpen}
				setIsOpen={setIsModalOpen}
				rounded='rounded-2xl'
				isScrollable>
				<ModalHeader hasCloseButton={false}>
					<FieldWrap
						firstSuffix={<Icon icon='Search01' className='text-zinc-500' />}
						lastSuffix={
							<Badge color='zinc' variant='outline' className='font-mono text-sm'>
								ESC
							</Badge>
						}>
						<Input
							ref={inputRef}
							name='search'
							placeholder='Search'
							type='search'
							value={inputValue}
							onChange={handleInputChange}
							className='w-full'
						/>
					</FieldWrap>
				</ModalHeader>
				<ModalBody className='pt-2'>
					<div className='flex flex-col gap-2'>
						{result.map((item, index) => (
							<button
								key={item.id + index}
								style={{
									padding: '8px',
									// backgroundColor: index === selectedIndex ? '#eee' : '#fff',
									cursor: 'pointer',
								}}
								className={classNames(
									'flex cursor-pointer items-center gap-4 rounded-lg border border-zinc-500/25',
									{
										'outline-2 outline-offset-1 outline-primary-400':
											index === selectedIndex,
									},
								)}
								onMouseEnter={() => setSelectedIndex(index)}
								onClick={() => handleClick(item.to)}>
								<div className='flex grow items-center gap-2'>
									{item.icon && <Icon icon={item.icon} />}
									{item.text}
								</div>
								<div className='text-xs text-zinc-500'>
									{flattenPages.find((i) => i.id === item.parentId)?.text}
								</div>
							</button>
						))}
					</div>
				</ModalBody>
				<ModalFooter>
					<ModalFooterChild>
						<div className='flex items-center gap-1 text-sm'>
							<div className='rounded-lg border border-zinc-500/50 p-1 font-mono text-sm'>
								<Icon icon='ArrowMoveDownLeft' />
							</div>
							<span className='text-zinc-500'>to select</span>
						</div>
						<div className='flex items-center gap-1 text-sm'>
							<div className='rounded-lg border border-zinc-500/50 p-1 font-mono text-sm'>
								<Icon icon='ArrowDown02' />
							</div>
							<div className='rounded-lg border border-zinc-500/50 p-1 font-mono text-sm'>
								<Icon icon='ArrowUp02' />
							</div>
							<span className='text-zinc-500'>to navigate</span>
						</div>
						<div className='flex items-center gap-1 text-sm'>
							<div className='rounded-lg border border-zinc-500/50 p-1 font-mono text-xs'>
								ESC
							</div>
							<span className='text-zinc-500'>to close</span>
						</div>
					</ModalFooterChild>
				</ModalFooter>
			</Modal>
		</>
	);
};

const EditorAsideTemplate = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const tabs = {
		dashboard: {
			id: 'dashboard',
			title: 'Dashboard',
			icon: 'Home09',
		},
		apps: {
			id: 'apps',
			title: 'Apps',
			icon: 'GridView',
		},
	};
	const activeTab = localStorage.getItem('bolt_activeTab') || tabs.dashboard.id;

	return (
		<Aside>
			<AsideHeaderPart />
			<AsideBody>
				<Search />
				<Nav>
					{[tabs.dashboard.id].includes(activeTab as string) && (
						<>
							<NavTitle>Dashboards</NavTitle>
							<NavItem {...pages.apps.sales} />
							<NavItem {...pages.apps.customer} />
							<NavItem {...pages.apps.products}>
								<NavButton
									icon='PlusSignCircle'
									title='New'
									onClick={() => navigate(pages.apps.products.subPages.edit.to)}
								/>
							</NavItem>
							<NavItem {...pages.apps.projects} isChildrenNavButtonOverwrite>
								<div className='-mx-2 -my-2'>
									<EXAMPLE.Ui.Dropdown.Snooze />
								</div>
							</NavItem>
							<NavItem {...pages.apps.invoices} />
							<NavItem {...pages.apps.mail}>
								<Badge variant='soft' color='emerald'>
									8
								</Badge>
							</NavItem>
							<NavItem {...pages.apps.chat}>
								<Badge variant='soft'>Soon</Badge>
							</NavItem>
						</>
					)}
					{[tabs.dashboard.id, tabs.apps.id].includes(activeTab as string) && (
						<>
							<NavTitle>Apps</NavTitle>
							<NavCollapse {...pages.apps.sales}>
								<NavItem {...pages.apps.sales} />
								<NavItem {...pages.apps.sales.subPages?.list} />
								<NavItem {...pages.apps.sales.subPages?.view} />
							</NavCollapse>
							<NavCollapse {...pages.apps.customer}>
								<NavItem {...pages.apps.customer} />
								<NavItem {...pages.apps.customer.subPages?.list} />
								<NavItem
									{...pages.apps.customer.subPages?.edit}
									to={`${pages.apps.customer.subPages.edit.to}?customerId=17`}
								/>
								<NavItem
									{...pages.apps.customer.subPages?.view}
									to={`${pages.apps.customer.subPages.view.to}?customerId=17`}
								/>
							</NavCollapse>
							<NavCollapse {...pages.apps.products}>
								<NavItem {...pages.apps.products} />
								<NavItem {...pages.apps.products.subPages?.list} />
								<NavItem {...pages.apps.products.subPages?.edit} />
							</NavCollapse>
							<NavCollapse {...pages.apps.projects}>
								<NavItem {...pages.apps.projects} />
								<NavItem {...pages.apps.projects.subPages?.board} />
								<NavItem {...pages.apps.projects.subPages?.list} />
								<NavItem {...pages.apps.projects.subPages?.grid} />
							</NavCollapse>
							<NavCollapse {...pages.apps.invoices}>
								<NavItem {...pages.apps.invoices} />
								<NavItem {...pages.apps.invoices.subPages?.list} />
								<NavItem
									{...pages.apps.invoices.subPages?.view}
									to={`${pages.apps.invoices.subPages.view.to}?invoiceId=100023`}
								/>
							</NavCollapse>
							<NavCollapse {...pages.apps.mail}>
								<NavItem {...pages.apps.mail} />
								<NavItem
									{...pages.apps.mail.subPages?.new}
									to={`${pages.apps.mail.to}?newMail=true`}
								/>
							</NavCollapse>
							<NavItem {...pages.apps.chat} />
							<NavSeparator />
						</>
					)}
				</Nav>
			</AsideBody>
			<AsideFooterPart />
		</Aside>
	);
};

export default EditorAsideTemplate;
