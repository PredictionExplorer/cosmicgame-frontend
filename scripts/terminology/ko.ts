import type { TerminologyRule } from '../terminology-consistency-core';

/**
 * Canonical Korean terminology (docs/i18n/glossary-ko.md).
 *
 * Variants are matched as substrings (`cjk-substring` in
 * locale-text-matchers.ts): Hangul compounds join without spaces and
 * particles attach to the noun, so one entry covers 할당, 할당된, 할당을, …
 * A variant must therefore never be contained in ordinary innocent copy —
 * every entry below was checked against the vocabulary the site does need.
 *
 * Keep this list focused on terminology drift. Vocabulary that is banned
 * outright (경매, 당첨, 추첨, 스테이킹, 기부, …) lives only in KO_BANNED_TERMS
 * in lexicon-scan-core.ts so neither gate can silently weaken the other.
 */
export const KO_TERMINOLOGY_RULES: readonly TerminologyRule[] = [
  {
    concept: 'Gesture',
    canonical: '제스처',
    variants: ['제스쳐', '손짓', '몸짓'],
  },
  {
    concept: 'Gesture Cost',
    canonical: '제스처 비용',
    variants: ['제스처 가격', '제스처 요금', '제스처 수수료'],
  },
  {
    concept: 'Performance Cycle',
    canonical: '퍼포먼스 사이클 (dense UI: 사이클)',
    variants: [
      '성능 사이클',
      '성능 주기',
      '공연 사이클',
      '공연 주기',
      '연주 사이클',
      '퍼포먼스 주기',
      '싸이클',
    ],
  },
  {
    concept: 'Finalize / Finalization',
    canonical: '마감 / 마감하다',
    variants: ['파이널라이즈', '정산'],
  },
  {
    concept: 'Final Gesture',
    canonical: '최종 제스처',
    variants: ['파이널 제스처', '마지막 제스처'],
  },
  {
    concept: 'Calibration Window',
    canonical: '보정 구간',
    variants: [
      '캘리브레이션 윈도우',
      '캘리브레이션 창',
      '보정 창',
      '보정 윈도우',
      '조정 구간',
      '교정 구간',
    ],
  },
  {
    concept: 'Allocation',
    canonical: '배분',
    variants: ['할당', '분배', '리워드'],
  },
  {
    concept: 'Recipient',
    canonical: '수령자',
    variants: ['수신자', '수혜자', '획득자', '받는 사람'],
  },
  {
    concept: 'Stellar Selection',
    canonical: '별빛 선정',
    variants: ['스텔라 셀렉션', '스텔라 선정', '항성 선정', '별 선정', '별빛 선발'],
  },
  {
    concept: 'Anchoring',
    canonical: '앵커링',
    variants: ['앵커리지', '앙커링', '정박', '닻 내리기'],
  },
  {
    concept: 'Release (an anchor)',
    canonical: '앵커링 해제',
    variants: ['언앵커링', '언앵커', '앵커링 취소', '앵커링 철회'],
  },
  {
    concept: 'Anchor Distribution',
    canonical: '앵커링 지급',
    variants: [
      '앵커링 배분',
      '앵커 배분',
      '앵커링 분배',
      '앵커링 보상',
      '앵커링 리워드',
      '앵커 지급',
    ],
  },
  {
    concept: 'Retrieve',
    canonical: '회수',
    variants: ['가져오기', '수령하기', '찾아가기', '받아가기'],
  },
  {
    concept: 'Imprint',
    canonical: '각인',
    variants: ['발행', '새기기', '새김'],
  },
  {
    concept: 'Endurance Champion',
    canonical: '수호 챔피언',
    variants: [
      '지속 챔피언',
      '인내 챔피언',
      '지구력 챔피언',
      '인듀어런스 챔피언',
      '최장 유지 챔피언',
      '내구 챔피언',
    ],
  },
  {
    concept: 'Chrono-Warrior',
    canonical: '시간의 전사',
    variants: ['크로노 워리어', '크로노워리어', '크로노 전사', '시간 전사', '시간 용사'],
  },
  {
    concept: 'Cosmic Council',
    canonical: '우주 평의회',
    variants: [
      '코스믹 카운슬',
      '코스믹 평의회',
      '코스믹 의회',
      '우주 의회',
      '우주 위원회',
      '우주 협의회',
    ],
  },
  {
    concept: 'Coordination',
    canonical: '조율',
    variants: ['거버넌스', '코디네이션', '조정 제안'],
  },
  {
    concept: 'Public Goods',
    canonical: '공공재',
    // 공공 이익 is already caught by the lexicon (이익 is banned).
    variants: ['공공 재화', '공익', '공공선', '퍼블릭 굿즈'],
  },
  {
    concept: 'Compounding Cycle Reserve',
    canonical: '누적 준비금',
    variants: ['복리 준비금', '컴파운딩 리저브', '순환 준비금', '이월 준비금', '누적 리저브'],
  },
  {
    concept: 'Signature (the artwork)',
    canonical: '시그니처',
    variants: ['시그너처', '시그니쳐', '서명 작품'],
  },
  {
    concept: 'Outreach Reserve',
    canonical: '홍보 준비금',
    variants: ['홍보 예비금', '홍보 기금', '홍보 리저브', '아웃리치 리저브', '아웃리치 준비금'],
  },
  {
    concept: 'Site Map',
    canonical: '사이트맵',
    variants: ['사이트 맵', '사이트 지도'],
  },
  {
    concept: 'White Paper',
    canonical: '백서',
    variants: ['화이트페이퍼', '화이트 페이퍼'],
  },
  {
    concept: 'Privacy Policy',
    canonical: '개인정보 처리방침',
    variants: ['개인정보처리방침', '개인정보 보호정책', '프라이버시 정책', '개인 정보 처리 방침'],
  },
  {
    concept: 'Terms of Use',
    canonical: '이용약관',
    variants: ['이용 약관', '서비스 약관', '사용 약관'],
  },
  {
    concept: 'Risk Disclosures',
    canonical: '위험 고지',
    variants: ['리스크 고지', '위험 공시', '리스크 공시'],
  },
  {
    concept: 'FAQ',
    canonical: '자주 묻는 질문',
    variants: ['자주 하는 질문', '자주하는 질문', '질문과 답변'],
  },
  {
    concept: 'Gallery',
    canonical: '갤러리',
    variants: ['화랑', '미술관', '갤러리아'],
  },
  {
    concept: 'Wallet',
    canonical: '지갑',
    variants: ['월렛', '월릿'],
  },
  {
    concept: 'Connect Wallet',
    canonical: '지갑 연결',
    variants: ['지갑 접속', '지갑 연동', '지갑 커넥트'],
  },
  {
    concept: 'Transaction',
    canonical: '트랜잭션',
    variants: ['트렌잭션', '트랜젝션', '트렌젹션'],
  },
  {
    concept: 'Participant',
    canonical: '참여자',
    variants: ['참가자'],
  },
  {
    concept: 'User',
    canonical: '사용자',
    variants: ['유저', '이용자'],
  },
  {
    concept: 'Anchored NFTs',
    canonical: '앵커링된 NFT',
    variants: ['앵커된 NFT', '앵커 NFT'],
  },
  {
    concept: 'Knowledge quiz',
    canonical: '지식 퀴즈',
    variants: ['지식 테스트', '지식 시험'],
  },
  {
    concept: 'Learn Hub',
    canonical: '학습 센터',
    variants: ['학습 허브', '러닝 허브', '배움터'],
  },
  {
    concept: 'How It Works',
    canonical: '작동 원리',
    // 이용 방법 / 사용 방법 are legitimate generic phrases ("how to use a
    // wallet"), so only the page-name drifts are listed.
    variants: ['작동 방식', '동작 원리', '작동 방법'],
  },
  {
    concept: 'Source Code',
    canonical: '소스 코드',
    variants: ['소스코드', '원본 코드'],
  },
  {
    concept: 'Audits',
    canonical: '보안 감사',
    variants: ['오딧', '오디트', '감리'],
  },
  {
    concept: 'Statistics',
    canonical: '통계',
    variants: ['스탯', '스태티스틱스'],
  },
  {
    concept: 'Trait',
    canonical: '특성',
    variants: ['속성', '트레잇', '트레이트'],
  },
  {
    concept: 'Rarity',
    canonical: '희귀도',
    variants: ['레어도', '희소성', '레어리티'],
  },
  {
    concept: 'Three-body problem',
    canonical: '삼체 문제',
    variants: ['3체 문제', '세 물체 문제', '삼체문제'],
  },
  {
    concept: 'Deterministic',
    canonical: '결정론적',
    variants: ['확정론적', '디터미니스틱'],
  },
  {
    concept: 'Generative art',
    canonical: '제너러티브 아트',
    variants: ['생성 예술', '생성 미술', '제너레이티브 아트', '생성형 아트'],
  },
  {
    concept: 'On-chain',
    canonical: '온체인',
    variants: ['온 체인', '온-체인', '체인 상의'],
  },
  {
    concept: 'Procedural',
    canonical: '절차적',
    variants: ['프로시저럴', '프로시듀럴', '절차형'],
  },
  {
    concept: 'Verified (contracts)',
    canonical: '검증',
    variants: ['인증된 컨트랙트', '베리파이드'],
  },
  {
    concept: 'Public domain',
    canonical: '퍼블릭 도메인',
    variants: ['공공 영역', '공유 저작물', '공중 영역'],
  },
  {
    concept: 'Formally verified',
    canonical: '정형 검증',
    variants: ['형식 검증', '공식 검증', '포멀 베리피케이션'],
  },
  {
    concept: 'Loading',
    canonical: '불러오는 중',
    variants: ['로딩 중', '로딩중', '불러오기 중'],
  },
  {
    concept: 'Copied',
    canonical: '복사됨',
    variants: ['복사 완료', '카피됨'],
  },
];
