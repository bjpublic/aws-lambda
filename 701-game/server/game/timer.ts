export default function timer(intervalMillis: number) {
  let lastMillis = 0;
  return function check(): boolean {
    const now = Date.now();
    if (lastMillis === 0) {
      lastMillis = now;
      return false;
    }
    if (now - lastMillis < intervalMillis) {
      return false;
    }
    lastMillis = now;
    return true;
  };
}
