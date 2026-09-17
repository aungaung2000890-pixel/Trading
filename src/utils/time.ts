export interface DualTime {
  mmtTime: string;
  mmtDate: string;
  usTime: string;
  usDate: string;
  timestamp: number;
}

export function getDualTime(date: Date = new Date()): DualTime {
  const mmtTime = date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Yangon',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const mmtDate = date.toLocaleDateString('en-US', {
    timeZone: 'Asia/Yangon',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const usTime = date.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const usDate = date.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    mmtTime,
    mmtDate,
    usTime,
    usDate,
    timestamp: date.getTime(),
  };
}

export function formatTimeAgo(timestamp: number, lang: 'my' | 'en' = 'my'): string {
  const elapsedSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSec < 5) {
    return lang === 'my' ? 'ယခုလေးတင်' : 'Just now';
  }
  if (elapsedSec < 60) {
    return lang === 'my' ? `လွန်ခဲ့သော ${elapsedSec} စက္ကန့်က` : `${elapsedSec}s ago`;
  }
  const elapsedMin = Math.floor(elapsedSec / 60);
  return lang === 'my' ? `လွန်ခဲ့သော ${elapsedMin} မိနစ်က` : `${elapsedMin}m ago`;
}
