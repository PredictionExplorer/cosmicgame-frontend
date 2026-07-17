import { COSMIC_SIGNATURE_CODE } from '../cosmicSignatureCode';

describe('COSMIC_SIGNATURE_CODE', () => {
  it('is a non-empty string', () => {
    expect(typeof COSMIC_SIGNATURE_CODE).toBe('string');
    expect(COSMIC_SIGNATURE_CODE.length).toBeGreaterThan(0);
  });

  it('contains Rust crate declarations', () => {
    expect(COSMIC_SIGNATURE_CODE).toContain('extern crate nalgebra');
    expect(COSMIC_SIGNATURE_CODE).toContain('extern crate rustfft');
  });

  it('contains the Sha3RandomByteStream struct', () => {
    expect(COSMIC_SIGNATURE_CODE).toContain('pub struct Sha3RandomByteStream');
  });

  it('contains the Body struct and gravitational constant', () => {
    expect(COSMIC_SIGNATURE_CODE).toContain('struct Body');
    expect(COSMIC_SIGNATURE_CODE).toContain('const G: f64 = 9.8');
  });

  it('contains the main function', () => {
    expect(COSMIC_SIGNATURE_CODE).toContain('fn main()');
  });

  it('contains the FFT and video generation functions', () => {
    expect(COSMIC_SIGNATURE_CODE).toContain('fn fourier_transform');
    expect(COSMIC_SIGNATURE_CODE).toContain('fn create_video_from_frames_in_memory');
    expect(COSMIC_SIGNATURE_CODE).toContain('fn plot_positions');
  });
});
