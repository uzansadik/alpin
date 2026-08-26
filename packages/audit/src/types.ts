export type AuditTarget = {
  type: string;
  id?: string | null;
};

export type WriteAuditLogInput = {
  organizationId?: string | null;
  actorId?: string | null;

  action: string;

  target?: AuditTarget;

  metadata?: Record<string, unknown>;

  ipAddress?: string | null;
  userAgent?: string | null;
};
