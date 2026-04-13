import { NextRequest, NextResponse } from "next/server";

type WakaTimeItem = {
  name?: string;
  percent?: number;
  digital?: string;
  text?: string;
  total_seconds?: number;
};

type WakaTimeBestDay = {
  date?: string;
  text?: string;
  total_seconds?: number;
};

type WakaTimeGrandTotal = {
  digital?: string;
  text?: string;
  total_seconds?: number;
  hours?: number;
  minutes?: number;
};

type WakaTimeDay = {
  date?: string;
  grand_total?: WakaTimeGrandTotal;
};

type WakaTimeSummaryDay = {
  range?: {
    date?: string;
  };
  grand_total?: WakaTimeGrandTotal;
};

type WakaTimeStatsData = {
  human_readable_total?: string;
  human_readable_daily_average?: string;
  total_seconds?: number;
  daily_average?: number;
  start?: string;
  end?: string;
  status?: string;
  is_up_to_date?: boolean;
  percent_calculated?: number;
  days_including_holidays?: number;
  days_minus_holidays?: number;
  best_day?: WakaTimeBestDay;
  languages?: WakaTimeItem[];
  editors?: WakaTimeItem[];
  operating_systems?: WakaTimeItem[];
  projects?: WakaTimeItem[];
  categories?: WakaTimeItem[];
  machines?: WakaTimeItem[];
  dependencies?: WakaTimeItem[];
  days?: WakaTimeDay[];
};

type WakaTimeStatsPayload = {
  data?: WakaTimeStatsData;
};

type WakaTimeSummariesPayload = {
  data?: WakaTimeSummaryDay[];
};

type NormalizedWakaTimeItem = {
  name: string;
  percent: number;
  percentLabel: string;
  time: string;
  totalSeconds: number;
};

type DailyActivityItem = {
  date: string;
  total: string;
  totalSeconds: number;
};

type DateRange = {
  start: string;
  end: string;
};

const VALID_RANGES = [
  "last_7_days",
  "last_30_days",
  "last_6_months",
  "last_year",
  "all_time",
] as const;

type WakaTimeRange = (typeof VALID_RANGES)[number];

const DEFAULT_RANGE: WakaTimeRange = "last_7_days";

export const runtime = "nodejs";

const formatPercent = (value?: number) => {
  if (typeof value !== "number") {
    return "--";
  }

  return `${value.toFixed(2)}%`;
};

const normalizePercent = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
};

const formatHours = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "--";
  }

  const hours = seconds / 3600;

  return `${hours.toFixed(2)} hrs`;
};

const formatDuration = (item?: WakaTimeItem) => {
  if (!item) {
    return "--";
  }

  if (typeof item.digital === "string" && item.digital.length > 0) {
    return item.digital;
  }

  if (typeof item.text === "string" && item.text.length > 0) {
    return item.text;
  }

  if (typeof item.total_seconds === "number") {
    return formatHours(item.total_seconds);
  }

  return "--";
};

const getDayTotalSeconds = (grandTotal?: WakaTimeGrandTotal) => {
  if (!grandTotal) {
    return 0;
  }

  if (typeof grandTotal.total_seconds === "number") {
    return Math.max(0, grandTotal.total_seconds);
  }

  if (typeof grandTotal.hours === "number" || typeof grandTotal.minutes === "number") {
    const hours = typeof grandTotal.hours === "number" ? grandTotal.hours : 0;
    const minutes = typeof grandTotal.minutes === "number" ? grandTotal.minutes : 0;
    return Math.max(0, hours * 3600 + minutes * 60);
  }

  return 0;
};

const getDayTotalText = (grandTotal: WakaTimeGrandTotal | undefined, totalSeconds: number) => {
  if (grandTotal?.text) {
    return grandTotal.text;
  }

  if (grandTotal?.digital) {
    return grandTotal.digital;
  }

  return formatHours(totalSeconds);
};

