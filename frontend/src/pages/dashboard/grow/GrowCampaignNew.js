import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Target, Users, DollarSign, Palette, Rocket, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { growService } from '@/services/growService';

const OBJECTIVES = [
  { value: 'awareness', label: 'Notoriete', desc: 'Plus de personnes voient ta marque', icon: '👁️' },
  { value: 'traffic', label: 'Trafic', desc: 'Envoyer des gens vers ton site/WhatsApp', icon: '🔗' },
  { value: 'conversions', label: 'Conversions', desc: 'Generer des ventes', icon: '🛒' },
  { value: 'messages', label: 'Messages', desc: 'Recevoir des messages WhatsApp', icon: '💬' },
];

const INTERESTS = ['Restaurant', 'Mode', 'Beaute', 'Technologie', 'Sport', 'Immobilier', 'Education', 'Sante', 'Alimentation', 'Voyage', 'Finance', 'Agriculture'];

const AFRICAN_CITIES = ['Douala', 'Yaounde', 'Bamenda', 'Bafoussam', 'Lagos', 'Abidjan', 'Dakar', 'Kinshasa', 'Nairobi', 'Accra', 'Johannesburg', 'Casablanca'];

export default function GrowCampaignNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [campaign, setCampaign] = useState({
    name: '', objective: '', budget_fcfa: 5000, budget_type: 'daily', duration: 14,
    target_audience: { age_min: 18, age_max: 55, locations: [], interests: [], genders: 'all' },
    ad_creative: { headline: '', description: '', cta_button: 'LEARN_MORE', image_url: '' },
  });

  const createMutation = useMutation({
    mutationFn: (data) => growService.createCampaign(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['grow-campaigns']);
      toast.success('Campagne creee!');
      navigate(`/dashboard/grow/campaigns/${res.campaign_id}`);
    },
    onError: () => toast.error('Erreur lors de la creation'),
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await growService.generateCreative({
        product_name: campaign.name, product_description: campaign.ad_creative.description || campaign.name, objective: campaign.objective,
      });
      setCampaign(prev => ({
        ...prev, ad_creative: { ...prev.ad_creative, headline: res.headlines?.[0] || prev.ad_creative.headline, description: res.descriptions?.[0] || prev.ad_creative.description, _options: res },
      }));
      toast.success('Suggestions generees!');
    } catch { toast.error('Erreur IA'); }
    finally { setGenerating(false); }
  };

  const handleSubmit = () => {
    const now = new Date();
    const end = new Date(now.getTime() + campaign.duration * 86400000);
    createMutation.mutate({
      name: campaign.name, objective: campaign.objective, budget_fcfa: campaign.budget_fcfa,
      budget_type: campaign.budget_type, start_date: now.toISOString(), end_date: end.toISOString(),
      target_audience: campaign.target_audience, ad_creative: campaign.ad_creative,
    });
  };

  const toggleArrayItem = (arr, item) => arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
  const estimatedReach = Math.round((campaign.budget_fcfa / 100) * (campaign.target_audience.locations.length || 1) * 15);

  const stepTitles = [
    { icon: <Target className="w-5 h-5" />, label: 'Objectif' },
    { icon: <Users className="w-5 h-5" />, label: 'Audience' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Budget' },
    { icon: <Palette className="w-5 h-5" />, label: 'Creatif' },
    { icon: <Rocket className="w-5 h-5" />, label: 'Lancer' },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto" data-testid="grow-campaign-new">
      <button onClick={() => navigate('/dashboard/grow/campaigns')} className="flex items-center text-text-muted hover:text-primary mb-6"><ArrowLeft className="w-4 h-4 mr-2" />Retour</button>
      <h1 className="text-2xl font-bold mb-6">Nouvelle campagne</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepTitles.map((s, i) => (
          <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${step === i + 1 ? 'bg-orange-500/20 text-orange-400' : step > i + 1 ? 'bg-primary/10 text-primary' : 'text-text-muted'}`}>
            {s.icon}<span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        {/* Step 1: Objective */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Quel est votre objectif ?</h2>
            <input type="text" placeholder="Nom de la campagne" value={campaign.name} onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-orange-500" data-testid="campaign-name-input" />
            <div className="grid grid-cols-2 gap-3">
              {OBJECTIVES.map((obj) => (
                <button key={obj.value} onClick={() => setCampaign({ ...campaign, objective: obj.value })}
                  className={`p-4 rounded-xl border text-left transition ${campaign.objective === obj.value ? 'border-orange-500 bg-orange-500/5' : 'border-border hover:border-border/60'}`} data-testid={`obj-${obj.value}`}>
                  <div className="text-2xl mb-2">{obj.icon}</div>
                  <div className="font-bold text-sm">{obj.label}</div>
                  <div className="text-xs text-text-muted">{obj.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Audience */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Definissez votre audience</h2>
            <div>
              <label className="text-sm font-medium mb-2 block">Villes cibles</label>
              <div className="flex flex-wrap gap-2">
                {AFRICAN_CITIES.map((city) => (
                  <button key={city} onClick={() => setCampaign({ ...campaign, target_audience: { ...campaign.target_audience, locations: toggleArrayItem(campaign.target_audience.locations, city) } })}
                    className={`px-3 py-1.5 rounded-full text-xs transition ${campaign.target_audience.locations.includes(city) ? 'bg-orange-500 text-white' : 'bg-background border border-border text-text-secondary hover:border-orange-500/50'}`}>
                    {city}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Age min: {campaign.target_audience.age_min}</label>
                <input type="range" min={18} max={64} value={campaign.target_audience.age_min} onChange={(e) => setCampaign({ ...campaign, target_audience: { ...campaign.target_audience, age_min: +e.target.value } })} className="w-full accent-orange-500" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Age max: {campaign.target_audience.age_max}</label>
                <input type="range" min={19} max={65} value={campaign.target_audience.age_max} onChange={(e) => setCampaign({ ...campaign, target_audience: { ...campaign.target_audience, age_max: +e.target.value } })} className="w-full accent-orange-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sexe</label>
              <div className="flex gap-3">
                {[['all', 'Tous'], ['male', 'Hommes'], ['female', 'Femmes']].map(([v, l]) => (
                  <button key={v} onClick={() => setCampaign({ ...campaign, target_audience: { ...campaign.target_audience, genders: v } })}
                    className={`px-4 py-2 rounded-lg text-sm ${campaign.target_audience.genders === v ? 'bg-orange-500 text-white' : 'bg-background border border-border'}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Interets</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((int) => (
                  <button key={int} onClick={() => setCampaign({ ...campaign, target_audience: { ...campaign.target_audience, interests: toggleArrayItem(campaign.target_audience.interests, int) } })}
                    className={`px-3 py-1.5 rounded-full text-xs transition ${campaign.target_audience.interests.includes(int) ? 'bg-orange-500 text-white' : 'bg-background border border-border text-text-secondary'}`}>
                    {int}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="outline" className="text-orange-400 border-orange-400/30" onClick={() => setCampaign({ ...campaign, target_audience: { ...campaign.target_audience, locations: ['Douala', 'Yaounde'], interests: ['Mode', 'Beaute'], age_min: 22, age_max: 45, genders: 'all' } })}>
              <Sparkles className="w-4 h-4 mr-2" /> Laisser l'IA choisir
            </Button>
          </div>
        )}

        {/* Step 3: Budget */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Definissez votre budget</h2>
            <div className="flex gap-3">
              {[['daily', 'Journalier'], ['lifetime', 'Total campagne']].map(([v, l]) => (
                <button key={v} onClick={() => setCampaign({ ...campaign, budget_type: v })}
                  className={`px-4 py-2 rounded-lg text-sm ${campaign.budget_type === v ? 'bg-orange-500 text-white' : 'bg-background border border-border'}`}>{l}</button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Budget: {campaign.budget_fcfa.toLocaleString()} FCFA{campaign.budget_type === 'daily' ? '/jour' : ''}</label>
              <input type="range" min={2000} max={50000} step={1000} value={campaign.budget_fcfa} onChange={(e) => setCampaign({ ...campaign, budget_fcfa: +e.target.value })} className="w-full accent-orange-500" data-testid="budget-slider" />
              <div className="flex justify-between text-xs text-text-muted"><span>2,000 F</span><span>50,000 F</span></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Duree: {campaign.duration} jours</label>
              <div className="flex gap-3">
                {[7, 14, 30].map(d => (
                  <button key={d} onClick={() => setCampaign({ ...campaign, duration: d })}
                    className={`px-4 py-2 rounded-lg text-sm ${campaign.duration === d ? 'bg-orange-500 text-white' : 'bg-background border border-border'}`}>{d}j</button>
                ))}
              </div>
            </div>
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
              <p className="text-sm text-orange-400">Estimation: votre pub pourrait toucher <strong>{estimatedReach.toLocaleString()} - {(estimatedReach * 3).toLocaleString()}</strong> personnes/jour</p>
              {campaign.budget_type === 'daily' && <p className="text-xs text-text-muted mt-1">Budget total estime: {(campaign.budget_fcfa * campaign.duration).toLocaleString()} FCFA</p>}
            </div>
          </div>
        )}

        {/* Step 4: Creative */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Creatif publicitaire</h2>
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating} className="text-orange-400 border-orange-400/30" data-testid="generate-creative-btn">
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />} Generer avec l'IA
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Titre (40 car. max)</label>
              <input type="text" maxLength={40} value={campaign.ad_creative.headline} onChange={(e) => setCampaign({ ...campaign, ad_creative: { ...campaign.ad_creative, headline: e.target.value } })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500" placeholder="Titre accrocheur..." data-testid="creative-headline" />
              {campaign.ad_creative._options?.headlines && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {campaign.ad_creative._options.headlines.map((h, i) => (
                    <button key={i} onClick={() => setCampaign({ ...campaign, ad_creative: { ...campaign.ad_creative, headline: h } })}
                      className="text-xs px-2 py-1 rounded bg-orange-500/10 text-orange-400 hover:bg-orange-500/20">{h}</button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description (125 car. max)</label>
              <textarea maxLength={125} rows={3} value={campaign.ad_creative.description} onChange={(e) => setCampaign({ ...campaign, ad_creative: { ...campaign.ad_creative, description: e.target.value } })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 resize-none" placeholder="Description de votre offre..." data-testid="creative-description" />
              {campaign.ad_creative._options?.descriptions && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {campaign.ad_creative._options.descriptions.map((d, i) => (
                    <button key={i} onClick={() => setCampaign({ ...campaign, ad_creative: { ...campaign.ad_creative, description: d } })}
                      className="text-xs px-2 py-1 rounded bg-orange-500/10 text-orange-400 hover:bg-orange-500/20">{d.slice(0, 40)}...</button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bouton CTA</label>
              <select value={campaign.ad_creative.cta_button} onChange={(e) => setCampaign({ ...campaign, ad_creative: { ...campaign.ad_creative, cta_button: e.target.value } })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500">
                <option value="LEARN_MORE">En savoir plus</option>
                <option value="SHOP_NOW">Acheter</option>
                <option value="CONTACT_US">Nous contacter</option>
                <option value="SIGN_UP">S'inscrire</option>
                <option value="SEND_WHATSAPP">WhatsApp</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Recap + Launch */}
        {step === 5 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Recap de votre campagne</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-muted">Nom</span><span className="font-medium">{campaign.name}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-muted">Objectif</span><span className="font-medium capitalize">{OBJECTIVES.find(o => o.value === campaign.objective)?.label}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-muted">Budget</span><span className="font-medium">{campaign.budget_fcfa.toLocaleString()} FCFA/{campaign.budget_type === 'daily' ? 'jour' : 'total'}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-muted">Duree</span><span className="font-medium">{campaign.duration} jours</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-muted">Villes</span><span className="font-medium">{campaign.target_audience.locations.join(', ') || 'Toutes'}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-muted">Age</span><span className="font-medium">{campaign.target_audience.age_min}-{campaign.target_audience.age_max} ans</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-text-muted">Titre pub</span><span className="font-medium">{campaign.ad_creative.headline || '-'}</span></div>
              <div className="flex justify-between py-2"><span className="text-text-muted">Estimation portee</span><span className="font-medium text-orange-400">{estimatedReach.toLocaleString()} - {(estimatedReach * 3).toLocaleString()} /jour</span></div>
            </div>
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 text-xs text-text-muted">
              Votre campagne sera soumise a Facebook pour validation (24-48h). Le budget ne sera depense qu'apres approbation.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}><ArrowLeft className="w-4 h-4 mr-2" />Retour</Button>
          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)} disabled={(step === 1 && (!campaign.name || !campaign.objective))} className="bg-orange-500 hover:bg-orange-600" data-testid="wizard-next-btn">
              Suivant<ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createMutation.isLoading} className="bg-orange-500 hover:bg-orange-600" data-testid="wizard-launch-btn">
              <Rocket className="w-4 h-4 mr-2" /> Lancer la campagne
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
