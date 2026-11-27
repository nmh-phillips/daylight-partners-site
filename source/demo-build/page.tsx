"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { MODULES, type ModuleKey } from "@/lib/settings";
import { demoDataset } from "@/lib/demo-data";
import { ExecDashboard } from "@/components/modules/ExecDashboard";
import { BoardReport } from "@/components/modules/board/BoardReport";
import { Pipeline } from "@/components/modules/pipeline/Pipeline";
import { Pricing } from "@/components/modules/pricing/Pricing";
import { ClientProfitability } from "@/components/modules/clients/ClientProfitability";
import { Receivables } from "@/components/modules/receivables/Receivables";
import { Payables } from "@/components/modules/payables/Payables";
import { CloseTracker } from "@/components/modules/close/CloseTracker";
import { DEMO_CLOSE_DOC, DEMO_CLOSE_MONTH, DEMO_CLOSE_XERO } from "@/lib/close-demo";
import { ExternalFactors } from "@/components/modules/external/ExternalFactors";
import { emptyExternalDoc, DEFAULT_EXTERNAL_CATEGORIES } from "@/lib/external";
import { PeoplePlaceholder, ClientHealthPlaceholder } from "@/components/modules/PlaceholderPages";
import { DEMO_AS_OF, demoDeals } from "@/lib/pipeline";
import { budgetNewArr } from "@/lib/arr";
import { ActionsTracker } from "@/components/modules/actions/ActionsTracker";
import { RiskRegister } from "@/components/modules/risks/RiskRegister";
import { MarketInsights } from "@/components/modules/market/MarketInsights";
import { Customise } from "@/components/modules/customise/Customise";
import { Subscriptions } from "@/components/modules/subscriptions/Subscriptions";
import { SoftwareSpend } from "@/components/modules/software/SoftwareSpend";
import { demoSoftware } from "@/lib/software";
import { Revenue } from "@/components/modules/revenue/Revenue";
import { demoRevenue } from "@/lib/revenue";
import { customerBook, withInvoiceCurrencies } from "@/lib/customers";
import { Renewals } from "@/components/modules/customers/Renewals";
import { Retention } from "@/components/modules/customers/Retention";
import { Margin } from "@/components/modules/margin/Margin";
import { RollingForecast } from "@/components/modules/margin/RollingForecast";
const BOOK_AS_OF = "2026-11-27";
const BOOK = withInvoiceCurrencies(customerBook(demoRevenue(), BOOK_AS_OF), [
  { contact: "Brightwater Syndicate", currency: "AUD", date: "2026-06-01" },
  { contact: "Calder Specialty", currency: "CAD", date: "2026-05-01" },
]);

const REVENUE = demoRevenue();
const DEALS = { deals: demoDeals, source: "demo pipeline", asOf: DEMO_AS_OF };
const NEW_ARR_BUDGET = demoDataset.arr ? budgetNewArr(demoDataset.arr) : null;
const EXTERNAL_DOC = emptyExternalDoc(DEFAULT_EXTERNAL_CATEGORIES);

const SOFTWARE = demoSoftware(); // built once so edits in the demo survive re-renders

function view(k: ModuleKey) {
  switch (k) {
    case "board": return <BoardReport dataset={demoDataset} deals={DEALS} />;
    case "pipeline": return <Pipeline budget={NEW_ARR_BUDGET} budgetLabel="budgeted new ARR" />;
    case "subscriptions": return <Subscriptions />;
    case "software": return <SoftwareSpend data={SOFTWARE} demo isAdmin={false} hasRegister={false} />;
    case "revenue": return <Revenue doc={REVENUE} isAdmin={false} xero={null} yearEndMonth={12} note="Demo: in the live app new invoices come from Xero and the monthly check runs against Xero's profit and loss." />;
    case "pricing": return <Pricing />;
    case "renewals": return <Renewals book={BOOK} asOf={BOOK_AS_OF} />;
    case "retention": return <Retention book={BOOK} asOf={BOOK_AS_OF} yearEndMonth={12} />;
    case "margin": return <Margin dataset={demoDataset} />;
    case "rolling": return <RollingForecast dataset={demoDataset} />;
    case "clients": return <ClientProfitability />;
    case "receivables": return <Receivables />;
    case "payables": return <Payables />;
    case "close": return <CloseTracker month={DEMO_CLOSE_MONTH} doc={DEMO_CLOSE_DOC} isAdmin xero={DEMO_CLOSE_XERO} demo />;
    case "external": return <ExternalFactors signedIn={false} isAdmin={false} doc={EXTERNAL_DOC} risks={null} news={{}} book={BOOK} />;
    case "people": return <PeoplePlaceholder />;
    case "health": return <ClientHealthPlaceholder />;
    case "actions": return <ActionsTracker />;
    case "risks": return <RiskRegister />;
    case "market": return <MarketInsights />;
    case "customise": return <Customise />;
    case "data": return (
      <div className="card">
        <h2>Data</h2>
        <p className="card-sub">In the live app, this is where you upload month-end packs from Excel and connect Xero and Zoho CRM (read-only) for live receivables, payables, software spend and pipeline. Uploads stay in your own workspace.</p>
      </div>
    );
    default: return <ExecDashboard dataset={demoDataset} deals={DEALS} />;
  }
}

export default function Demo() {
  const [active, setActive] = useState<ModuleKey>("overview");
  useEffect(() => {
    const read = () => {
      const m = MODULES.find((x) => x.hash === window.location.hash);
      setActive(m ? m.key : "overview");
      window.scrollTo(0, 0);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return (
    <AppShell active={active} isDemo linkMode="hash" right={<span className="badge">Preview</span>}>
      {view(active)}
    </AppShell>
  );
}
