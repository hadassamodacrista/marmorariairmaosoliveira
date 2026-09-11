"use client";

declare global {
  interface Window {
    bootstrap: {
      Toast: new (el: Element, opts?: Record<string, unknown>) => { show: () => void };
      Modal: new (el: Element) => { show: () => void; hide: () => void };
    };
  }
}

export function toast(msg: string, tipo: "success" | "danger" | "warning" = "success") {
  const cor = tipo === "success" ? "bg-success" : tipo === "danger" ? "bg-danger" : "bg-warning text-dark";
  const el = document.createElement("div");
  el.className = `toast align-items-center text-white ${cor} border-0 position-fixed bottom-0 end-0 m-3`;
  el.style.zIndex = "9999";
  el.innerHTML = `<div class="d-flex"><div class="toast-body"></div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  el.querySelector(".toast-body")!.textContent = msg;
  document.body.appendChild(el);
  try {
    const bsToast = new window.bootstrap.Toast(el, { delay: 3500 });
    bsToast.show();
  } catch {
    // bootstrap ainda não carregou (raro) — remove depois de um tempo
    setTimeout(() => el.remove(), 3500);
  }
  el.addEventListener("hidden.bs.toast", () => el.remove());
}

export function confirmar(msg: string): boolean {
  return window.confirm(msg);
}
