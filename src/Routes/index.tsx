import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import { lazy } from 'react';
import LoginPage from '@/pages/auth/Login.page';
import RegisterPage from '@/pages/auth/Register.page';
import ForgotPasswordPage from '@/pages/auth/ForgotPassword.page';
import ResetPasswordPage from '@/pages/auth/ResetPassword.page';
import VerifyEmailPage from '@/pages/auth/VerifyEmail.page';
import TwoFactorPage from '@/pages/auth/TwoFactor.page';
import TwoFactorSetupPage from '@/pages/auth/TwoFactorSetup.page';
import MagicLinkPage from '@/pages/auth/MagicLink.page';
import OAuthCallbackPage from '@/pages/auth/OAuthCallback.page';
import OAuthCompletePage from '@/pages/app/Apps/OAuthComplete.page';
import AccountLockedPage from '@/pages/auth/AccountLocked.page';
import SessionExpiredPage from '@/pages/auth/SessionExpired.page';
import Protected from '@/Protected/Protected';
import Root from '@/Root';
import DefaultLayout from '@/layouts/Default.layout';
import Providers from '@/Providers/Providers';
import pages from './pages';
import MailLayout from '@/layouts/Mail.layout';
import Page404Page from '@/pages/Page404.page';
import UnderConstructionPage from '@/pages/UnderConstruction.page';
import DocumentationPages from '@/Routes/infoPages/documentationPages';
import ExamplePages from '@/Routes/infoPages/examplePages';
import AppLayout from '@/layouts/App.layout';
import SettingsLayout from '@/layouts/Settings.layout';
import SettingsPages from './agent1o1Pages/settingsPages';
import AppPages from './agent1o1Pages/appPages';
import AgentLayout from '@/layouts/Agent.layout';
import AgentPages from './agent1o1Pages/agentPages';
import EditorLayout from '@/layouts/Editor.layout';
import EditorPages from './agent1o1Pages/editorPages';
import OnboardingLayout from '@/layouts/Onboarding.layout';

// Lazily loaded components for routes
const BillingSuccessPage = lazy(() => import('@/pages/billing/BillingSuccess.page'));
const BillingCancelPage = lazy(() => import('@/pages/billing/BillingCancel.page'));
const PricingPage = lazy(() => import('@/pages/onboarding/Pricing.page'));
const OnboardingPage = lazy(() => import('@/pages/onboarding/Onboarding.page'));
const CreateWorkspacePage = lazy(
	() => import('@/pages/onboarding/standalone/CreateWorkspace.page'),
);
const InviteTeamPage = lazy(() => import('@/pages/onboarding/standalone/InviteTeam.page'));
const WorkspacesPage = lazy(() => import('@/pages/settings/Workspaces/Workspaces.page'));
const WorkspaceListPage = lazy(() => import('@/pages/settings/Workspaces/WorkspaceList.page'));

const SalesLayout = lazy(() => import('@/pages/apps/sales/_layouts/Sales.layout'));
const SalesDashboardPage = lazy(() => import('@/pages/apps/sales/SalesDashboard.page'));
const SalesListPage = lazy(() => import('@/pages/apps/sales/SalesList.page'));
const SalesViewPage = lazy(() => import('@/pages/apps/sales/SalesView.page'));

const CustomerLayout = lazy(() => import('@/pages/apps/customer/_layouts/Customer.layout'));
const CustomerDashboardPage = lazy(() => import('@/pages/apps/customer/CustomerDashboard.page'));
const CustomerListPage = lazy(() => import('@/pages/apps/customer/CustomerList.page'));
const CustomerEditPage = lazy(() => import('@/pages/apps/customer/CustomerEdit.page'));
const CustomerViewPage = lazy(() => import('@/pages/apps/customer/CustomerView.page'));

const ProductsLayout = lazy(() => import('@/pages/apps/products/_layouts/Products.layout'));
const ProductsDashboardPage = lazy(() => import('@/pages/apps/products/ProductsDashboard.page'));
const ProductsListPage = lazy(() => import('@/pages/apps/products/ProductsList.page'));
const ProductsEditPage = lazy(() => import('@/pages/apps/products/ProductsEdit.page'));

