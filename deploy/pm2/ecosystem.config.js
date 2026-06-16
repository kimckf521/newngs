// PM2 process configuration for ngs-web
// Start with: pm2 start /var/www/ngs/current/deploy/pm2/ecosystem.config.js
// Save with:  pm2 save
// Boot with:  pm2 startup systemd

module.exports = {
  apps: [
    {
      name: 'ngs-web',
      cwd: '/var/www/ngs/current',
      script: 'server.js',
      // Single fork on a 2-CPU box. The contact form is fire-and-forget
      // so SMTP latency no longer blocks the worker, and a static-content
      // site doesn't push CPU. To utilize both cores, switch to:
      //   instances: 2,
      //   exec_mode: 'cluster',
      //   max_memory_restart: '500M',
      // Two clustered forks at 500M each fit alongside Nginx + OS in 2 GB.
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '127.0.0.1',
      },
      // Auto-restart if memory bloats
      max_memory_restart: '700M',
      // Log files
      out_file: '/var/log/pm2/ngs-web.out.log',
      error_file: '/var/log/pm2/ngs-web.error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
