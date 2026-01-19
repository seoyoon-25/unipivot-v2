'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegisterStep1 from './RegisterStep1';
import RegisterStep2 from './RegisterStep2';
import RegisterStep3 from './RegisterStep3';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    // Step 1 - 기본 정보
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    // Step 2 - 추가 정보
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
    // Step 3 - 약관 동의
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleStep1Next = () => {
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2Next = () => {
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
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!formData.termsAgreed || !formData.privacyAgreed) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">회원가입</h2>
      <p className="text-gray-600 mb-8">유니피벗과 함께 한반도의 미래를 만들어가세요</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
      </div>

      {/* Step Labels */}
      <div className="flex justify-between mb-6 text-xs text-gray-500">
        <span className={step >= 1 ? 'text-primary font-medium' : ''}>1. 기본정보</span>
        <span className={step >= 2 ? 'text-primary font-medium' : ''}>2. 추가정보</span>
        <span className={step >= 3 ? 'text-primary font-medium' : ''}>3. 약관동의</span>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <RegisterStep1
          formData={{
            name: formData.name,
            email: formData.email,
            password: formData.password,
            passwordConfirm: formData.passwordConfirm,
          }}
          onChange={handleChange}
          onNext={handleStep1Next}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          error={error}
        />
      )}

      {step === 2 && (
        <RegisterStep2
          formData={{
            displayName: formData.displayName,
            origin: formData.origin,
            birthRegion: formData.birthRegion,
            birthCity: formData.birthCity,
            residenceRegion: formData.residenceRegion,
            phone: formData.phone,
            birthYear: formData.birthYear,
            gender: formData.gender,
            occupation: formData.occupation,
            organization: formData.organization,
            referralSource: formData.referralSource,
          }}
          onChange={handleChange}
          setFormData={setFormData}
          onNext={handleStep2Next}
          onPrev={() => {
            setError('');
            setStep(1);
          }}
          error={error}
        />
      )}

      {step === 3 && (
        <RegisterStep3
          formData={{
            termsAgreed: formData.termsAgreed,
            privacyAgreed: formData.privacyAgreed,
            marketingAgreed: formData.marketingAgreed,
          }}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onPrev={() => {
            setError('');
            setStep(2);
          }}
          isLoading={isLoading}
          error={error}
        />
      )}

      <p className="mt-8 text-center text-sm text-gray-600">
        이미 회원이신가요?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
