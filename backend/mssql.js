const sql = require("mssql");

const config = {
  server: "192.168.0.250",
  port: 1433,
  options: { encrypt: false, database: "QINNOTEK" },
  authentication: {
    type: "default",
    options: {
      userName: "sa",
      password: "qinnotek18**",
    },
  },
};

const pool = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config: ", err));

module.exports = {
  sql,
  pool,
};
