import axios from "axios";
import axiosClient from "./axiosClient";

export type Subscriber = {
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

/** Public — submits an email from the site's "Stay In The Loop" form. */
export async function subscribe(email: string) {
  const res = await axios.post(`${process.env.NEXT_PUBLIC_API}/subscribe`, {
    email,
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to subscribe");
  }

  return res.data as { success: true; message: string; data: { id: string } };
}

/** Admin — paginated, searchable subscriber list. */
export async function getSubscribers(
  page: number,
  limit: number,
  search: string
) {
  const res = await axiosClient.get("/admin/get/subscribers", {
    params: { page, limit, search: search || undefined },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to fetch subscribers");
  }

  return {
    subscribers: (res.data.data || []) as Subscriber[],
    pagination: (res.data.pagination || null) as Pagination | null,
  };
}

/** Admin — removes a subscriber by id. */
export async function deleteSubscriber(id: string) {
  const res = await axiosClient.delete("/admin/delete/subscriber", {
    params: { id },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to delete subscriber");
  }
}

/** Extracts a user-facing message from any error thrown by the calls above. */
export function getSubscriberErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
