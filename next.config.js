/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.externals = [
  //       "argon2",
  //       "libphonenumber-js",
  //       "typeorm",
  //       "pg",
  //       "cors",
  //     ];
  //   }

  //   return config;
  // },
};

module.exports = nextConfig;
