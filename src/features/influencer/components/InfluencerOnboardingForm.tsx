"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  InfluencerProfileCreateSchema,
  type InfluencerProfileCreateRequest,
} from "@/features/influencer/lib/dto";
import { useCreateInfluencerProfile } from "@/features/influencer/hooks/useInfluencerProfile";

const CHANNEL_TYPES = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "blog", label: "블로그" },
  { value: "tiktok", label: "TikTok" },
] as const;

export function InfluencerOnboardingForm() {
  const { mutate: createProfile, isPending } = useCreateInfluencerProfile();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InfluencerProfileCreateRequest>({
    resolver: zodResolver(InfluencerProfileCreateSchema),
    defaultValues: {
      birthDate: "",
      channels: [
        {
          channelType: "instagram",
          channelName: "",
          channelUrl: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "channels",
  });

  const onSubmit = (data: InfluencerProfileCreateRequest) => {
    createProfile(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">기본 정보</h2>

        <div className="space-y-2">
          <Label htmlFor="birthDate">생년월일 *</Label>
          <Input
            id="birthDate"
            type="date"
            {...register("birthDate")}
            className={errors.birthDate ? "border-red-500" : ""}
          />
          {errors.birthDate && (
            <p className="text-sm text-red-500">{errors.birthDate.message}</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">SNS 채널 정보</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                channelType: "instagram",
                channelName: "",
                channelUrl: "",
              })
            }
            disabled={fields.length >= 4}
          >
            <Plus className="mr-1 h-4 w-4" />
            채널 추가
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-3 rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">채널 {index + 1}</h3>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`channels.${index}.channelType`}>
                  채널 타입 *
                </Label>
                <Select
                  value={watch(`channels.${index}.channelType`)}
                  onValueChange={(value) =>
                    setValue(
                      `channels.${index}.channelType`,
                      value as "instagram" | "youtube" | "blog" | "tiktok"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="채널 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.channels?.[index]?.channelType && (
                  <p className="text-sm text-red-500">
                    {errors.channels[index]?.channelType?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`channels.${index}.channelName`}>
                  채널명 *
                </Label>
                <Input
                  id={`channels.${index}.channelName`}
                  {...register(`channels.${index}.channelName`)}
                  placeholder="예: 맛집투어 블로거"
                  className={
                    errors.channels?.[index]?.channelName ? "border-red-500" : ""
                  }
                />
                {errors.channels?.[index]?.channelName && (
                  <p className="text-sm text-red-500">
                    {errors.channels[index]?.channelName?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`channels.${index}.channelUrl`}>
                  채널 URL *
                </Label>
                <Input
                  id={`channels.${index}.channelUrl`}
                  {...register(`channels.${index}.channelUrl`)}
                  placeholder="https://..."
                  className={
                    errors.channels?.[index]?.channelUrl ? "border-red-500" : ""
                  }
                />
                {errors.channels?.[index]?.channelUrl && (
                  <p className="text-sm text-red-500">
                    {errors.channels[index]?.channelUrl?.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {errors.channels && (
          <p className="mt-2 text-sm text-red-500">
            {typeof errors.channels === "object" && "message" in errors.channels
              ? errors.channels.message
              : "채널 정보를 확인해주세요"}
          </p>
        )}
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

