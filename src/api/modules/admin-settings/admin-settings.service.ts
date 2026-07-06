import { axiosClient } from '@/api/client';
import { unwrap } from '@/api/core';
import type { TApiResponse } from '@/api/core';
import { AdminSettingsEndpoints as E } from './admin-settings.endpoints';

export interface IAdminSettings {
	[key: string]: unknown;
}

export type IUpdateAdminSettingsDto = Partial<IAdminSettings>;

export const AdminSettingsService = {
	get: (signal?: AbortSignal) =>
		axiosClient
			.get<TApiResponse<IAdminSettings>>(E.index, { signal })
			.then(unwrap<IAdminSettings>),

	update: (body: IUpdateAdminSettingsDto) =>
		axiosClient.put<TApiResponse<IAdminSettings>>(E.update, body).then(unwrap<IAdminSettings>),
};
