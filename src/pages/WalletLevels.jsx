import React, { useEffect, useMemo } from 'react';
import { ArrowLeft, Check, LockKeyhole, Sparkles, TrendingUp, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import useAuthStore from '../store/useAuthStore';
import useGroupStore from '../store/useGroupStore';
import useTopupStore from '../store/useTopupStore';
import genieImage from '../assets/elgny.webp';

const LEVEL_STEP = 500;
const ARABIC_LEVEL_ORDINALS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];

const getLevelLabel = (level, isArabic) => {
  if (isArabic) {
    return `المستوى ${ARABIC_LEVEL_ORDINALS[level - 1] || level}`;
  }
  return `Level ${level}`;
};

const getUserGroupName = (user) => String(user?.group || user?.groupName || user?.groupId || '').trim().toLowerCase();

const groupMatchesUser = (group, user) => {
  const userGroup = getUserGroupName(user);
  if (!userGroup) return false;
  const groupId = String(group?.id || group?._id || '').trim().toLowerCase();
  const names = [group?.name, group?.nameAr, groupId]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);
  return names.includes(userGroup) || String(user?.groupId || '').trim().toLowerCase() === groupId;
};

const getApprovedDepositTotal = (topups, user) => (
  (Array.isArray(topups) ? topups : [])
    .filter((topup) => {
      const sameUser = String(topup?.userId || '').trim() === String(user?.id || '').trim();
      const approved = ['approved', 'active', 'completed', 'success'].includes(String(topup?.status || '').toLowerCase());
      return sameUser && approved;
    })
    .reduce((total, topup) => {
      const amount = Number(
        topup?.financialSnapshot?.originalAmount
        ?? topup?.requestedAmount
        ?? topup?.amount
        ?? topup?.actualPaidAmount
        ?? 0
      );
      return total + (Number.isFinite(amount) && amount > 0 ? amount : 0);
    }, 0)
);

