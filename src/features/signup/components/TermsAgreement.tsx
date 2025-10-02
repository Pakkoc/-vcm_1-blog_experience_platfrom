"use client";

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { REQUIRED_TERMS, MARKETING_TERMS } from '@/features/signup/constants/terms';

type TermsAgreementProps = {
  value?: {
    required?: boolean;
    marketing?: boolean;
  };
  onChange: (value: { required: boolean; marketing: boolean }) => void;
};

type TermsDialogProps = {
  title: string;
  content: string;
};

const TermsDialog = ({ title, content }: TermsDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs">
          보기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="whitespace-pre-wrap text-sm text-slate-700">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const TermsAgreement = ({ value = { required: false, marketing: false }, onChange }: TermsAgreementProps) => {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-4">
      <div className="flex items-start gap-2">
        <Checkbox
          id="terms-required"
          checked={value.required ?? false}
          onCheckedChange={(checked) =>
            onChange({ required: checked === true, marketing: value.marketing ?? false })
          }
        />
        <div className="flex flex-1 items-center justify-between gap-2">
          <label
            htmlFor="terms-required"
            className="cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            <span className="font-medium text-rose-600">[필수]</span>{' '}
            {REQUIRED_TERMS.title}
          </label>
          <TermsDialog title={REQUIRED_TERMS.title} content={REQUIRED_TERMS.content} />
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="terms-marketing"
          checked={value.marketing ?? false}
          onCheckedChange={(checked) =>
            onChange({ required: value.required ?? false, marketing: checked === true })
          }
        />
        <div className="flex flex-1 items-center justify-between gap-2">
          <label
            htmlFor="terms-marketing"
            className="cursor-pointer text-sm leading-none text-slate-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            <span className="text-slate-500">[선택]</span> {MARKETING_TERMS.title}
          </label>
          <TermsDialog title={MARKETING_TERMS.title} content={MARKETING_TERMS.content} />
        </div>
      </div>
    </div>
  );
};
