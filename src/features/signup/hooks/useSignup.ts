import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { apiClient } from '@/lib/remote/api-client';
import {
  SignupResponseSchema,
  type SignupRequest,
  type SignupResponse,
} from '@/features/signup/lib/dto';

export const useSignup = () => {
  const router = useRouter();
  const { refresh } = useCurrentUser();

  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const response = await apiClient.post<SignupResponse>('/auth/signup', data);
      return SignupResponseSchema.parse(response.data);
    },
    onSuccess: async (data) => {
      await refresh();

      const params = new URLSearchParams({
        role: data.role,
        email: data.email,
      });

      router.push(`/signup/verify?${params.toString()}`);
    },
  });
};
