const DEFAULT_API_BASE_URL = "http://localhost:3000/api";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const API_BASE_URL = stripTrailingSlash(
  process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
);

export type ApiPoster = {
  id: number;
  club_id: number;
  user_id: number;
  location: string;
  position: string;
  img_path: string;
  date: string;
};

export type ApiClub = {
  id: number;
  member_post_permissions?: boolean;
};

type SearchPosterResponse = {
  posters: ApiPoster[];
  total_count: number;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      responseText || `Request failed with status ${response.status}`,
    );
  }

  // Some endpoints may not return JSON bodies.
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const boilerbuzzApi = {
  apiBaseUrl: API_BASE_URL,

  getPosters: async () => {
    return request<ApiPoster[]>("/poster");
  },

  getClubs: async () => {
    return request<ApiClub[]>("/club");
  },

  searchPosters: async (searchTag: string) => {
    return request<SearchPosterResponse>("/posters/search", {
      method: "POST",
      body: {
        search_tag: searchTag,
        page_index: 0,
        page_length: 50,
      },
    });
  },

  createPoster: async (payload: {
    club_id: number;
    user_id: number;
    location: string;
    position: string;
    img_path: string;
    date: string;
  }) => {
    return request<ApiPoster[]>("/poster", {
      method: "POST",
      body: payload,
    });
  },

  createClub: async (payload: { member_post_permissions: boolean }) => {
    return request<ApiClub[]>("/club", {
      method: "POST",
      body: payload,
    });
  },
};
