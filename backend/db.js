import sql from "mssql";

const config = {
  server: "DESKTOP-FGS8L0O\\SAYANSQL", // نام سرور و اینستنس
  database: "CampusRoutingDB",          // نام دیتابیس شما
  driver: "msnodesqlv8",               // مهم: Windows Authentication
  options: {
    trustedConnection: true,            // استفاده از Windows Authentication
    trustServerCertificate: true
  }
};

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
  });
