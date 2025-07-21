const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "web-vitals": path.resolve(__dirname, "node_modules/web-vitals"),
    },
  },
};
