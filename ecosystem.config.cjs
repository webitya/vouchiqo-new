module.exports = {
  apps: [
    {
      name: "vouchiqo-web",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
    {
      name: "vouchiqo-worker-analytics",
      script: "./workers/analytics.worker.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "vouchiqo-worker-coupons",
      script: "./workers/coupons.worker.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "vouchiqo-worker-revivals",
      script: "./workers/revivals.worker.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "vouchiqo-worker-notifications",
      script: "./workers/notifications.worker.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
