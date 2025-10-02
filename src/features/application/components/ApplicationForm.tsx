"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  ApplicationCreateSchema,
  type ApplicationCreateRequest,
} from "@/features/application/lib/dto";
import { useCreateApplication } from "@/features/application/hooks/useApplication";

type ApplicationFormProps = {
  campaignId: string;
  campaignTitle: string;
};

export function ApplicationForm({ campaignId, campaignTitle }: ApplicationFormProps) {
  const { mutate: createApplication, isPending } = useCreateApplication();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationCreateRequest>({
    resolver: zodResolver(ApplicationCreateSchema),
    defaultValues: {
      campaignId,
      message: "",
      visitDate: "",
    },
  });

  const onSubmit = (data: ApplicationCreateRequest) => {
    createApplication(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">지원 체험단</p>
        <p className="text-lg font-semibold text-slate-900">{campaignTitle}</p>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">지원 정보</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">각오 한마디 *</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="이 체험단에 지원하는 이유와 각오를 작성해주세요 (최소 10자)"
              rows={5}
              className={errors.message ? "border-red-500" : ""}
            />
            {errors.message && (
              <p className="text-sm text-red-500">{errors.message.message}</p>
            )}
            <p className="text-xs text-slate-500">
              최소 10자 이상, 최대 500자까지 작성 가능합니다
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visitDate">방문 예정일 *</Label>
            <Input
              id="visitDate"
              type="date"
              {...register("visitDate")}
              className={errors.visitDate ? "border-red-500" : ""}
            />
            {errors.visitDate && (
              <p className="text-sm text-red-500">{errors.visitDate.message}</p>
            )}
            <p className="text-xs text-slate-500">
              체험 가능한 날짜를 선택해주세요
            </p>
          </div>
        </div>
      </Card>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          지원 전 확인사항
        </h3>
        <ul className="space-y-1 text-xs text-slate-600">
          <li>• 지원서 제출 후에는 수정이 불가능합니다</li>
          <li>• 선정 여부는 광고주가 결정하며, 결과는 개별 통보됩니다</li>
          <li>• 선정 후 미션을 완수하지 못할 경우 불이익이 있을 수 있습니다</li>
        </ul>
      </div>

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
          {isPending ? "제출 중..." : "지원하기"}
        </Button>
      </div>
    </form>
  );
}

