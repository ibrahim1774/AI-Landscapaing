import { GeneratorInputs } from "../types.js";

/**
 * Capture lead data whenever a user initiates a generation.
 * This can be sent to a Webhook (Zapier/Make) or a Database.
 */
export const captureLead = async (inputs: GeneratorInputs) => {
    const WEBHOOK_URL = import.meta.env.VITE_LEAD_WEBHOOK_URL;

    if (!WEBHOOK_URL) {
        console.warn("Lead capture skipped: VITE_LEAD_WEBHOOK_URL not set.");
        return;
    }

    console.log("CaptureLead triggered with inputs:", inputs);

    try {
        // 1. Silent Supabase Capture (New)
        console.log("Attempting Supabase lead capture...");
        const { saveLeadToSupabase } = await import("./supabaseService.js");
        saveLeadToSupabase(inputs);

        // 2. Webhook Capture (Existing)
        if (WEBHOOK_URL) {
            await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...inputs,
                    timestamp: new Date().toISOString(),
                    source: window.location.hostname
                })
            });
            console.log("Lead captured via Webhook successfully!");
        }
    } catch (error) {
        console.error("Lead capture failed:", error);
    }
};
