import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define Status Type
type StatusType = "operational" | "degraded" | "partial" | "major" | "maintenance";

// Status Map
const STATUS_MAP: Record<StatusType, { status: string; label: string }> = {
  operational: { status: "operational", label: "服务正常" },
  degraded: { status: "degraded", label: "性能下降" },
  partial: { status: "partial", label: "部分问题" },
  major: { status: "major", label: "重大事故" },
  maintenance: { status: "maintenance", label: "正在检修" },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiToken = process.env.BETTER_STACK_API_TOKEN;

  // Use Vercel's caching
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  if (!apiToken) {
    return res.status(200).json({
      status: "unknown",
      label: "未配置状态",
      updatedAt: null,
    });
  }

  // 智能替换 URL 路径中的问号
  function encodePathQuestionMarks(url: string, forceEncode = false): string {
    if (!url.includes('?')) return url;
    const parts = url.split('?');
    // 如果只有一个问号且强制作为路径，则全部替换
    if (parts.length === 2 && forceEncode) return parts.join('%3F');
    // 保留最后一段作为查询参数，其余问号替换为 %3F
    const query = parts.pop();
    return `${parts.join('%3F')}?${query}`;
  }

  try {
    let fetchUrl = "https://uptime.betterstack.com/api/v2/monitors";
    
    // 如果前端请求携带了 url 参数（比如用于获取特定监控项）
    const rawUrl = req.query.url as string;
    if (rawUrl) {
      // 默认将只带一个 ? 的 URL 视作路径一部分（适应你提到的示例），如果有多个则只保留最后一个作为查询参数分隔符
      const formattedUrl = encodePathQuestionMarks(rawUrl, true);
      // 将其作为查询参数附加给 Better Stack
      fetchUrl += `?url=${encodeURIComponent(formattedUrl)}`;
    }

    const response = await fetch(fetchUrl, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
        throw new Error(`Better Stack API error: ${response.statusText}`);
    }

    const data = await response.json() as {
        data: Array<{
            id: string;
            attributes: {
                url: string;
                pronounceable_name: string;
                status: "paused" | "pending" | "maintenance" | "up" | "validating" | "down";
            };
        }>;
    };

    const monitors = data.data || [];
    const totalCount = monitors.length;
    const downCount = monitors.filter(m => m.attributes.status === "down").length;
    const maintenanceCount = monitors.filter(m => m.attributes.status === "maintenance").length;
    const validatingCount = monitors.filter(m => m.attributes.status === "validating").length;
    const upCount = monitors.filter(m => m.attributes.status === "up").length;

    let statusType: StatusType;

    if (totalCount === 0) {
      return res.status(200).json({
        status: "unknown",
        label: "无监控项",
        updatedAt: new Date().toISOString(),
      });
    }

    if (downCount > totalCount / 2) {
      statusType = "major";
    } else if (downCount > 0) {
      statusType = "partial";
    } else if (maintenanceCount > 0) {
      statusType = "maintenance";
    } else if (validatingCount > 0) {
      statusType = "degraded";
    } else if (upCount === totalCount) {
      statusType = "operational";
    } else {
      statusType = "partial";
    }

    const statusInfo = STATUS_MAP[statusType];

    return res.status(200).json({
      status: statusInfo.status,
      label: statusInfo.label,
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Fetch status failed:", error);
    return res.status(200).json({
      status: "error",
      label: "无法获取状态",
      updatedAt: null,
    });
  }
}
