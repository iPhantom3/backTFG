const createRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'xxxx-xxxx-xxxx'.replace(/[x]/g, function (c) {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  });
}

export default createRandomString;