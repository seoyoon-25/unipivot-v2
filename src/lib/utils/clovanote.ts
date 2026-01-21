// 클로바노트 앱 URL
export function getClovaNoteLaunchUrl(platform: 'ios' | 'android' | 'web') {
  const urls = {
    ios: 'clovanote://',
    android: 'intent://launch#Intent;scheme=clovanote;package=com.naver.labs.clovanote;end',
    web: 'https://clovanote.naver.com'
  }
  return urls[platform]
}
