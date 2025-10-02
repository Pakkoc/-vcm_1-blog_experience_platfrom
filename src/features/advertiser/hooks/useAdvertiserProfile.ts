import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/remote/api-client';
import {
  AdvertiserProfileResponseSchema,
  type AdvertiserProfileCreateRequest,
  type AdvertiserProfileResponse,
} from '@/features/advertiser/lib/dto';
import { useToast } from '@/hooks/use-toast';

export const useAdvertiserProfile = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['advertiser', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get<AdvertiserProfileResponse>('/advertiser/profile');
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useCreateAdvertiserProfile = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AdvertiserProfileCreateRequest) => {
      const response = await apiClient.post<AdvertiserProfileResponse>('/advertiser/profile', data);
      return AdvertiserProfileResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiser', 'profile'] });
      toast({
        title: '프로필 등록 완료',
        description: '광고주 프로필이 성공적으로 등록되었습니다.',
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: '프로필 등록 실패',
        description: error.response?.data?.error?.message || '프로필 등록 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
};
