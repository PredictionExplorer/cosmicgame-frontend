/**
 * Canonical Simplified-Chinese terminology guard.
 *
 * This complements (and intentionally does not duplicate) the banned-register
 * checks in lexicon-scan-core.ts. The lexicon scanner rejects legally risky
 * vocabulary; this module catches plausible but inconsistent translations of
 * approved glossary concepts.
 */

export interface TerminologyRule {
  /** English concept name used in diagnostics. */
  concept: string;
  /** Approved rendering from docs/i18n/glossary-zh.md. */
  canonical: string;
  /** Known literal translations, rejected candidates, and historic drift. */
  variants: readonly string[];
}

export interface TerminologyHit {
  concept: string;
  canonical: string;
  variant: string;
  line: number;
  excerpt: string;
}

/**
 * Keep this list focused on terminology drift. Terms already enforced by
 * ZH_BANNED_TERMS (for example 质押, 铸造, 奖励, 彩票, 慈善) belong only in the
 * lexicon scanner so neither gate can silently weaken the other.
 */
export const TERMINOLOGY_RULES: readonly TerminologyRule[] = [
  {
    concept: 'Gesture',
    canonical: '落笔',
    variants: ['手势', '姿态'],
  },
  {
    concept: 'Gesture Cost',
    canonical: '落笔价格',
    variants: ['落笔成本', '手势价格', '手势成本'],
  },
  {
    concept: 'Performance Cycle',
    canonical: '演绎周期（密集界面可简称“周期”）',
    variants: ['表演周期', '演出周期', '性能周期', '绩效周期'],
  },
  {
    concept: 'Finalize / Finalization',
    canonical: '收官',
    variants: ['最终确定', '周期最终确定', '最终落笔'],
  },
  {
    concept: 'Final Gesture',
    canonical: '收官之笔',
    variants: ['最后手势', '最终手势'],
  },
  {
    concept: 'Allocation Recipient',
    canonical: '获配者',
    variants: ['分配接收者', '获奖者', '胜出者'],
  },
  {
    concept: 'Stellar Selection',
    canonical: '星选',
    variants: ['恒星选择', '星级选择', '星空选择', '随机抽选'],
  },
  {
    concept: 'Anchoring / release',
    canonical: '锚定 / 解锚',
    variants: ['锚固', '锚点锁定', '解除锚定', '锚定释放'],
  },
  {
    concept: 'Anchor Distribution',
    canonical: '锚定派发',
    variants: ['锚定分发', '锚点派发'],
  },
  {
    concept: 'Imprint',
    canonical: '铭刻',
    variants: ['刻印', '印制 NFT'],
  },
  {
    concept: 'Cosmic Council',
    canonical: '宇宙议会',
    variants: ['宇宙委员会', '宇宙理事会'],
  },
  {
    concept: 'Public Goods',
    canonical: '公共物品',
    variants: ['公益品', '公共产品', '公共商品'],
  },
  {
    concept: 'Public Goods funding',
    canonical: '公共物品资助',
    variants: ['公益资助'],
  },
  {
    concept: 'Compounding Cycle Reserve',
    canonical: '滚动储备',
    variants: ['复合周期储备', '复合储备'],
  },
  {
    concept: 'Gallery',
    canonical: '画廊',
    variants: ['图库'],
  },
  {
    concept: 'Learn Hub',
    canonical: '学习中心',
    variants: ['学习枢纽'],
  },
  {
    concept: 'Site Map',
    canonical: '网站地图',
    variants: ['站点地图'],
  },
  {
    concept: 'Outreach Reserve',
    canonical: '推广储备',
    variants: ['营销储备', '市场推广储备', '市场储备'],
  },
  {
    concept: 'Outreach Allocation',
    canonical: '推广分配',
    variants: ['营销分配'],
  },
  {
    concept: 'Participation CST',
    canonical: '参与 CST',
    variants: ['参与度 CST'],
  },
  {
    concept: 'Recognition CST',
    canonical: '表彰 CST',
    variants: ['认可 CST'],
  },
  {
    concept: 'Attached NFTs',
    canonical: '已附加 NFT / 附加',
    variants: ['附属 NFT', '挂载 NFT'],
  },
  {
    concept: 'Named Tokens',
    canonical: '已命名代币 / 命名',
    variants: ['命名令牌', '命名通证'],
  },
  {
    concept: 'Finalization countdown',
    canonical: '收官倒计时',
    variants: ['最终倒计时', '结束倒计时'],
  },
] as const;

const ALLOW_START = 'terminology-allow-start';
const ALLOW_END = 'terminology-allow-end';
const ALLOW_LINE = 'terminology-allow-line';

function excerptFor(line: string): string {
  const normalized = line.trim().replace(/\s+/g, ' ');
  return normalized.length <= 180 ? normalized : `${normalized.slice(0, 177)}…`;
}

/**
 * Scans decoded user-facing text or a Chinese content source file.
 *
 * Content modules may use narrowly scoped `terminology-allow-*` comments when
 * quoting third-party copy or discussing a rejected rendering. JSON catalogs
 * cannot contain comments, so every catalog value is always enforced.
 */
export function scanTerminology(
  text: string,
  rules: readonly TerminologyRule[] = TERMINOLOGY_RULES,
): TerminologyHit[] {
  const hits: TerminologyHit[] = [];
  let allowed = false;

  text.split('\n').forEach((line, index) => {
    if (line.includes(ALLOW_START)) {
      allowed = true;
      return;
    }
    if (line.includes(ALLOW_END)) {
      allowed = false;
      return;
    }
    if (allowed || line.includes(ALLOW_LINE)) return;

    for (const rule of rules) {
      for (const variant of rule.variants) {
        let offset = line.indexOf(variant);
        while (offset !== -1) {
          hits.push({
            concept: rule.concept,
            canonical: rule.canonical,
            variant,
            line: index + 1,
            excerpt: excerptFor(line),
          });
          offset = line.indexOf(variant, offset + variant.length);
        }
      }
    }
  });

  return hits;
}

export function validateTerminologyRules(
  rules: readonly TerminologyRule[] = TERMINOLOGY_RULES,
): string[] {
  const errors: string[] = [];
  const owners = new Map<string, string>();

  for (const rule of rules) {
    if (!rule.concept.trim()) errors.push('A terminology rule has an empty concept name.');
    if (!rule.canonical.trim()) {
      errors.push(`${rule.concept || '(unnamed rule)'} has an empty canonical rendering.`);
    }
    if (rule.variants.length === 0) {
      errors.push(`${rule.concept} has no drift variants.`);
    }

    for (const variant of rule.variants) {
      if (!variant.trim()) {
        errors.push(`${rule.concept} has an empty drift variant.`);
        continue;
      }
      if (rule.canonical.includes(variant)) {
        errors.push(`${rule.concept} canonical rendering contains its drift variant "${variant}".`);
      }
      const existingOwner = owners.get(variant);
      if (existingOwner) {
        errors.push(
          `Drift variant "${variant}" is owned by both ${existingOwner} and ${rule.concept}.`,
        );
      } else {
        owners.set(variant, rule.concept);
      }
    }
  }

  return errors;
}
