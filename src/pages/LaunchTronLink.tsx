import {useEffect, useMemo, useState} from "react";

function isMobileUA() {
  const ua = navigator.userAgent.toLowerCase();
  return /android|iphone|ipad|ipod|miui|harmonyos/.test(ua);
}

function getHashQuery() {
  const hash = window.location.hash || "";
  const i = hash.indexOf("?");
  return new URLSearchParams(i === -1 ? "" : hash.substring(i + 1));
}

function getParamFromHashOrSearch(key: string) {
  const qsHash = getHashQuery();
  const qsSearch = new URLSearchParams(window.location.search);
  return qsHash.get(key) || qsSearch.get(key) || "";
}

function ensureEncoded(s: string) {
  if (!s) return "";
  const looksEncoded = /^%7B/i.test(s) || /%[0-9A-Fa-f]{2}/.test(s);
  return looksEncoded ? s : encodeURIComponent(s);
}

export default function LaunchTronLink() {
  const [tip, setTip] = useState("");
  const paramRaw = useMemo(() => getParamFromHashOrSearch("param"), []);
  const paramEncoded = ensureEncoded(paramRaw);
  const deeplink = "tronlinkoutside://pull.activity?param=" + paramEncoded;

  const openTronLink = () => {
    setTip("正在尝试打开 TronLink…");
    // 尝试唤起 App
    window.location.href = deeplink;

    // 兜底：如果未被 App 接管，跳应用商店
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(ua);
    const isIOS = /iphone|ipad|ipod/.test(ua);

    setTimeout(() => {
      // 仍然可见，说明没有跳走
      if (document.visibilityState === "visible") {
        if (isAndroid) {
          window.location.href = "https://play.google.com/store/apps/details?id=com.tronlinkpro.wallet";
        } else if (isIOS) {
          window.location.href = "https://apps.apple.com/app/id1453530185";
        }
      }
    }, 1200);
  };

  useEffect(() => {
    if (!paramEncoded) {
      setTip("参数缺失：没有 param（深链 JSON）。");
      return;
    }
    if (isMobileUA()) {
      openTronLink();
    } else {
      setTip("检测到当前为电脑端，请使用手机打开此链接以完成签名绑定。");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      padding: 16,
      fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
      maxWidth: 720,
      margin: "0 auto"
    }}>
      <h3>打开 TronLink 完成签名绑定</h3>

      <div style={{marginTop: 12, padding: 12, background: "#f7f7f9", borderRadius: 8}}>
        {tip || "准备就绪"}
      </div>

      {!isMobileUA() && (
        <div style={{marginTop: 16}}>
          <ol style={{lineHeight: 1.7}}>
            <li>请用<strong>手机</strong>打开此页面（或复制下方链接到手机浏览器）。</li>
            <li>确保已安装 <strong>TronLink</strong> App。</li>
            <li>打开页面后会自动拉起 TronLink 进行签名。</li>
          </ol>
          <div style={{marginTop: 12, wordBreak: "break-all", fontSize: 13}}>
            页面直链：<code>{window.location.href}</code>
          </div>
        </div>
      )}

      <div style={{marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap"}}>
        <button onClick={openTronLink} style={{padding: "10px 14px"}}>
          再次尝试打开 TronLink
        </button>
        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          style={{padding: "10px 14px"}}
        >
          复制本页链接（发到手机）
        </button>
      </div>

      <details style={{marginTop: 18}}>
        <summary>调试信息</summary>
        <div style={{fontSize: 13, marginTop: 8}}>
          <div><b>deeplink</b>：</div>
          <div style={{wordBreak: "break-all"}}><code>{deeplink}</code></div>
          <div style={{marginTop: 8}}><b>param</b>（已编码）：</div>
          <div style={{wordBreak: "break-all"}}><code>{paramEncoded}</code></div>
        </div>
      </details>
    </div>
  );
}
