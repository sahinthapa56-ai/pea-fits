"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ──────────────────────────────────────────────
// Messages Page
// ──────────────────────────────────────────────

export default function MessagesPage() {
  const { addToast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/messages");
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch messages");
      setMessages(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkRead = async (messageId: string) => {
    try {
      const res = await fetch(`/api/admin/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [messageId] }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update message");
      addToast("success", "Message marked as read");
      fetchMessages();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to update message");
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Messages</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-text-secondary mt-1">
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <Skeleton variant="table" lines={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMessages} />
      ) : messages.length === 0 ? (
        <EmptyState
          title="No messages"
          description="Contact messages from customers will appear here."
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border divide-y divide-border">
          {messages.map((msg) => (
            <div key={msg.id} className="hover:bg-surface-container/30 transition-colors">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                className="w-full text-left px-6 py-4 flex items-center gap-4"
              >
                <div className="shrink-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${msg.isRead ? "bg-surface-container" : "bg-primary"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-primary">{msg.name}</span>
                    <span className="text-sm text-text-secondary truncate">{msg.subject}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-text-secondary">{msg.email}</span>
                    <span className="text-xs text-text-secondary">·</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {!msg.isRead && (
                    <Badge variant="warning" size="sm">
                      New
                    </Badge>
                  )}
                  <svg
                    className={`w-4 h-4 text-text-secondary transition-transform ${expandedId === msg.id ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded message content */}
              {expandedId === msg.id && (
                <div className="px-6 pb-4 pl-[3.25rem] space-y-3">
                  <div className="p-4 rounded-lg bg-surface-container/30 border border-border">
                    <p className="text-sm text-primary whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Reply via email
                    </a>
                    {!msg.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkRead(msg.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
