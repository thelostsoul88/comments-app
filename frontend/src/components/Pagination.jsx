export default function Pagination({ page, pageSize, total, onPage }) {
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  const prev = () => onPage(Math.max(page - 1, 1));
  const next = () => onPage(Math.min(page + 1, pages));
  return (
    <div
      style={{
        margin: "14px 0",
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button onClick={prev} disabled={page <= 1}>
        ←
      </button>
      <span>
        Стр. {page} из {pages}
      </span>
      <button onClick={next} disabled={page >= pages}>
        →
      </button>
    </div>
  );
}
