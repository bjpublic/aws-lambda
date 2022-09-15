export async function acceptTraceIdCookie(): Promise<void> {
  await fetch(`/api/accept-trace`, {
    method: "POST",
  });
}

export async function markAsLike(id: string): Promise<number | null> {
  return await handleServerResponse(
    fetch(`/api/${id}/like`, { method: "POST" }),
    null
  );
}

export async function fetchLike(id: string): Promise<number | null> {
  return await handleServerResponse(fetch(`/api/${id}/like`), null);
}

export async function fetchRecommendation(id: string): Promise<string[]> {
  return await handleServerResponse(fetch(`/recommend-api/${id}?topn=3`), []);
}

async function handleServerResponse<R>(
  promise: Promise<Response>,
  defaultValue: R
): Promise<R> {
  try {
    const response = await promise;
    const json = await response.json();
    if (response.ok) {
      return json.result;
    }
    throw json;
  } catch (error) {
    console.error({ error }, "Error from server");
  }
  return defaultValue;
}
