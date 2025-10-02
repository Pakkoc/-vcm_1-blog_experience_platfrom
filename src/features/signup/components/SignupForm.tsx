"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSignup } from '@/features/signup/hooks/useSignup';
import { SignupRequestSchema, type SignupRequest } from '@/features/signup/lib/dto';
import { RoleSelector } from './RoleSelector';
import { TermsAgreement } from './TermsAgreement';
import { formatPhoneNumber } from '@/lib/validation/phone';
import { USER_ROLE } from '@/constants/roles';
import { useToast } from '@/hooks/use-toast';

export const SignupForm = () => {
  const { toast } = useToast();
  const signupMutation = useSignup();

  const form = useForm<SignupRequest>({
    resolver: zodResolver(SignupRequestSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: USER_ROLE.INFLUENCER,
      terms: {
        required: true,
        marketing: false,
      },
    },
  });

  const onSubmit = async (data: SignupRequest) => {
    try {
      await signupMutation.mutateAsync(data);
      toast({
        title: '회원가입 성공',
        description: '환영합니다! 이메일을 확인하여 인증을 완료해주세요.',
      });
    } catch (error) {
      let errorMessage = '회원가입에 실패했습니다';

      if (error instanceof Error) {
        if (error.message.includes('EMAIL_ALREADY_EXISTS')) {
          errorMessage = '이미 사용 중인 이메일입니다';
        } else if (error.message.includes('PHONE_ALREADY_EXISTS')) {
          errorMessage = '이미 사용 중인 휴대폰 번호입니다';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      toast({
        title: '회원가입 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="홍길동"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일 *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>휴대폰번호 *</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="010-0000-0000"
                  autoComplete="tel"
                  {...field}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호 *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="8자 이상, 영문/숫자 포함"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>역할 선택 *</FormLabel>
              <FormControl>
                <RoleSelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>약관 동의</FormLabel>
              <FormControl>
                <TermsAgreement value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={signupMutation.isPending}
        >
          {signupMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              가입 중...
            </>
          ) : (
            '회원가입'
          )}
        </Button>
      </form>
    </Form>
  );
};
