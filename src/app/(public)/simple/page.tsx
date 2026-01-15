export const dynamic = 'force-dynamic'

export default function SimplePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: 'black', fontSize: '24px' }}>Simple Test Page</h1>
      <p style={{ color: 'black', fontSize: '16px' }}>
        This is a simple test page without complex components.
      </p>
      <nav style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', marginRight: '20px' }}>홈</a>
        <a href="/p/about-us" style={{ color: 'blue', marginRight: '20px' }}>소개</a>
        <a href="/programs" style={{ color: 'blue', marginRight: '20px' }}>프로그램</a>
      </nav>
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc'
      }}>
        <h2>Navigation Test</h2>
        <p>Click the links above to test navigation. If you see content on other pages, the basic routing works.</p>
      </div>
    </div>
  )
}