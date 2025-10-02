"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  AdvertiserProfileCreateSchema,
  type AdvertiserProfileCreateRequest,
} from "@/features/advertiser/lib/dto";
import { useCreateAdvertiserProfile } from "@/features/advertiser/hooks/useAdvertiserProfile";

export function AdvertiserOnboardingForm() {
  const { mutate: createProfile, isPending } = useCreateAdvertiserProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdvertiserProfileCreateRequest>({
    resolver: zodResolver(AdvertiserProfileCreateSchema),
    defaultValues: {
      companyName: "",
      location: "",
      category: "",
      businessNumber: "",
    },
  });

  const onSubmit = (data: AdvertiserProfileCreateRequest) => {
    createProfile(data);
  };

  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">사업자 정보</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">업체명 *</Label>
            <Input
              id="companyName"
              {...register("companyName")}
              placeholder="예: 서울맛집"
              className={errors.companyName ? "border-red-500" : ""}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">위치 (주소) *</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="예: 서울시 강남구 테헤란로 123"
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">카테고리 *</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="예: 한식, 카페, 뷰티, IT 등"
              className={errors.category ? "border-red-500" : ""}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessNumber">사업자등록번호 *</Label>
            <Input
              id="businessNumber"
              {...register("businessNumber")}
              placeholder="000-00-00000"
              maxLength={12}
              onChange={(e) => {
                e.target.value = formatBusinessNumber(e.target.value);
              }}
              className={errors.businessNumber ? "border-red-500" : ""}
            />
            {errors.businessNumber && (
              <p className="text-sm text-red-500">{errors.businessNumber.message}</p>
            )}
            <p className="text-xs text-slate-500">
              사업자등록번호는 검증 후 승인됩니다
            </p>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => window.history.back()}
          disabled={isPending}
        >
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "등록 중..." : "프로필 등록"}
        </Button>
      </div>
    </form>
  );
}

