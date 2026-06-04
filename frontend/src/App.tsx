import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
const ADDR = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const ABI = [
  { name: "post", type: "function", stateMutability: "nonpayable", inputs: [{ name: "content", type: "string" }], outputs: [{ type: "uint256" }] },
  { name: "upvote", type: "function", stateMutability: "nonpayable", inputs: [{ name: "id", type: "uint256" }], outputs: [] },
  { name: "getPost", type: "function", stateMutability: "view", inputs: [{ name: "id", type: "uint256" }], outputs: [{ name: "author", type: "address" }, { name: "content", type: "string" }, { name: "upvotes", type: "uint256" }, { name: "createdAt", type: "uint256" }] },
  { name: "totalPosts", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#080b14", color: "#e2e8f0", fontFamily: "Inter,sans-serif", padding: "24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 700, color: "#38bdf8" },
  tabs: { display: "flex", gap: 8, marginBottom: 24 },
  tab: (a: boolean) => ({ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: a ? "#38bdf8" : "#1e2533", color: a ? "#000" : "#94a3b8", fontWeight: 600 }),
  card: { background: "#111827", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #1e2533" },
  label: { display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 },
  input: { width: "100%", background: "#1e2533", border: "1px solid #374151", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontSize: 14, boxSizing: "border-box" as const, marginBottom: 14 },
  btn: { background: "#38bdf8", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14, marginRight: 8 },
};
function PostCard({ id }: { id: bigint }) {
  const { data } = useReadContract({ address: ADDR, abi: ABI, functionName: "getPost", args: [id] });
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading } = useWaitForTransactionReceipt({ hash });
  if (!data) return null;
  const [author, content, upvotes] = data as [string, string, bigint, bigint];
  return (
    <div style={s.card}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>📌 {content}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>{author.slice(0, 12)}...</div>
        <button style={{ ...s.btn, fontSize: 12, padding: "6px 12px", opacity: isPending || isLoading ? 0.6 : 1 }} onClick={() => writeContract({ address: ADDR, abi: ABI, functionName: "upvote", args: [id] })} disabled={isPending || isLoading}>👍 {upvotes.toString()}</button>
      </div>
    </div>
  );
}
export default function App() {
  const { isConnected } = useAccount();
  const [tab, setTab] = useState<"browse" | "post">("browse");
  const [content, setContent] = useState("");
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash });
  const { data: total } = useReadContract({ address: ADDR, abi: ABI, functionName: "totalPosts" });
  const allIds = total ? Array.from({ length: Number(total) }, (_, i) => BigInt(i)) : [];
  return (
    <div style={s.page}>
      <div style={s.header}>
        <div><div style={s.title}>📌 AnonWall</div><div style={{ fontSize: 13, color: "#64748b" }}>On-chain message board • {total?.toString() ?? 0} posts</div></div>
        <ConnectButton />
      </div>
      {!isConnected ? <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>Connect wallet to post or upvote</div> : (
        <>
          <div style={s.tabs}>
            <button style={s.tab(tab === "browse")} onClick={() => setTab("browse")}>Browse</button>
            <button style={s.tab(tab === "post")} onClick={() => setTab("post")}>Post</button>
          </div>
          {tab === "browse" && <div>{allIds.length ? [...allIds].reverse().map(id => <PostCard key={id.toString()} id={id} />) : <div style={{ color: "#64748b", padding: 20 }}>No posts yet</div>}</div>}
          {tab === "post" && (
            <div style={s.card}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>Post to AnonWall</div>
              <label style={s.label}>Message</label>
              <textarea style={{ ...s.input, height: 80, resize: "vertical" as const }} value={content} onChange={e => setContent(e.target.value)} placeholder="Say something on-chain..." />
              <button style={{ ...s.btn, opacity: isPending || confirming ? 0.6 : 1 }} onClick={() => writeContract({ address: ADDR, abi: ABI, functionName: "post", args: [content] })} disabled={isPending || confirming}>{isPending || confirming ? "Posting..." : "Post " + "📌"}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
