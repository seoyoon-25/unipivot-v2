module.exports = {
  apps: [{
    name: 'unipivot-v2',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/unihome-v2',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
