'use client';

import { Phone, Building2, MapPin, Calendar, Users, Briefcase } from 'lucide-react';
import { getSouthProvinces, getNorthProvinces, getNorthCities } from '@/lib/data/regions';

interface FormData {
  displayName: string;
  origin: string;
  birthRegion: string;
  birthCity: string;
  residenceRegion: string;
  phone: string;
  birthYear: string;
  gender: string;
  occupation: string;
  organization: string;
  referralSource: string;
}

interface RegisterStep2Props {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFormData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  error: string;
}

const referralOptions = [
  '지인 소개',
  '인터넷 검색',
  'SNS (페이스북, 인스타그램 등)',
  '유튜브',
  '언론 보도',
  '오프라인 홍보물',
  '기타',
];

export default function RegisterStep2({
  formData,
  onChange,
  setFormData,
  onNext,
  onPrev,
  error,
}: RegisterStep2Props) {
  const southProvinces = getSouthProvinces();
  const northProvinces = getNorthProvinces();

  const handleOriginChange = (origin: string) => {
    setFormData((prev: any) => ({
      ...prev,
      origin,
      birthRegion: '',
      birthCity: '',
    }));
  };

  const handleBirthRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      birthRegion: e.target.value,
      birthCity: '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const isStep2Valid = () => {
    return (
      formData.displayName.trim() &&
      formData.origin &&
      formData.residenceRegion &&
      formData.phone.trim() &&
      formData.birthYear &&
      formData.gender
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
            onChange={onChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="활동명을 입력해주세요"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          💡 독후감 작성 시 익명 처리를 원할 때 사용됩니다
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            출생지
          </label>

          {/* 남한: 시/도만 선택 */}
          {formData.origin === 'SOUTH' && (
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="birthRegion"
                value={formData.birthRegion}
                onChange={onChange}
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
                onChange={onChange}
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
                onChange={onChange}
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
            onChange={onChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
            required
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
            onChange={onChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="010-0000-0000"
            required
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
              onChange={onChange}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="1990"
              min="1900"
              max={new Date().getFullYear()}
              required
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
                onClick={() =>
                  setFormData((prev: any) => ({ ...prev, gender: option.value }))
                }
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
              onChange={onChange}
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
              onChange={onChange}
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
          onChange={onChange}
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

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 py-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
        <button
          type="submit"
          disabled={!isStep2Valid()}
          className="flex-1 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </form>
  );
}
