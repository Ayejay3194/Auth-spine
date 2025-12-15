import { Engine } from "./engine";
import { PredictiveSchedulingEngine } from "../engines/predictiveScheduling";
import { ClientBehaviorEngine } from "../engines/clientBehavior";
import { RebookingEngine } from "../engines/rebooking";
import { DynamicPricingEngine } from "../engines/dynamicPricing";
import { SegmentationEngine } from "../engines/segmentation";
import { NotificationEngine } from "../engines/notifications";
import { ReviewAutomationEngine } from "../engines/reviews";
import { WaitlistEngine } from "../engines/waitlist";
import { InventoryEngine } from "../engines/inventory";
import { FinanceEngine } from "../engines/finance";
import { MarketingEngine } from "../engines/marketing";
import { CommunicationOptimizerEngine } from "../engines/communication";
import { AppointmentFlowEngine } from "../engines/appointmentFlow";
import { CancellationEngine } from "../engines/cancellations";
import { OnboardingEngine } from "../engines/onboarding";
import { BenchmarkingEngine } from "../engines/benchmarking";

export function defaultEngines(): Engine[] {
  return [
    new PredictiveSchedulingEngine(),
    new ClientBehaviorEngine(),
    new RebookingEngine(),
    new DynamicPricingEngine(),
    new SegmentationEngine(),
    new NotificationEngine(),
    new ReviewAutomationEngine(),
    new WaitlistEngine([]),
    new InventoryEngine(),
    new FinanceEngine(),
    new MarketingEngine(),
    new CommunicationOptimizerEngine(),
    new AppointmentFlowEngine(),
    new CancellationEngine(),
    new OnboardingEngine(),
    new BenchmarkingEngine(800000),
  ];
}
