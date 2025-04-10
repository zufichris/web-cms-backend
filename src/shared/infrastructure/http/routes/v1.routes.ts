import { userRoutes } from "@app/modules/user/infrastructure/http/routes/user.routes";
import express from "express";
import { Request, Response } from "express";
import os from "os";
const router = express.Router();

const API_VERSION = "v1";
const BASE_PATH = `/${API_VERSION}`;

let requestsServed = 0;
const startTime = new Date();

const API_INFO = {
  version: API_VERSION,
  name: "Website CMS API",
  status: "operational",
  timestamp: new Date().toISOString(),
  endpoints: [
    {
      path: BASE_PATH,
      method: "GET",
      description: "API information with system details",
    },
    {
      path: `${BASE_PATH}/health`,
      method: "GET",
      description:
        "Detailed health check with memory usage and performance metrics",
      params: [
        {
          name: "format",
          value: "simple|detailed",
          description: "Response format (default: detailed)",
        },
      ],
    },
    {
      path: `${BASE_PATH}/ping`,
      method: "GET",
      description: "Enhanced ping response with timing and echo capability",
      params: [
        {
          name: "echo",
          value: "string",
          description: "String to echo back in the response",
        },
      ],
    },
    {
      path: `${BASE_PATH}/users`,
      method: "GET",
      description: "List all users",
    },
    {
      path: `${BASE_PATH}/users/:id`,
      method: "GET",
      description: "Get user by ID",
    },
    {
      path: `${BASE_PATH}/users`,
      method: "POST",
      description: "Create a new user",
    },
    {
      path: `${BASE_PATH}/users/:id`,
      method: "PUT",
      description: "Update user by ID",
    },
    {
      path: `${BASE_PATH}/users/:id`,
      method: "DELETE",
      description: "Delete user by ID",
    },
  ],
};

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

router.use("/v1/users", userRoutes);

router.get(BASE_PATH, (_: Request, res: Response) => {
  requestsServed++;
  const systemInfo = {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
    freeMemory: `${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`,
  };

  res.status(200).json({
    ...API_INFO,
    message: "Welcome to the Website CMS API v1",
    apiStatus: {
      upSince: startTime.toISOString(),
      uptime: formatUptime(process.uptime()),
      requestsServed,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
    },
    system: systemInfo,
  });
});

router.get(`${BASE_PATH}/health`, (req: Request, res: Response) => {
  {
    requestsServed++;
    const format = req.query.format === "simple" ? "simple" : "detailed";
    const currentTime = new Date();

    if (format === "simple") {
      res.status(200).json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: currentTime.toISOString(),
      });
    }

    const memoryUsage = process.memoryUsage();
    const osInfo = {
      loadAvg: os.loadavg(),
      uptime: formatUptime(os.uptime()),
      freeMemory: `${Math.round(os.freemem() / (1024 * 1024))} MB`,
      totalMemory: `${Math.round(os.totalmem() / (1024 * 1024))} MB`,
      cpuUsage: process.cpuUsage(),
    };

    const uptimeMs = currentTime.getTime() - startTime.getTime();
    const requestsPerMinute = (requestsServed / (uptimeMs / 1000 / 60)).toFixed(
      2,
    );

    res.status(200).json({
      status: "healthy",
      timestamp: currentTime.toISOString(),
      process: {
        uptime: {
          seconds: process.uptime(),
          formatted: formatUptime(process.uptime()),
        },
        memory: {
          rss: `${Math.round(memoryUsage.rss / (1024 * 1024))} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / (1024 * 1024))} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / (1024 * 1024))} MB`,
          external: `${Math.round(memoryUsage.external / (1024 * 1024))} MB`,
          usagePercentage: `${((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1)}%`,
        },
        resourceUsage: process.resourceUsage(),
      },
      os: osInfo,
      api: {
        startTime: startTime.toISOString(),
        uptime: formatUptime(uptimeMs / 1000),
        requests: {
          total: requestsServed,
          perMinute: requestsPerMinute,
        },
      },
    });
  }
});

router.get(`${BASE_PATH}/ping`, (req: Request, res: Response) => {
  requestsServed++;
  const startHrTime = process.hrtime();
  const timestamp = new Date();

  const echo = req.query.echo ? String(req.query.echo) : undefined;

  const hrtime = process.hrtime(startHrTime);
  const responseTimeMs = hrtime[0] * 1000 + hrtime[1] / 1000000;

  res.status(200).json({
    message: "pong",
    timestamp: timestamp.toISOString(),
    responseTime: `${responseTimeMs.toFixed(2)}ms`,
    serverTime: {
      iso: timestamp.toISOString(),
      unix: Math.floor(timestamp.getTime() / 1000),
      timezone: timestamp.getTimezoneOffset(),
    },
    request: {
      number: requestsServed,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    },
    ...(echo && { echo }),
  });
});

export const routesV1 = router;
