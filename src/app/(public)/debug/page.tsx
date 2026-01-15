'use client'
export default function DebugPage() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      <h1>디버그 페이지</h1>
      <p>이 페이지가 보인다면 기본 렌더링은 작동하고 있습니다.</p>
      <button onClick={() => alert('클릭 이벤트 작동!')}>
        클릭 테스트
      </button>
      <div>
        <strong>현재 시간:</strong> {new Date().toLocaleString()}
      </div>
      <script dangerouslySetInnerHTML={{
        __html: 'console.log("Debug page JavaScript is working")'
      }} />
    </div>
  )
}