import { ResponseDefault } from "@app/shared/application";
import express, { NextFunction } from "express";
import { Request, Response } from "express";
import os from "os";
const router = express.Router();

const API_VERSION = "v1";
const BASE_PATH = `/${API_VERSION}`;

let requestsServed = 0;
const startTime = new Date();

const endpointStats = new Map<string, EndpointStat>();

const trackRequestDuration = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  const method = req.method;
  const path = req.path;
  const endpoint = `${method}:${path}`;

  // Ensure the endpoint exists in our tracking map with proper structure
  if (!endpointStats.has(endpoint)) {
    // Try to identify the module from the path
    const pathSegments = path.split('/').filter(Boolean);
    let module = pathSegments.length > 1 ? pathSegments[1] : 'unknown';

    // Make sure module is one of our known modules
    const knownModules = ['auth', 'email', 'page', 'user'];
    if (!knownModules.includes(module)) {
      module = 'other';
    }

    // Determine if the endpoint is secured (this is a heuristic)
    const secured = path.includes('/me') ||
      (method !== 'GET' && !path.includes('/login') &&
        !path.includes('/register') && !path.includes('/refresh-token'));

    endpointStats.set(endpoint, {
      hits: 0,
      lastAccessed: null,
      averageResponseTime: 0,
      totalResponseTime: 0,
      statusCodes: {},
      method: method,
      module: module,
      secured: secured,
      errors: 0
    });
  }

  // Update stats when the response is finished
  res.on('finish', () => {
    const hrtime = process.hrtime(start);
    const responseTimeMs = hrtime[0] * 1000 + hrtime[1] / 1000000;
    const statusCode = res.statusCode;

    const stats = endpointStats.get(endpoint)! as EndpointStat;
    stats.hits++;
    stats.lastAccessed = new Date();
    stats.totalResponseTime += responseTimeMs;
    stats.averageResponseTime = stats.totalResponseTime / stats.hits;

    // Track status code distribution
    if (!stats.statusCodes[statusCode]) {
      stats.statusCodes[statusCode] = 0;
    }
    stats.statusCodes[statusCode]++;

    // Track errors (status codes 4xx and 5xx)
    if (statusCode >= 400) {
      stats.errors++;
    }

    endpointStats.set(endpoint, stats);
    requestsServed++;
  });

  next();
};

