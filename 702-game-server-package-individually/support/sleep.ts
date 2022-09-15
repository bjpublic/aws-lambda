export default async function sleep(millis: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, millis));
}
