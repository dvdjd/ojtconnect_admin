const request = async <T, B = unknown>(url: string, method: string, body?: B): Promise<T> => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? ({} as T) : (await res.json() as T);
};

export const api = {
  get: <T>(url: string) => request<T>(url, 'GET'),
  post: <T, B = unknown>(url: string, body?: B) => request<T, B>(url, 'POST', body),
  put: <T, B = unknown>(url: string, body?: B) => request<T, B>(url, 'PUT', body),
  patch: <T, B = unknown>(url: string, body?: B) => request<T, B>(url, 'PATCH', body),
  delete: <T, B = unknown>(url: string, body?: B) => request<T>(url, 'DELETE', body),
};
