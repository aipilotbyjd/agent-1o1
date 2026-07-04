import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/api/core';
import { AdminSettingsService } from './admin-settings.service';
import type { IUpdateAdminSettingsDto } from './admin-settings.service';
import { adminSettingsKeys } from './admin-settings.keys';

export const useAdminSettings = () =>
	useQuery({
		queryKey: adminSettingsKeys.settings(),
		queryFn: ({ signal }) => AdminSettingsService.get(signal),
	});

export const useUpdateAdminSettings = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: IUpdateAdminSettingsDto) => AdminSettingsService.update(body),
		onSuccess: (data) => {
			qc.setQueryData(adminSettingsKeys.settings(), data);
			qc.invalidateQueries({ queryKey: adminSettingsKeys.all() });
			notify.success('Settings updated');
		},
		onError: notify.fromError('Failed to update settings'),
	});
};
