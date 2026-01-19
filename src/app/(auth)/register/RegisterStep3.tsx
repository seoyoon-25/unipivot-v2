'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, Loader2 } from 'lucide-react';

interface FormData {
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
}

interface RegisterStep3Props {
  formData: FormData;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onPrev: () => void;
  isLoading: boolean;
  error: string;
}

export default function RegisterStep3({
  formData,
  setFormData,
  onSubmit,
  onPrev,
  isLoading,
  error,
}: RegisterStep3Props) {
  const [allChecked, setAllChecked] = useState(false);

  const handleAllCheck = () => {
    const newValue = !allChecked;
    setAllChecked(newValue);
    setFormData((prev: any) => ({
      ...prev,
      termsAgreed: newValue,
      privacyAgreed: newValue,
      marketingAgreed: newValue,
    }));
  };

  const handleCheck = (field: string) => {
    setFormData((prev: any) => {
      const newData = { ...prev, [field]: !prev[field] };
      // 모든 필수 약관이 동의되어 있고 마케팅도 동의되어 있으면 전체 동의 체크
      setAllChecked(newData.termsAgreed && newData.privacyAgreed && newData.marketingAgreed);
      return newData;
    });
  };

  const isFormValid = formData.termsAgreed && formData.privacyAgreed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">약관 동의</h3>
        <p className="text-sm text-gray-500 mt-1">서비스 이용을 위해 약관에 동의해주세요</p>
      </div>

      {/* 전체 동의 */}
      <div
        onClick={handleAllCheck}
        className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            allChecked ? 'bg-primary border-primary' : 'border-gray-300'
          }`}
        >
          {allChecked && <Check className="w-4 h-4 text-white" />}
        </div>
        <span className="font-semibold text-gray-900">전체 동의</span>
      </div>

      {/* 개별 약관 */}
      <div className="space-y-3">
        {/* 이용약관 */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <div
            onClick={() => handleCheck('termsAgreed')}
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                formData.termsAgreed ? 'bg-primary border-primary' : 'border-gray-300'
              }`}
            >
              {formData.termsAgreed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-700">
              <span className="text-red-500">[필수]</span> 이용약관 동의
            </span>
          </div>
          <Link
            href="/terms"
            target="_blank"
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* 개인정보처리방침 */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <div
            onClick={() => handleCheck('privacyAgreed')}
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                formData.privacyAgreed ? 'bg-primary border-primary' : 'border-gray-300'
              }`}
            >
              {formData.privacyAgreed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-700">
              <span className="text-red-500">[필수]</span> 개인정보 수집 및 이용 동의
            </span>
          </div>
          <Link
            href="/privacy"
            target="_blank"
            className="text-gray-400 hover:text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* 마케팅 수신 동의 */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <div
            onClick={() => handleCheck('marketingAgreed')}
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                formData.marketingAgreed ? 'bg-primary border-primary' : 'border-gray-300'
              }`}
            >
              {formData.marketingAgreed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-700">
              <span className="text-gray-400">[선택]</span> 마케팅 정보 수신 동의
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        마케팅 정보 수신에 동의하시면 유니피벗의 새로운 프로그램, 이벤트, 소식을 받아보실 수 있습니다.
      </p>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={isLoading}
          className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          이전
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              가입 중...
            </>
          ) : (
            '가입하기'
          )}
        </button>
      </div>
    </form>
  );
}
