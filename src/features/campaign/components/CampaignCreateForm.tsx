"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  CampaignCreateSchema,
  type CampaignCreateRequest,
} from "@/features/campaign/lib/dto";
import { useCreateCampaign } from "@/features/campaign/hooks/useCampaign";

export function CampaignCreateForm() {
  const { mutate: createCampaign, isPending } = useCreateCampaign();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CampaignCreateRequest>({
    resolver: zodResolver(CampaignCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      benefits: "",
      mission: "",
      recruitCount: 1,
      recruitStartDate: "",
      recruitEndDate: "",
      experienceStartDate: "",
      experienceEndDate: "",
    },
  });

  const onSubmit = (data: CampaignCreateRequest) => {
    // datetime-local 값을 ISO 8601 형식으로 변환
    const formattedData = {
      ...data,
      recruitStartDate: new Date(data.recruitStartDate).toISOString(),
      recruitEndDate: new Date(data.recruitEndDate).toISOString(),
    };
    createCampaign(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">기본 정보</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">체험단 제목 *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="예: 강남 프리미엄 한식당 체험단 모집"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">상세 설명 *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="체험단에 대한 상세 설명을 입력해주세요"
              rows={5}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">위치 *</Label>
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
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">혜택 및 미션</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="benefits">제공 혜택 *</Label>
            <Textarea
              id="benefits"
              {...register("benefits")}
              placeholder="예: 2인 디너 세트 무료 제공 (5만원 상당)"
              rows={3}
              className={errors.benefits ? "border-red-500" : ""}
            />
            {errors.benefits && (
              <p className="text-sm text-red-500">{errors.benefits.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission">미션 내용 *</Label>
            <Textarea
              id="mission"
              {...register("mission")}
              placeholder="예: 방문 후 7일 이내 블로그 리뷰 작성 (최소 500자, 사진 5장 이상)"
              rows={3}
              className={errors.mission ? "border-red-500" : ""}
            />
            {errors.mission && (
              <p className="text-sm text-red-500">{errors.mission.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">모집 정보</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recruitCount">모집 인원 *</Label>
            <Input
              id="recruitCount"
              type="number"
              min="1"
              {...register("recruitCount", { valueAsNumber: true })}
              placeholder="1"
              className={errors.recruitCount ? "border-red-500" : ""}
            />
            {errors.recruitCount && (
              <p className="text-sm text-red-500">{errors.recruitCount.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recruitStartDate">모집 시작일시 *</Label>
              <Input
                id="recruitStartDate"
                type="datetime-local"
                {...register("recruitStartDate")}
                className={errors.recruitStartDate ? "border-red-500" : ""}
              />
              {errors.recruitStartDate && (
                <p className="text-sm text-red-500">
                  {errors.recruitStartDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recruitEndDate">모집 종료일시 *</Label>
              <Input
                id="recruitEndDate"
                type="datetime-local"
                {...register("recruitEndDate")}
                className={errors.recruitEndDate ? "border-red-500" : ""}
              />
              {errors.recruitEndDate && (
                <p className="text-sm text-red-500">
                  {errors.recruitEndDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="experienceStartDate">체험 시작일 *</Label>
              <Input
                id="experienceStartDate"
                type="date"
                {...register("experienceStartDate")}
                className={errors.experienceStartDate ? "border-red-500" : ""}
              />
              {errors.experienceStartDate && (
                <p className="text-sm text-red-500">
                  {errors.experienceStartDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceEndDate">체험 종료일 *</Label>
              <Input
                id="experienceEndDate"
                type="date"
                {...register("experienceEndDate")}
                className={errors.experienceEndDate ? "border-red-500" : ""}
              />
              {errors.experienceEndDate && (
                <p className="text-sm text-red-500">
                  {errors.experienceEndDate.message}
                </p>
              )}
            </div>
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
          {isPending ? "등록 중..." : "체험단 등록"}
        </Button>
      </div>
    </form>
  );
}

