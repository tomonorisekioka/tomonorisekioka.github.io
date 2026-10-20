/* GA4 page analytics with opt-in consent. No Google network request before consent. */
(function () {
  "use strict";
  const ID = "G-F9FJ0MR7B1";
  const KEY = "ts-analytics-consent-v1";
  let choice = null;
  let loaded = false;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  function save(value) {
    choice = value;
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }
  function enable() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("config", ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(script);
  }
  // Game telemetry goes through this consent gate rather than accessing gtag directly.
  // Do not transmit names, identifiers, coordinates or free-text inputs.
  window.siteAnalyticsEvent = function (name, params) {
    if (choice !== "yes" || !loaded || typeof window.gtag !== "function") return;
    window.gtag("event", name, params || {});
  };
  function banner() {
    const panel = document.createElement("div");
    panel.className = "analytics-consent";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "アクセス解析の設定");
    const text = document.createElement("p");
    text.textContent = "このサイトではGoogle Analyticsを使って閲覧状況を集計します。広告目的では利用しません。";
    const actions = document.createElement("div");
    actions.className = "analytics-consent-actions";
    const yes = document.createElement("button");
    yes.type = "button";
    yes.textContent = "許可する";
    const no = document.createElement("button");
    no.type = "button";
    no.textContent = "許可しない";
    no.className = "analytics-consent-no";
    actions.append(no, yes);
    panel.append(text, actions);
    function decide(value) {
      save(value);
      panel.remove();
      if (value === "yes") enable();
    }
    yes.addEventListener("click", () => decide("yes"));
    no.addEventListener("click", () => decide("no"));
    document.body.appendChild(panel);
  }
  function settings() {
    const footer = document.querySelector(".footer-inner");
    if (!footer) return;
    const button = document.createElement("button");
    button.className = "analytics-settings";
    button.type = "button";
    button.textContent = "アクセス解析の設定";
    button.addEventListener("click", () => {
      // Withdrawal prevents subsequent visits from being measured; any
      // already-loaded tag cannot be unloaded without reloading the page.
      try { localStorage.removeItem(KEY); } catch (e) {}
      window.location.reload();
    });
    button.title = "アクセス解析の許可・拒否を変更する";
    footer.appendChild(button);
  }
  function start() {
    settings();
    if (choice === "yes") enable();
    else if (choice !== "no") banner();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
