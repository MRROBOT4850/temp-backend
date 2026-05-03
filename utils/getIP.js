// module.exports = function getClientIp(socket) {
//   return socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
// };
module.exports = function getClientIp(socket) {
  const forwarded = socket.handshake.headers["x-forwarded-for"];
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return socket.handshake.address;
};