router.use(trackRequestDuration);

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
      path: `${BASE_PATH}/analytics`,
      method: "GET",
      description: "Comprehensive analytics with system metrics, endpoint usage, and performance data",
      params: [
        {
          name: "period",
          value: "hourly|daily|weekly|monthly|all",
          description: "Time period for analytics data (default: all)",
        },
        {
          name: "format",
          value: "detailed|summary",
          description: "Response format level of detail (default: detailed)",
        },
        {
          name: "module",
          value: "auth|email|page|user",
          description: "Filter analytics by specific module",
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

function getSystemInfo() {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`,
    freeMemory: `${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`,
    memoryUsagePercent: `${((1 - os.freemem() / os.totalmem()) * 100).toFixed(1)}%`,
    loadAverage: os.loadavg(),
    uptimeFormatted: formatUptime(os.uptime()),
  };
}

function getProcessInfo() {
  const memoryUsage = process.memoryUsage();

  return {
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
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || "development",
  };
}

router.get(BASE_PATH, (_: Request, res: Response) => {
  const systemInfo = getSystemInfo();

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
  const format = req.query.format === "simple" ? "simple" : "detailed";
  const currentTime = new Date();

  if (format === "simple") {
    res.status(200).json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: currentTime.toISOString(),
    });
    return;
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
  const requestsPerMinute = (requestsServed / (uptimeMs / 1000 / 60)).toFixed(2);

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
});

router.get(`${BASE_PATH}/ping`, (req: Request, res: Response) => {
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

interface EndpointStat {
  hits: number;
  lastAccessed: Date | null;
  averageResponseTime: number;
  totalResponseTime: number;
  statusCodes: Record<number, number>;
  method: string;
  module?: string;
  secured?: boolean;
  errors: number;
}

const initializeEndpointStats = () => {
  const knownEndpoints = [
    { path: `${BASE_PATH}/auth/register`, module: 'auth', secured: false, method: 'POST' },
    { path: `${BASE_PATH}/auth/login`, module: 'auth', secured: false, method: 'POST' },
    { path: `${BASE_PATH}/auth/refresh-token`, module: 'auth', secured: false, method: 'POST' },
    { path: `${BASE_PATH}/auth/me`, module: 'auth', secured: true, method: 'GET' },
    { path: `${BASE_PATH}/auth/change-password`, module: 'auth', secured: true, method: 'POST' },

    { path: `${BASE_PATH}/email/send-mail`, module: 'email', secured: false, method: 'POST' },
    { path: `${BASE_PATH}/email/get-templates`, module: 'email', secured: false, method: 'GET' },

    { path: `${BASE_PATH}/pages`, module: 'page', secured: true, method: 'GET' },
    { path: `${BASE_PATH}/pages`, module: 'page', secured: true, method: 'POST' },
    { path: `${BASE_PATH}/pages/:id`, module: 'page', secured: true, method: 'GET' },
    { path: `${BASE_PATH}/pages/:id`, module: 'page', secured: true, method: 'PATCH' },
    { path: `${BASE_PATH}/pages/:id`, module: 'page', secured: true, method: 'DELETE' },
    { path: `${BASE_PATH}/pages/:pageId/sections`, module: 'page', secured: true, method: 'POST' },
    { path: `${BASE_PATH}/pages/:pageId/sections`, module: 'page', secured: true, method: 'GET' },
    { path: `${BASE_PATH}/pages/:pageId/sections/:sectionId`, module: 'page', secured: true, method: 'DELETE' },
    { path: `${BASE_PATH}/pages/:pageId/sections/:sectionId`, module: 'page', secured: true, method: 'GET' },
    { path: `${BASE_PATH}/pages/:pageId/sections/:sectionId/blocks`, module: 'page', secured: true, method: 'POST' },
    { path: `${BASE_PATH}/pages/:pageId/sections/:sectionId/blocks/:blockKey`, module: 'page', secured: true, method: 'PATCH' },
    { path: `${BASE_PATH}/pages/:pageId/sections/:sectionId/blocks/:blockKey`, module: 'page', secured: true, method: 'DELETE' },

    { path: `${BASE_PATH}/users`, module: 'user', secured: true, method: 'GET' },
    { path: `${BASE_PATH}/users`, module: 'user', secured: true, method: 'POST' },
    { path: `${BASE_PATH}/users/me`, module: 'user', secured: true, method: 'GET' },
    { path: `${BASE_PATH}/users/:id`, module: 'user', secured: true, method: 'GET' },
    { path: `${BASE_PATH}/users/:id`, module: 'user', secured: true, method: 'PATCH' },
    { path: `${BASE_PATH}/users/:id`, module: 'user', secured: true, method: 'DELETE' },
  ];

  knownEndpoints.forEach(endpoint => {
    endpointStats.set(`${endpoint.method}:${endpoint.path}`, {
      hits: 0,
      lastAccessed: null,
      averageResponseTime: 0,
      totalResponseTime: 0,
      statusCodes: {},
      method: endpoint.method,
      module: endpoint.module,
      secured: endpoint.secured,
      errors: 0
    });
  });
};

initializeEndpointStats();

const getRequestsByModule = () => {
  const moduleStats: Record<string, { total: number, secured: number, unsecured: number, errors: number }> = {};

  endpointStats.forEach((stats) => {
    if (!stats.module) return;

    if (!moduleStats[stats.module]) {
      moduleStats[stats.module] = { total: 0, secured: 0, unsecured: 0, errors: 0 };
    }

    moduleStats[stats.module].total += stats.hits;
    if (stats.secured) {
      moduleStats[stats.module].secured += stats.hits;
    } else {
      moduleStats[stats.module].unsecured += stats.hits;
    }
    moduleStats[stats.module].errors += stats.errors;
  });

  return moduleStats;
};

// Get status code distribution
const getStatusCodeDistribution = () => {
  const distribution: Record<number, number> = {};

  endpointStats.forEach(stats => {
    Object.entries(stats.statusCodes).forEach(([code, count]) => {
      const numericCode = parseInt(code);
      if (!distribution[numericCode]) {
        distribution[numericCode] = 0;
      }
      distribution[numericCode] += count;
    });
  });

  return distribution;
};

router.get(`${BASE_PATH}/analytics`, (req: Request, res: Response) => {
  const format = req.query.format === "summary" ? "summary" : "detailed";
  const period = String(req.query.period || "all");
  const currentTime = new Date();
  const uptimeMs = currentTime.getTime() - startTime.getTime();
  const endpointMetrics = Array.from(endpointStats.entries())
    .map(([endpoint, stats]) => {
      const [method, path] = endpoint.split(':');
      return {
        endpoint: path,
        method,
        module: stats.module || 'unknown',
        secured: stats.secured || false,
        hits: stats.hits,
        errors: stats.errors,
        errorRate: stats.hits > 0 ? `${((stats.errors / stats.hits) * 100).toFixed(1)}%` : '0%',
        lastAccessed: stats.lastAccessed?.toISOString() || null,
        averageResponseTime: `${stats.averageResponseTime.toFixed(2)}ms`,
        statusCodes: stats.statusCodes,
        percentage: requestsServed > 0 ? `${((stats.hits / requestsServed) * 100).toFixed(1)}%` : '0%'
      };
    })
    .sort((a, b) => b.hits - a.hits);

  // Calculate request rate metrics
  const uptimeSeconds = uptimeMs / 1000;
  const requestRates = {
    perSecond: (requestsServed / uptimeSeconds).toFixed(2),
    perMinute: (requestsServed / (uptimeSeconds / 60)).toFixed(2),
    perHour: (requestsServed / (uptimeSeconds / 3600)).toFixed(2),
    perDay: (requestsServed / (uptimeSeconds / 86400)).toFixed(2),
  };

  // Calculate memory usage trends
  const memoryUsage = process.memoryUsage();
  const memoryTrend = {
    current: `${Math.round(memoryUsage.heapUsed / (1024 * 1024))} MB`,
    percentOfTotal: `${((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1)}%`,
    percentOfSystem: `${((memoryUsage.rss / os.totalmem()) * 100).toFixed(1)}%`,
  };

  // Get module-based statistics
  const moduleStats = getRequestsByModule();

  // Get status code distribution
  const statusCodeDistribution = getStatusCodeDistribution();

  // Calculate error rate
  const totalErrors = Object.values(statusCodeDistribution).reduce((acc, count) => {
    return acc + (count >= 400 && count < 600 ? count : 0);
  }, 0);

  const errorRate = requestsServed > 0 ? (totalErrors / requestsServed) * 100 : 0;

  // Base response object
  const response = {
    timestamp: currentTime.toISOString(),
    period: period,
    server: {
      status: "operational",
      upSince: startTime.toISOString(),
      uptime: formatUptime(uptimeMs / 1000),
    },
    requests: {
      total: requestsServed,
      rates: requestRates,
      errorRate: `${errorRate.toFixed(2)}%`,
      statusCodes: statusCodeDistribution
    },
    modules: Object.entries(moduleStats).map(([name, stats]) => ({
      name,
      total: stats.total,
      secured: stats.secured,
      unsecured: stats.unsecured,
      errors: stats.errors,
      errorRate: stats.total > 0 ? `${((stats.errors / stats.total) * 100).toFixed(2)}%` : '0%',
      percentage: requestsServed > 0 ? `${((stats.total / requestsServed) * 100).toFixed(1)}%` : '0%'
    })).sort((a, b) => b.total - a.total),
    topEndpoints: endpointMetrics.slice(0, 5),
  };

  // If detailed format, add more comprehensive information
  if (format === "detailed") {
    Object.assign(response, {
      allEndpoints: endpointMetrics,
      system: getSystemInfo(),
      process: getProcessInfo(),
      performance: {
        memory: memoryTrend,
        cpu: {
          loadAverage: os.loadavg(),
          cores: os.cpus().length,
          utilizationPercent: `${(os.loadavg()[0] / os.cpus().length * 100).toFixed(1)}%`
        }
      },
      securityMetrics: {
        securedEndpointRequests: endpointMetrics
          .filter(endpoint => endpoint.secured)
          .reduce((acc, endpoint) => acc + endpoint.hits, 0),
        unsecuredEndpointRequests: endpointMetrics
          .filter(endpoint => !endpoint.secured)
          .reduce((acc, endpoint) => acc + endpoint.hits, 0),
      }
    });
  }

  res.status(200).json_structured({
    message: "Analytics Retrieved successfully",
    status: 200,
    success: true,
    data: response
  } as ResponseDefault<unknown>);
});

export const routesV1 = router;