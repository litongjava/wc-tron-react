import { useMemo, useState } from 'react';
import { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect';
// （可选）并行支持注入钱包（浏览器装了 TronLink 插件时可加速）
// import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters'

const projectId = import.meta.env.VITE_WC_PROJECT_ID as string | undefined;

function randomNonce(n = 24) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `WC_DEMO_${Date.now()}_${s}`;
}

export default function WalletConnectDemo01() {
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('idle');
  const [nonce, setNonce] = useState('');
  const [signature, setSignature] = useState('');

  // 初始化 WalletConnect (TRON) 适配器
  const wcAdapter = useMemo(() => {
    if (!projectId) console.warn('Missing VITE_WC_PROJECT_ID');
    return new WalletConnectAdapter({
      network: 'Mainnet', // 或 'Nile'（测试网）
      options: {
        projectId: projectId ?? '',
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'Earndao WC Demo',
          description: 'TRON WalletConnect minimal demo',
          url: window.location.origin,
          icons: ['https://fav.farm/⚡'],
        },
      },
    });
  }, []);

  async function connect() {
    try {
      setStatus('connecting...');
      await wcAdapter.connect();
      setAddress(wcAdapter.address ?? '');
      setStatus('connected');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setStatus(`connect failed: ${msg}`);
    }
  }

  async function signNonce() {
    try {
      if (!address) throw new Error('Not connected');
      const n = randomNonce();
      setNonce(n);
      setStatus('signing...');
      // 只传字符串
      const sig = await wcAdapter.signMessage(n);
      setSignature(sig);
      setStatus('signed ✔');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setStatus(`sign failed: ${msg}`);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <h2>TRON WalletConnect</h2>
      <div style={{ marginTop: 12, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <div><b>状态：</b>{status}</div>
        <div><b>地址：</b>{address || '未连接'}</div>
      </div>

      {!address ? (
        <button onClick={connect} style={{ padding: '10px 14px', marginTop: 12 }}>
          🔗 连接钱包（WalletConnect）
        </button>
      ) : (
        <button onClick={signNonce} style={{ padding: '10px 14px', marginTop: 12 }}>
          ✍️ 对随机 nonce 签名
        </button>
      )}

      {nonce && (
        <div style={{ marginTop: 12 }}>
          <div><b>nonce：</b><code style={{ wordBreak: 'break-all' }}>{nonce}</code></div>
        </div>
      )}

      {signature && (
        <div style={{ marginTop: 12 }}>
          <div><b>signature：</b></div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background:'#f7f7f9', padding:12, borderRadius:8 }}>
{signature}
          </pre>
        </div>
      )}

      <hr style={{ margin:'20px 0' }} />
    </div>
  );
}