// const errorHandler = (err, req, res) => {
//   const statusCode = res.statusCode ? res.statusCode : 500;
//   const message = err.message || "BACKEND ERROR";
//   const extraDetails = err.extraDetails || "Error from backend";
//   // switch (statusCode) {
//   //   case 400:
//   //     res.json({
//   //       title: "Validation failed",
//   //       message: err.message,
//   //       stackTrace: err.stack,
//   //     });

//   //     break;
//   //   case 404:
//   //     res.json({
//   //       title: "Not found",
//   //       message: err.message,
//   //       stackTrace: err.stack,
//   //     });

//   //   default:
//   //     break;
//   // }
//   res.json({ title: "Not found", message: err.message, stackTrace: err.stack });
// };

// module.exports = errorHandler;

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  const message = err.message || "BACKEND ERROR"; // Changed from | to ||
  const extraDetails = err.extraDetails || "Error from backend"; // Changed from | to ||

  res.status(statusCode).json({
    title: "Error",
    message: message,
    extraDetails: extraDetails,
    stackTrace: process.env.NODE_ENV === "production" ? null : err.stack, // Hide stack trace in production
  });
};

module.exports = errorHandler;