const normalizeItem = (item?: WakaTimeItem): NormalizedWakaTimeItem => ({
  name: item?.name ?? "Unknown",
  percent: normalizePercent(item?.percent),
  percentLabel: formatPercent(item?.percent),
  time: formatDuration(item),
  totalSeconds: typeof item?.total_seconds === "number" ? Math.max(0, item.total_seconds) : 0,
});

const normalizeCollection = (items?: WakaTimeItem[]) => (items ?? []).map((item) => normalizeItem(item));

const normalizeDailyActivity = (days?: WakaTimeDay[]): DailyActivityItem[] => {
  if (!Array.isArray(days)) {
    return [];
  }

  return days
    .map((day) => {
      const date = typeof day.date === "string" && day.date.length > 0 ? day.date : "--";
      const totalSeconds = getDayTotalSeconds(day.grand_total);

      return {
        date,
        total: getDayTotalText(day.grand_total, totalSeconds),
        totalSeconds,
      };
    })
    .filter((item) => item.date !== "--" || item.totalSeconds > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
};

const normalizeSummaryActivity = (days?: WakaTimeSummaryDay[]): DailyActivityItem[] => {
  if (!Array.isArray(days)) {
    return [];
  }

  return days
    .map((day) => {
      const date = typeof day.range?.date === "string" && day.range.date.length > 0
        ? day.range.date
        : "--";
      const totalSeconds = getDayTotalSeconds(day.grand_total);

      return {
        date,
        total: getDayTotalText(day.grand_total, totalSeconds),
        totalSeconds,
      };
    })
    .filter((item) => item.date !== "--" || item.totalSeconds > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
};

const resolveRange = (rawRange: string | null): WakaTimeRange => {
  if (rawRange && VALID_RANGES.includes(rawRange as WakaTimeRange)) {
    return rawRange as WakaTimeRange;
  }

  return DEFAULT_RANGE;
};

const getUtcDateRange = (days: number): DateRange => {
  const safeDays = Math.max(1, Math.floor(days));
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (safeDays - 1));

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

const getSummaryQueryForRange = (range: WakaTimeRange) => {
  if (range === "last_7_days" || range === "last_30_days") {
    return `range=${range}`;
  }

  if (range === "last_6_months") {
    const dateRange = getUtcDateRange(183);
    return `start=${dateRange.start}&end=${dateRange.end}`;
  }

  const dateRange = getUtcDateRange(365);
  return `start=${dateRange.start}&end=${dateRange.end}`;
};

export async function GET(request: NextRequest) {
  const apiKey = process.env.WAKATIME_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ message: "WakaTime API key is not configured" }, { status: 503 });
  }

  const requestedRange = request.nextUrl.searchParams.get("range");
  const range = resolveRange(requestedRange);
  const summariesQuery = getSummaryQueryForRange(range);
  const consistencyRange = getUtcDateRange(365);
  const consistencyQuery = `start=${consistencyRange.start}&end=${consistencyRange.end}`;

  try {
    const auth = Buffer.from(`${apiKey}:`).toString("base64");
    const [statsResponse, summariesResponse, consistencyResponse] = await Promise.all([
      fetch(`https://wakatime.com/api/v1/users/current/stats/${range}`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        cache: "no-store",
      }),
      fetch(`https://wakatime.com/api/v1/users/current/summaries?${summariesQuery}`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        cache: "no-store",
      }),
      fetch(`https://wakatime.com/api/v1/users/current/summaries?${consistencyQuery}`, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        cache: "no-store",
      }),
    ]);

    if (!statsResponse.ok) {
      return NextResponse.json({ message: "Unable to fetch WakaTime stats" }, { status: 502 });
    }

    const payload = (await statsResponse.json()) as WakaTimeStatsPayload;
    const stats = payload.data;

    const languagesAll = normalizeCollection(stats?.languages);
    const editorsAll = normalizeCollection(stats?.editors);
    const operatingSystemsAll = normalizeCollection(stats?.operating_systems);
    const projectsAll = normalizeCollection(stats?.projects);
    const categoriesAll = normalizeCollection(stats?.categories);
    const machinesAll = normalizeCollection(stats?.machines);
    const dependenciesAll = normalizeCollection(stats?.dependencies);
    const statsDailyActivity = normalizeDailyActivity(stats?.days);
    const summariesPayload = summariesResponse.ok
      ? ((await summariesResponse.json()) as WakaTimeSummariesPayload)
      : null;
    const consistencyPayload = consistencyResponse.ok
      ? ((await consistencyResponse.json()) as WakaTimeSummariesPayload)
      : null;
    const summariesDailyActivity = normalizeSummaryActivity(summariesPayload?.data);
    const consistencyDailyActivity = normalizeSummaryActivity(consistencyPayload?.data);
    const dailyActivity = statsDailyActivity.length > 0 ? statsDailyActivity : summariesDailyActivity;

    const topLanguage = languagesAll[0];
    const topEditor = editorsAll[0];
    const topOs = operatingSystemsAll[0];
    const topProject = projectsAll[0];
    const topCategory = categoriesAll[0];

    const bestDay = {
      date: stats?.best_day?.date ?? "--",
      text: stats?.best_day?.text ?? "--",
      totalSeconds:
        typeof stats?.best_day?.total_seconds === "number" ? stats.best_day.total_seconds : 0,
    };

    return NextResponse.json({
      range,
      validRanges: VALID_RANGES,

      total: stats?.human_readable_total ?? "--",
      dailyAverage: stats?.human_readable_daily_average ?? "--",
      totalSeconds: typeof stats?.total_seconds === "number" ? Math.max(0, stats.total_seconds) : 0,
      dailyAverageSeconds:
        typeof stats?.daily_average === "number" ? Math.max(0, stats.daily_average) : 0,

      startDate: stats?.start ?? "--",
      endDate: stats?.end ?? "--",
      status: stats?.status ?? "--",
      isUpToDate: Boolean(stats?.is_up_to_date),
      percentCalculated:
        typeof stats?.percent_calculated === "number" ? stats.percent_calculated : null,
      daysIncludingHolidays:
        typeof stats?.days_including_holidays === "number" ? stats.days_including_holidays : null,
      daysMinusHolidays:
        typeof stats?.days_minus_holidays === "number" ? stats.days_minus_holidays : null,
      bestDay,

      topLanguage: topLanguage?.name ?? "--",
      topLanguagePercent: topLanguage?.percentLabel ?? "--",
      topEditor: topEditor?.name ?? "--",
      topEditorPercent: topEditor?.percentLabel ?? "--",
      topOs: topOs?.name ?? "--",
      topOsPercent: topOs?.percentLabel ?? "--",

      // Keep legacy shape for desktop widget compatibility.
      languages: languagesAll.slice(0, 4),

      // Full analytics payload for dedicated dashboard views.
      languagesAll,
      editorsAll,
      operatingSystemsAll,
      projectsAll,
      categoriesAll,
      machinesAll,
      dependenciesAll,
      dailyActivity,
      consistencyDailyActivity,
      topProject: topProject?.name ?? "--",
      topProjectPercent: topProject?.percentLabel ?? "--",
      topCategory: topCategory?.name ?? "--",
      topCategoryPercent: topCategory?.percentLabel ?? "--",

      counts: {
        languages: languagesAll.length,
        editors: editorsAll.length,
        operatingSystems: operatingSystemsAll.length,
        projects: projectsAll.length,
        categories: categoriesAll.length,
        machines: machinesAll.length,
        dependencies: dependenciesAll.length,
        dailyActivity: dailyActivity.length,
      },

      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ message: "WakaTime request failed" }, { status: 500 });
  }
}
