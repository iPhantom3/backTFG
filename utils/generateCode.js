const generateCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'xxxx-xxxx'.replace(/[x]/g, function (c) {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  });
};

export default generateCode;