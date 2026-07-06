export function saved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getLastSevenDays() {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export function shortDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
  });
}
