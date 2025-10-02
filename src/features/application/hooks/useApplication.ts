import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/remote/api-client';
import {
  ApplicationResponseSchema,
  type ApplicationCreateRequest,
  type ApplicationResponse,
  type ApplicationWithCampaign,
} from '@/features/application/lib/dto';
import { useToast } from '@/hooks/use-toast';

export const useMyApplications = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['applications', 'my'],
    queryFn: async () => {
      const response = await apiClient.get<ApplicationWithCampaign[]>('/applications/my');
      return response.data;
    },
    enabled,
  });
};

export const useCreateApplication = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ApplicationCreateRequest) => {
      const response = await apiClient.post<ApplicationResponse>('/applications', data);
      return ApplicationResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: '지원 완료',
        description: '체험단 지원이 완료되었습니다.',
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: '지원 실패',
        description: error.response?.data?.error?.message || '지원 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    },
  });
};

