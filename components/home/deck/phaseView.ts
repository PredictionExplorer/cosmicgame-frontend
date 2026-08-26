import type { CyclePhase } from '@/lib/cycleState';

/**
 * Per-phase visual treatment for the cycle monument (formerly ChronoCoreTimer).
 * Message keys resolve under `home.chrono.phase.*`, which stays the single
 * source of phase copy for the countdown centerpiece.
 */
export interface PhaseView {
  /** Message key segment under `home.chrono.phase.*`. */
  messageKey: string;
  /** Whether this phase renders a static display text instead of a countdown. */
  hasDisplayText: boolean;
  toneClass: string;
  haloClass: string;
  glowClass: string;
  pulseClass: string;
  clockTextClass: string;
  iconClass: string;
}

export function viewForPhase(phase: CyclePhase): PhaseView {
  switch (phase) {
    case 'loading':
      return {
        messageKey: 'loading',
        hasDisplayText: true,
        toneClass: 'border-white/[0.10] bg-white/[0.03]',
        haloClass: 'border-white/10 bg-white/[0.02]',
        glowClass: 'shadow-[0_0_80px_rgb(var(--aurora-cyan-rgb)/0.16)]',
        pulseClass: '',
        clockTextClass: 'text-gradient-signature',
        iconClass: 'text-primary',
      };
    case 'unavailable':
      return {
        messageKey: 'unavailable',
        hasDisplayText: true,
        toneClass: 'border-white/[0.10] bg-white/[0.025]',
        haloClass: 'border-white/10 bg-white/[0.015]',
        glowClass: 'shadow-[0_0_60px_rgb(255_255_255/0.08)]',
        pulseClass: '',
        clockTextClass: 'text-muted-foreground',
        iconClass: 'text-muted-foreground',
      };
    case 'opening-soon':
      return {
        messageKey: 'openingSoon',
        hasDisplayText: false,
        toneClass:
          'border-emerald-300/35 bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--aurora-cyan-rgb)/0.13))]',
        haloClass: 'border-emerald-300/35 bg-emerald-400/[0.055]',
        glowClass: 'shadow-[0_0_125px_rgb(var(--impact-green-rgb)/0.34)]',
        pulseClass: 'animate-cosmic-drift',
        clockTextClass:
          'bg-gradient-to-r from-[rgb(var(--impact-green-rgb))] via-[#7DD3FC] to-[#35C9FF] bg-clip-text text-transparent',
        iconClass: 'text-[rgb(var(--impact-green-rgb))]',
      };
    case 'waiting-first-gesture':
      return {
        messageKey: 'waitingFirstGesture',
        hasDisplayText: true,
        toneClass:
          'border-emerald-300/30 bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.13),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--aurora-cyan-rgb)/0.12))]',
        haloClass: 'border-emerald-300/30 bg-emerald-400/[0.045]',
        glowClass: 'shadow-[0_0_105px_rgb(var(--impact-green-rgb)/0.26)]',
        pulseClass: 'animate-cosmic-drift',
        clockTextClass:
          'bg-gradient-to-r from-[rgb(var(--impact-green-rgb))] via-[#7DD3FC] to-[#35C9FF] bg-clip-text text-transparent',
        iconClass: 'text-[rgb(var(--impact-green-rgb))]',
      };
    case 'approach':
      return {
        messageKey: 'approach',
        hasDisplayText: false,
        toneClass:
          'border-primary/35 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.14))]',
        haloClass: 'border-primary/30 bg-primary/[0.045]',
        glowClass: 'shadow-[0_0_110px_rgb(var(--aurora-cyan-rgb)/0.32)]',
        pulseClass: 'animate-cosmic-drift',
        clockTextClass: 'text-gradient-signature',
        iconClass: 'text-primary',
      };
    case 'final-hour':
      return {
        messageKey: 'finalHour',
        hasDisplayText: false,
        toneClass:
          'border-[rgb(var(--solar-gold-rgb)/0.42)] bg-[linear-gradient(135deg,rgb(var(--solar-gold-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.13))]',
        haloClass: 'border-[rgb(var(--solar-gold-rgb)/0.36)] bg-[rgb(var(--solar-gold-rgb)/0.045)]',
        glowClass: 'shadow-[0_0_120px_rgb(var(--solar-gold-rgb)/0.30)]',
        pulseClass: 'animate-pulse-glow',
        clockTextClass: 'text-[rgb(var(--solar-gold-rgb))]',
        iconClass: 'text-[rgb(var(--solar-gold-rgb))]',
      };
    case 'final-ten':
      return {
        messageKey: 'finalTen',
        hasDisplayText: false,
        toneClass:
          'border-[rgb(var(--chrono-rose-rgb)/0.46)] bg-[linear-gradient(135deg,rgb(var(--chrono-rose-rgb)/0.18),rgb(var(--cosmic-indigo-rgb)/0.36),rgb(var(--nebula-violet-rgb)/0.18))]',
        haloClass:
          'border-[rgb(var(--chrono-rose-rgb)/0.38)] bg-[rgb(var(--chrono-rose-rgb)/0.045)]',
        glowClass: 'shadow-[0_0_130px_rgb(var(--chrono-rose-rgb)/0.32)]',
        pulseClass: 'animate-pulse-glow',
        clockTextClass: 'text-[rgb(var(--chrono-rose-rgb))]',
        iconClass: 'text-[rgb(var(--chrono-rose-rgb))]',
      };
    case 'final-minute':
      return {
        messageKey: 'finalMinute',
        hasDisplayText: false,
        toneClass:
          'border-red-400/55 bg-[linear-gradient(135deg,rgb(var(--chrono-rose-rgb)/0.24),rgb(127_29_29/0.32),rgb(var(--nebula-violet-rgb)/0.20))]',
        haloClass: 'border-red-400/45 bg-red-500/[0.055]',
        glowClass: 'shadow-[0_0_150px_rgb(248_113_113/0.40)]',
        pulseClass: 'motion-safe:animate-urgency-pulse',
        clockTextClass: 'text-red-300',
        iconClass: 'text-red-300',
      };
    case 'confirming':
      return {
        messageKey: 'confirming',
        hasDisplayText: true,
        toneClass:
          'border-primary/40 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.18),rgb(var(--cosmic-indigo-rgb)/0.36),rgb(var(--nebula-violet-rgb)/0.16))]',
        haloClass: 'border-primary/35 bg-primary/[0.05]',
        glowClass: 'shadow-[0_0_120px_rgb(var(--aurora-cyan-rgb)/0.30)]',
        pulseClass: 'animate-pulse-glow',
        clockTextClass: 'text-primary',
        iconClass: 'text-primary',
      };
    case 'ready-to-finalize':
      return {
        messageKey: 'readyToFinalize',
        hasDisplayText: true,
        toneClass:
          'border-emerald-400/35 bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--aurora-cyan-rgb)/0.11))]',
        haloClass: 'border-emerald-300/35 bg-emerald-400/[0.045]',
        glowClass: 'shadow-[0_0_120px_rgb(var(--impact-green-rgb)/0.28)]',
        pulseClass: 'animate-signature-pulse',
        clockTextClass: 'text-[rgb(var(--impact-green-rgb))]',
        iconClass: 'text-[rgb(var(--impact-green-rgb))]',
      };
    case 'live':
    default:
      return {
        messageKey: 'live',
        hasDisplayText: false,
        toneClass:
          'border-primary/25 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.12),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.13))]',
        haloClass: 'border-primary/25 bg-primary/[0.035]',
        glowClass: 'shadow-[0_0_100px_rgb(var(--aurora-cyan-rgb)/0.26)]',
        pulseClass: '',
        clockTextClass: 'text-gradient-signature',
        iconClass: 'text-primary',
      };
  }
}
