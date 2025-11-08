module.exports = {
  apps: [
    {
      name: 'va-proxy',
      script: './dist/index.js',
      cwd: './proxy-server',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/proxy-error.log',
      out_file: './logs/proxy-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'va-auth',
      script: './dist/index.js',
      cwd: './auth-server',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/auth-error.log',
      out_file: './logs/auth-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'va-content',
      script: './dist/index.js',
      cwd: './content-server',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      error_file: './logs/content-error.log',
      out_file: './logs/content-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'va-upload',
      script: './dist/index.js',
      cwd: './upload-server',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
      error_file: './logs/upload-error.log',
      out_file: './logs/upload-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