const ProjectLayout = lazy(() => import('@/pages/apps/projects/_layouts/Project.layout'));
const ProjectDashboardPage = lazy(() => import('@/pages/apps/projects/ProjectDashboard.page'));
const ProjectBoardPage = lazy(() => import('@/pages/apps/projects/ProjectBoard.page'));
const ProjectListPage = lazy(() => import('@/pages/apps/projects/ProjectList.page'));
const ProjectGridPage = lazy(() => import('@/pages/apps/projects/ProjectGrid.page'));

const InvoiceLayout = lazy(() => import('@/pages/apps/invoices/_layouts/Invoice.layout'));
const InvoicesDashboardPage = lazy(() => import('@/pages/apps/invoices/InvoicesDashboard.page'));
const InvoicesListPage = lazy(() => import('@/pages/apps/invoices/InvoicesList.page'));
const InvoicesViwPage = lazy(() => import('@/pages/apps/invoices/InvoicesViw.page'));

const ChatLayout = lazy(() => import('@/pages/apps/chat/_layouts/Chat.layout'));
const ChatDashboardPage = lazy(() => import('@/pages/apps/chat/ChatDashboard.page'));

const MailLayoutPage = lazy(() => import('@/pages/apps/mail/_layouts/Mail.layout.page'));
const MailDashboardPage = lazy(() => import('@/pages/apps/mail/MailDashboard.page'));
const MailInboxPage = lazy(() => import('@/pages/apps/mail/MailInbox.page'));
const MailNewPage = lazy(() => import('@/pages/apps/mail/MailNew.page'));

