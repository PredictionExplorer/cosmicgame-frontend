module.exports = {
  formatEther: (val) => String(Number(val) / 1e18),
  parseEther: (val) => BigInt(Math.round(Number(val) * 1e18)),
  formatUnits: (val, decimals) => String(Number(val) / Math.pow(10, decimals)),
  parseUnits: (val, decimals) => BigInt(Math.round(Number(val) * Math.pow(10, decimals))),
  isAddress: (addr) => /^0x[0-9a-fA-F]{40}$/.test(addr),
  getAddress: (addr) => addr,
  zeroAddress: '0x0000000000000000000000000000000000000000',
  maxUint256: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
};
