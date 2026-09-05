"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Search } from "lucide-react";
import axiosClient from "../../lib/axiosClient";

type Contact = {
  _id: string;
  serviceCategory: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminContactUsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState<Contact | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchContacts = useCallback(async (targetPage: number, searchTerm: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/admin/get/contacts", {
        params: { page: targetPage, limit: 10, search: searchTerm || undefined },
      });

      // console.log("Response Contact", res)

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to fetch contacts");
      }

      setContacts(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchContacts(page, search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [page, search, fetchContacts]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contact submission? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await axiosClient.delete("/admin/delete/contact", {
        params: { id },
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to delete contact");
      }

      if (viewing?._id === id) setViewing(null);
      
      if (contacts.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchContacts(page, search);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete contact");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="adminMain-header">
        <h1 className="adminMain-title">Contact Us</h1>
        <p className="adminMain-subtitle">
          {pagination ? `${pagination.totalItems} total submissions` : "Loading..."}
        </p>
      </div>

      <div className="adminTable-wrap">
        <div className="adminTable-toolbar">
          <div className="adminTable-searchWrap">
            <Search className="adminTable-searchIcon" size={15} strokeWidth={2} />
            <input
              type="text"
              className="adminTable-search"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          {pagination && (
            <span className="adminTable-count">{pagination.totalItems} records</span>
          )}
        </div>

        {error && <div className="adminTable-error">{error}</div>}

        <table className="adminTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="adminTable-empty">
                  Loading...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="adminTable-empty">
                  No contact submissions found.
                </td>
              </tr>
            ) : (
              contacts.map((c) => (
                <tr key={c._id}>
                  <td>{c.fullName}</td>
                  <td>{c.email}</td>
                  <td>{c.phoneNumber}</td>
                  <td className="adminTable-message">
                    {c.message.length > 60 ? `${c.message.slice(0, 60)}...` : c.message}
                  </td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td>
                    <div className="adminTable-actions">
                      <button
                        className="adminTable-viewBtn"
                        onClick={() => setViewing(c)}
                      >
                        View
                      </button>
                      <button
                        className="adminTable-deleteBtn"
                        onClick={() => handleDelete(c._id)}
                        disabled={deletingId === c._id}
                      >
                        {deletingId === c._id ? "Deleting..." : "Delete"}
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
                className="adminPagination-btn adminPagination-btn--nav"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={15} strokeWidth={2.25} />
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
                className="adminPagination-btn adminPagination-btn--nav"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={15} strokeWidth={2.25} />
              </button>
            </div>
          </div>
        )}
      </div>

      {viewing && (
        <div className="adminModal-overlay" onClick={() => setViewing(null)}>
          <div className="adminModal" onClick={(e) => e.stopPropagation()}>
            <div className="adminModal-header">
              <h2 className="adminModal-title">{viewing.fullName}</h2>
              <button className="adminModal-close" onClick={() => setViewing(null)}>
                <X size={16} strokeWidth={2.25} />
              </button>
            </div>
            <div className="adminModal-body">
              <div className="adminModal-row">
                <span className="adminModal-label">Email</span>
                <span className="adminModal-value">{viewing.email}</span>
              </div>
              <div className="adminModal-row">
                <span className="adminModal-label">Phone</span>
                <span className="adminModal-value">{viewing.phoneNumber}</span>
              </div>
              <div className="adminModal-row">
                <span className="adminModal-label">Country</span>
                <span className="adminModal-value">{viewing.country}</span>
              </div>
              <div className="adminModal-row">
                <span className="adminModal-label">Service</span>
                <span className="adminModal-value">{viewing.serviceCategory}</span>
              </div>
              <div className="adminModal-row">
                <span className="adminModal-label">Submitted</span>
                <span className="adminModal-value">{formatDate(viewing.createdAt)}</span>
              </div>
              <div className="adminModal-row adminModal-row--full">
                <span className="adminModal-label">Message</span>
                <p className="adminModal-message">{viewing.message}</p>
              </div>
            </div>
            <div className="adminModal-footer">
              <button
                className="adminTable-deleteBtn"
                onClick={() => handleDelete(viewing._id)}
                disabled={deletingId === viewing._id}
              >
                {deletingId === viewing._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
