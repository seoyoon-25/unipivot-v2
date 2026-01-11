module.exports = {
  apps: [
    {
      name: 'unipivot',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/unihome-v2',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/pm2/unipivot-error.log',
      out_file: '/var/log/pm2/unipivot-out.log',
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 1000,
      exp_backoff_restart_delay: 100,
      max_memory_restart: '1G',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      watch: false,
      ignore_watch: ['node_modules', '.next', 'prisma/*.db']
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'unipivot.org',
      ref: 'origin/main',
      repo: 'git@github.com:unipivot/unihome-v2.git',
      path: '/var/www/unihome-v2',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
}
