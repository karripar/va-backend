const fetchData = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(url, options);

  let data: unknown = null;

  // Check if there's actually a body to parse
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text(); // fallback for non-JSON or empty
  }

  if (!response.ok) {
    if (data && typeof data === "object" && "message" in data) {
      throw new Error((data as { message: string }).message);
    }
    throw new Error(`Error ${response.status} occurred`);
  }

  return data as T;
};

export default fetchData;