const router = createBrowserRouter([
	{
		path: '/',
		element: <Providers />,
		children: [
			{
				path: '/',
				element: <Root />,
				children: [
					{
						path: '/',
						element: <Navigate to={pages.app.subPages.dashboard.to} replace />,
					},
					// Public routes
					{
						path: pages.pagesExamples.login.to,
						element: <LoginPage />,
					},
					{
						path: pages.pagesExamples.signup.to,
						element: <RegisterPage />,
					},
					{
						path: pages.auth.forgotPassword.to,
						element: <ForgotPasswordPage />,
					},
					{
						path: pages.auth.resetPassword.to,
						element: <ResetPasswordPage />,
					},
					{
						path: pages.auth.verifyEmail.to,
						element: <VerifyEmailPage />,
					},
					{
						path: '/email-verified',
						element: <VerifyEmailPage />,
					},
					{
						path: pages.auth.twoFactor.to,
						element: <TwoFactorPage />,
					},
					{
						path: pages.auth.twoFactorSetup.to,
						element: <TwoFactorSetupPage />,
					},
					{
						path: pages.auth.magicLink.to,
						element: <MagicLinkPage />,
					},
					{
						path: pages.auth.oauthCallback.to,
						element: <OAuthCallbackPage />,
					},
					{
						path: pages.auth.oauthComplete.to,
						element: <OAuthCompletePage />,
					},
					{
						path: '/credentials',
						element: <OAuthCompletePage />,
					},
					{
						path: pages.auth.accountLocked.to,
						element: <AccountLockedPage />,
					},
					{
						path: pages.auth.sessionExpired.to,
						element: <SessionExpiredPage />,
					},
					{
						element: <OnboardingLayout />,
						children: [
							{
								path: pages.onboarding.subPages.pricing.to,
								element: <PricingPage />,
							},
							{
								path: pages.onboarding.to,
								element: <OnboardingPage />,
							},
							{
								path: pages.onboarding.subPages.createWorkspace.to,
								element: <CreateWorkspacePage />,
							},
							{
								path: pages.onboarding.subPages.inviteTeam.to,
								element: <InviteTeamPage />,
							},
							{
								path: '/workspaces',
								element: <WorkspacesPage />,
							},
							{
								path: '/workspace-list',
								element: <WorkspaceListPage />,
							},
						],
					},
					{
						element: <DefaultLayout />,
						children: [...DocumentationPages, ...ExamplePages],
					},
					{
						path: pages.pagesExamples.underConstruction.to,
						element: <UnderConstructionPage />,
					},
					// Stripe callback pages (full-screen, no layout)
					{
						path: '/billing/success',
						element: <BillingSuccessPage />,
					},
					{
						path: '/billing/cancel',
						element: <BillingCancelPage />,
					},
					{
						path: '*',
						element: <Page404Page />,
					},
					// Protected routes
					{
						element: <Protected role='admin' />,
						children: [
							// App routes
							{
								element: <AppLayout />,
								children: AppPages,
							},
							// Settings routes
							{
								element: <SettingsLayout />,
								children: SettingsPages,
							},
							// Agent routes
							{
								element: <AgentLayout />,
								children: AgentPages,
							},
							// Editor routes
							{
								element: <EditorLayout />,
								children: EditorPages,
							},
							{
								element: <DefaultLayout />,
								children: [
									// Apps
									{
										// Sales
										path: pages.apps.sales.to,
										element: <SalesLayout />,
										children: [
											{
												path: pages.apps.sales.to,
												element: <SalesDashboardPage />,
											},
											{
												path: pages.apps.sales.subPages.list.to,
												element: <SalesListPage />,
											},
											{
												path: pages.apps.sales.subPages.view.to,
												element: <SalesViewPage />,
											},
										],
									},
									{
										// Customer
										path: pages.apps.customer.to,
										element: <CustomerLayout />,
										children: [
											{
												path: pages.apps.customer.to,
												element: <CustomerDashboardPage />,
											},
											{
												path: pages.apps.customer.subPages.list.to,
												element: <CustomerListPage />,
											},
											{
												path: pages.apps.customer.subPages.edit.to,
												element: <CustomerEditPage />,
											},
											{
												path: pages.apps.customer.subPages.view.to,
												element: <CustomerViewPage />,
											},
										],
									},
									{
										// Products
										path: pages.apps.products.to,
										element: <ProductsLayout />,
										children: [
											{
												path: pages.apps.products.to,
												element: <ProductsDashboardPage />,
											},
											{
												path: pages.apps.products.subPages.list.to,
												element: <ProductsListPage />,
											},
											{
												path: pages.apps.products.subPages.edit.to,
												element: <ProductsEditPage />,
											},
										],
									},
									{
										// Projects
										path: pages.apps.projects.to,
										element: <ProjectLayout />,
										children: [
											{
												path: pages.apps.projects.to,
												element: <ProjectDashboardPage />,
											},
											{
												path: pages.apps.projects.subPages.board.to,
												element: <ProjectBoardPage />,
											},
											{
												path: pages.apps.projects.subPages.list.to,
												element: <ProjectListPage />,
											},
											{
												path: pages.apps.projects.subPages.grid.to,
												element: <ProjectGridPage />,
											},
										],
									},
									{
										// Invoices
										path: pages.apps.invoices.to,
										element: <InvoiceLayout />,
										children: [
											{
												path: pages.apps.invoices.to,
												element: <InvoicesDashboardPage />,
											},
											{
												path: pages.apps.invoices.subPages.list.to,
												element: <InvoicesListPage />,
											},
											{
												path: pages.apps.invoices.subPages.view.to,
												element: <InvoicesViwPage />,
											},
										],
									},

									{
										// Chat
										path: pages.apps.chat.to,
										element: <ChatLayout />,
										children: [
											{
												path: pages.apps.chat.to,
												element: <ChatDashboardPage />,
											},
										],
									},
								],
							},
							{
								element: <MailLayout />,
								children: [
									// Apps
									{
										// Mail
										path: pages.apps.mail.to,
										element: <MailLayoutPage />,
										children: [
											{
												path: pages.apps.mail.to,
												element: <MailDashboardPage />,
											},
											{
												path: pages.apps.mail.subPages.inbox.to,
												element: <MailInboxPage />,
											},
											{
												path: pages.apps.mail.subPages.new.to,
												element: <MailNewPage />,
											},
										],
									},
								],
							},
						],
					},
				],
			},
		],
	},
]);

const Routes = () => {
	return <RouterProvider router={router} />;
};

export default Routes;
