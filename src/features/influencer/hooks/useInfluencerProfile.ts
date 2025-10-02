import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/remote/api-client';
import {
  InfluencerProfileResponseSchema,
  type InfluencerProfileCreateRequest,
  type InfluencerProfileResponse,
} from '@/features/influencer/lib/dto';
import { useToast } from '@/hooks/use-toast';

export const useInfluencerProfile = () => {
  return useQuery({
    queryKey: ['influencer', 'profile'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<InfluencerProfileResponse>('/influencer/profile');
        return InfluencerProfileResponseSchema.parse(response.data);
      } catch (error) {
        return null;
      }
    },
  });
};

export const useCreateInfluencerProfile = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InfluencerProfileCreateRequest) => {
      const response = await apiClient.post<InfluencerProfileResponse>(
        '/influencer/profile',
        data
      );
      return InfluencerProfileResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer', 'profile'] });
      toast({
        title: '프로필 등록 완료',
        description: '인플루언서 프로필이 성공적으로 등록되었습니다.',
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