const WalletLevels = () => {
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const groups = useGroupStore((state) => state.groups);
  const loadGroups = useGroupStore((state) => state.loadGroups);
  const topups = useTopupStore((state) => state.topups);
  const loadTopups = useTopupStore((state) => state.loadTopups);
  const isArabic = dir === 'rtl';

  useEffect(() => {
    void loadGroups({ force: true });
    void loadTopups({ force: true });
  }, [loadGroups, loadTopups]);

  const levels = useMemo(() => (
    (Array.isArray(groups) ? groups : [])
      .slice()
      .sort((left, right) => Number(right?.discount ?? right?.percentage ?? 0) - Number(left?.discount ?? left?.percentage ?? 0))
      .map((group, index) => ({
        ...group,
        level: index + 1,
        threshold: index * LEVEL_STEP,
        percentage: Number(group?.discount ?? group?.percentage ?? 0),
      }))
  ), [groups]);

  const totalDeposits = getApprovedDepositTotal(topups, user);
  const reachedLevelIndex = Math.min(Math.floor(totalDeposits / LEVEL_STEP), Math.max(levels.length - 1, 0));
  const activeLevelIndex = levels.findIndex((level) => groupMatchesUser(level, user));
  const currentLevelIndex = activeLevelIndex >= 0 ? activeLevelIndex : reachedLevelIndex;
  const currentLevel = levels[currentLevelIndex] || null;
  const nextLevel = levels[currentLevelIndex + 1] || null;
  const progressBase = currentLevel?.threshold || 0;
  const progressTarget = nextLevel?.threshold || (progressBase + LEVEL_STEP);
  const progressPercent = nextLevel
    ? Math.min(100, Math.max(0, ((totalDeposits - progressBase) / (progressTarget - progressBase)) * 100))
    : 100;

  return (
    <section className="wallet-levels-page" dir={dir}>
      <div className="wallet-levels-shell">
        <header className="wallet-levels-header">
          <div>
            <p className="wallet-levels-kicker"><Sparkles /> {isArabic ? 'برنامج المكافآت' : 'Rewards program'}</p>
            <h1>{isArabic ? 'مستويات الإيداع' : 'Deposit levels'}</h1>
            <p>{isArabic ? 'كل إضافة تقرّبك من مستوى أعلى ومزايا أفضل.' : 'Every deposit takes you closer to a higher level and better benefits.'}</p>
          </div>
          <div className="wallet-levels-balance">
            <WalletCards />
            <span>{isArabic ? 'إجمالي الإضافات' : 'Total deposits'}</span>
            <strong dir="ltr">{totalDeposits.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD</strong>
          </div>
        </header>

        <section className="wallet-levels-hero">
          <div className="wallet-levels-hero-copy">
            <span className="wallet-levels-current-label">{isArabic ? 'مستواك الحالي' : 'Your current level'}</span>
            <h2>{currentLevel ? getLevelLabel(currentLevel.level, isArabic) : (isArabic ? 'المستوى الأول' : 'Level one')}</h2>
            <div className="wallet-levels-progress-meta">
              <span>{isArabic ? 'التقدم للمستوى التالي' : 'Progress to next level'}</span>
              <strong dir="ltr">{Math.round(progressPercent)}%</strong>
            </div>
            <div className="wallet-levels-progress-track" aria-label={`${Math.round(progressPercent)}%`}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="wallet-levels-next-note">
              {nextLevel
                ? `${isArabic ? 'أضف' : 'Add'} ${(progressTarget - totalDeposits).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD ${isArabic ? 'للوصول إلى' : 'to reach'} ${nextLevel.nameAr || nextLevel.name}`
                : (isArabic ? 'أنت في أعلى مستوى متاح حاليًا.' : 'You are currently at the highest available level.')}
            </p>
          </div>
          <div className="wallet-levels-hero-art" aria-hidden="true">
            <span className="wallet-levels-orbit wallet-levels-orbit--one" />
            <span className="wallet-levels-orbit wallet-levels-orbit--two" />
            <img src={genieImage} alt="" />
          </div>
        </section>

        <section className="wallet-levels-list" aria-label={isArabic ? 'قائمة المستويات' : 'Levels list'}>
          <div className="wallet-levels-list-heading">
            <div>
              <span>{isArabic ? 'خريطة المجموعات' : 'Group map'}</span>
              <h2>{isArabic ? 'كل مستوى يفتح لك خطوة جديدة' : 'Every level unlocks a new step'}</h2>
            </div>
            <button type="button" onClick={() => navigate('/wallet/add-balance')}><ArrowLeft /> {isArabic ? 'إضافة رصيد' : 'Add balance'}</button>
          </div>
          <div className="wallet-levels-grid">
            {levels.map((level, index) => {
              const isCurrent = index === currentLevelIndex;
              const isReached = index <= reachedLevelIndex;
              return (
                <article key={level.id || level._id || level.name || index} className={`wallet-level-card${isCurrent ? ' is-current' : ''}${isReached ? ' is-reached' : ''}`}>
                  <div className="wallet-level-card-media">
                    <img src={genieImage} alt="" />
                    <span>{level.level}</span>
                  </div>
                  <div className="wallet-level-card-copy">
                    <div className="wallet-level-card-title">
                      <div>
                        <span>{isArabic ? `المستوى ${level.level}` : `Level ${level.level}`}</span>
                        <h3>{level.nameAr || level.name}</h3>
                      </div>
                      {isReached ? <Check /> : <LockKeyhole />}
                    </div>
                    <p dir="ltr">{level.threshold.toLocaleString('en-US')} USD {isArabic ? 'إجمالي الإيداعات' : 'total deposits'}</p>
                    <strong>{level.percentage}% {isArabic ? 'نسبة المجموعة' : 'group rate'}</strong>
                  </div>
                </article>
              );
            })}
          </div>
          {!levels.length && <p className="wallet-levels-empty">{isArabic ? 'لا توجد مجموعات مفعلة حاليًا.' : 'No active groups are available yet.'}</p>}
        </section>
      </div>
    </section>
  );
};

export default WalletLevels;
