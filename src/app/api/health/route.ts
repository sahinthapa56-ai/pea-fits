import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type HealthStatus = {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  environment: string | undefined;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  db: {
    connected: boolean;
    latency: number;
  };
  version: string;
};

export async function GET() {
  const start = Date.now();

  const health: HealthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    db: { connected: false, latency: 0 },
    version: "1.0.0",
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.db = {
      connected: true,
      latency: Date.now() - start,
    };
    return NextResponse.json(health, { status: 200 });
  } catch {
    health.status = "error";
    health.db = {
      connected: false,
      latency: Date.now() - start,
    };
    return NextResponse.json(health, {
      status: 503,
      headers: { "Retry-After": "30" },
    });
  }
}
