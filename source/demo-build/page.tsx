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
import { MonthEndClose } from "@/components/modules/close/MonthEndClose";
import { ActionsTracker } from "@/components/modules/actions/ActionsTracker";
import { RiskRegister } from "@/components/modules/risks/RiskRegister";
import { MarketInsights } from "@/components/modules/market/MarketInsights";
import { Customise } from "@/components/modules/customise/Customise";

function view(k: ModuleKey) {
  switch (k) {
    case "board": return <BoardReport dataset={demoDataset} />;
    case "pipeline": return <Pipeline />;
    case "pricing": return <Pricing />;
    case "clients": return <ClientProfitability />;
    case "receivables": return <Receivables />;
    case "payables": return <Payables />;
    case "close": return <MonthEndClose />;
    case "actions": return <ActionsTracker />;
    case "risks": return <RiskRegister />;
    case "market": return <MarketInsights />;
    case "customise": return <Customise />;
    default: return <ExecDashboard dataset={demoDataset} />;
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
