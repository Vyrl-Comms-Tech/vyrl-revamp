"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSubscribers,
  deleteSubscriber,
  getSubscriberErrorMessage,
  type Subscriber,
  type Pagination,
} from "../../lib/subscriberApi";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async (targetPage: number, searchTerm: string) => {
    setLoading(true);
    setError("");
    try {
      const { subscribers, pagination } = await getSubscribers(targetPage, 10, searchTerm);
      setSubscribers(subscribers);
      setPagination(pagination);
    } catch (err) {
      setError(getSubscriberErrorMessage(err, "Failed to fetch subscribers"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSubscribers(page, search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [page, search, fetchSubscribers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this subscriber? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      await deleteSubscriber(id);

      if (subscribers.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchSubscribers(page, search);
      }
    } catch (err) {
      alert(getSubscriberErrorMessage(err, "Failed to delete subscriber"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="adminMain-header">
        <h1 className="adminMain-title">Subscribers</h1>
        <p className="adminMain-subtitle">
          {pagination ? `${pagination.totalItems} total subscribers` : "Loading..."}
        </p>
      </div>

      <div className="adminTable-wrap">
        <div className="adminTable-toolbar">
          <input
            type="text"
            className="adminTable-search"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {pagination && (
            <span className="adminTable-count">{pagination.totalItems} records</span>
          )}
        </div>

        {error && <div className="adminTable-error">{error}</div>}

        <table className="adminTable">
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="adminTable-empty">
                  Loading...
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="adminTable-empty">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s._id}>
                  <td>{s.email}</td>
                  <td>{formatDate(s.createdAt)}</td>
                  <td>
                    <div className="adminTable-actions">
                      <button
                        className="adminTable-deleteBtn"
                        onClick={() => handleDelete(s._id)}
                        disabled={deletingId === s._id}
                      >
                        {deletingId === s._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination && pagination.totalPages > 1 && (
          <div className="adminPagination">
            <span className="adminPagination-info">
              Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems}
            </span>
            <div className="adminPagination-controls">
              <button
                className="adminPagination-btn"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &lsaquo;
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    className={`adminPagination-btn${p === page ? " active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                className="adminPagination-btn"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                &rsaquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
