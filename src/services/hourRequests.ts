import { api } from '../config/api';
import { User } from '../types/user';

export interface HourRequest {
    id: string;
    projectId: string;
    requestedBy: string;
    hours: number;
    reason: string;
    neededBy: string;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewNotes?: string;
    requester: User;
    reviewer?: User;
}

export interface CreateHourRequestDto {
    hours: number;
    reason: string;
    neededBy: string;
}

export interface ReviewHourRequestDto {
    status: 'approved' | 'rejected';
    reviewNotes?: string;
}

export const hourRequestService = {
    async getProjectHourRequests(projectId: string): Promise<HourRequest[]> {
        const { data } = await api.get<HourRequest[]>(`/projects/${projectId}/hour-requests`);
        return data;
    },

    async createHourRequest(projectId: string, request: CreateHourRequestDto): Promise<HourRequest> {
        const { data } = await api.post<HourRequest>(`/projects/${projectId}/hour-requests`, request);
        return data;
    },

    async reviewHourRequest(
        projectId: string,
        requestId: string,
        review: ReviewHourRequestDto
    ): Promise<HourRequest> {
        const { data } = await api.patch<HourRequest>(
            `/projects/${projectId}/hour-requests/${requestId}/review`,
            review
        );
        return data;
    },

    async deleteHourRequest(projectId: string, requestId: string): Promise<void> {
        await api.delete(`/projects/${projectId}/hour-requests/${requestId}`);
    }
};
