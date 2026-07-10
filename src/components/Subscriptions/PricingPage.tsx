const plans = [
  { name: "Consumer", price: "$12", body: "Premium training, journal, Atlas coaching, and progress tracking for one member.", features: ["Smart workout library", "Fitness diary", "Atlas daily insights", "Progress photos"] },
  { name: "Trainer", price: "$49", body: "Client management, programming, messaging, and coaching workflows.", features: ["Client roster", "Program delivery", "Check-ins", "Trainer messages"] },
  { name: "Gym", price: "Custom", body: "A branded member experience for facilities and teams.", features: ["Gym profile", "Member roles", "Billing support", "Enterprise onboarding"] },
];
export function PricingPage() {
  return <main className="pricing-page"><header className="pricing-hero"><p className="eyebrow">Pricing</p><h1>Premium fitness software for members, trainers, and gyms.</h1><p>Choose the experience that fits how you train or coach.</p></header><section className="pricing-grid">{plans.map((plan) => <article className="pricing-card" key={plan.name}><h2>{plan.name}</h2><strong>{plan.price}</strong><p>{plan.body}</p><ul>{plan.features.map((f) => <li key={f}>✓ {f}</li>)}</ul><button>{plan.name === "Gym" ? "Contact Enterprise" : "Start now"}</button></article>)}</section><section className="pricing-faq"><h2>FAQ</h2><p><strong>Can I change plans?</strong> Yes. Upgrade or adjust your subscription from Billing.</p><p><strong>Is Atlas included?</strong> Atlas coaching is included across member experiences.</p></section></main>;
}
