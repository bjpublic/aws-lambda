import AWSXRay from "aws-xray-sdk-core";

export function captureFn<R>(name: string, fn: () => R): R {
  return process.env.IS_OFFLINE ? fn() : AWSXRay.captureFunc(name, fn);
}

export async function captureAsyncFn<R>(
  name: string,
  fn: () => Promise<R>
): Promise<R> {
  if (process.env.IS_OFFLINE) {
    return fn();
  }
  return AWSXRay.captureAsyncFunc(name, async function (subsegment) {
    try {
      const result = await fn();
      subsegment?.close();
      return result;
    } catch (error: any) {
      subsegment?.close(error);
      throw error;
    }
  });
}
