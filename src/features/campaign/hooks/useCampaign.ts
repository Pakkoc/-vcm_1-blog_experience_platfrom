import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/remote/api-client';
import {
  CampaignResponseSchema,
  CampaignListResponseSchema,
  type CampaignCreateRequest,
  type CampaignUpdateRequest,
  type CampaignResponse,
  type CampaignListItem,
  type CampaignListResponse,
} from '@/features/campaign/lib/dto';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

export const useCampaigns = (status?: string) => {
  return useQuery({
    queryKey: ['campaigns', status],
    queryFn: async () => {
      const url = status ? `/campaigns?status=${status}` : '/campaigns';
      const response = await apiClient.get<CampaignListResponse>(url);
      const validated = CampaignListResponseSchema.parse(response.data);
      return validated.campaigns;
    },
  });
};

export const useMyCampaigns = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['campaigns', 'my'],
    queryFn: async () => {
      const response = await apiClient.get<CampaignListItem[]>('/campaigns/my');
      return response.data;
    },
    enabled,
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: async () => {
      const response = await apiClient.get<CampaignResponse>(`/campaigns/${id}`);
      return CampaignResponseSchema.parse(response.data);
    },
    enabled: !!id,
  });
};

export const useCreateCampaign = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CampaignCreateRequest) => {
      const response = await apiClient.post<CampaignResponse>('/campaigns', data);
      return CampaignResponseSchema.parse(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: '체험단 등록 완료',
        description: '체험단이 성공적으로 등록되었습니다.',
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: '체험단 등록 실패',
        description: error.response?.data?.error?.message || '체험단 등록 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCampaign = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CampaignUpdateRequest) => {
      const response = await apiClient.patch<CampaignResponse>(`/campaigns/${id}`, data);
      return CampaignResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: '체험단 수정 완료',
        description: '체험단이 성공적으로 수정되었습니다.',
      });
    },
    onError: (error: any) => {
      toast({
        title: '체험단 수정 실패',
        description: error.response?.data?.error?.message || '체험단 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCampaignStatus = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (status: 'recruiting' | 'recruit_ended' | 'selection_completed' | 'cancelled') => {
      const response = await apiClient.patch<CampaignResponse>(`/campaigns/${id}/status`, { status });
      return CampaignResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: '상태 변경 완료',
        description: '체험단 상태가 변경되었습니다.',
      });
    },
    onError: (error: any) => {
      toast({
        title: '상태 변경 실패',
        description: error.response?.data?.error?.message || '상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
};

