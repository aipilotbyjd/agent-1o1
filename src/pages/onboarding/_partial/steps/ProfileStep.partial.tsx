import { useState, useRef } from 'react';
import { Check, Loader2, UploadCloud, X } from 'lucide-react';
import { useAuth } from '@/context/authContext';
import { useUploadAvatar } from '@/api/modules/auth';
import { useOnboardingStore } from '../../_context/OnboardingStore.context';

const ProfileStep = () => {
	const { userData } = useAuth();
	const uploadAvatar = useUploadAvatar();
	const { state, dispatch } = useOnboardingStore();
	const { avatarUrl } = state;

	const [uploadProgress, setUploadProgress] = useState<number | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = async (file: File) => {
		if (!file) return;
		if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			if (e.target?.result)
				dispatch({ type: 'SET_FIELD', payload: { avatarUrl: e.target.result as string } });
		};
		reader.readAsDataURL(file);
		setUploadProgress(0);
		try {
			await uploadAvatar.mutateAsync(file);
			setUploadProgress(100);
		} catch {
			dispatch({ type: 'SET_FIELD', payload: { avatarUrl: userData?.avatar ?? null } });
		} finally {
			setUploadProgress(null);
		}
	};

	const onDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};
	const onDragLeave = () => setIsDragging(false);
	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
	};

	return (
		<>
			<div>
				<h1 className='text-3xl leading-tight font-extrabold tracking-tight text-slate-950 dark:text-zinc-50'>
					You're in. Make it yours.
				</h1>
				<p className='mt-2 text-sm font-medium text-slate-500 dark:text-zinc-400'>
					Upload a photo so teammates recognize you across workflows and notifications.
				</p>
			</div>

			<div className='space-y-2 pt-2'>
				<label className='block text-xs font-bold text-slate-600 dark:text-zinc-400'>
					Profile Picture
				</label>
				<div
					onDragOver={onDragOver}
					onDragLeave={onDragLeave}
					onDrop={onDrop}
					onClick={() => fileInputRef.current?.click()}
					className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all ${
						isDragging
							? 'border-primary-500 bg-primary-400/5'
							: 'border-slate-200 bg-white/30 hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900/20 dark:hover:border-zinc-700'
					}`}>
					<input
						type='file'
						ref={fileInputRef}
						className='hidden'
						accept='image/*'
						onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
					/>

					{uploadProgress !== null ? (
						<div className='flex w-full max-w-[200px] flex-col items-center space-y-3 py-2'>
							<Loader2 className='h-8 w-8 animate-spin text-primary-500' />
							<div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800'>
								<div
									className='h-full bg-primary-400'
									style={{ width: `${uploadProgress}%` }}
								/>
							</div>
							<span className='text-xs font-bold text-slate-500'>
								{uploadProgress}% uploaded
							</span>
						</div>
					) : avatarUrl ? (
						<div className='flex w-full items-center gap-4'>
							<div className='relative'>
								<img
									src={avatarUrl}
									alt='Profile avatar'
									className='h-16 w-16 rounded-full border border-primary-500/30 object-cover'
								/>
								<div className='absolute -right-1 -bottom-1 rounded-full border-2 border-white bg-emerald-500 p-0.5 text-white dark:border-zinc-900'>
									<Check className='h-3 w-3 stroke-[3]' />
								</div>
							</div>
							<div className='flex-1 text-left'>
								<p className='text-sm font-bold text-slate-900 dark:text-zinc-50'>
									Looking sharp.
								</p>
								<p className='text-xs text-slate-400'>
									Hit Continue whenever you're ready.
								</p>
							</div>
							<button
								onClick={(e) => {
									e.stopPropagation();
									dispatch({ type: 'SET_FIELD', payload: { avatarUrl: null } });
								}}
								className='rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-zinc-800'>
								<X className='h-4 w-4' />
							</button>
						</div>
					) : (
						<>
							<div className='mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400'>
								<UploadCloud className='h-5 w-5' />
							</div>
							<p className='text-xs font-bold text-slate-800 dark:text-zinc-200'>
								Drop your photo here, or{' '}
								<span className='text-primary-600 underline dark:text-primary-400'>
									browse
								</span>
							</p>
							<p className='mt-1 text-[10px] text-slate-400'>
								PNG or JPEG · under 2MB
							</p>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default ProfileStep;
