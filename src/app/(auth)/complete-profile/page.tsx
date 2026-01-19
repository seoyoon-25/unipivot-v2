'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  User,
  Phone,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Building2,
  Check,
  ChevronRight,
} from 'lucide-react';
import { getSouthProvinces, getNorthProvinces, getNorthCities } from '@/lib/data/regions';

const referralOptions = [
  '지인 소개',
  '인터넷 검색',
  'SNS (페이스북, 인스타그램 등)',
  '유튜브',
  '언론 보도',
  '오프라인 홍보물',
  '기타',
];

function CompleteProfileForm() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - 추가 정보
    displayName: '',
    origin: '',
    birthRegion: '',
    birthCity: '',
    residenceRegion: '',
    phone: '',
    birthYear: '',
    gender: '',
    occupation: '',
    organization: '',
    referralSource: '',
    // Step 2 - 약관 동의
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [allChecked, setAllChecked] = useState(false);

  const southProvinces = getSouthProvinces();
  const northProvinces = getNorthProvinces();

  // 세션에서 이름으로 활동명 초기화
  useEffect(() => {
    if (session?.user?.name) {
      setFormData((prev) => ({ ...prev, displayName: session.user.name || '' }));
    }
  }, [session]);

  // 인증 상태 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.profileCompleted) {
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOriginChange = (origin: string) => {
    setFormData((prev) => ({
      ...prev,
      origin,
      birthRegion: '',
      birthCity: '',
    }));
  };

  const handleBirthRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      birthRegion: e.target.value,
      birthCity: '',
    }));
  };

  const handleGenderChange = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const isStep1Valid = () => {
    return (
      formData.displayName.trim() &&
      formData.origin &&
      formData.residenceRegion &&
      formData.phone.trim() &&
      formData.birthYear &&
      formData.gender
    );
  };

  const handleStep1Next = () => {
    if (!formData.displayName.trim()) {
      setError('활동명을 입력해주세요.');
      return;
    }
    if (!formData.origin) {
      setError('출신을 선택해주세요.');
      return;
    }
    if (!formData.residenceRegion) {
      setError('거주지를 선택해주세요.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('연락처를 입력해주세요.');
      return;
    }
    if (!formData.birthYear) {
      setError('출생연도를 입력해주세요.');
      return;
    }
    if (!formData.gender) {
      setError('성별을 선택해주세요.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleAllCheck = () => {
    const newValue = !allChecked;
    setAllChecked(newValue);
    setFormData((prev) => ({
      ...prev,
      termsAgreed: newValue,
      privacyAgreed: newValue,
      marketingAgreed: newValue,
    }));
  };

  const handleTermsCheck = (field: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: !prev[field as keyof typeof prev] };
      setAllChecked(
        newData.termsAgreed && newData.privacyAgreed && newData.marketingAgreed
      );
      return newData;
    });
  };

  const handleSubmit = async () => {
    if (!formData.termsAgreed || !formData.privacyAgreed) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: formData.displayName,
          phone: formData.phone || undefined,
          origin: formData.origin || undefined,
          birthRegion: formData.birthRegion || undefined,
          birthCity: formData.birthCity || undefined,
          residenceRegion: formData.residenceRegion || undefined,
          birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
          gender: formData.gender || undefined,
          occupation: formData.occupation || undefined,
          organization: formData.organization || undefined,
          referralSource: formData.referralSource || undefined,
          termsAgreed: formData.termsAgreed,
          privacyAgreed: formData.privacyAgreed,
          marketingAgreed: formData.marketingAgreed,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '프로필 저장에 실패했습니다.');
        return;
      }

      // 세션 업데이트
      await update();

      // 원래 목적지로 이동
      router.push(callbackUrl);
    } catch {
      setError('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skipProfile: true }),
      });

      if (res.ok) {
        await update();
        router.push(callbackUrl);
      }
    } catch {
      router.push(callbackUrl);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">프로필 완성</h2>
        <p className="text-gray-600">서비스 이용을 위해 추가 정보를 입력해주세요</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
      </div>

      {/* Step Labels */}
      <div className="flex justify-between mb-6 text-xs text-gray-500">
        <span className={step >= 1 ? 'text-primary font-medium' : ''}>1. 추가정보</span>
        <span className={step >= 2 ? 'text-primary font-medium' : ''}>2. 약관동의</span>
      </div>

      {/* Step 1 - 추가 정보 */}
      {step === 1 && (
        <div className="space-y-5">
          {/* 활동명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              활동명(닉네임) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="활동명을 입력해주세요"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              독후감 작성 시 익명 처리를 원할 때 사용됩니다
            </p>
          </div>

          {/* 출신 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출신 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'SOUTH', label: '남한' },
                { value: 'NORTH', label: '북한' },
                { value: 'OVERSEAS', label: '해외' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOriginChange(option.value)}
                  className={`py-3 rounded-xl font-medium transition-colors ${
                    formData.origin === option.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 출생지 - 출신에 따라 다른 UI */}
          {formData.origin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출생지</label>

              {/* 남한: 시/도만 선택 */}
              {formData.origin === 'SOUTH' && (
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    name="birthRegion"
                    value={formData.birthRegion}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
                  >
                    <option value="">시/도 선택</option>
                    {southProvinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 북한: 시/도 + 시/군 선택 */}
              {formData.origin === 'NORTH' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="birthRegion"
                      value={formData.birthRegion}
                      onChange={handleBirthRegionChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
                    >
                      <option value="">시/도 선택</option>
                      {northProvinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                  <select
                    name="birthCity"
                    value={formData.birthCity}
                    onChange={handleChange}
                    disabled={!formData.birthRegion}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white disabled:bg-gray-100"
                  >
                    <option value="">시/군 선택</option>
                    {formData.birthRegion &&
                      getNorthCities(formData.birthRegion).map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* 해외: 직접 입력 */}
              {formData.origin === 'OVERSEAS' && (
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="birthRegion"
                    value={formData.birthRegion}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="출생지를 입력해주세요 (예: 미국 LA)"
                  />
                </div>
              )}
            </div>
          )}

          {/* 거주지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 거주지 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="residenceRegion"
                value={formData.residenceRegion}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
              >
                <option value="">시/도 선택</option>
                {southProvinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="010-0000-0000"
              />
            </div>
          </div>

          {/* 출생연도 & 성별 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출생연도 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="1990"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'MALE', label: '남성' },
                  { value: 'FEMALE', label: '여성' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleGenderChange(option.value)}
                    className={`py-3 rounded-xl font-medium transition-colors ${
                      formData.gender === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 소속 & 소속명 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">소속 (선택)</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="예: 학생, 직장인"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">소속명 (선택)</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="소속 기관/회사명"
                />
              </div>
            </div>
          </div>

          {/* 가입 경로 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">가입 경로 (선택)</label>
            <select
              name="referralSource"
              value={formData.referralSource}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
            >
              <option value="">선택해주세요</option>
              {referralOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="pt-4 space-y-3">
            <button
              type="button"
              onClick={handleStep1Next}
              disabled={!isStep1Valid()}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors disabled:opacity-50"
            >
              나중에 하기
            </button>
          </div>
        </div>
      )}

      {/* Step 2 - 약관 동의 */}
      {step === 2 && (
        <div className="space-y-6">
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
                onClick={() => handleTermsCheck('termsAgreed')}
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
              <Link href="/terms" target="_blank" className="text-gray-400 hover:text-gray-600">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* 개인정보처리방침 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div
                onClick={() => handleTermsCheck('privacyAgreed')}
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
              <Link href="/privacy" target="_blank" className="text-gray-400 hover:text-gray-600">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* 마케팅 수신 동의 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div
                onClick={() => handleTermsCheck('marketingAgreed')}
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
            마케팅 정보 수신에 동의하시면 유니피벗의 새로운 프로그램, 이벤트, 소식을 받아보실 수
            있습니다.
          </p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setError('');
                setStep(1);
              }}
              disabled={isLoading}
              className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              이전
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formData.termsAgreed || !formData.privacyAgreed || isLoading}
              className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  저장 중...
                </>
              ) : (
                '완료'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompleteProfileForm />
    </Suspense>
  );
}
