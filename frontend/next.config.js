/** @type {import('next').NextConfig} */
const path = require("path");

module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.join(__dirname),
};
