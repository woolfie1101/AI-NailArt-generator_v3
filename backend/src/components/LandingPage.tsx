import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { useTranslations } from '../hooks/useTranslations';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  const { t } = useTranslations();

  const featureCards = [
    {
      title: t('landing.feature1Title'),
      description: t('landing.feature1Desc'),
    },
    {
      title: t('landing.feature2Title'),
      description: t('landing.feature2Desc'),
    },
    {
      title: t('landing.feature3Title'),
      description: t('landing.feature3Desc'),
    },
  ];

  const plans = [
    {
      name: t('landing.freePlanName'),
      price: t('landing.freePlanPrice'),
      description: t('landing.freePlanDesc'),
      features: [
        t('landing.freePlanFeature1'),
        t('landing.freePlanFeature2'),
      ],
      highlight: false,
    },
    {
      name: t('landing.premiumPlanName'),
      price: t('landing.premiumPlanPrice'),
      description: t('landing.premiumPlanDesc'),
      features: [
        t('landing.premiumPlanFeature1'),
        t('landing.premiumPlanFeature2'),
        t('landing.premiumPlanFeature3'),
      ],
      highlight: true,
    },
    {
      name: t('landing.proPlanName'),
      price: t('landing.proPlanPrice'),
      description: t('landing.proPlanDesc'),
      features: [
        t('landing.proPlanFeature1'),
        t('landing.proPlanFeature2'),
        t('landing.proPlanFeature3'),
      ],
      highlight: false,
    },
  ];

  const handleLogin = async () => {
    if (loading) return;
    await signInWithGoogle();
  };

  return (
    <div className="space-y-16">
      <section className="bg-gradient-to-br from-rose-50 via-amber-50 to-white rounded-3xl p-8 md:p-12 border border-amber-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium bg-white/70 rounded-full border border-amber-200 text-amber-700 shadow">
              <SparklesIcon />
              {t('landing.heroBadge')}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {t('landing.heroTitle')}
            </h1>
            <p className="text-lg text-gray-600 md:w-3/4">
              {t('landing.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                onClick={handleLogin}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-md transition-all duration-300
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-700'}`}
              >
                <SparklesIcon />
                {loading ? t('landing.heroLoading') : t('landing.heroCta')}
              </button>
              <p className="text-sm text-gray-500">
                {t('landing.heroSecondary')}
              </p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 self-stretch">
            <div className="bg-white/80 border border-rose-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-rose-500 font-semibold mb-2">
                {t('landing.previewTitle')}
              </p>
              <p className="text-sm text-gray-600">
                {t('landing.previewDesc')}
              </p>
            </div>
            <div className="bg-white/80 border border-amber-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-amber-500 font-semibold mb-2">
                {t('landing.promptTitle')}
              </p>
              <p className="text-sm text-gray-600">
                {t('landing.promptDesc')}
              </p>
            </div>
            <div className="bg-white/80 border border-emerald-100 rounded-2xl p-4 shadow-sm col-span-2">
              <p className="text-xs uppercase tracking-wide text-emerald-500 font-semibold mb-2">
                {t('landing.workflowTitle')}
              </p>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>{t('landing.workflowStep1')}</li>
                <li>{t('landing.workflowStep2')}</li>
                <li>{t('landing.workflowStep3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
          {t('landing.featuresTitle')}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((feature) => (
            <div key={feature.title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
          {t('landing.pricingTitle')}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-10">
          {t('landing.pricingSubtitle')}
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 shadow-sm flex flex-col gap-4 transition-all duration-300
                ${plan.highlight ? 'border-gray-900 bg-gray-900 text-white shadow-lg scale-105' : 'border-slate-200 bg-white'}`}
            >
              <div>
                <h3 className={`text-xl font-semibold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-3xl font-bold mt-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </p>
                <p className={`text-sm mt-2 ${plan.highlight ? 'text-gray-200' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>
              <ul className={`space-y-2 text-sm ${plan.highlight ? 'text-gray-100' : 'text-gray-600'}`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className={`mt-1 w-2 h-2 rounded-full ${plan.highlight ? 'bg-amber-300' : 'bg-emerald-400'}`}></span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleLogin}
                disabled={loading}
                className={`mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold border transition-all duration-300
                  ${plan.highlight
                    ? 'bg-white text-gray-900 hover:bg-amber-100 border-transparent'
                    : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                  }
                  ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <SparklesIcon />
                {loading ? t('landing.pricingLoading') : t('landing.pricingCta')}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
