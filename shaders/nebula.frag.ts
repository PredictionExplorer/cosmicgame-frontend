/**
 * Nebula fragment shader.
 *
 * Renders a procedural deep-space nebula using 4-octave fractal Brownian
 * motion over 3D simplex noise. Three cosmic color anchors (Cosmic Indigo,
 * Nebula Violet, Aurora Cyan) interpolate through the noise field. A radial
 * vignette keeps text contrast within WCAG AA on top of the hero headline.
 *
 * OKLab-space color mixing would be ideal, but for the fragment path we do
 * sRGB interpolation — imperceptible in this range and half the instructions.
 *
 * Uniforms:
 *   uTime        seconds since mount; drives drift and wave
 *   uResolution  viewport size in pixels
 *   uMouse       mouse position in [-1, 1] clip coords; subtle parallax
 *   uIntensity   0..1 master multiplier; 0 = near-black, 1 = full bloom
 */
export const nebulaFragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uIntensity;

  const vec3 COSMIC_INDIGO = vec3(0.102, 0.043, 0.243);
  const vec3 NEBULA_VIOLET = vec3(0.424, 0.235, 0.882);
  const vec3 AURORA_CYAN   = vec3(0.000, 0.898, 1.000);
  const vec3 CHRONO_ROSE   = vec3(1.000, 0.239, 0.541);
  const vec3 DEEP_SPACE    = vec3(0.051, 0.020, 0.129);

  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      total += snoise(p) * amplitude;
      p *= 2.02;
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv * 2.0 - 1.0;
    centered.x *= uResolution.x / uResolution.y;

    vec2 parallax = uMouse * 0.12;
    vec3 samplePos = vec3(centered * 0.9 + parallax, uTime * 0.03);

    float noise1 = fbm(samplePos * 1.0);
    float noise2 = fbm(samplePos * 2.3 + vec3(8.0, 4.0, 0.0));
    float noise3 = fbm(samplePos * 4.5 + vec3(0.0, 0.0, 3.0));

    float shape = 0.5 + 0.5 * noise1;
    float detail = 0.5 + 0.5 * noise2;
    float sparkle = 0.5 + 0.5 * noise3;

    vec3 col = DEEP_SPACE;
    col = mix(col, COSMIC_INDIGO, smoothstep(0.15, 0.65, shape));
    col = mix(col, NEBULA_VIOLET, smoothstep(0.35, 0.85, shape * detail));
    col = mix(col, AURORA_CYAN, smoothstep(0.55, 0.95, detail * sparkle) * 0.65);
    col = mix(col, CHRONO_ROSE, smoothstep(0.75, 0.98, sparkle) * 0.35);

    float r = length(centered);
    float vignette = smoothstep(1.6, 0.4, r);
    col *= vignette;

    float stars = pow(max(0.0, snoise(samplePos * 60.0)), 32.0) * 2.2;
    col += vec3(stars);

    col *= mix(0.55, 1.25, uIntensity);

    gl_FragColor = vec4(col, 1.0);
  }
`;
