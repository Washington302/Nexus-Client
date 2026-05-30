<script lang="ts">
  import { COLORS, S } from "$lib/constants";
  import type { Covenant , CurrencyConfig} from "$lib/types";


  // ── Currency config ───────────────────────────────────────────────────────

  const defaultCurrencies: CurrencyConfig[] = [
    { label: "Pounds", abbreviation: "£", rateToBase: 1 },
    { label: "Shillings", abbreviation: "s", rateToBase: 20 },
    { label: "Pence", abbreviation: "d", rateToBase: 240 },
  ];

  let {
    covenant,
    currencies = defaultCurrencies,
  }: {
    covenant: Covenant;
    currencies?: CurrencyConfig[];
  } = $props();

  let selectedCurrency = $state<CurrencyConfig>(defaultCurrencies[0]);

  function convert(pounds: number): string {
    const value = pounds * selectedCurrency.rateToBase;
    // Show one decimal place for shillings/pence to avoid ugly fractions
    const display =
      selectedCurrency.rateToBase === 1
        ? value.toString()
        : value % 1 === 0
          ? value.toString()
          : value.toFixed(1);
    return `${display} ${selectedCurrency.abbreviation}`;
  }

  // ── Expenditure rows ──────────────────────────────────────────────────────
  const expenditureRows = $derived([
    [
      "Buildings",
      covenant.buildingsExpenditure,
      "1 pound per 10 pts. Inhabitants",
      "50% per craft",
    ],
    [
      "Consumables",
      covenant.consumablesExpenditure,
      "2 pounds per 10 pts. Inhabitants",
      "20% per craft",
    ],
    [
      "Provisions",
      covenant.provisionsExpenditure,
      "5 pounds per 10 pts. Inhabitants",
      "50% + 20% craft",
    ],
    [
      "Wages",
      covenant.wagesExpenditure,
      "2 points per 10 pts. Inhabitants",
      "—",
    ],
    [
      "Weapons & Armor",
      covenant.weaponsArmorExpenditure,
      "1 pound per 320 pts. Weapons & Armor",
      "50% per craft",
    ],
    [
      "Writing Materials",
      covenant.writingMaterialsExpenditure,
      "1 pound per Magus and book specialist",
      "50% per craft",
    ],
    ["Misc", covenant.miscExpenditure, "Sundry charges", "—"],
  ]);

  // ── Derived totals ────────────────────────────────────────────────────────
  const totalExpenditure = $derived(
    covenant.buildingsExpenditure +
      covenant.consumablesExpenditure +
      covenant.provisionsExpenditure +
      covenant.wagesExpenditure +
      covenant.weaponsArmorExpenditure +
      covenant.writingMaterialsExpenditure +
      covenant.miscExpenditure,
  );

  const totalIncome = $derived(
    covenant.annualIncomeSilver + covenant.costSavingsSilver,
  );

  const netSurplus = $derived(totalIncome - totalExpenditure);

  // ── Shared styles ─────────────────────────────────────────────────────────
  const sectionHeaderStyle = `
    font-family: ${S.fontBody};
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${COLORS.red};
    margin: 0 0 10px 0;
  `;

  const thStyle = `
    font-family: ${S.fontBody};
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${COLORS.inkMuted};
    padding: 6px 12px;
    border-bottom: 1px solid ${COLORS.outlineVar};
  `;

  const tdStyle = `
    font-family: ${S.fontBody};
    font-size: 13px;
    color: ${COLORS.ink};
    padding: 8px 12px;
    border-bottom: 1px solid ${COLORS.outlineVar};
    vertical-align: middle;
  `;
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
  <!-- Currency selector -->
  <div
    style="
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
  "
  >
    <span
      style="
      font-family: {S.fontBody};
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: {COLORS.inkMuted};
    ">Display Currency</span
    >
    <div style="display: flex; gap: 4px;">
      {#each currencies.length ? currencies : defaultCurrencies as currency}
        {@const isSelected =
          selectedCurrency.abbreviation === currency.abbreviation}
        <button
          onclick={() => (selectedCurrency = currency)}
          style="
            font-family: {S.fontBody};
            font-size: 12px;
            font-weight: {isSelected ? '700' : '400'};
            color: {isSelected ? COLORS.white : COLORS.inkMuted};
            background-color: {isSelected ? COLORS.ink : 'transparent'};
            border: 1px solid {isSelected ? COLORS.ink : COLORS.outlineVar};
            padding: 4px 12px;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.15s ease;
          ">{currency.label}</button
        >
      {/each}
    </div>
  </div>

  <!-- Income & Summary -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <!-- Income -->
    <div
      style="
      background-color: {COLORS.bgLow};
      border: 1px solid {COLORS.outlineVar};
      border-radius: 6px;
      overflow: hidden;
    "
    >
      <div
        style="padding: 6px 12px; border-bottom: 1px solid {COLORS.outlineVar};"
      >
        <span
          style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: {COLORS.red};
        ">Income</span
        >
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          {#each [["Annual Income", covenant.annualIncomeSilver], ["Cost Savings", covenant.costSavingsSilver]] as [label, value]}
            <tr>
              <td style={tdStyle}>{label}</td>
              <td
                style="
                {tdStyle}
                text-align: right;
                font-family: {S.fontHeadline};
                font-size: 14px;
                font-weight: 700;
              ">{convert(value as number)}</td
              >
            </tr>
          {/each}
        </tbody>
      </table>

      <!-- Total income -->
      <div
        style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background-color: {COLORS.bgHigh};
        border-top: 1px solid {COLORS.outlineVar};
      "
      >
        <span
          style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
        ">Total Income</span
        >
        <span
          style="
          font-family: {S.fontHeadline};
          font-size: 18px;
          font-weight: 800;
          color: {COLORS.ink};
        ">{convert(totalIncome)}</span
        >
      </div>
    </div>

    <!-- Net surplus/deficit -->
    <div
      style="
      background-color: {COLORS.bgLow};
      border: 1px solid {netSurplus >= 0 ? COLORS.outlineVar : COLORS.red};
      border-radius: 6px;
      overflow: hidden;
    "
    >
      <div
        style="padding: 6px 12px; border-bottom: 1px solid {COLORS.outlineVar};"
      >
        <span
          style="
          font-family: {S.fontBody};
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: {COLORS.red};
        ">Annual Summary</span
        >
      </div>

      <div
        style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        border-bottom: 1px solid {COLORS.outlineVar};
      "
      >
        {#each [["Total Income", totalIncome, COLORS.ink], ["Total Expenditure", totalExpenditure, COLORS.ink]] as [label, value, color]}
          <div
            style="
            padding: 10px 12px;
            text-align: center;
            border-right: 1px solid {COLORS.outlineVar};
          "
          >
            <div
              style="
              font-family: {S.fontBody};
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: {COLORS.inkMuted};
              margin-bottom: 4px;
            "
            >
              {label}
            </div>
            <div
              style="
              font-family: {S.fontHeadline};
              font-size: 16px;
              font-weight: 800;
              color: {color};
            "
            >
              {convert(value as number)}
            </div>
          </div>
        {/each}
      </div>

      <!-- Net -->
      <div
        style="
        padding: 16px 12px;
        text-align: center;
      "
      >
        <div
          style="
          font-family: {S.fontBody};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: {COLORS.inkMuted};
          margin-bottom: 6px;
        "
        >
          Net Surplus / Deficit
        </div>
        <div
          style="
          font-family: {S.fontHeadline};
          font-size: 28px;
          font-weight: 800;
          color: {netSurplus >= 0 ? '#4a7c59' : COLORS.red};
        "
        >
          {netSurplus >= 0 ? "+" : ""}{convert(netSurplus)}
        </div>
      </div>
    </div>
  </div>

  <!-- Yearly Expenditure table -->
  <div>
    <p style={sectionHeaderStyle}>Yearly Expenditure</p>
    <div
      style="
      background-color: {COLORS.bgLow};
      border: 1px solid {COLORS.outlineVar};
      border-radius: 6px;
      overflow: hidden;
    "
    >
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: {COLORS.bgHigh};">
            <th style="{thStyle} text-align: left;">Category</th>
            <th style="{thStyle} text-align: left;">Rule Summary</th>
            <th style="{thStyle} text-align: left;">Cost Saving Limit</th>
            <th style="{thStyle} text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          {#each expenditureRows as [label, value, rule, saving], i}
            <tr
              style="background-color: {i % 2 === 0
                ? COLORS.bgLow
                : COLORS.white};"
            >
              <td style="{tdStyle} font-weight: 600;">{label}</td>
              <td
                style="
                {tdStyle}
                font-size: 11px;
                font-style: italic;
                color: {COLORS.inkMuted};
              ">{rule}</td
              >
              <td
                style="
                {tdStyle}
                font-size: 11px;
                color: {COLORS.inkMuted};
              ">{saving}</td
              >
              <td
                style="
                {tdStyle}
                text-align: right;
                font-family: {S.fontHeadline};
                font-size: 14px;
                font-weight: 700;
                color: {(value as number) > 0 ? COLORS.ink : COLORS.inkMuted};
              ">{convert(value as number)}</td
              >
            </tr>
          {/each}
        </tbody>
        <!-- Total row -->
        <tfoot>
          <tr style="background-color: {COLORS.bgHigh};">
            <td
              style="
              {tdStyle}
              font-weight: 700;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.06em;
              color: {COLORS.inkMuted};
              border-bottom: none;
            "
              colspan="3">Total Expenditure</td
            >
            <td
              style="
              {tdStyle}
              text-align: right;
              font-family: {S.fontHeadline};
              font-size: 16px;
              font-weight: 800;
              color: {COLORS.red};
              border-bottom: none;
            ">{convert(totalExpenditure)}</td
            >
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</div>
